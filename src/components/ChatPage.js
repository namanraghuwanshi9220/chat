// src/components/ChatPage.js
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

const ChatPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [globalMessages, setGlobalMessages] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch messages from global group
    const fetchMessages = async () => {
      const q = query(collection(db, 'globalGroup'));
      const querySnapshot = await getDocs(q);
      const messages = [];
      querySnapshot.forEach((doc) => messages.push(doc.data()));
      setGlobalMessages(messages);
    };

    fetchMessages();
  }, []);

  const handleSearch = async () => {
    const q = query(
      collection(db, 'users'),
      where('username', '>=', searchTerm),
      where('username', '<=', searchTerm + '\uf8ff')
    );
    const querySnapshot = await getDocs(q);
    const result = [];
    querySnapshot.forEach((doc) => result.push(doc.data()));
    setUsers(result);
  };

  const sendMessage = async () => {
    const user = auth.currentUser;
    if (!user) return alert('You must be logged in');

    try {
      await addDoc(collection(db, 'globalGroup'), {
        message,
        username: user.displayName || 'Anonymous',
        createdAt: new Date(),
      });
      setMessage('');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Global Group Chat</h2>
        <div className="space-y-4 mb-6">
          {globalMessages.map((msg, index) => (
            <div key={index} className="bg-gray-100 p-3 rounded-md">
              <p className="text-sm font-bold">{msg.username}</p>
              <p>{msg.message}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center space-x-4 mb-6">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600"
          >
            Send
          </button>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Search Users</h2>
          <div className="flex items-center space-x-4 mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600"
            >
              Search
            </button>
          </div>
          <div className="space-y-4">
            {users.map((user, index) => (
              <div key={index} className="bg-gray-100 p-3 rounded-md">
                <p className="text-sm font-bold">{user.username}</p>
                <p>{user.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
