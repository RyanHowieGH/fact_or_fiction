// components/LoginCTA.js
"use client";

export default function LoginCTA({ onLoginClick, onSignupClick }) {
  return (
    <div className="card w-full max-w-lg bg-primary text-primary-content shadow-xl mx-auto my-8">
      <div className="card-body text-center">
        <h2 className="card-title justify-center text-xl">Want to save your streaks?</h2>
        <p>Log in or sign up to track your progress and compete on the leaderboard!</p>
        <div className="card-actions justify-center mt-4">
          <button className="btn btn-secondary" onClick={onLoginClick}>Log In</button>
          <button className="btn btn-accent" onClick={onSignupClick}>Sign Up</button>
        </div>
      </div>
    </div>
  );
}