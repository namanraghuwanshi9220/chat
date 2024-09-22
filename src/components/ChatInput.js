// src/components/ChatInput.js
import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const ChatInput = () => {
  const [text, setText] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    if (text.trim()) {
      await addDoc(collection(db, 'messages'), {
        text,
        uid: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
      setText('');
    }
  };

  return (
    <form onSubmit={sendMessage} className="p-4 flex">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-grow p-2 rounded-lg border border-gray-300"
        type="text"
        placeholder="Type a message"
      />
      <button className="ml-2 p-2 rounded-lg bg-blue-500 text-white" type="submit">
        Send
      </button>
    </form>
  );
};

export default ChatInput;
