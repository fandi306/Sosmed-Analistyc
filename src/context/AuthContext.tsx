import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, testConnection } from '../firebase.ts';

export const FIXED_SECURITY_CREDENTIALS = {
  email: 'fandi.ahmad@thedeluxecoffee.com',
  username: 'fandi.ahmad',
  password: 'admin123',
  displayName: 'Fandi Ahmad',
};

interface AuthContextType {
  user: User | any;
  loading: boolean;
  isOnline: boolean;
  signInWithGoogle: () => Promise<void>;
  loginWithCredentials: (
    identifier: string,
    pass: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isOnline: true,
  signInWithGoogle: async () => {},
  loginWithCredentials: async () => ({ success: false }),
  logout: async () => {},
  authError: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Initial connection test
    testConnection().then((connected) => {
      setIsOnline(connected);
    });

    // 2. Check local security session first
    try {
      const savedSession = localStorage.getItem('deluxe_auth_session');
      if (savedSession) {
        setUser(JSON.parse(savedSession));
        setLoading(false);
      }
    } catch (e) {
      // ignore
    }

    // 3. Firebase Auth listener
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setAuthError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const loginWithCredentials = async (identifier: string, pass: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (
      (cleanId === FIXED_SECURITY_CREDENTIALS.email ||
        cleanId === FIXED_SECURITY_CREDENTIALS.username) &&
      cleanPass === FIXED_SECURITY_CREDENTIALS.password
    ) {
      const fixedUser = {
        uid: 'dlx-admin-fandi',
        email: FIXED_SECURITY_CREDENTIALS.email,
        displayName: FIXED_SECURITY_CREDENTIALS.displayName,
        photoURL: null,
        isFixedAdmin: true,
      };

      setUser(fixedUser);
      setAuthError(null);

      try {
        localStorage.setItem('deluxe_auth_session', JSON.stringify(fixedUser));
      } catch (e) {
        // ignore
      }

      return { success: true };
    } else {
      const msg =
        'Username atau kata sandi tidak cocok. Gunakan fandi.ahmad@thedeluxecoffee.com dan sandi: admin123.';
      setAuthError(msg);
      return { success: false, message: msg };
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        try {
          localStorage.setItem('deluxe_auth_session', JSON.stringify(res.user));
        } catch (e) {}
      }
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      setAuthError(err.message || 'Gagal login dengan Google.');
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('deluxe_auth_session');
      setUser(null);
      await signOut(auth);
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isOnline,
        signInWithGoogle,
        loginWithCredentials,
        logout,
        authError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
