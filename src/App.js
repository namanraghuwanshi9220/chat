// src/App.js
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import Login from './components/Login';
import SetUsername from './components/SetUsername';
import Chat from './components/Chat';
import { doc, getDoc } from 'firebase/firestore';
import LoadingSpinner from './components/LoadingSpinner'; // Import LoadingSpinner

const App = () => {
  const [user, setUser] = useState(null);
  const [usernameSet, setUsernameSet] = useState(false);
  const [loading, setLoading] = useState(true); // New loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().username) {
          setUsernameSet(true);
        } else {
          setUsernameSet(false); // User exists but username not set
        }
      } else {
        setUser(null);
        setUsernameSet(false);
      }
      setLoading(false); // Set loading to false once check is complete
    });

    return () => unsubscribe();
  }, []);

  // Show loading spinner while checking auth status
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Login onLogin={() => setUser(auth.currentUser)} />;
  }

  if (!usernameSet) {
    return <SetUsername onUsernameSet={() => setUsernameSet(true)} />;
  }

  return <Chat />;
};

export default App;
