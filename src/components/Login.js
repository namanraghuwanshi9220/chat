import React, { useState } from 'react';
import { auth, db } from '../firebase'; // Make sure to configure Firebase
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError(''); // Clear error when toggling
  };

  const handleAuth = async () => {
    setError(''); // Clear previous error
    setLoading(true); // Disable button while loading
    try {
      if (isLogin) {
        // Login
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Check if email is already used
        const userDoc = await getDoc(doc(db, 'users', email));
        if (userDoc.exists()) {
          throw new Error('Email is already in use');
        }

        // Signup
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Add user data to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          username: username,
          email: email,
          status: 'online'
        });
      }
      setEmail('');
      setPassword('');
      setUsername('');
    } catch (err) {
      setError(err.message); // Set error message to state
      console.error('Error during authentication:', err);
    } finally {
      setLoading(false); // Re-enable button
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Chat-App</h1>
      <div className="bg-white p-8 rounded shadow-md w-96">
        {error && <p className="text-red-500 mb-4">{error}</p>} {/* Display error message */}
        
        <div className="mb-4">
          <label className="block mb-2">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading} // Disable input while loading
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading} // Disable input while loading
          />
        </div>
        {!isLogin && (
          <div className="mb-4">
            <label className="block mb-2">Username</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading} // Disable input while loading
            />
          </div>
        )}
        <button
          onClick={handleAuth}
          className={`w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading} // Disable button while loading
        >
          {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
        </button>
        <div className="mt-4 text-center">
          {isLogin ? (
            <>
              Don't have an account?{' '}
              <button onClick={toggleAuthMode} className="text-blue-500 underline">
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={toggleAuthMode} className="text-blue-500 underline">
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
