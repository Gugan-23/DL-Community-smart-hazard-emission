import React, { useState } from "react";
import axios from "axios";

const VideoStream = () => {
  const [isStreaming, setIsStreaming] = useState(false);

  const startStream = () => {
    setIsStreaming(true);
  };

  const stopStream = () => {
    axios.post("http://127.0.0.1:5000/stop")
      .then(() => {
        setIsStreaming(false);
      })
      .catch(error => console.error("Error stopping stream:", error));
  };

  return (
    <div>
      <h2>Live Video Stream</h2>
      {isStreaming ? (
        <img src="http://127.0.0.1:5000/video_feed" alt="Video Stream" width="640" />
      ) : (
        <p>Click 'Start' to begin the stream.</p>
      )}
      
      <div style={{ marginTop: "10px" }}>
        <button onClick={startStream} disabled={isStreaming} style={{ marginRight: "10px" }}>
          Start Stream
        </button>
        <button onClick={stopStream} disabled={!isStreaming}>
          Stop Stream
        </button>
      </div>
    </div>
  );
};

export default VideoStream;
