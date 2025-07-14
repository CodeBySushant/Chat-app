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

  useEffect(() => {
    // Fetch friends
    const fetchFriends = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/friends', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFriends(response.data.friends);
      } catch (err) {
        console.error('Error fetching friends:', err);
      }
    };
    fetchFriends();
  }, []);

  useEffect(() => {
    if (!selectedFriend) return;

    const room = [username, selectedFriend].sort().join('_');
    socket.emit('join-private-room', { username, friend: selectedFriend });

    // Fetch message history
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/messages/private/${room}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(response.data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };
    fetchMessages();

    socket.on('private-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('user-typing', ({ user }) => {
      if (user !== username) setTyping(user);
    });

    socket.on('user-stop-typing', () => {
      setTyping('');
    });

    return () => {
      socket.off('private-message');
      socket.off('user-typing');
      socket.off('user-stop-typing');
    };
  }, [selectedFriend, username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() && !image) return;
    const room = [username, selectedFriend].sort().join('_');
    const msgData = { user: username, message: message || image, room };

    try {
      socket.emit('send-private-message', msgData);
      setMessage('');
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData);
      setImage(response.data.url);
    } catch (err) {
      console.error('Error uploading image:', err);
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleTyping = () => {
    if (!selectedFriend) return;
    const room = [username, selectedFriend].sort().join('_');
    socket.emit('typing', { user: username, room });
    setTimeout(() => socket.emit('stop-typing', { user: username, room }), 2000);
  };

  return (
    <div className="private-chat-wrapper">
      {!selectedFriend ? (
        <div className="friends-list">
          <h2>Select a Friend</h2>
          {friends.length === 0 ? (
            <p>No friends yet</p>
          ) : (
            friends.map(friend => (
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
          <h2>Chat with {selectedFriend}</h2>
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`msg ${msg.user === username ? 'me' : ''}`}>
                <strong>{msg.user}:</strong> {msg.message}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="reactions">
                    {msg.reactions.map((r, i) => (
                      <span key={i} className="reaction">{r.emoji}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
            {typing && <div className="typing-indicator">{typing} is typing...</div>}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                handleTyping();
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder="Type a message..."
            />
            <button className="emoji-button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
              <BsEmojiSmile />
            </button>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            <button className="upload-button" onClick={() => fileInputRef.current.click()}>
              <MdOutlineImage />
            </button>
            <button onClick={handleSendMessage}>
              <IoSend />
            </button>
            {image && (
              <div className="image-preview-container">
                <img src={image} alt="Preview" style={{ maxWidth: '100px' }} />
                <button className="preview-cancel-button" onClick={() => setImage(null)}>
                  Cancel
                </button>
              </div>
            )}
            {showEmojiPicker && (
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            )}
          </div>
          <button onClick={() => setSelectedFriend(null)}>Back to Friends</button>
        </div>
      )}
    </div>
  );
};

export default PrivateChat;