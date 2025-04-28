
https://go.screenpal.com/watch/cTfunKnQfkZ
DL Community Smart Hazard Emission 🚨🌿
A real-time hazard emission monitoring dashboard built with Streamlit, MongoDB, and Machine Learning.
This system predicts critical threshold violations in gas and temperature emissions and sends alerts when dangers are detected.

🚀 Features
📈 Live sensor data monitoring via MQTT protocol.

🧠 RandomForest Regressor model for danger prediction.

📊 Beautiful real-time dashboards with Streamlit.

☁️ Stores sensor data in MongoDB Atlas.

📞 Automatic SMS alerts via Twilio if danger detected for consecutive readings.

🔥 Threshold violation prediction and proactive alerting.

🛠️ Tech Stack
Frontend: Streamlit

Backend: Python, MQTT Client

Database: MongoDB Atlas
https://go.screenpal.com/watch/cTfunKnQfkZ
Machine Learning: RandomForestRegressor

Alert System: Twilio API

Deployment: Streamlit Cloud / Localhost

🧩 Folder Structure
bash
Copy
Edit
DL-Community-smart-hazard-emission/
│
├── app.py                  # Main Streamlit app
├── mqtt_handler.py          # MQTT connection and data fetch
├── model.py                 # RandomForest model for threshold prediction
├── mongodb_handler.py       # MongoDB connection and operations
├── twilio_alert.py          # Twilio SMS alert integration
├── requirements.txt         # Project dependencies
└── README.md                # Project documentation (this file)
⚙️ Setup Instructions
1. Clone the repository

git clone https://github.com/Gugan-23/DL-Community-smart-hazard-emission.git
cd DL-Community-smart-hazard-emission
2. Install dependencies

pip install -r requirements.txt
3. Set up environment variables
Create a .env file in the root directory and add:


MONGO_URI=your_mongodb_connection_string
MQTT_BROKER=your_mqtt_broker_url
MQTT_PORT=your_mqtt_broker_port
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=your_twilio_phone_number
ALERT_TO_NUMBER=your_personal_phone_number
4. Run the application

streamlit run app.py
📊 Dashboard Overview
Live Data: Temperature, Gas Emission values.

Predicted Danger: Real-time prediction if emissions exceed safety thresholds.

SMS Alerts: If danger is detected 5 times in a row, an SMS alert is sent
