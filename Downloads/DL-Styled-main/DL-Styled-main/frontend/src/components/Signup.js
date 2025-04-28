import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css'; // Import your CSS

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage('Passwords do not match.');
            return;
        }

        const response = await fetch('http://127.0.0.1:8000/signup/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                email,
                password,
                confirm_password: confirmPassword,
                phone_number: phoneNumber
            }),
        });

        const data = await response.json();

        if (response.ok) {
            setMessage('Signup successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } else {
            setMessage('Signup failed: ' + (data.detail || 'Unknown error'));
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-image">
                <img src="/signup.png" alt="Signup" /> {/* Replace with your image path */}
            </div>
            <div className="signup-box">
                <h2>SIGN UP</h2>
                <form onSubmit={handleSignup}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <div className="password-field">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <span className="eye-icon" onClick={togglePasswordVisibility}>
                            {showPassword ? '🙈' : '👁️'}
                        </span>
                    </div>

                    <div className="password-field">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <span className="eye-icon" onClick={toggleConfirmPasswordVisibility}>
                            {showConfirmPassword ? '🙈' : '👁️'}
                        </span>
                    </div>

                    <input
                        type="text"
                        placeholder="Phone Number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                    />
                    <button type="submit">SIGN UP</button>
                </form>
                {message && <p>{message}</p>}
                <p>
                    Already have an Account?{' '}
                    <span className="signup-link" onClick={() => navigate('/login')}>
                        Login
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Signup;
