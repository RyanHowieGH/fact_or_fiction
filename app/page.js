// app/page.js
"use client"; // Make the main page a Client Component to handle state

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client'; // Use browser client

// Import Components
import Game from '@/components/Game';
import Leaderboard from '@/components/Leaderboard';
import AuthModal from '@/components/AuthModal';
import LoginCTA from '@/components/LoginCTA';
import UsernameSetter from '@/components/UsernameSetter'; // Import username component

export default function HomePage() {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true); // Track initial user loading

  // State for Auth Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalView, setModalView] = useState('sign_in'); // 'sign_in' or 'sign_up'

  // Fetch initial user session and listen for changes
  useEffect(() => {
    setLoadingUser(true);
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoadingUser(false);
    });

    // Listen for auth changes (login, logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoadingUser(false); // Stop loading on change too

        // Close modal on successful sign-in or sign-up
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
           // Small delay to allow UI to potentially update before closing
           setTimeout(() => setModalOpen(false), 300);
        }
         // You might want to fetch game profile data here again if needed
         // Or rely on the Game component's useEffect depending on `user` prop
      }
    );

    // Cleanup listener on component unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]); // Add supabase as dependency

  // Modal control functions
  const openLoginModal = () => {
    setModalView('sign_in');
    setModalOpen(true);
  };

  const openSignupModal = () => {
    setModalView('sign_up');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  // --- Render Logic ---
  if (loadingUser) {
    // Optional: Show a full-page loader during initial user check
     return (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
           <span className="loading loading-lg loading-spinner text-primary"></span>
        </div>
     );
  }

  return (
    <div>
      {/* Show Login/Signup CTA only if user is NOT logged in */}
      {!user && <LoginCTA onLoginClick={openLoginModal} onSignupClick={openSignupModal} />}

      {/* Show Username Setter if user IS logged in */}
      {user && <UsernameSetter user={user} />}

      {/* Game Component - Pass the user state */}
      <Game user={user} />

      {/* Leaderboard Component */}
      <Leaderboard />

      {/* Auth Modal Component - Rendered but hidden until state changes */}
      <AuthModal
        isOpen={modalOpen}
        view={modalView}
        onClose={closeModal}
      />
    </div>
  );
}