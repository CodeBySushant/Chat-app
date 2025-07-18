// src/components/Friends.js
import React, { useState, useEffect, useCallback } from 'react';
import './Friends.css';
import axios from 'axios';
import debounce from 'lodash/debounce';

const Friends = ({ username }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/friends', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingRequests(response.data.pendingRequests || []);
      setSentRequests(response.data.sentRequests || []);
      setFriends(response.data.friends || []);
    } catch (err) {
      setError('Failed to load friends data');
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = useCallback(
    debounce(async (query) => {
      if (query.trim() === '') {
        setSearchResults([]);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`http://localhost:5000/api/users/search?query=${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSearchResults(response.data.filter(user => user !== username));
      } catch (err) {
        setError('Error searching users');
      } finally {
        setLoading(false);
      }
    }, 500),
    [username, token]
  );

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, handleSearch]);

  const sendFriendRequest = async (recipient) => {
    try {
      await axios.post(
        'http://localhost:5000/api/friends/request',
        { recipient },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSentRequests([...sentRequests, recipient]);
    } catch (err) {
      setError(err.response?.data?.error || 'Error sending friend request');
    }
  };

  const acceptFriendRequest = async (sender) => {
    try {
      await axios.post(
        'http://localhost:5000/api/friends/accept',
        { sender },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingRequests(pendingRequests.filter(req => req !== sender));
      setFriends([...friends, sender]);
    } catch (err) {
      setError(err.response?.data?.error || 'Error accepting friend request');
    }
  };

  const rejectFriendRequest = async (sender) => {
    try {
      await axios.post(
        'http://localhost:5000/api/friends/reject',
        { sender },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingRequests(pendingRequests.filter(req => req !== sender));
    } catch (err) {
      setError(err.response?.data?.error || 'Error rejecting friend request');
    }
  };

  return (
    <div className="friends-wrapper">
      <h2>Friends</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search users by username"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={() => handleSearch(searchQuery)}>Search</button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="search-results">
        {loading ? (
          <p>Loading...</p>
        ) : searchQuery && searchResults.length === 0 ? (
          <p>No users found</p>
        ) : (
          searchResults.map(user => (
            <div key={user} className="user-item">
              <span>{user}</span>
              {friends.includes(user) ? (
                <span>Friend</span>
              ) : sentRequests.includes(user) ? (
                <span>Request Sent</span>
              ) : (
                <button onClick={() => sendFriendRequest(user)}>Send Friend Request</button>
              )}
            </div>
          ))
        )}
      </div>

      <div className="pending-requests">
        <h3>Pending Requests</h3>
        {pendingRequests.length === 0 ? (
          <p>No pending requests</p>
        ) : (
          pendingRequests.map(sender => (
            <div key={sender} className="request-item">
              <span>{sender}</span>
              <div>
                <button onClick={() => acceptFriendRequest(sender)}>Accept</button>
                <button onClick={() => rejectFriendRequest(sender)}>Reject</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="friends-list">
        <h3>Your Friends</h3>
        {friends.length === 0 ? (
          <p>No friends yet</p>
        ) : (
          friends.map(friend => (
            <div key={friend} className="friend-item">
              <span>{friend}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Friends;
