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
        const response = await fetch('/api/leaderboard'); // Fetch from our API route
        if (!response.ok) {
          throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
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
     // Optional: Add a timer to refresh the leaderboard periodically?
     // const intervalId = setInterval(fetchLeaderboard, 60000); // Refresh every minute
     // return () => clearInterval(intervalId);
  }, []); // Fetch only on initial mount

  return (
    <div className="card w-full max-w-md bg-base-200 shadow-xl mx-auto my-8">
      <div className="card-body">
        <h2 className="card-title justify-center text-xl mb-4">Leaderboard (Top 10)</h2>
        {loading && <div className="text-center"><span className="loading loading-dots loading-md"></span></div>}
        {error && <div className="alert alert-error text-sm p-2">Error: {error}</div>}
        {!loading && !error && scores.length === 0 && <p className="text-center text-sm">No scores yet!</p>}
        {!loading && !error && scores.length > 0 && (
          <div className="overflow-x-auto">
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
                  <tr key={score.username || index}> {/* Use username as key if available */}
                    <th>{index + 1}</th>
                    <td>{score.username ?? 'Anonymous'}</td> {/* Fallback for safety */}
                    <td>{score.highest_streak}</td>
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