// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyD_cMqOrBUNGcBb63XHVIuTi7dAsKKJdMI",
    authDomain: "chat2-f1d62.firebaseapp.com",
    databaseURL: "https://chat2-f1d62-default-rtdb.firebaseio.com",
    projectId: "chat2-f1d62",
    storageBucket: "chat2-f1d62.appspot.com",
    messagingSenderId: "793933705479",
    appId: "1:793933705479:web:410d44cee8e3a0871255a2",
    measurementId: "G-CX7S2CBFBH"
};

// Initialize Firebase app (only call initializeApp once)
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
