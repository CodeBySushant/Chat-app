import React, { useState } from 'react';
import './Register.css';

function Register({ onSwitch }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage('✅ Registration successful! You can now login.');
      setSuccess(true);
      setUsername('');
      setPassword('');
    } else {
      setMessage(data.error || '❌ Registration failed');
      setSuccess(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Create Your Account</h2>
        <p className="subtitle">Join us and start chatting today!</p>

        <form onSubmit={handleRegister} className="register-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="primary-btn">
            Sign Up
          </button>
        </form>

        {message && (
          <p className={`message ${success ? 'success' : 'error'}`}>
            {message}
          </p>
        )}

        <p className="switch-link">
          Already have an account?{' '}
          <button type="button" className="link-button" onClick={onSwitch}>
            Log In
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;