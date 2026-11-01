import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User as FirebaseUser,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { AvatarId } from '../types';

export interface UserProfile {
  uid: string;
  displayName: string;
  avatar: AvatarId;
  xp: number;
  badges: string[];
  casesClosed: number;
  createdAt: string;
  isGuest: boolean;
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Test connection on boot per Firebase guidelines
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    // If not found or permissions on test/connection, network is still reachable
    return true;
  }
}

// Google Sign-In with popup
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

// Get user profile from Firestore users/{uid}
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) {
      return null;
    }
    const data = snap.data();
    return {
      uid,
      displayName: data.displayName || 'Detective',
      avatar: (data.avatar as AvatarId) || 'shinchan',
      xp: typeof data.xp === 'number' ? data.xp : 0,
      badges: Array.isArray(data.badges) ? data.badges : [],
      casesClosed: typeof data.casesClosed === 'number' ? data.casesClosed : 0,
      createdAt: data.createdAt || new Date().toISOString(),
      isGuest: false,
    };
  } catch (err) {
    console.error('Error fetching user profile:', err);
    throw err;
  }
}

// Create user profile in Firestore users/{uid}
export async function createUserProfile(
  uid: string,
  displayName: string,
  avatar: AvatarId
): Promise<UserProfile> {
  const trimmedName = displayName.trim();
  if (trimmedName.length < 2 || trimmedName.length > 30) {
    throw new Error('Detective name must be between 2 and 30 characters.');
  }

  const profileData = {
    displayName: trimmedName,
    avatar,
    xp: 0,
    badges: [],
    casesClosed: 0,
    createdAt: new Date().toISOString(),
  };

  const userDocRef = doc(db, 'users', uid);
  await setDoc(userDocRef, profileData);

  return {
    uid,
    ...profileData,
    isGuest: false,
  };
}

// Increment user XP in Firestore
export async function updateUserXp(uid: string, delta: number): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      xp: increment(delta),
    });
  } catch (err) {
    console.warn('Could not update XP in Firestore:', err);
  }
}

// Sign out
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Error signing out:', err);
  }
}
