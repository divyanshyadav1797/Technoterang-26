// ─────────────────────────────────────────────────────────
//  Firebase Frontend Config  |  src/firebase.js
//
//  Project: peer-2-peer-data
//
//  To get these values:
//  1. Go to Firebase Console → https://console.firebase.google.com
//  2. Select "peer-2-peer-data" project
//  3. Click the gear icon ⚙️ → Project Settings
//  4. Scroll to "Your apps" → click your Web app (</> icon)
//  5. Copy the firebaseConfig object values below
// ─────────────────────────────────────────────────────────
import { initializeApp }  from 'firebase/app';
import { getAuth }        from 'firebase/auth';
import { getFirestore }   from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            "AIzaSyA-qj5l2IrGrdf2-XeRhS82SMwzXQSHpF0",
  authDomain:        "peer-2-peer-data.firebaseapp.com",
  projectId:         "peer-2-peer-data",
  storageBucket:     "peer-2-peer-data.appspot.com",
  messagingSenderId: "your-messaging-sender-id",   // Firebase Console → Project Settings → General → Your apps
  appId:             "your-app-id",                // Firebase Console → Project Settings → General → Your apps
};

const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);   // ← Firestore client
