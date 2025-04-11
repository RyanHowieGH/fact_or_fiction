// components/LoginCTA.js
"use client";

export default function LoginCTA({ onLoginClick, onSignupClick }) {
  // Card and button classes seem stable
  return (
    <div className="card w-full max-w-lg bg-gradient-to-r from-primary to-secondary text-primary-content shadow-xl mx-auto my-8"> {/* Example gradient */}
      <div className="card-body text-center">
        <h2 className="card-title justify-center text-xl">Want to save your streaks?</h2>
        <p>Log in or sign up to track your progress and compete on the leaderboard!</p>
        <div className="card-actions justify-center mt-4 space-x-4"> {/* Added space between buttons */}
          <button className="btn btn-neutral" onClick={onLoginClick}>Log In</button>
          <button className="btn btn-accent" onClick={onSignupClick}>Sign Up</button>
        </div>
      </div>
    </div>
  );
}