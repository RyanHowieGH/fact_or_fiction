// app/layout.js
import './globals.css';

export const metadata = { /* ... */ };

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <head>
        {/* Favicons etc */}
      </head>
      <body>
        <div className="navbar bg-base-300 shadow-md"> {/* ... Navbar content ... */} </div>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="footer footer-center p-4 bg-base-300 text-base-content mt-10"> {/* ... Footer content ... */} </footer>
      </body>
    </html>
  );
}