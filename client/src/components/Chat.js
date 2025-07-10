import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './Chat.css';

const socket = io('http://localhost:5000');

function Chat() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    socket.on('chat-message', (data) => {
      setChat((prev) => [...prev, data]);
    });

    return () => socket.off('chat-message');
  }, []);

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit('send-message', { user: username, message });
    setMessage('');
  };

  const handleJoin = () => {
    if (username.trim()) setJoined(true);
  };

  return (
    <div className="chat-wrapper">
      {!joined ? (
        <div className="login-box">
          <h2>Enter Your Name</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your name"
          />
          <button onClick={handleJoin}>Join Chat</button>
        </div>
      ) : (
        <div className="chat-box">
          <h2>Welcome, {username} 👋</h2>
          <div className="chat-messages">
            {chat.map((msg, idx) => (
              <div key={idx} className={`msg ${msg.user === username ? 'me' : ''}`}>
                <strong>{msg.user}: </strong>
                {msg.message}
              </div>
            ))}
          </div>
          <div className="chat-input">
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
