import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Predict.css";

const Preidct = () => {
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({ Location: "", Temperature: "", "Gas Emission Value": "" });
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/api/data")
      .then((response) => setData(response.data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("http://127.0.0.1:5000/api/predict", formData)
      .then((response) => setPrediction(response.data))
      .catch((error) => console.error("Prediction error:", error));
  };

  return (
    <div>
      <table border="1">
        
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.Location}</td><td>{item.Temperature}</td><td>{item["Gas Emission Value"]}</td>
              <td>{item.Threshold}</td><td>{item.Analog}</td><td>{item.Timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Make Prediction</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" name="Location" placeholder="Location" onChange={handleChange} />
        <input type="number" name="Temperature" placeholder="Temperature" step="0.01"  onChange={handleChange} />
        <input type="number" name="Gas Emission Value" placeholder="Gas Emission" step="0.01"  onChange={handleChange} />
        <button type="submit">Predict</button>
      </form>

      {prediction && <p>Threshold: {prediction.Threshold} | Analog: {prediction.Analog}</p>}
    </div>
  );
};

export default Preidct;
