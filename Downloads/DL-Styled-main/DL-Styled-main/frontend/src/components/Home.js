import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import AboutUs from './AboutUs';
import Profile from './Profile';
import Eda from './EDA';
import LiveData from './LiveData';
import HistData from './HistData';
import Predict from './Predict';
import Contact from './Contact';
import Average from './Average';
import './Home.css';

import BackgroundAudio from './BackgroundAudio';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faChartLine, faDatabase,
  faClockRotateLeft, faMagic, faInfoCircle, faSignOutAlt,faPhone,faAngleRight
} from '@fortawesome/free-solid-svg-icons';

const Home = () => {
  // Logout function
  const handleLogout = () => {
    // Clear any user session or token (if applicable)
    localStorage.removeItem('token'); // Example: Remove token from localStorage
    // Redirect to the login page
    window.location.href = '/login'; // Redirect to the login route
  };

  return (
    <div className="dashboard-container">
      {/* Top Navigation Header */}
      <header className="dashboard-header">
        <h1 className="logo">Dothraki</h1>
        <nav className="main-nav">
          <Link to="aboutus"><FontAwesomeIcon icon={faInfoCircle} /> About</Link>
          <Link to="profile"><FontAwesomeIcon icon={faUser} /> Profile</Link>
          <BackgroundAudio />
          <button onClick={handleLogout} className="logout-button">
            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
          </button>
        </nav>
      </header>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {/* Left Navigation Panel */}
        <aside className="dashboard-sidebar">
          <div className="nav-card">
            <h2>Analytics</h2>
            <ul className="dashboard-nav">
              <li><Link to="eda"><FontAwesomeIcon icon={faChartLine} /> EDA</Link></li>
              <li><Link to="livedata"><FontAwesomeIcon icon={faDatabase} /> Live Data</Link></li>
              <li><Link to="historicaldata"><FontAwesomeIcon icon={faClockRotateLeft} /> Historical Data</Link></li>
              <li><Link to="predict"><FontAwesomeIcon icon={faMagic} /> Predict</Link></li>
              <li><Link to="average"><FontAwesomeIcon icon={faAngleRight} /> Average</Link></li>
              <li><Link to="contact"><FontAwesomeIcon icon={faPhone} /> Contact Us</Link></li>
            </ul>
            
          </div>
          
        </aside>
        

        {/* Main Content Area */}
        <main className="main-content">
          <Routes>
            <Route path="aboutus" element={<AboutUs />} />
            <Route path="profile" element={<Profile />} />
            <Route path="eda" element={<Eda />} />
            <Route path="livedata" element={<LiveData />} />
            
            <Route path="average" element={<Average />} />
            <Route path="historicaldata" element={<HistData />} />
            <Route path="predict" element={<Predict />} />
            <Route path="contact" element={<Contact />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Home;