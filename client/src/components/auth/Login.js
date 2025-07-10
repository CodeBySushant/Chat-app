import React, { useState } from 'react';

function Login({ onLogin }) {
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
      // Save token in localStorage or state
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      onLogin(data.username);
    } else {
      setError(data.error || 'Login failed');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p>{error}</p>}
<<<<<<< HEAD

      {/* Add Google login button here */}
      <a href="http://localhost:5000/api/auth/google" style={{ display: 'inline-block', marginTop: '1rem' }}>
        <button type="button">Login with Google</button>
      </a>
=======
>>>>>>> origin/main
    </div>
  );
}

export default Login;
