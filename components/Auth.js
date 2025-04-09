// components/Auth.js
"use client"; // Required for hooks, event handlers, and Auth UI

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client'; // Use browser client
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

export default function AuthComponent() {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true); // Start loading until user/profile checked
  const [username, setUsername] = useState('');

  useEffect(() => {
    setLoading(true);
    // Get initial user session
    supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user);
        if (user) {
            // Fetch profile if user exists
            supabase.from('profiles').select('username').eq('id', user.id).single()
                .then(({ data, error }) => {
                    if (error && error.code !== 'PGRST116') console.error("Error fetching profile:", error);
                    setProfile(data);
                    setUsername(data?.username || '');
                    setLoading(false);
                });
        } else {
            setLoading(false); // No user, stop loading
        }
    });

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            setProfile(null); // Reset profile on auth change
            setUsername(''); // Reset username form
            setLoading(true); // Start loading profile for new user
            if (currentUser) {
                // Fetch profile for the new user
                supabase.from('profiles').select('username').eq('id', currentUser.id).single()
                    .then(({ data, error }) => {
                         if (error && error.code !== 'PGRST116') console.error("Error fetching profile:", error);
                         setProfile(data);
                         setUsername(data?.username || '');
                         setLoading(false); // Finished loading profile
                    });
            } else {
                 setLoading(false); // No user, stop loading
            }
        }
    );

    return () => {
        authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  // Handle username update/set
  const handleUsernameUpdate = async (e) => { /* ... same username update logic using supabase client instance ... */
        e.preventDefault(); if (!user || !username.trim()) return; setLoading(true);
        try {
            const { data, error } = await supabase.from('profiles').upsert({ id: user.id, username: username.trim(), updated_at: new Date() }).select().single();
            if (error) throw error;
            setProfile(data); alert('Username saved!');
         } catch (error) { console.error("Error saving username:", error.message); alert('Failed to save username.'); }
         finally { setLoading(false); }
  };

  // --- Render Logic ---
  if (loading) {
      return <div className="text-center my-10"><span className="loading loading-dots loading-lg"></span></div>;
  }

  if (!user) {
      // Show Supabase Auth UI if not logged in
      return (
        <div className="max-w-md mx-auto mt-8 p-6 card bg-base-200 shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-center">Login or Sign Up</h3>
          <Auth
            supabaseClient={supabase} // Pass the client instance
            appearance={{ theme: ThemeSupa }}
            providers={['google', 'github']} // Optional
            // theme="dark" // Optional: Match DaisyUI theme
          />
        </div>
      );
  }

  // Show user info and username form if logged in
  return (
    <div className="mt-8 p-4 card bg-base-200 shadow max-w-md mx-auto">
      <p className="text-center">Logged in as: <strong>{user.email}</strong></p>
      <form onSubmit={handleUsernameUpdate} className="form-control mt-4">
         <label className="label"><span className="label-text">Username:</span></label>
         <div className="join">
             <input type="text" placeholder="Username (min 3 chars)" value={username} onChange={(e) => setUsername(e.target.value)} className="input input-bordered join-item flex-grow" minLength="3" required disabled={loading} />
             <button type="submit" className="btn btn-primary join-item" disabled={loading || !username.trim() || username === profile?.username}>Save</button>
         </div>
         {/* Feedback on username save state */}
      </form>
      <button onClick={() => supabase.auth.signOut()} className="btn btn-outline btn-sm mt-4 w-full"> Log Out </button>
    </div>
  );
}