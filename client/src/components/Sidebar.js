import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ username, onLogout, darkMode, toggleDarkMode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto'; // Cleanup on unmount
    };
  }, [isOpen]);

  return (
    <>
      <button className="menu-toggle" onClick={toggleSidebar}>
        {isOpen ? '✕' : '☰'}
      </button>

      {isOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-username">{username}</div>
        </div>

        <div className="sidebar-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={closeSidebar}
          >
            Home
          </NavLink>
          <NavLink
            to="/general"
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={closeSidebar}
          >
            General
          </NavLink>
          <NavLink
            to="/private"
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={closeSidebar}
          >
            Private
          </NavLink>
        </div>

        <div className="sidebar-actions">
          <button onClick={() => { toggleDarkMode(); closeSidebar(); }}>
            {darkMode ? 'Light Theme' : 'Dark Theme'}
          </button>
          <button className="logout" onClick={() => { onLogout(); closeSidebar(); }}>
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;