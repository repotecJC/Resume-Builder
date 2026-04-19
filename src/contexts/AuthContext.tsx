import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isNewUser: boolean; // Add this flag
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if user document already exists
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          // This is a brand new user for the system
          setIsNewUser(true);
          await setDoc(userRef, {
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            createdAt: Date.now()
          });
        } else {
          setIsNewUser(false);
        }
      } else {
        setIsNewUser(false);
      }
      
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      
      // Optional: Domain restriction logic
      // const allowedDomain = import.meta.env.VITE_ALLOWED_DOMAIN;
      // if (allowedDomain && result.user.email && !result.user.email.endsWith(`@${allowedDomain}`)) {
      //   await firebaseSignOut(auth);
      //   alert(`Access restricted to ${allowedDomain} accounts only.`);
      //   return;
      // }
    } catch (error: any) {
      if (error.code === 'auth/too-many-requests') {
        alert('Too many sign-in attempts. Please try again later.');
      } else if (error.code !== 'auth/popup-closed-by-user') {
        console.error('Sign-in error:', error);
        alert('Failed to sign in. Please try again.');
      }
      throw error;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    // Clear all local resume states to prevent data leakage between sessions
    localStorage.removeItem('elegant_resume_app_data');
    localStorage.removeItem('elegant_resume_data');
    window.location.href = '/'; // Force reload to clear all React state
  };

  const value = useMemo(() => ({
    user,
    loading,
    isNewUser,
    signInWithGoogle,
    signOut
  }), [user, loading, isNewUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
