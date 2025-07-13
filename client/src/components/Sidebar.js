import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ username, onLogout, darkMode, toggleDarkMode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <button className="menu-toggle" onClick={toggleSidebar}>
        {isOpen ? '✕' : '☰'}
      </button>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-username">{username}</div>
        </div>
        <div className="sidebar-links">
          <NavLink to="/" exact activeClassName="active" onClick={toggleSidebar}>
            Home
          </NavLink>
          <NavLink to="/general" activeClassName="active" onClick={toggleSidebar}>
            General
          </NavLink>
          <NavLink to="/private" activeClassName="active" onClick={toggleSidebar}>
            Private
          </NavLink>
        </div>
        <div className="sidebar-actions">
          <button onClick={toggleDarkMode}>
            {darkMode ? 'Light Theme' : 'Dark Theme'}
          </button>
          <button className="logout" onClick={() => { onLogout(); toggleSidebar(); }}>
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;