import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './Chat.css';

const socket = io('http://localhost:5000');

function Chat({ username }) {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [room, setRoom] = useState('');
  const [joined, setJoined] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  const [image, setImage] = useState(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    socket.on('chat-message', (data) => {
      setChat((prev) => [...prev, data]);
    });

    socket.on('user-typing', ({ user }) => {
      if (user !== username) {
        setTypingUser(user);
      }
    });

    socket.on('user-stop-typing', ({ user }) => {
      if (user !== username) {
        setTypingUser(null);
      }
    });

    return () => {
      socket.off('chat-message');
      socket.off('user-typing');
      socket.off('user-stop-typing');
    };
  }, [username]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleTyping = (e) => {
    setMessage(e.target.value);

    socket.emit('typing', { user: username, room });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop-typing', { user: username, room });
    }, 1000);
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit('send-message', { user: username, message, room });
    setMessage('');
    socket.emit('stop-typing', { user: username, room });
  };

  const handleImageUpload = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append('image', image);

    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();

      // Send image message with <img> tag as message content
      socket.emit('send-message', {
        user: username,
        message: `<img src="${data.url}" alt="uploaded" style="max-width: 200px;" />`,
        room,
      });

      setImage(null);
    } catch (err) {
      console.error('Upload error:', err);
    }
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
      <label className="dark-mode-toggle">
        <input
          type="checkbox"
          checked={darkMode}
          onChange={toggleDarkMode}
        />
        <span className="toggle-switch"></span>
      </label>

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
          <h2>{username} in Room: {room}</h2>
          <div className="chat-messages" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {chat.map((msg, idx) => (
              <div
                key={idx}
                className={`msg ${msg.user === username ? 'me' : ''}`}
              >
                <strong>{msg.user}: </strong>
                <span
                  dangerouslySetInnerHTML={{ __html: msg.message }}
                />
              </div>
            ))}
            {typingUser && (
              <div className="typing-indicator">
                <em>{typingUser} is typing...</em>
              </div>
            )}
          </div>
          <div className="chat-input" style={{ marginTop: '10px' }}>
            <input
              type="text"
              value={message}
              placeholder="Type a message..."
              onChange={handleTyping}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>

            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              accept="image/*"
              style={{ marginLeft: '10px' }}
            />
            <button onClick={handleImageUpload} disabled={!image}>
              Upload Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
