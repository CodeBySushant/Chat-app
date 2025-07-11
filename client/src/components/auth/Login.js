import React, { useState } from 'react';
import './Login.css';

function Login({ onLogin, onSwitch }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      setTimeout(() => setError(''), 4000);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setTimeout(() => setError(''), 4000);
      return;
    }

    setIsLoading(true);
    try {
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
        setError('');
      } else {
        setError(data.error || 'Login failed');
        setTimeout(() => setError(''), 4000);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setTimeout(() => setError(''), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Sign in to ChatApp</h2>
        <p>Welcome back! Please sign in to continue</p>

        <div className="oauth-buttons">
          <a href="http://localhost:5000/api/auth/google" className="oauth-btn google-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.18-.54-.28-1.12-.28-1.71s.1-1.17.28-1.71V6.45H2.18c-.85 1.72-1.34 3.58-1.34 5.59s.49 3.87 1.34 5.59l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.45l3.66 2.84c.87-2.6 3.3-4.91 6.16-4.91z" fill="#EA4335"/>
            </svg>
            Google
          </a>
          <a href="https://www.buymeacoffee.com/itsofficialsushant" className="oauth-btn coffee-btn">
            <img
              src="/buymeacoffee.webp"
              alt="Buy Me a Coffee"
              className="coffee-logo"
            />
            Buy Me a Coffee
          </a>
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
          <div className="password-container">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          <button type="submit" className="primary-btn" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        {error && <p className="error-msg" style={{ color: '#ff6666' }}>{error}</p>}

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