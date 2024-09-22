import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import SkeletonLoader from './SkeletonLoader';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let msgs = [];
      querySnapshot.forEach((doc) => {
        msgs.push(doc.data());
      });
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    const user = auth.currentUser;
    if (!user) return;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const username = userDoc.exists() ? userDoc.data().username : user.email;

    await addDoc(collection(db, 'messages'), {
      text: newMessage,
      username: username,
      uid: user.uid,
      createdAt: new Date(),
    });

    setNewMessage('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="p-4 bg-blue-600 text-white flex justify-between items-center">
        <h1 className="text-lg font-bold">Chat App</h1>
        <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">
          Logout
        </button>
      </header>
      
      <div className="flex-grow overflow-y-auto p-4">
        {loading ? (
          <SkeletonLoader />
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex mb-4 ${message.uid === auth.currentUser.uid ? 'justify-end ' : 'justify-start'}`}
            >
              <div
                className={`rounded-lg p-4 shadow-lg ${
                  message.uid === auth.currentUser.uid
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-300 text-black rounded-bl-none'
                } max-w-xs`}
              >
                <div className="flex justify-between items-center mb-1 ">
                  <div className="font-bold flex ">{message.username}:</div>
                </div>
                <div>{message.text}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-gray-200 flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow p-2 border rounded-lg mr-2"
          placeholder="Type your message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
