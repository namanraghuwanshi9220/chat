// src/components/UserSearch.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const UserSearch = ({ onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const q = query(collection(db, 'users'), where('displayName', '>=', searchTerm));
      getDocs(q).then((querySnapshot) => {
        let users = [];
        querySnapshot.forEach((doc) => {
          users.push(doc.data());
        });
        setUsers(users);
      });
    } else {
      setUsers([]);
    }
  }, [searchTerm]);

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="p-2 rounded-lg border border-gray-300"
        placeholder="Search users"
      />
      <ul className="mt-2">
        {users.map((user) => (
          <li key={user.uid} onClick={() => onSelectUser(user)} className="p-2 hover:bg-gray-200 cursor-pointer">
            {user.displayName}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserSearch;
