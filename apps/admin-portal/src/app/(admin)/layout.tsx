// --- apps/admin-portal/src/app/(admin)/layout.tsx ---
'use client';
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/'); // Redirect to login if not authenticated
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="loading-container">
        <div>Loading Admin Portal...</div>
      </div>
    );
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="admin-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <div className="main-header">
          <button 
            className="mobile-menu-button"
            onClick={toggleSidebar}
          >
            ☰
          </button>
          <button 
            className="sign-out-button"
            onClick={() => signOut(auth)}
          >
            Sign Out
          </button>
        </div>
        <div className="main-content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
}