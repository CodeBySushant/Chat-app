
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ onLogout, onThemeToggle, darkMode }) => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">Chat-app</div>
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
          Home
        </NavLink>
        <NavLink to="/general" className={({ isActive }) => (isActive ? 'active' : '')}>
          General
        </NavLink>
        <NavLink to="/private" className={({ isActive }) => (isActive ? 'active' : '')}>
          Private
        </NavLink>
        <NavLink to="/friends" className={({ isActive }) => (isActive ? 'active' : '')}>
          Friends
        </NavLink>
      </div>
      <div className="nav-actions">
        <button onClick={onThemeToggle} className="theme-toggle">
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
        <button onClick={onLogout} className="logout">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;