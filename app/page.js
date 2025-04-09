// app/page.js
import AuthComponent from '@/components/Auth'; // Assuming alias setup
import Game from '@/components/Game';

// This page is likely a Server Component by default,
// but it renders Client Components.
export default function HomePage() {

  // You could fetch initial server-side data here if needed,
  // but Auth and Game handle their own client-side loading.

  return (
    <div>
      {/* Render the Client Components */}
      <AuthComponent />
      <Game />

      {/* Add Leaderboard component here later */}
      {/* <Leaderboard /> */}
    </div>
  );
}