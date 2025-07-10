import React, { useState, useEffect } from 'react';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Chat from './components/Chat';

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
<<<<<<< HEAD
    // 1. Check if user info is already saved locally
    const storedUser = localStorage.getItem('username');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      setUser(storedUser);
      return;
    }

    // 2. Check URL params for Google OAuth redirect with token & username
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const username = params.get('username');

    if (token && username) {
      // Save token and username locally
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      setUser(username);

      // Clean URL by removing query params
      window.history.replaceState({}, document.title, '/');
    }
=======
    const storedUser = localStorage.getItem('username');
    if (storedUser) setUser(storedUser);
>>>>>>> origin/main
  }, []);

  if (!user) {
    return showRegister ? (
      <>
<<<<<<< HEAD
        <Register onRegister={setUser} />
=======
        <Register />
>>>>>>> origin/main
        <button onClick={() => setShowRegister(false)}>Go to Login</button>
      </>
    ) : (
      <>
        <Login onLogin={setUser} />
        <button onClick={() => setShowRegister(true)}>Go to Register</button>
      </>
    );
  }

  return <Chat username={user} />;
}

export default App;
