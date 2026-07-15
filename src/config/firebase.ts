// ─── Firebase Configuration ───────────────────────────────────────────────────
// Replace these placeholder values with your actual Firebase project config.
// Get them from: Firebase Console → Project Settings → Your Apps → Web App
// https://console.firebase.google.com

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { initializeAuth, Auth, getAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getFirestore,
  Firestore,
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// ─── Config Object ────────────────────────────────────────────────────────────
// TODO: Replace with your actual Firebase project credentials

const firebaseConfig = {
  apiKey: 'AIzaSyBt8Wfg1hiiSbjS9X_IFkoGEIS1cf9nfgI',
  authDomain: 'biotasks-99db8.firebaseapp.com',
  projectId: 'biotasks-99db8',
  storageBucket: 'biotasks-99db8.firebasestorage.app',
  messagingSenderId: '295973724201',
  appId: '1:295973724201:web:7fc3015da592c1a8e2fc38',
};

// ─── Initialize Firebase (singleton) ─────────────────────────────────────────

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

function initFirebase() {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } else {
    app = getApps()[0];
    auth = getAuth(app);
  }

  db = getFirestore(app);
  storage = getStorage(app);

  return { app, auth, db, storage };
}

const firebase = initFirebase();

export const firebaseApp = firebase.app;
export const firebaseAuth = firebase.auth;
export const firestore = firebase.db;
export const firebaseStorage = firebase.storage;

// ─── Firestore Collection Paths ───────────────────────────────────────────────

export const COLLECTIONS = {
  USERS: 'users',
  CHATS: 'chats',
  tasks: (userId: string) => `users/${userId}/tasks`,
  categories: (userId: string) => `users/${userId}/categories`,
  settings: (userId: string) => `users/${userId}/settings`,
  messages: (chatId: string) => `chats/${chatId}/messages`,
} as const;
