import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
 // Import Bootstrap CSS
import Signup from './components/Signup';
import Login from './components/Login';
import Home from './components/Home';

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" />} /> {/* Redirect to login */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home/*" element={<Home />} /> {/* Note the wildcard * to handle nested routes */}
        </Routes>
    );
};

export default App;
