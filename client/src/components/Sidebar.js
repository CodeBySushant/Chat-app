import React, { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import './Sidebar.css';

function Sidebar({ username, onLogout, darkMode, toggleDarkMode }) {
  const [open, setOpen] = useState(true);

  return (
    <>
      <button className="sidebar-toggle" onClick={() => setOpen(!open)}>
        {open ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      <aside className={`sidebar ${open ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>Welcome, {username}</h2>
        </div>

        <button
          className="theme-btn"
          onClick={() => toggleDarkMode()}
          aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? 'Light Theme' : 'Dark Theme'}
        </button>

        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </aside>
    </>
  );
}

export default Sidebar;