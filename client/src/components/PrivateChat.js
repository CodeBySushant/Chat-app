import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';
import './PrivateChat.css';
import axios from 'axios';
import { IoSend } from 'react-icons/io5';
import { BsEmojiSmile } from 'react-icons/bs';
import { MdOutlineImage } from 'react-icons/md';

const socket = io('http://localhost:5000');

const PrivateChat = ({ username, darkMode }) => {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [image, setImage] = useState(null);
  const [typing, setTyping] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch accepted friends list
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/friends', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFriends(res.data.friends || []);
      } catch (err) {
        console.error('Error fetching friends:', err);
      }
    };
    fetchFriends();
  }, []);

  // Handle room join, message fetch and socket listeners
  useEffect(() => {
    if (!selectedFriend) return;

    const room = [username, selectedFriend].sort().join('_');
    socket.emit('join-private-room', { username, friend: selectedFriend });

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/messages/private/${room}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };
    fetchMessages();

    const handlePrivateMessage = (msg) => {
      if (msg.room === room) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleTyping = ({ user }) => {
      if (user !== username) setTyping(`${user} is typing...`);
    };

    const handleStopTyping = () => {
      setTyping('');
    };

    socket.on('private-message', handlePrivateMessage);
    socket.on('user-typing', handleTyping);
    socket.on('user-stop-typing', handleStopTyping);

    return () => {
      socket.off('private-message', handlePrivateMessage);
      socket.off('user-typing', handleTyping);
      socket.off('user-stop-typing', handleStopTyping);
    };
  }, [selectedFriend, username]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message (text or image)
  const handleSendMessage = () => {
    if (!message.trim() && !image) return;
    const room = [username, selectedFriend].sort().join('_');
    const msgData = { user: username, message: image || message, room };

    socket.emit('send-private-message', msgData);
    setMessage('');
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    socket.emit('stop-typing', { user: username, room });
  };

  // Upload image
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await axios.post('http://localhost:5000/api/upload', formData);
      setImage(res.data.url);
    } catch (err) {
      console.error('Error uploading image:', err);
    }
  };

  // Handle emoji click
  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // Typing event
  const handleTyping = () => {
    if (!selectedFriend) return;
    const room = [username, selectedFriend].sort().join('_');
    socket.emit('typing', { user: username, room });

    setTimeout(() => {
      socket.emit('stop-typing', { user: username, room });
    }, 2000);
  };

  return (
    <div className={`private-chat-wrapper ${darkMode ? 'dark' : ''}`}>
      {!selectedFriend ? (
        <div className="friends-list">
          <h2>Select a Friend</h2>
          {friends.length === 0 ? (
            <p>No friends yet</p>
          ) : (
            friends.map((friend) => (
              <div
                key={friend}
                className="friend-item"
                onClick={() => setSelectedFriend(friend)}
              >
                {friend}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="chat-box">
          <div className="chat-header">
            <h2>Chat with {selectedFriend}</h2>
            <button onClick={() => setSelectedFriend(null)}>← Back</button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`msg ${msg.user === username ? 'me' : ''}`}>
                <strong>{msg.user}:</strong>{' '}
                {msg.message.startsWith('http') && msg.message.includes('cloudinary') ? (
                  <img src={msg.message} alt="uploaded" style={{ maxWidth: '200px' }} />
                ) : (
                  msg.message
                )}
                {msg.reactions?.length > 0 && (
                  <div className="reactions">
                    {msg.reactions.map((r, i) => (
                      <span key={i}>{r.emoji}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {typing && <div className="typing-indicator">{typing}</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                handleTyping();
                if (e.key === 'Enter') handleSendMessage();
              }}
            />
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
              <BsEmojiSmile />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
            <button onClick={() => fileInputRef.current.click()}>
              <MdOutlineImage />
            </button>
            <button onClick={handleSendMessage}>
              <IoSend />
            </button>
          </div>

          {image && (
            <div className="image-preview">
              <img src={image} alt="Preview" style={{ maxWidth: '150px' }} />
              <button onClick={() => setImage(null)}>Cancel</button>
            </div>
          )}

          {showEmojiPicker && (
            <div className="emoji-picker-wrapper">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PrivateChat;
