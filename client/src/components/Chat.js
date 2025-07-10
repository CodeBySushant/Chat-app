import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './Chat.css';

const socket = io('http://localhost:5000');

function Chat({ username }) {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [room, setRoom] = useState('');
  const [joined, setJoined] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize darkMode state from localStorage (if exists)
    const saved = localStorage.getItem('darkMode');
    return saved === 'true'; // saved is string, convert to boolean
  });

  useEffect(() => {
    socket.on('chat-message', (data) => {
      setChat((prev) => [...prev, data]);
    });

    return () => socket.off('chat-message');
  }, []);

  // Save darkMode preference whenever it changes
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit('send-message', { user: username, message });
    setMessage('');
  };

  const handleJoin = () => {
    if (room.trim()) {
      socket.emit('join-room', { username, room });
      setJoined(true);
      setChat([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.reload();
  };

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <div className={`chat-wrapper ${darkMode ? 'dark' : ''}`}>
      <button className="logout-button" onClick={handleLogout}>Logout</button>
      <button className="dark-mode-toggle" onClick={toggleDarkMode}>
        {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>

      {!joined ? (
        <div className="login-box">
          <h2>Welcome, {username}</h2>
          <input
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Enter room name"
            style={{ marginTop: '10px' }}
          />
          <button onClick={handleJoin}>Join Room</button>
        </div>
      ) : (
        <div className="chat-box">
          <h2>
            {username} in Room: {room}
          </h2>
          <div className="chat-messages" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {chat.map((msg, idx) => (
              <div key={idx} className={`msg ${msg.user === username ? 'me' : ''}`}>
                <strong>{msg.user}: </strong>
                {msg.message}
              </div>
            ))}
          </div>
          <div className="chat-input" style={{ marginTop: '10px' }}>
            <input
              type="text"
              value={message}
              placeholder="Type a message..."
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
