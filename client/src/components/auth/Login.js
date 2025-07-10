import React, { useState } from 'react';
import './Login.css';

function Login({ onLogin, onSwitch }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      onLogin(data.username);
    } else {
      setError(data.error || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Sign in to ChatApp</h2>
        <p>Welcome back! Please sign in to continue</p>

        <div className="oauth-buttons">
          <a href="http://localhost:5000/api/auth/google" className="oauth-btn google-btn">🔵 Google</a>
          <a href="#" className="oauth-btn github-btn" disabled>⚫ GitHub (Coming Soon)</a>
        </div>

        <div className="divider"><span>or</span></div>

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="primary-btn">Continue →</button>
        </form>

        <a className="passkey-link" href="#">Use passkey instead</a>

        {error && <p className="error-msg">{error}</p>}

        <p className="signup-link">
          Don’t have an account?{' '}
          <button type="button" className="link-button" onClick={onSwitch}>
            Sign up
          </button>
        </p>
        <p className="secured-by">Secured by ChatApp</p>
      </div>
    </div>
  );
}

export default Login;