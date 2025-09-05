// --- apps/admin-portal/src/app/page.tsx (Final Login Page) ---
'use client';
import { useAuth } from "@/context/AuthContext";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch {
            setError("Failed to log in. Check credentials.");
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px' }}>
                <h2>Admin Login</h2>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Log In</button>
            </form>
        </div>
    )
};

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
      if (!loading && user) {
          router.push('/dashboard'); // Redirect if already logged in
      }
  }, [user, loading, router]);

  if (loading || user) {
    return <div>Loading...</div>; // Show loading screen while redirecting
  }

  return <LoginPage />;
}