import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Chat from './components/Chat';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import PrivateChat from './components/PrivateChat';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

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

  return (
    <Router>
      <div className={`app-container ${darkMode ? 'dark' : ''}`}>
        <div className="desktop-nav">
          <Navbar onLogout={handleLogout} onThemeToggle={toggleDarkMode} />
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
            <Route path="/private" element={<PrivateChat />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;