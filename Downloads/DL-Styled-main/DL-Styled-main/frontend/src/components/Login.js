import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Import your separate CSS file

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State for showing password
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://127.0.0.1:8000/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            localStorage.setItem('token', data.token); // Save token


            if (response.ok) {
                setMessage('Login successful! Redirecting to Home page...');
                setTimeout(() => {
                    navigate('/home');
                }, 2250);
            } else {
                setMessage('Login failed: ' + (data.detail || 'Invalid Credentials!'));
            }

        } catch (error) {
            setMessage('An error occurred. Please try again.');
            console.error('Login error:', error);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword); // Toggle password visibility
    };

    return (
        <div className="login-container">
            <div className="login-image">
                <img src="/login.png" alt="Login" /> {/* Adjust image path if needed */}
            </div>
            <div className="login-box">
                <h2>LOGIN</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    
                    {/* Password Field with Toggle Feature */}
                    <div className="password-field">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <span className="eye-icon" onClick={togglePasswordVisibility}>
                            {showPassword ? '🙈' : '👁️'}
                        </span>
                    </div>
                    
                    <button type="submit">LOGIN</button>
                </form>
                {message && <p>{message}</p>}
                <p>
                    Don't have an Account?{' '}
                    <span className="signup-link" onClick={() => navigate('/signup')}>
                        Sign Up
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Login;