// App.js
import React, { useState, useEffect } from 'react';
import './EDA.css';

function EDA() {
  const [metrics, setMetrics] = useState({
    Bookq: null,
    mean_json: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTrainingData();
  }, []);

  const fetchTrainingData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('http://localhost:5005/train');
      const data = await response.json();
      
      setMetrics({
        Bookq: data.results.Bookq,
        mean_json: data.results.mean_json
      });
      
      // Refresh images after data load
      setTimeout(refreshVisualizations, 2000);
    } catch (err) {
      setError('Failed to load data. Please try refreshing.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const refreshVisualizations = () => {
    const timestamp = Date.now();
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      img.src = img.src.split('?')[0] + `?t=${timestamp}`;
    });
  };

  const refreshData = () => {
    setMetrics({ Bookq: null, mean_json: null });
    fetchTrainingData();
  };

  return (
    <div className="App">
      <h1>Industrial Sensor Analytics</h1>
      
      <DataSection 
        title="Real-time Sensor Data (Bookq)"
        collection="Bookq"
        metrics={metrics.Bookq}
      />
      
      <DataSection
        title="Aggregated Metrics (mean_json)"
        collection="mean_json"
        metrics={metrics.mean_json}
      />

      <div className="section">
        <h3>Controls</h3>
        <button 
          className="refresh-btn" 
          onClick={refreshData}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh Dashboard'}
        </button>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

const DataSection = ({ title, collection, metrics }) => (
  <div className="section">
    <h2>{title}</h2>
    
    <MetricsTable 
      metrics={metrics} 
      collection={collection} 
    />
    
    <div className="visualizations">
      <img 
        src={`http://localhost:5005/correlation/${collection}`} 
        alt="Correlation" 
      />
      <img 
        src={`http://localhost:5005/pairplot/${collection}`} 
        alt="Pairplot" 
      />
    </div>
  </div>
);

const MetricsTable = ({ metrics, collection }) => {
    // Handle loading state
    if (!metrics) return <p>Loading metrics for {collection}...</p>;
    
    // Handle error state
    if (metrics.error) return <p className="error">Error: {metrics.error}</p>;
    
    // Verify metrics structure
    if (typeof metrics !== 'object' || Object.keys(metrics).length === 0) {
      return <p>No metrics available for {collection}</p>;
    }
  
    return (
      <div className="model-section">
        <h3>Model Performance ({collection})</h3>
        <table className="metrics-table">
          <thead>
            <tr>
              <th>Model</th>
              <th>MAE</th>
              <th>RMSE</th>
              <th>R² Score</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(metrics).map(([modelName, scores]) => {
              // Skip non-model entries
              if (!scores || typeof scores !== 'object') return null;
              
              return (
                <tr key={`${collection}-${modelName}`}>
                  <td>{modelName}</td>
                  <td>{scores.MAE ?? 'N/A'}</td>
                  <td>{scores.RMSE ?? 'N/A'}</td>
                  <td>
                    {typeof scores.R2 === 'number' 
                      ? scores.R2.toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

export default EDA;