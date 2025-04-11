// components/AuthModal.js
"use client";

import { useEffect, useRef } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@/utils/supabase/client';

export default function AuthModal({ isOpen, view = 'sign_in', onClose }) {
  const modalRef = useRef(null);
  const supabase = createClient(); // Create client instance for the Auth UI

  // Effect to control modal visibility using the dialog element's methods
  useEffect(() => {
    const modalElement = modalRef.current;
    if (!modalElement) return;

    if (isOpen) {
      // Check if already open to prevent errors/flicker
      if (!modalElement.hasAttribute('open')) {
         modalElement.showModal();
      }
    } else {
      if (modalElement.hasAttribute('open')) {
          modalElement.close();
      }
    }
  }, [isOpen]); // Depend only on isOpen

   // Prevent closing modal by clicking backdrop
   const handleClickOutside = (event) => {
    if (modalRef.current && event.target === modalRef.current) {
      // Optional: Keep open, or call onClose() if you want backdrop click to close
      // onClose();
    }
  };

  return (
    <dialog id="auth_modal" className="modal" ref={modalRef} onClick={handleClickOutside} onClose={onClose}>
      <div className="modal-box">
         {/* Add a close button inside the box */}
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose} // Use the onClose prop to close
         >
           ✕
         </button>

        <div className="p-4"> {/* Padding for Auth UI */}
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: { default: { colors: { brand: '#4ade80' /* Green-400 */, brandAccent: '#22c55e' /* Green-500 */} } }
              }}
              // theme="dark" // Optional: if your default theme is dark
              providers={[]} // No social providers as requested
              view={view} // 'sign_in' or 'sign_up'
              showLinks={false} // Hide magic link, etc.
              // We are focusing on email/password for simplicity with the UI component
            />
        </div>
      </div>
       {/* Fallback for clicking backdrop if dialog doesn't handle it perfectly */}
       {/* <form method="dialog" className="modal-backdrop">
         <button>close</button>
       </form> */}
    </dialog>
  );
}