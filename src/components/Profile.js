// src/components/Profile.js
import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { setDoc, doc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

const Profile = ({ onProfileComplete }) => {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const user = auth.currentUser;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('User not authenticated');

    try {
      // Update Firestore user data
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        username,
        bio,
      });

      // Update Firebase Authentication user profile
      await updateProfile(user, {
        displayName: username,
      });

      alert('Profile updated successfully');
      onProfileComplete(); // Call the function here to complete the profile process
    } catch (error) {
      alert(`Error updating profile: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
          required
        />
        <textarea
          placeholder="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default Profile;
