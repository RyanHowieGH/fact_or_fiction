// components/Game.js
"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

// Pass user object as a prop
export default function Game({ user }) {
  const supabase = createClient();
  const [profile, setProfile] = useState(null); // Stores profile data { current_streak, highest_streak }

  const [factData, setFactData] = useState(null);
  const [loadingFact, setLoadingFact] = useState(true); // Separate loading for fact
  const [loadingProfile, setLoadingProfile] = useState(false); // Separate loading for profile
  const [feedback, setFeedback] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [userChoice, setUserChoice] = useState(null);
  const [updatingStreak, setUpdatingStreak] = useState(false);

  // Fetch user's profile data when user object changes
  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null); // Clear profile if user logs out
      return;
    }
    setLoadingProfile(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('current_streak, highest_streak') // Fetch streaks
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }
      setProfile(profileData); // Store profile (might be null if doesn't exist yet)
    } catch (error) {
      console.error('Error fetching profile:', error.message);
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, [user, supabase]); // Depend on user and supabase client

  // Fetch a new fact
  const fetchFact = useCallback(async () => {
    setLoadingFact(true);
    setFeedback('');
    setShowAnswer(false);
    setUserChoice(null);
    setFactData(null);
    try {
      const response = await fetch('/api/get-fact');
      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      const data = await response.json();
      setFactData(data);
    } catch (error) {
      console.error("Failed to fetch fact:", error);
      setFeedback('error-fetch');
    } finally {
      setLoadingFact(false);
    }
  }, []); // No dependencies needed here

  // Initial fact fetch and profile fetch based on initial user prop
  useEffect(() => {
    fetchFact();
    fetchProfile(); // Fetch profile based on the user prop passed in
  }, [fetchFact, fetchProfile]); // Run when these functions are stable

  // Handle user answering
  const handleAnswer = async (choice) => {
    if (!factData || showAnswer || updatingStreak) return;
    const isCorrect = (choice === 'true') === factData.isPresentedFactTrue;
    setUserChoice(choice);
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setShowAnswer(true);

    if (user) { // Only update streak if logged in
      setUpdatingStreak(true);
      try {
        // Use profile state, but fetch fresh values before update for safety? Or trust state? Let's trust state for now.
        const current_streak = profile?.current_streak || 0;
        const current_highest = profile?.highest_streak || 0;
        let newStreak = 0;
        let newHighestStreak = current_highest;

        if (isCorrect) {
          newStreak = current_streak + 1;
          newHighestStreak = Math.max(newStreak, current_highest);
        } // else newStreak remains 0 (reset)

        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            current_streak: newStreak,
            highest_streak: newHighestStreak,
            updated_at: new Date().toISOString()
          })
          .select('current_streak, highest_streak') // Select the updated data
          .single();

        if (updateError) throw updateError;

        // Update local profile state *after* successful DB update
        setProfile(updatedProfile);

      } catch (error) {
        console.error('Error updating streak:', error.message);
        setFeedback('error-streak');
      } finally {
        setUpdatingStreak(false);
      }
    }
  };

  // Render feedback message
  const renderFeedback = () => {
    if (!showAnswer) return null;
    if (feedback === 'correct') return <div className="alert alert-success mt-4">Correct!</div>;
    if (feedback === 'incorrect') return <div className="alert alert-error mt-4">Incorrect! The actual fact is: "{factData?.originalFact}"</div>;
    if (feedback === 'error-fetch') return <div className="alert alert-warning mt-4">Could not load fact. Try again?</div>;
    if (feedback === 'error-streak') return <div className="alert alert-warning mt-4">Streak update failed. Answer recorded.</div>;
    return null;
  };

  const isLoading = loadingFact || loadingProfile || updatingStreak;

  // --- Render Logic ---
  return (
    <div className="card w-full max-w-lg bg-base-100 shadow-xl mx-auto my-8">
      <div className="card-body">
        <h2 className="card-title text-2xl justify-center mb-4">Fact or Fiction?</h2>

        {/* Show streak ONLY if user is logged in and profile is loaded */}
        {user && profile && (
          <div className="text-center mb-4 text-lg font-semibold">
            Current Streak: {updatingStreak ? <span className="loading loading-xs loading-spinner"></span> : (profile.current_streak ?? 0)}
          </div>
        )}
        {user && !profile && loadingProfile && (
             <div className="text-center mb-4 text-lg font-semibold">Loading streak...</div>
        )}

        {/* Loading State */}
        {loadingFact && !factData && <div className="text-center my-10"><span className="loading loading-lg loading-spinner text-primary"></span></div>}

        {/* Error Fetching Fact */}
        {!loadingFact && feedback === 'error-fetch' && (
             <div className='text-center my-6'>
                {renderFeedback()}
                <button onClick={fetchFact} className="btn btn-primary mt-4">Try Again</button>
             </div>
         )}

        {/* Fact Display and Buttons */}
        {!loadingFact && factData && feedback !== 'error-fetch' && (
          <>
            <p className="text-xl text-center my-6 min-h-[6rem] flex items-center justify-center">
                {factData.presentedFact}
            </p>

            <div className="card-actions justify-center mt-4">
              <button className="btn btn-success btn-lg" onClick={() => handleAnswer('true')} disabled={showAnswer || isLoading}>True</button>
              <button className="btn btn-error btn-lg" onClick={() => handleAnswer('false')} disabled={showAnswer || isLoading}>False</button>
            </div>

            <div className="min-h-[4rem] mt-4">{renderFeedback()}</div>

            {/* Next Fact Button */}
            {(showAnswer || feedback === 'error-streak') && feedback !== 'error-fetch' && (
                <div className="text-center mt-4">
                    <button
                        onClick={fetchFact}
                        className="btn btn-primary"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Loading...' : 'Next Fact'}
                    </button>
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}