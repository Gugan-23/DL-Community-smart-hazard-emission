from flask import Flask, Response, jsonify, request
import torch
from transformers import CLIPProcessor, CLIPModel
from ultralytics import YOLO
import cv2
import pandas as pd
from pymongo import MongoClient
from PIL import Image
import threading
import pymongo
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
from datetime import datetime
from flask_cors import CORS

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
app = Flask(__name__)
CORS(app) 
# Load models
device = "cuda" if torch.cuda.is_available() else "cpu"
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch16").to(device)
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch16")

yolo_model = YOLO("yolo11n.pt")  
class_names = [
  "Person", "Phone", "Laptop", "Tablet", "Computer", "Keyboard",
  "Washing machine", "Fridge", "Hand",
  "Car crash", "Accident", "Vehicle collision", "Car accident", 
  "Bike accident", "Truck crash", "Traffic accident", "Emergency", "Fire", 
  "Explosion", "Road accident", "Ambulance", "Injury", "Broken vehicle"
]

text_inputs = clip_processor(text=class_names, return_tensors="pt", padding=True).to(device)

cap = None  # Camera variable
stop_stream = False  # Stop flag

def generate_frames():
    global cap, stop_stream
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)  # Open camera

    while cap.isOpened():
        if stop_stream:
            break  # Stop streaming when flag is set

        success, frame = cap.read()
        if not success:
            print("❌ Error: Could not read frame.")
            break

        results = yolo_model(frame)

        for result in results:
            for box in result.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cropped_img = frame[y1:y2, x1:x2]

                if cropped_img.size == 0:
                    continue  

                image_pil = Image.fromarray(cv2.cvtColor(cropped_img, cv2.COLOR_BGR2RGB))
                image_inputs = clip_processor(images=image_pil, return_tensors="pt").to(device)

                with torch.no_grad():
                    image_features = clip_model.get_image_features(**image_inputs)
                    text_features = clip_model.get_text_features(**text_inputs)
                    similarity = (image_features @ text_features.T).softmax(dim=-1)

                max_idx = similarity[0].argmax().item()
                label = class_names[max_idx]
                confidence = similarity[0][max_idx].item()

                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, f"{label}: {confidence:.2f}", (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    cap.release()  # Release camera when stopped

@app.route('/video_feed')
def video_feed():
    global stop_stream
    stop_stream = False
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/stop', methods=['POST'])
def stop_video():
    global stop_stream
    stop_stream = True  # Set flag to stop stream
    return jsonify({"message": "Stream stopped"}), 200
client = MongoClient("mongodb+srv://vgugan16:gugan2004@cluster0.qyh1fuo.mongodb.net/dL?retryWrites=true&w=majority&appName=Cluster0")
db = client["dL"]  # Replace with your DB name
collection = db["Bookq"]  # Replace with your Collection name

@app.route("/api/data1", methods=["GET"])
def get_data():
    data = list(collection.find({}, {"_id": 0}))  # Exclude MongoDB's default _id
    return jsonify(data)
MONGO_URI = "mongodb+srv://vgugan16:gugan2004@cluster0.qyh1fuo.mongodb.net/dL?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "dL"
READINGS_COLLECTION = "Bookq"
MEAN_VALUES_COLLECTION = "mean_json"

client = pymongo.MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
readings_collection = db[READINGS_COLLECTION]
mean_values_collection = db[MEAN_VALUES_COLLECTION]
EMAIL_ADDRESS = "h8702643@gmail.com"  # Replace with your email
EMAIL_PASSWORD = "osxarglpzcircimn"    # Replace with your app password

@app.route('/api/send-email', methods=['POST'])
def send_email():
    data = request.json
    name = data.get('name')
    sender_email = data.get('email')
    message_content = data.get('message')

    if not name or not sender_email or not message_content:
        return jsonify({"message": "All fields are required!"}), 400

    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_ADDRESS
        msg['To'] = "v.gugan16@gmail.com"  # Change to your recipient email
        msg['Subject'] = f"New Contact Form Submission from {name}"

        body = f"Name: {name}\nEmail: {sender_email}\n\nMessage:\n{message_content}"
        msg.attach(MIMEText(body, 'plain'))

        # Sending the email
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.sendmail(EMAIL_ADDRESS, "your-email@example.com", msg.as_string())
        server.quit()

        return jsonify({"message": "Email sent successfully!"})

    except Exception as e:
        return jsonify({"message": "Failed to send email!", "error": str(e)}), 500

# Load and preprocess data
def load_data():
    cursor = readings_collection.find({}, {'_id': 0})
    data = list(cursor)
    
    if data:
        df = pd.DataFrame(data)
        df['Timestamp'] = pd.to_datetime(df['Timestamp'], errors='coerce')
        df = df.dropna(subset=['Timestamp'])
        df['Date'] = df['Timestamp'].dt.date.astype(str)
    else:
        df = pd.DataFrame(columns=["Location", "Temperature", "Gas Emission Value", "Threshold", "Analog", "Timestamp", "Date"])

    df['Location'] = df['Location'].fillna("Unknown")
    return df

@app.route('/api/mean', methods=['GET'])
def get_all_mean_data():
    mean_data = list(mean_values_collection.find({}, {"_id": 0}))  # Fetch all documents & remove _id
    return jsonify(mean_data) if mean_data else jsonify({"error": "No data found"}), 200

def train_model(df):
    if "Threshold" in df.columns and not df.empty:
        try:
            label_encoder = LabelEncoder()
            df["Location_Encoded"] = label_encoder.fit_transform(df["Location"])

            X = df[["Location_Encoded", "Temperature", "Gas Emission Value"]]
            y = df["Threshold"]

            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

            model = RandomForestRegressor(n_estimators=100, random_state=42)
            model.fit(X_train, y_train)

            y_pred = model.predict(X_test)
            print(f"MAE: {mean_absolute_error(y_test, y_pred):.2f}, RMSE: {mean_squared_error(y_test, y_pred) ** 0.5:.2f}")

            return model, label_encoder

        except ValueError as e:
            print(f"Model training error: {e}")
            return None, None

    print("Insufficient data for training.")
    return None, None
def load_or_initialize_data():
    """Load data from MongoDB"""
    cursor = readings_collection.find({}, {'_id': 0})  # Exclude MongoDB's default _id field
    data = list(cursor)
    
    if data:
        df = pd.DataFrame(data)
        df['Timestamp'] = pd.to_datetime(df['Timestamp'], errors='coerce')
        df = df.dropna(subset=['Timestamp'])  # Remove invalid timestamps
        df['Date'] = df['Timestamp'].dt.date.astype(str)  # Convert date to string
    else:
        df = pd.DataFrame(columns=[
            "Location", "Temperature", "Gas Emission Value",
            "Threshold", "Analog", "Timestamp", "Date"
        ])
    
    df['Location'] = df['Location'].fillna("Unknown")
    return df

# Get mean values and update MongoDB
def save_mean_values():
    """Calculate and store daily mean values in MongoDB"""
    df = load_or_initialize_data()
    
    if not df.empty:
        mean_values = df.groupby('Date').agg({
            'Threshold': 'mean',
            'Gas Emission Value': 'mean'
        }).reset_index()
        
        mean_values_records = mean_values.to_dict(orient='records')
        
        # Replace existing mean values for the same date
        for record in mean_values_records:
            mean_values_collection.update_one(
                {"Date": record["Date"]}, 
                {"$set": record}, 
                upsert=True
            )

        print("\nDaily mean values saved to MongoDB successfully!")

# API to fetch all data

# API to predict and store data
@app.route('/api/predict', methods=['POST'])
def predict():
    df = load_data()
    model, label_encoder = train_model(df)

    data = request.json
    location = data.get("Location", "Unknown")
    temperature = float(data.get("Temperature", 0))
    gas_emission = float(data.get("Gas Emission Value", 0))

    # Encode location
    try:
        location_encoded = label_encoder.transform([location])[0]
    except ValueError:
        new_classes = list(label_encoder.classes_) + [location]
        label_encoder.fit(new_classes)
        location_encoded = label_encoder.transform([location])[0]

    # Make prediction
    if model:
        user_input = pd.DataFrame([{
            "Location_Encoded": location_encoded,
            "Temperature": temperature,
            "Gas Emission Value": gas_emission
        }])
        predicted_threshold = model.predict(user_input)[0]
    else:
        predicted_threshold = gas_emission * 1.1  # Fallback logic

    analog = 1 if gas_emission > predicted_threshold else 0

    # Save data to MongoDB
    new_entry = {
        "Location": location,
        "Temperature": temperature,
        "Gas Emission Value": gas_emission,
        "Threshold": float(predicted_threshold),
        "Analog": int(analog),
        "Timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        "Date": datetime.now().date().isoformat()
    }
    readings_collection.insert_one(new_entry)

    # Save mean values
    save_mean_values()

    return jsonify({"Threshold": predicted_threshold, "Analog": analog, "Message": "Prediction saved!"})

if __name__ == "__main__":
    app.run(debug=True)
