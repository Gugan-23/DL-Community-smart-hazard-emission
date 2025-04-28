// BackgroundAudio.js
import React, { useEffect, useState } from 'react';
import './BackgroundAudio.css'; // Import the CSS file for styling

const BackgroundAudio = () => {
    const [audio] = useState(new Audio("/game.mp3")); // Path to your audio file
    const [isPlaying, setIsPlaying] = useState(true); // Default to true to start playing automatically

    useEffect(() => {
        audio.loop = true; // Loop the audio
        if (isPlaying) {
            audio.play().catch((error) => {
                console.error('Error playing audio:', error);
            });
        } else {
            audio.pause();
        }

        // Cleanup function to pause audio and reset when the component unmounts
        return () => {
            audio.pause();
            audio.currentTime = 0;
        };
    }, [isPlaying, audio]);

    const toggleAudio = () => {
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="audio-toggle-button">
            <button onClick={toggleAudio}>
                {isPlaying ? 'Audio Off' : 'Audio On'}
            </button>
        </div>
    );
};

export default BackgroundAudio;
