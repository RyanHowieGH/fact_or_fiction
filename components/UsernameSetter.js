// components/UsernameSetter.js
"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

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
    setMessage({ type: '', text: '' });
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
    if (!user || !username.trim() || username.trim() === currentUsername) {
         // Don't update if same or empty
         if(username.trim() === currentUsername) {
             setMessage({ type: 'success', text: 'Username is already set.' });
             setTimeout(() => setMessage({ type: '', text: '' }), 3000);
         }
        return;
    }
    if (username.trim().length < 3) {
         setMessage({ type: 'error', text: 'Username must be at least 3 characters.' });
         return;
    }


    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: username.trim(), updated_at: new Date() }) // Use update, trigger should handle insert
        .eq('id', user.id);

      if (error) {
        // Check for unique constraint violation (PostgreSQL code 23505)
        if (error.code === '23505') {
            throw new Error('Username already taken. Please choose another.');
        }
        throw error; // Re-throw other errors
      }

      setMessage({ type: 'success', text: 'Username updated successfully!' });
      setCurrentUsername(username.trim()); // Update current state
       // Clear message after few seconds
       setTimeout(() => setMessage({ type: '', text: '' }), 4000);

    } catch (error) {
      console.error("Error updating username:", error.message);
      setMessage({ type: 'error', text: `Failed to update username: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null; // Don't render if not logged in

  return (
    <div className="card w-full max-w-md bg-base-200 shadow mx-auto my-8">
      <div className="card-body p-4">
        <h3 className="text-lg font-semibold mb-2">Leaderboard Username</h3>
        <form onSubmit={handleUsernameUpdate} className="form-control">
          <div className="join w-full">
            <input
              type="text"
              placeholder="Enter username (min 3 chars)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input input-bordered join-item flex-grow input-sm"
              minLength="3"
              required
              disabled={loading}
            />
            <button
                type="submit"
                className="btn btn-primary join-item btn-sm"
                disabled={loading || !username.trim() || username.trim() === currentUsername || username.trim().length < 3}
            >
              {loading ? <span className="loading loading-spinner loading-xs"></span> : (currentUsername ? 'Update' : 'Set')}
            </button>
          </div>
          {/* Feedback Messages */}
          {message.text && (
            <p className={`text-xs mt-1 ${message.type === 'error' ? 'text-error' : message.type === 'success' ? 'text-success' : 'text-info'}`}>
                {message.text}
            </p>
          )}
           {currentUsername && username.trim() === currentUsername && !message.text && <p className="text-xs mt-1 text-success">Username is set.</p>}

        </form>
      </div>
    </div>
  );
}