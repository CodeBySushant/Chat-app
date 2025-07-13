import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar({ onLogout, onThemeToggle, darkMode }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo">ChatApp</div>
      <div className="navbar-links">
        <NavLink to="/" exact activeClassName="active">Home</NavLink>
        <NavLink to="/general" activeClassName="active">General</NavLink>
        <NavLink to="/private" activeClassName="active">Private</NavLink>
      </div>
      <div className="navbar-actions">
        <button onClick={onThemeToggle}>{darkMode ? 'Light Theme' : 'Dark Theme'}</button>
        <button onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;