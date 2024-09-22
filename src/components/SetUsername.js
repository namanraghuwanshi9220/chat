// src/components/SetUsername.js
import React, { useState } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const SetUsername = ({ onUsernameSet }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (user) {
      const userRef = doc(db, 'usernames', username);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        alert('Username already exists. Please choose a different one.');
      } else {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          username: username,
        });
        await setDoc(doc(db, 'usernames', username), { uid: user.uid });
        onUsernameSet(); // Callback to indicate username is set
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Set Username</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          Set Username
        </button>
      </form>
    </div>
  );
};

export default SetUsername;