import React, { useEffect, useState } from "react";
import axios from "axios";

const DataFetch = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/api/data1")
      .then((response) => setData(response.data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div>
      <h2>Historical Data</h2>
      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Analog</th>
            <th>Date</th>
            <th>Gas Emission Value</th>
            <th>Location</th>
            <th>Temperature</th>
            <th>Threshold</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.Analog}</td>
              <td>{item.Date}</td>
              <td>{item["Gas Emission Value"]}</td>
              <td>{item.Location}</td>
              <td>{item.Temperature}</td>
              <td>{item.Threshold}</td>
              <td>{item.Timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataFetch;
