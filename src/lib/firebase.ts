import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDT2n0yZndVPWq2IN26rjbEJBR6PP3M5EU',
  authDomain: 'notational-5a53e.firebaseapp.com',
  projectId: 'notational-5a53e',
  storageBucket: 'notational-5a53e.firebasestorage.app',
  messagingSenderId: '149737539828',
  appId: '1:149737539828:web:02363129f560636d17f6a1',
}

// Singleton pattern — only initialize once
let app: FirebaseApp
let auth: Auth
let db: Firestore

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApps()[0]
    }
  }
  return app
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp())
  }
  return auth
}

export function getFirebaseDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp())
  }
  return db
}

export const CLOUD_ENABLED = true
