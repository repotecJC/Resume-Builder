import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
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
    getRedirectResult(auth).catch((error) => {
      if (error.code !== 'auth/cancelled-popup-request') {
        console.error('Redirect auth error:', error);
      }
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
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
        } catch (error: any) {
          console.error("Firebase auth check runtime error:", error);
          if (error.message && error.message.includes('offline')) {
            console.error("Failed to get document because the client is offline. Please check your Firebase configuration or network.");
          }
          setIsNewUser(false); // Default to false if we can't verify
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
      await signInWithRedirect(auth, provider);
      
      // Note: Domain restriction logic has been removed here because
      // signInWithRedirect immediately navigates the page away.
      // Domain validation should happen in getRedirectResult or onAuthStateChanged instead.
    } catch (error: any) {
      if (error.code === 'auth/too-many-requests') {
        alert('Too many sign-in attempts. Please try again later.');
      } else {
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
