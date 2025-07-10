import React, { useState } from 'react';

function SetUsername({ token, onUsernameSet }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSetUsername = async (e) => {
    e.preventDefault();

    const res = await fetch('http://localhost:5000/api/auth/set-username', {
      method: 'POST', // or PATCH if you want
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username }),
    });

    const data = await res.json();

    if (res.ok) {
      onUsernameSet(username);
    } else {
      setError(data.error || 'Failed to set username');
    }
  };

  return (
    <form onSubmit={handleSetUsername}>
      <h2>Choose a username</h2>
      <input
        type="text"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
      />
      <button type="submit">Save Username</button>
      {error && <p>{error}</p>}
    </form>
  );
}

export default SetUsername;
