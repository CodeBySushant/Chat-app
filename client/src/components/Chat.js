import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './Chat.css';
import { FiPaperclip } from 'react-icons/fi';
import Picker from 'emoji-picker-react'; // emoji picker lib, install with: npm i emoji-picker-react

const socket = io('http://localhost:5000');

function Chat({ username }) {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [room, setRoom] = useState('');
  const [joined, setJoined] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    socket.on('chat-message', (data) => setChat((prev) => [...prev, data]));
    socket.on('user-typing', ({ user }) => user !== username && setTypingUser(user));
    socket.on('user-stop-typing', ({ user }) => user !== username && setTypingUser(null));

    return () => {
      socket.off('chat-message');
      socket.off('user-typing');
      socket.off('user-stop-typing');
    };
  }, [username]);

  // Auto-scroll to bottom when chat updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit('typing', { user: username, room });

    clearTimeout(typingTimeoutRef.current);
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

  // Handle emoji click
  const onEmojiClick = (emojiData) => {
  setMessage((prev) => prev + emojiData.emoji);
  setShowEmojiPicker(false); // Close emoji picker
  };

  // Validate & upload image file
  const handleImageUpload = async (file) => {
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB.');
      return;
    }

    // Show preview while uploading
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();

      // Send image message with img tag
      socket.emit('send-message', {
        user: username,
        message: `<img src="${data.url}" alt="uploaded" style="max-width: 200px;" />`,
        room,
      });

      setImagePreview(null);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Image upload failed. Please try again.');
      setImagePreview(null);
    }
  };

  // Handle file select via dialog or drag-drop
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
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
    <div
      className={`chat-wrapper ${darkMode ? 'dark' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{ userSelect: 'none' }}
    >
      <button className="logout-button" onClick={handleLogout}>Logout</button>
      <label className="dark-mode-toggle">
        <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
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
          />
          <button onClick={handleJoin}>Join Room</button>
        </div>
      ) : (
        <div className="chat-box">
          <h2>{username} in Room: {room}</h2>
          <div className="chat-messages">
            {chat.map((msg, idx) => (
              <div key={idx} className={`msg ${msg.user === username ? 'me' : ''}`}>
                <strong>{msg.user}: </strong>
                <span dangerouslySetInnerHTML={{ __html: msg.message }} />
              </div>
            ))}
            <div ref={chatEndRef} />
            {typingUser && <div className="typing-indicator"><em>{typingUser} is typing...</em></div>}
          </div>

          {imagePreview && (
            <div className="image-preview-container">
              <img src={imagePreview} alt="preview" style={{ maxWidth: 200, borderRadius: 8 }} />
              <button onClick={() => setImagePreview(null)} style={{ marginLeft: 8 }}>Cancel</button>
            </div>
          )}

          <div className="chat-input">
            <input
              type="text"
              value={message}
              placeholder="Type a message..."
              onChange={handleTyping}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              autoComplete="off"
            />
            <button onClick={sendMessage}>Send</button>

            <button
              className="upload-button"
              onClick={() => fileInputRef.current.click()}
              title="Attach Image"
              aria-label="Attach Image"
            >
              <FiPaperclip size={20} />
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            <button
              type="button"
              onClick={() => setShowEmojiPicker((val) => !val)}
              title="Toggle Emoji Picker"
              aria-label="Toggle Emoji Picker"
              style={{ marginLeft: 8 }}
            >
              😊
            </button>
          </div>

          {showEmojiPicker && (
            <div style={{ position: 'absolute', bottom: '70px', right: '40px', zIndex: 10 }}>
              <Picker onEmojiClick={onEmojiClick} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Chat;
