import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css'; // Ensure this CSS file exists

const Profile = () => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token'); // Get the stored token

                if (!token) {
                    throw new Error('No token found. Please log in.');
                }

                const response = await fetch('http://127.0.0.1:8000/api/profile/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${token}` // Send token in header
                    }
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error('Unauthorized. Please log in again.');
                    } else {
                        throw new Error('Failed to fetch profile data.');
                    }
                }

                const data = await response.json();
                setProfileData(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);

                // Redirect to login if unauthorized or token is missing
                if (err.message.includes('Unauthorized') || err.message.includes('No token')) {
                    localStorage.removeItem('token'); // Clear invalid token
                    navigate('/login');
                }
            }
        };

        fetchProfile();
    }, [navigate]);

    if (loading) {
        return (
            <div className="profile-loading">
                <p>Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-error">
                <p>Error: {error}</p>
                <button onClick={() => navigate('/login')}>Go to Login</button>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <h2>Your Profile</h2>
            <div className="profile-details">
                <div className="profile-item">
                    <label>Username:</label>
                    <p>{profileData.username}</p>
                </div>
                <div className="profile-item">
                    <label>Email:</label>
                    <p>{profileData.email}</p>
                </div>
                <div className="profile-item">
                    <label>Phone Number:</label>
                    <p>{profileData.phone_number || 'Not provided'}</p>
                </div>
                <div className="profile-item">
                    <label>Joined On:</label>
                    <p>{new Date(profileData.date_joined).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
};

export default Profile;