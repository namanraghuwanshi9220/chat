import React, { useState, useEffect, useRef } from 'react';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import SkeletonLoader from './SkeletonLoader';
import { format, isSameDay } from 'date-fns';

// ReplyContext Component
const ReplyContext = ({ messageId }) => {
  const [originalMessage, setOriginalMessage] = useState(null);

  useEffect(() => {
    const fetchOriginalMessage = async () => {
      if (!messageId) return;
      const docRef = doc(db, 'messages', messageId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setOriginalMessage(docSnap.data());
      }
    };

    fetchOriginalMessage();
  }, [messageId]);

  if (!originalMessage) return null;

  return (
    <div className="bg-gray-200 p-2 mb-2 rounded text-black"> {/* Added text-black */}
      <span className="font-bold">{originalMessage.username}:</span> {originalMessage.text}
    </div>
  );
};

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState(0);
  const [replyingTo, setReplyingTo] = useState(null); // State for replying
  const messagesEndRef = useRef(null);

  // Fetch messages and track active users
  useEffect(() => {
    // Query messages in ascending order
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
      const msgs = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        msgs.push({ id: doc.id, ...data });
      });
      setMessages(msgs);
      setLoading(false);
    });

    // Track active users
    const usersRef = collection(db, 'users');
    const unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
      const activeUsersCount = snapshot.docs.filter(doc => doc.data().isOnline).length;
      setActiveUsers(activeUsersCount);
    });

    // Mark user as online on component mount
    const markOnline = async () => {
      if (auth.currentUser) {
        const userDoc = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userDoc, { isOnline: true, lastActive: serverTimestamp() });
      }
    };
    markOnline();

    // Cleanup and mark user as offline on component unmount
    return () => {
      if (auth.currentUser) {
        const userDoc = doc(db, 'users', auth.currentUser.uid);
        updateDoc(userDoc, { isOnline: false, lastActive: serverTimestamp() });
      }
      unsubscribeMessages();
      unsubscribeUsers();
    };
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

    const messageData = {
      text: newMessage,
      username: username,
      uid: user.uid,
      createdAt: serverTimestamp(),
    };

    if (replyingTo) {
      messageData.replyTo = replyingTo.id;
    }

    await addDoc(collection(db, 'messages'), messageData);

    setNewMessage('');
    setReplyingTo(null); // Clear the replying state after sending
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

  const handleReply = (message) => {
    setReplyingTo(message);
  };

  // Function to render date separators
  const renderDateSeparator = (currentMessage, previousMessage) => {
    if (!previousMessage) {
      return (
        <div className="text-center my-4 text-gray-500">
          {formatMessageDate(currentMessage.createdAt)}
        </div>
      );
    }

    const currentDate = getMessageDate(currentMessage.createdAt);
    const previousDate = getMessageDate(previousMessage.createdAt);

    if (!isSameDay(currentDate, previousDate)) {
      return (
        <div className="text-center my-4 text-gray-500">
          {format(currentDate, 'MMMM dd, yyyy')}
        </div>
      );
    }

    return null;
  };

  // Helper function to safely get Date from Firestore Timestamp
  const getMessageDate = (timestamp) => {
    if (!timestamp) return null;
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    // If timestamp is already a Date object or invalid
    return timestamp instanceof Date ? timestamp : null;
  };

  // Helper function to format message date
  const formatMessageDate = (timestamp) => {
    const date = getMessageDate(timestamp);
    return date ? format(date, 'MMMM dd, yyyy') : 'Unknown Date';
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="p-4 bg-blue-600 text-white flex justify-between items-center">
        <h1 className="text-lg font-bold">Chat App</h1>
        <span>{activeUsers} Active{activeUsers !== 1 ? 's' : ''} </span>
        <div className="flex items-center space-x-4">
         
          <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">
            Logout
          </button>
        </div>
      </header>
      
      <div className="flex-grow overflow-y-auto p-4">
        {loading ? (
          <SkeletonLoader />
        ) : (
          messages.map((message, index) => {
            const previousMessage = index > 0 ? messages[index - 1] : null;
            const isSender = message.uid === auth.currentUser.uid;

            return (
              <React.Fragment key={message.id}>
                {renderDateSeparator(message, previousMessage)}
                <div
                  className={`flex mb-4 ${isSender ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`rounded-lg p-4 shadow-lg ${
                      isSender
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-300 text-black rounded-bl-none'
                    } max-w-sm break-words whitespace-normal relative`}
                  >
                    {/* Reply Context if applicable */}
                    {message.replyTo && (
                      <ReplyContext messageId={message.replyTo} />
                    )}

                    <div className="flex justify-between items-center mb-1">
                      <div className="font-bold">{message.username}:</div>
                      <div className={`text-xs ${isSender ? 'text-white' : 'text-gray-500'}`}>
                        {message.createdAt ? format(getMessageDate(message.createdAt), 'h:mm a') : '...'}
                      </div>
                    </div>
                    <div className="break-words">{message.text}</div>
                    
                    {/* Reply Button */}
                    <button
                      onClick={() => handleReply(message)}
                      className="absolute top-2 right-2 text-xs text-gray-200 hover:text-gray-400"
                      title="Reply"
                    >
                      ↩️
                    </button>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-gray-200 flex flex-col">
        {replyingTo && (
          <div className="bg-blue-100 p-2 mb-2 rounded flex justify-between items-center">
            <div>
              <span className="font-bold">{replyingTo.username}:</span> {replyingTo.text}
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-red-500 hover:text-red-700"
            >
              Cancel
            </button>
          </div>
        )}
        <div className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
            className="flex-grow p-2 border rounded-lg mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
    </div>
  );
};

export default Chat;
