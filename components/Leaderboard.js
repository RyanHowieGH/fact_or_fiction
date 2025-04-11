// components/Leaderboard.js
"use client";

import { useState, useEffect } from 'react';

export default function Leaderboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        // Ensure this path '/api/leaderboard' corresponds to 'app/api/leaderboard/route.js'
        const response = await fetch('/api/leaderboard');
        if (!response.ok) {
           const errorBody = await response.text();
           throw new Error(`Failed to fetch leaderboard: ${response.statusText} - ${errorBody}`);
        }
        const data = await response.json();
        setScores(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
     // Optional: Add a timer to refresh the leaderboard periodically
     // const intervalId = setInterval(fetchLeaderboard, 60000); // Refresh every minute
     // return () => clearInterval(intervalId);
  }, []); // Fetch only on initial mount

  return (
    // Card structure
    <div className="card w-full max-w-md bg-base-200 shadow-xl mx-auto my-8">
      <div className="card-body">
        <h2 className="card-title justify-center text-xl mb-4">Leaderboard (Top 10)</h2>
        {/* Loading spinner */}
        {loading && <div className="text-center"><span className="loading loading-dots loading-md text-primary"></span></div>}
        {/* Error Alert */}
        {error && <div className="alert alert-error text-sm p-2 shadow-md">Error: {error}</div>}
        {!loading && !error && scores.length === 0 && <p className="text-center text-sm">Be the first on the leaderboard!</p>}
        {!loading && !error && scores.length > 0 && (
          <div className="overflow-x-auto">
            {/* Table structure */}
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Username</th>
                  <th>Highest Streak</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score, index) => (
                  // Added hover effect using Tailwind utility class as per v5 guide
                  <tr key={score.username || index} className="hover:bg-base-300">
                    <th>{index + 1}</th>
                    <td>{score.username ?? 'Anonymous'}</td> {/* Fallback needed if username is somehow null */}
                    <td className='text-right pr-2'>{score.highest_streak}</td> {/* Align score right */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}