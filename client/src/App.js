import React, { useState, useEffect } from 'react';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Chat from './components/Chat';

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    if (storedUser) setUser(storedUser);
  }, []);

  if (!user) {
    return showRegister ? (
      <>
        <Register />
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
