import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar({ onLogout, onThemeToggle }) {
  return (
    <nav className="navbar">
      {/* Logo Left */}
      <div className="navbar-logo">Chat-App</div>

      {/* Center Nav Links */}
      <div className="navbar-links">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/general">General Chat</NavLink>
        <NavLink to="/private">Private Chat</NavLink>
      </div>

      {/* Right Buttons */}
      <div className="navbar-actions">
        <button className="theme-toggle" onClick={onThemeToggle}>
          Toggle Theme
        </button>
        <button className="logout-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
