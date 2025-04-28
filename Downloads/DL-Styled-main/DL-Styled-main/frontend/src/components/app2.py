# Set matplotlib backend first
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
from matplotlib import pyplot as plt
import os
import seaborn as sns
import pandas as pd
from flask import Flask, request, jsonify, send_file, render_template
from pymongo import MongoClient
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error,r2_score  

# Windows-specific thread configuration
if os.name == 'nt':
    os.environ['OMP_NUM_THREADS'] = '1'

app = Flask(__name__)
os.makedirs("static", exist_ok=True)

# MongoDB configuration
MONGO_URI = "mongodb+srv://vgugan16:gugan2004@cluster0.qyh1fuo.mongodb.net/dL?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "dL"
READINGS_COLLECTION = "Bookq"
MEAN_VALUES_COLLECTION = "mean_json"

client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]

def perform_eda(df, collection):
    try:
        if df.empty or len(df) < 2:
            print(f"Skipping EDA for {collection}: Insufficient data")
            return

        numeric_df = df.select_dtypes(include=['number'])
        if len(numeric_df.columns) < 2:
            print(f"Skipping EDA for {collection}: Not enough numeric columns")
            return

        # Correlation Matrix
        corr_path = f"static/correlation_matrix_{collection}.png"
        fig = plt.figure(figsize=(10, 8))
        sns.heatmap(numeric_df.corr(), annot=True, cmap='coolwarm', fmt=".2f")
        plt.title(f'Correlation Matrix - {collection}')
        plt.tight_layout()
        plt.savefig(corr_path)
        plt.close(fig)

        # Pairplot
        pairplot_path = f"static/pairplot_{collection}.png"
        fig = plt.figure(figsize=(12, 8))
        sns.pairplot(numeric_df)
        plt.title(f'Pairplot - {collection}')
        plt.tight_layout()
        plt.savefig(pairplot_path)
        plt.close(fig)

        print(f"Generated EDA visuals for {collection}")
    except Exception as e:
        print(f"EDA error for {collection}: {str(e)}")

def train_models(df):
    metrics = {}
    required_columns = ['Temperature', 'Gas Emission Value', 'Threshold']
    
    if not all(col in df.columns for col in required_columns):
        return {"error": "Missing required columns for training"}
    
    try:
        features = ["Temperature", "Gas Emission Value"]
        if "Location" in df.columns:
            label_encoder = LabelEncoder()
            df["Location_Encoded"] = label_encoder.fit_transform(df["Location"])
            features.insert(0, "Location_Encoded")

        X = df[features]
        y = df["Threshold"]

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        models = {
            "RandomForest": RandomForestRegressor(n_estimators=100, random_state=42),
            "DecisionTree": DecisionTreeRegressor(random_state=42),
            "LinearRegression": LinearRegression()
        }

        for name, model in models.items():
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            metrics[name] = {
                "MAE": round(mean_absolute_error(y_test, y_pred), 2),
                "RMSE": round(mean_squared_error(y_test, y_pred, squared=False), 2),
                 "R2": round(r2_score(y_test, y_pred), 4)
            }

    except Exception as e:
        return {"error": f"Training failed: {str(e)}"}
    
    return metrics

@app.route('/')
def home():
    return render_template("index.html")

@app.route('/train', methods=['GET'])
def train():
    try:
        results = {}
        for collection_name in [READINGS_COLLECTION, MEAN_VALUES_COLLECTION]:
            collection = db[collection_name]
            data = list(collection.find({}, {'_id': 0}))
            
            if not data:
                results[collection_name] = {"error": "No data found"}
                continue
                
            df = pd.DataFrame(data)
            perform_eda(df, collection_name)
            results[collection_name] = train_models(df)

        return jsonify({
            "message": "Training and EDA completed",
            "results": results
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/correlation/<collection>')
def correlation_image(collection):
    file_path = f"static/correlation_matrix_{collection}.png"
    try:
        if not os.path.exists(file_path):
            fig = plt.figure(figsize=(10, 8))
            plt.text(0.5, 0.5, 'Data not available\nRun training first', 
                    ha='center', va='center')
            plt.axis('off')
            plt.savefig(file_path)
            plt.close(fig)
            
        return send_file(file_path, mimetype="image/png")
    except Exception as e:
        print(f"Correlation error: {str(e)}")
        return jsonify({"error": "Failed to generate image"}), 500

@app.route('/pairplot/<collection>')
def pairplot_image(collection):
    file_path = f"static/pairplot_{collection}.png"
    try:
        if not os.path.exists(file_path):
            fig = plt.figure(figsize=(12, 8))
            plt.text(0.5, 0.5, 'Data not available\nRun training first', 
                    ha='center', va='center')
            plt.axis('off')
            plt.savefig(file_path)
            plt.close(fig)
            
        return send_file(file_path, mimetype="image/png")
    except Exception as e:
        print(f"Pairplot error: {str(e)}")
        return jsonify({"error": "Failed to generate image"}), 500

@app.errorhandler(500)
def handle_500(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5005, threaded=True)