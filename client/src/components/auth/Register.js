import React, { useState } from 'react';
import './Register.css';

function Register({ onSwitch }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#666"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 19.5c-5 0-9.27-3.11-11-7.5 1.73-4.39 6-7.5 11-7.5s9.27 3.11 11 7.5c-.58 1.47-1.43 2.83-2.54 3.94m-6.4-6.4c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3zm4.56 9.44l1.41-1.41c2.07-2.07 3.24-4.87 3.24-7.53 0-5.52-4.48-10-10-10S2 6.48 2 12s4.48 10 10 10c2.66 0 5.07-1.05 6.83-2.76l-1.41 1.41z" fill="#666"/>
                  </svg>
                )}
              </button>
            </div>
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