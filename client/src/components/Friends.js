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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/friends', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendingRequests(response.data.pendingRequests || []);
        setSentRequests(response.data.sentRequests || []);
        setFriends(response.data.friends || []);
      } catch (err) {
        setError('Failed to load friends data');
      }
    };
    fetchData();
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearch = useCallback(
    debounce((query) => {
      if (query.trim() === '') {
        setSearchResults([]);
        return;
      }
      setLoading(true);
      setError('');
      axios
        .get(`http://localhost:5000/api/users/search?query=${query}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        .then((response) => {
          setSearchResults(response.data.filter(user => user !== username));
        })
        .catch(() => {
          setError('Error searching users');
        })
        .finally(() => {
          setLoading(false);
        });
    }, 500),
    [username]
  );

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, handleSearch]);

  const sendFriendRequest = async (recipient) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/friends/request',
        { recipient },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSentRequests([...sentRequests, recipient]);
    } catch (err) {
      setError('Error sending friend request');
    }
  };

  const acceptFriendRequest = async (sender) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/friends/accept',
        { sender },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingRequests(pendingRequests.filter(req => req !== sender));
      setFriends([...friends, sender]);
    } catch (err) {
      setError('Error accepting friend request');
    }
  };

  const rejectFriendRequest = async (sender) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/friends/reject',
        { sender },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingRequests(pendingRequests.filter(req => req !== sender));
    } catch (err) {
      setError('Error rejecting friend request');
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
        ) : searchResults.length === 0 && searchQuery ? (
          <p>No users found</p>
        ) : (
          searchResults.map(user => (
            <div key={user} className="user-item">
              <span>{user}</span>
              {sentRequests.includes(user) ? (
                <span>Request Sent</span>
              ) : friends.includes(user) ? (
                <span>Friend</span>
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