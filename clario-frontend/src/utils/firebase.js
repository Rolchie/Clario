// src/utils/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";

// ── Firebase config ────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.REACT_APP_FIREBASE_APP_ID,
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ── Auth helpers ───────────────────────────────────────────────────────────
export async function registerUser(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  return cred.user;
}

export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

export async function logoutUser() {
  await signOut(auth);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// ── Firestore: sessions ────────────────────────────────────────────────────

/**
 * Save a session for the currently logged-in user.
 * Returns the new document ID, or null on failure.
 */
export async function saveSession(sessionData) {
  const user = auth.currentUser;

  if (!user) {
    console.error("saveSession: No authenticated user. Session not saved.");
    return null;
  }

  try {
    const sessionsRef = collection(db, "users", user.uid, "sessions");

    const docRef = await addDoc(sessionsRef, {
      ...sessionData,
      createdAt: serverTimestamp(),
      userId: user.uid,
    });

    console.log("Session saved:", docRef.id);
    return docRef.id;
  } catch (err) {
    console.error("saveSession failed:", err.code, err.message);
    return null;
  }
}

/**
 * Fetch up to `limitCount` sessions for the currently logged-in user,
 * ordered newest-first.
 */
export async function getSessions(limitCount = 50) {
  const user = auth.currentUser;

  if (!user) {
    console.warn("getSessions: No authenticated user.");
    return [];
  }

  try {
    const sessionsRef = collection(db, "users", user.uid, "sessions");

    const q = query(
      sessionsRef,
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (err) {
    console.error("getSessions failed:", err.code, err.message);
    return [];
  }
}