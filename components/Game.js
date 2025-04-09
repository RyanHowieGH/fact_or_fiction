// components/Game.js
"use client"; // Required for useState, useEffect, onClick

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client'; // Use the browser client

export default function Game() {
  const supabase = createClient(); // Create client instance
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // To store profile data like streaks

  const [factData, setFactData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [userChoice, setUserChoice] = useState(null);
  const [updatingStreak, setUpdatingStreak] = useState(false);

  // Fetch user session and profile
  const getUserData = useCallback(async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (session?.user) {
          setUser(session.user);
          // Fetch profile data if user exists
          try {
              const { data: profileData, error: profileError } = await supabase
                  .from('profiles')
                  .select('current_streak, highest_streak') // Fetch streaks
                  .eq('id', session.user.id)
                  .single();

              if (profileError && profileError.code !== 'PGRST116') { // Ignore 'not found' initially
                  throw profileError;
              }
              setProfile(profileData); // Store profile (might be null if not found)
          } catch (error) {
              console.error('Error fetching profile:', error.message);
              setProfile(null); // Ensure profile state is reset on error
          }
      } else {
          setUser(null);
          setProfile(null); // Clear profile if no user
      }
  }, [supabase]); // Add supabase as dependency

  // Fetch a new fact
  const fetchFact = useCallback(async () => { /* ... same fetch logic as before ... */
     setLoading(true); setFeedback(''); setShowAnswer(false); setUserChoice(null); setFactData(null);
     try {
        const response = await fetch('/api/get-fact'); // Use the new API route path
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        const data = await response.json();
        setFactData(data);
     } catch (error) { console.error("Failed to fetch fact:", error); setFeedback('error-fetch'); }
     finally { setLoading(false); }
  }, []); // No dependencies needed here


  // Initial data fetch and auth state listener
  useEffect(() => {
    getUserData(); // Get initial user state and profile
    fetchFact(); // Fetch initial fact

    // Listen for auth changes (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
            setUser(session?.user ?? null);
            // Re-fetch profile when auth state changes
            if (session?.user) {
                 getUserData(); // Refresh user data and profile on auth change
            } else {
                 setProfile(null); // Clear profile on logout
            }
             // Optional: Fetch a new fact on login/logout?
             // fetchFact();
        }
    );

    // Cleanup listener on component unmount
    return () => {
        authListener?.subscription.unsubscribe();
    };
  }, [supabase, getUserData, fetchFact]); // Add dependencies

  // Handle user answering
  const handleAnswer = async (choice) => { /* ... Mostly same logic ... */
     if (!factData || showAnswer || updatingStreak) return;
     const isCorrect = (choice === 'true') === factData.isPresentedFactTrue;
     setUserChoice(choice); setFeedback(isCorrect ? 'correct' : 'incorrect'); setShowAnswer(true);

     if (user) { // Only update streak if logged in
        setUpdatingStreak(true);
        try {
            // Get current streaks (use profile state, refetch for safety if needed)
             const current_streak = profile?.current_streak || 0;
             const current_highest = profile?.highest_streak || 0;
             let newStreak = 0;
             let newHighestStreak = current_highest;

             if (isCorrect) {
                 newStreak = current_streak + 1;
                 newHighestStreak = Math.max(newStreak, current_highest);
             } // else newStreak remains 0 (reset)

             const { error: updateError } = await supabase
                 .from('profiles')
                 .upsert({ // Use upsert for robustness
                     id: user.id,
                     current_streak: newStreak,
                     highest_streak: newHighestStreak,
                     updated_at: new Date().toISOString()
                 })
                 .select() // Important: select() after upsert returns the data
                 .single(); // Expecting one row back

             if (updateError) throw updateError;

             // Update local profile state *after* successful DB update
             setProfile(prev => ({ ...prev, current_streak: newStreak, highest_streak: newHighestStreak }));

        } catch (error) { console.error('Error updating streak:', error.message); setFeedback('error-streak'); }
        finally { setUpdatingStreak(false); }
     }
  };

  // Render feedback message
  const renderFeedback = () => { /* ... same render logic ... */ };

  // --- Render Logic --- (Uses DaisyUI, shows streak from profile state)
  return (
    <div className="card w-full max-w-lg bg-base-100 shadow-xl mx-auto my-8">
      <div className="card-body">
         <h2 className="card-title text-2xl justify-center mb-4">Fact or Fiction?</h2>
         {/* Show streak ONLY if user is logged in and profile loaded */}
         {user && profile && (
             <div className="text-center mb-4 text-lg font-semibold">
                Current Streak: {updatingStreak ? '...' : (profile.current_streak ?? 0)}
             </div>
         )}
         {/* Rest of the rendering logic (loading, error, fact, buttons, feedback, next button) is largely the same */}
         {/* Ensure loading/disabled states consider `updatingStreak` */}
         {/* ... */}
         {!loading && factData && feedback !== 'error-fetch' && (
             <>
               <p className="text-xl text-center my-6 min-h-[6rem] flex items-center justify-center">{factData.presentedFact}</p>
               <div className="card-actions justify-center mt-4">
                   <button className="btn btn-success btn-lg" onClick={() => handleAnswer('true')} disabled={showAnswer || loading || updatingStreak}>True</button>
                   <button className="btn btn-error btn-lg" onClick={() => handleAnswer('false')} disabled={showAnswer || loading || updatingStreak}>False</button>
               </div>
               <div className="min-h-[4rem] mt-4">{renderFeedback()}</div>
               {showAnswer && feedback !== 'error-fetch' && feedback !== 'error-streak' && (
                   <div className="text-center mt-4"><button onClick={fetchFact} className="btn btn-primary" disabled={loading || updatingStreak}>Next Fact</button></div>
               )}
               {feedback === 'error-streak' && <div className="text-center mt-4"><button onClick={fetchFact} className="btn btn-primary">Next Fact</button></div>}
             </>
         )}
      </div>
    </div>
  );
}