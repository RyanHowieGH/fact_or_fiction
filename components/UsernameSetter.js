// components/UsernameSetter.js
"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client'; // Assuming path alias

export default function UsernameSetter({ user }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [currentUsername, setCurrentUsername] = useState(null); // Store fetched username
  const [message, setMessage] = useState({ type: '', text: '' }); // For feedback

  // Fetch current username
  const fetchUsername = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setMessage({ type: '', text: '' }); // Clear message on fetch
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore 'not found'

      if (data?.username) {
          setUsername(data.username);
          setCurrentUsername(data.username);
          // Optionally clear info message if username exists
          // setMessage({ type: '', text: '' });
      } else {
          setCurrentUsername(null); // Explicitly null if not set
          setUsername(''); // Clear input if no username fetched
          setMessage({ type: 'info', text: 'Set your username for the leaderboard!' });
      }
    } catch (error) {
      console.error("Error fetching username:", error.message);
      setMessage({ type: 'error', text: 'Could not load username.' });
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchUsername();
  }, [fetchUsername]); // Run on mount and when fetchUsername updates (user changes)


  const handleUsernameUpdate = async (e) => {
    e.preventDefault();
    const trimmedUsername = username.trim();

    if (!user || !trimmedUsername || trimmedUsername === currentUsername) {
         // Don't update if same or empty
         if(trimmedUsername === currentUsername) {
             setMessage({ type: 'success', text: 'Username is already set.' });
             setTimeout(() => setMessage({ type: '', text: '' }), 3000); // Clear message after delay
         }
        return;
    }
    if (trimmedUsername.length < 3) {
         setMessage({ type: 'error', text: 'Username must be at least 3 characters.' });
         return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' }); // Clear previous messages
    try {
      // Attempt to update the username in the profiles table
      const { error } = await supabase
        .from('profiles')
        // Important: Ensure RLS allows users to update their own profile!
        // The handle_new_user trigger should have inserted the profile row already.
        .update({ username: trimmedUsername, updated_at: new Date() })
        .eq('id', user.id); // Target the correct user

      if (error) {
        // Check for unique constraint violation (PostgreSQL code 23505)
        if (error.code === '23505') {
            throw new Error('Username already taken. Please choose another.');
        }
        // Check for RLS violation or other DB errors
        console.error("Supabase Update Error:", error)
        throw new Error(`Database error: ${error.message}`); // Re-throw other specific errors
      }

      // If update is successful
      setMessage({ type: 'success', text: 'Username updated successfully!' });
      setCurrentUsername(trimmedUsername); // Update current state to reflect change
       // Clear success message after few seconds
       setTimeout(() => setMessage({ type: '', text: '' }), 4000);

    } catch (error) {
      console.error("Error updating username:", error.message);
      // Display specific error messages caught above, or a generic one
      setMessage({ type: 'error', text: `Failed to update username: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  // Don't render the component if the user is not logged in
  if (!user) return null;

  return (
    // Card structure
    <div className="card w-full max-w-md bg-base-200 shadow mx-auto my-8">
      <div className="card-body p-4">
         {/* Use fieldset/legend for semantic form structure */}
         <fieldset className="fieldset">
            <legend className="text-lg font-semibold mb-2">Leaderboard Username</legend>

            <form onSubmit={handleUsernameUpdate} className="mt-1">
              {/* Visually hidden label for accessibility */}
              <label className="label sr-only" htmlFor="username-input">Username:</label>

              {/* Use DaisyUI join component for input + button */}
              <div className="join w-full">
                <input
                  id="username-input" // Link label to input
                  type="text"
                  placeholder="Username (min 3 chars)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  // Input has default border in v5, removed 'input-bordered'
                  // Input size adjusted with 'input-sm'
                  className="input join-item flex-grow input-sm"
                  minLength="3"
                  required
                  disabled={loading}
                  aria-describedby="username-feedback" // Link feedback msg to input
                />
                <button
                    type="submit"
                    // Button size adjusted with 'btn-sm' to match input
                    className="btn btn-primary join-item btn-sm"
                    disabled={loading || !username.trim() || username.trim() === currentUsername || username.trim().length < 3}
                >
                  {/* Loading spinner */}
                  {loading ? <span className="loading loading-spinner loading-xs"></span> : (currentUsername ? 'Update' : 'Set')}
                </button>
              </div>
            </form>

            {/* Feedback Messages Area */}
            <div id="username-feedback" className="min-h-[1.25rem] mt-1"> {/* Reserve space for feedback */}
                {message.text && (
                <p className={`text-xs ${message.type === 'error' ? 'text-error' : message.type === 'success' ? 'text-success' : 'text-info'}`}>
                    {message.text}
                </p>
                )}
                {/* Show confirmation if username is set and matches input, only if no other message */}
                {currentUsername && username.trim() === currentUsername && !message.text && !loading && <p className="text-xs text-success">Username is set.</p>}
            </div>

         </fieldset>
      </div>
    </div>
  );
}