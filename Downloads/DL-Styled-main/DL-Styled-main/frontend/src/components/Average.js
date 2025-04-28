import React, { useEffect, useState } from "react";
import axios from "axios";
import './Average.css'
const Average = () => {
  const [meanData, setMeanData] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/api/mean")
      .then((response) => setMeanData(response.data))
      .catch((error) => console.error("Error fetching mean data:", error));
  }, []);

  return (
    <div>
      <h2>Average Emmision Of Everyday</h2>
      {meanData.length > 0 ? (
        <table border="1">
          <thead>
            <tr>
              {Object.keys(meanData[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {meanData.map((item, index) => (
              <tr key={index}>
                {Object.values(item).map((value, idx) => (
                  <td key={idx}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading mean data...</p>
      )}
    </div>
  );
};

export default Average;
