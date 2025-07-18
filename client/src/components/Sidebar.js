import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

// Shared navigation links
const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/general', label: 'General' },
  { to: '/private', label: 'Private' },
  { to: '/friends', label: 'Friends' },
];

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
      <button
        className="menu-toggle"
        onClick={toggleSidebar}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {isOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-username">{username}</div>
        </div>

        <div className="sidebar-links">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={closeSidebar}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="sidebar-actions">
          <button
            onClick={() => {
              toggleDarkMode();
              closeSidebar();
            }}
            className="theme-toggle"
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button
            className="logout"
            onClick={() => {
              onLogout();
              closeSidebar();
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

export default React.memo(Sidebar);