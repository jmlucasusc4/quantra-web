"use client";
import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) { setLoading(false); return; }
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
      // Keep proxy middleware in sync — it reads this cookie to gate protected routes
      if (u) {
        document.cookie = "quantra_session=1; path=/; max-age=2592000; SameSite=Lax";
      } else {
        document.cookie = "quantra_session=; path=/; max-age=0";
      }
    });
    return unsub;
  }, []);

  const setSessionCookie = () => {
    document.cookie = "quantra_session=1; path=/; max-age=2592000; SameSite=Lax";
  };
  const clearSessionCookie = () => {
    document.cookie = "quantra_session=; path=/; max-age=0";
  };

  const login  = (e: string, p: string) =>
    signInWithEmailAndPassword(auth!, e, p).then(() => { setSessionCookie(); });
  const signUp = (e: string, p: string) =>
    createUserWithEmailAndPassword(auth!, e, p).then(() => { setSessionCookie(); });
  const resetPassword = (e: string) => sendPasswordResetEmail(auth!, e);
  const logout        = ()          => signOut(auth!).then(() => { clearSessionCookie(); });

  return (
    <AuthContext.Provider value={{ user, loading, login, signUp, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
