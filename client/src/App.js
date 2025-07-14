import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Chat from './components/Chat';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import PrivateChat from './components/PrivateChat';
import Friends from './components/Friends';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      setUser(storedUser);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const username = params.get('username');

    if (token && username) {
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      setUser(username);
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  if (!user) {
    return showRegister ? (
      <Register onSwitch={() => setShowRegister(false)} />
    ) : (
      <Login onLogin={setUser} onSwitch={() => setShowRegister(true)} />
    );
  }

  const isChatRoute = location.pathname === '/general' || location.pathname === '/private';
  const isHomepage = location.pathname === '/';

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''} ${isChatRoute ? 'no-scroll' : ''} ${isHomepage ? 'homepage-active' : ''}`}>
      <div className="desktop-nav">
        <Navbar onLogout={handleLogout} onThemeToggle={toggleDarkMode} darkMode={darkMode} />
      </div>
      <div className="mobile-nav">
        <Sidebar
          username={user}
          onLogout={handleLogout}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
      </div>
      <div className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/general" element={<Chat username={user} darkMode={darkMode} />} />
          <Route path="/private" element={<PrivateChat username={user} darkMode={darkMode} />} />
          <Route path="/friends" element={<Friends username={user} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;