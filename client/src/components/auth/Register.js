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
        <h2>Create your account</h2>
        <p>Start chatting by creating your account</p>

        <form onSubmit={handleRegister} className="register-form">
          <input
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="primary-btn">Sign Up →</button>
        </form>

        {message && (
          <p className={`message-msg ${success ? 'success' : 'error'}`}>{message}</p>
        )}

        <p className="switch-link">
          Already have an account?{' '}
          <button type="button" className="link-button" onClick={onSwitch}>
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;
