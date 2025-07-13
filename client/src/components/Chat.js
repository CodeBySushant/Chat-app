import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './Chat.css';
import { FiPaperclip } from 'react-icons/fi';
import { BsEmojiSmile } from 'react-icons/bs';
import Picker from 'emoji-picker-react';

function Chat({ username, darkMode }) {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [room, setRoom] = useState('');
  const [joined, setJoined] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');
    socketRef.current.on('chat-message', (data) => setChat((prev) => [...prev, data]));
    socketRef.current.on('message-edited', ({ messageId, newContent }) => {
      setChat((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, message: newContent, edited: true } : msg
        )
      );
    });
    socketRef.current.on('message-deleted', ({ messageId }) => {
      setChat((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, message: '[deleted]', deleted: true } : msg
        )
      );
    });
    socketRef.current.on('user-typing', ({ user }) => user !== username && setTypingUser(user));
    socketRef.current.on('user-stop-typing', ({ user }) => user !== username && setTypingUser(null));

    return () => {
      socketRef.current.disconnect();
    };
  }, [username]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const handleTyping = (e) => {
    setMessage(e.target.value);
    socketRef.current.emit('typing', { user: username, room });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('stop-typing', { user: username, room });
    }, 1000);
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    if (editingId) {
      socketRef.current.emit('edit-message', { messageId: editingId, newContent: message });
      setEditingId(null);
    } else {
      socketRef.current.emit('send-message', { user: username, message, room });
    }
    setMessage('');
    socketRef.current.emit('stop-typing', { user: username, room });
  };

  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    if (msg.user === username) {
      setContextMenu({ x: e.pageX, y: e.pageY, message: msg });
    }
  };

  const handleEdit = () => {
    setMessage(contextMenu.message.message);
    setEditingId(contextMenu.message._id);
    setContextMenu(null);
  };

  const handleDelete = () => {
    socketRef.current.emit('delete-message', { messageId: contextMenu.message._id });
    setContextMenu(null);
  };

  const handleEmoji = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  const onEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Only image files allowed');
    if (file.size > 5 * 1024 * 1024) return alert('Max 5MB image');

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
      const data = await res.json();
      socketRef.current.emit('send-message', {
        user: username,
        message: `<img src="${data.url}" alt="uploaded" style="max-width:200px;" />`,
        room,
      });
      setImagePreview(null);
    } catch (err) {
      alert('Upload failed');
      setImagePreview(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) handleImageUpload(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) handleImageUpload(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleJoin = async () => {
    if (room.trim()) {
      try {
        const res = await fetch(`http://localhost:5000/api/messages/${room}`);
        const messages = await res.json();
        setChat(messages);
      } catch (err) {
        alert('Failed to load chat history');
      }

      socketRef.current.emit('join-room', { username, room });
      setJoined(true);
    }
  };

  return (
    <div
      className={`chat-wrapper ${darkMode ? 'dark' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => setContextMenu(null)}
    >
      {!joined ? (
        <div className="login-box">
          <h2>Welcome, {username}</h2>
          <input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Enter room name" />
          <button onClick={handleJoin}>Join Room</button>
        </div>
      ) : (
        <div className="chat-box">
          <h2>{username} in Room: {room}</h2>
          <div className="chat-messages">
            {chat.map((msg, idx) => (
              <div
                key={msg._id || idx}
                onContextMenu={(e) => handleContextMenu(e, msg)}
                className={`msg ${msg.user === username ? 'me' : ''}`}
              >
                <strong>{msg.user}: </strong>
                <span dangerouslySetInnerHTML={{ __html: msg.message }} />
                {msg.edited && <span className="edited-tag"> (edited)</span>}
              </div>
            ))}
            <div ref={chatEndRef} />
            {typingUser && <div className="typing-indicator"><em>{typingUser} is typing...</em></div>}
          </div>

          {imagePreview && (
            <div className="image-preview-container">
              <img src={imagePreview} alt="preview" style={{ maxWidth: 200, borderRadius: 8 }} />
              <button className="preview-cancel-button" onClick={() => setImagePreview(null)} style={{ marginLeft: 8 }}>Cancel</button>
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
            <button onClick={sendMessage}>{editingId ? 'Save' : 'Send'}</button>

            <button
              className="upload-button"
              onClick={() => fileInputRef.current.click()}
              title="Attach Image"
              aria-label="Attach Image"
            >
              <FiPaperclip size={20} />
            </button>

            <button
              className="emoji-button"
              onClick={handleEmoji}
              title="Add Emoji"
              aria-label="Add Emoji"
            >
              <BsEmojiSmile size={20} />
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {showEmojiPicker && (
            <div style={{ position: 'absolute', bottom: '70px', right: '40px', zIndex: 10 }}>
              <Picker onEmojiClick={onEmojiClick} />
            </div>
          )}

          {contextMenu && (
            <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }}>
              <button onClick={handleEdit}>Edit</button>
              <button onClick={handleDelete}>Delete</button>
              <button onClick={handleEmoji}>Emoji</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Chat;