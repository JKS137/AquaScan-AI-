import React, { useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import { LogIn, LogOut, Loader2, Droplets } from 'lucide-react';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          // New user defaults to analyst
          const role: UserRole = user.email === 'shjanabdul2@gmail.com' ? 'admin' : 'analyst';
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Analyst',
            role,
            createdAt: new Date().toISOString()
          };
          await setDoc(docRef, {
            ...newProfile,
            createdAt: serverTimestamp()
          });
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return { user, profile, loading, login, logout };
}

export function AuthScreen({ onLogin }: { onLogin: () => Promise<void> }) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await onLogin();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-bg">
      <div className="w-full max-w-md space-y-8 text-center bg-white p-12 rounded-xl border border-border shadow-sm">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-lg font-bold text-white text-3xl">
            W
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-text-main tracking-tight">AquaScan AI</h1>
            <p className="text-text-sec text-sm leading-relaxed max-w-[280px] mx-auto">
              Real-time ML-based contamination detection system
            </p>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-4 bg-primary text-white rounded-lg font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
          Sign in with Google
        </button>

        <div className="quote-box text-left">
          <p className="quote-text">
            "And We sent down water from the sky with a specific measure..." (Surah 23 Al-Mu’minoon, Verse 18)
          </p>
        </div>

        <p className="text-[10px] text-text-sec uppercase tracking-widest font-bold">
          Authorization Required • Analysts Only
        </p>
      </div>
    </div>
  );
}
