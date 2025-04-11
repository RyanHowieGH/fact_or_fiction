// app/layout.js
import './globals.css'; // Make sure this path points to your main CSS file (e.g., app/globals.css)

export const metadata = {
  title: 'Fact or Fiction?',
  description: 'Test your knowledge!',
};

export default function RootLayout({ children }) {
  return (
    // Ensure NO whitespace right after the opening tag or before the closing tag on this line
    // data-theme might still work if configured in globals.css @plugin directive
    <html lang="en" data-theme="light">
      {/* ADD THE <head> TAG */}
      <head>
        {/* Next.js automatically injects title, meta descriptions, etc., here */}
        {/* You can add other fixed head elements like favicons if needed: */}
        {/* <link rel="icon" href="/favicon.ico" sizes="any" /> */}
      </head>
      {/* Ensure NO whitespace here */}
      <body>
        {/* Navbar structure seems stable based on guide */}
        <div className="navbar bg-base-300 shadow-md">
          <div className="flex-1">
            <a className="btn btn-ghost text-xl">Fact or Fiction?</a>
          </div>
          <div className="flex-none">
            {/* Auth state specific buttons could go here */}
          </div>
        </div>

        <main className="container mx-auto px-4 py-8">
          {children} {/* Page content will be injected here */}
        </main>

        {/* Footer: Added md:footer-horizontal for responsiveness as per v5 changes */}
        <footer className="footer footer-center md:footer-horizontal p-4 bg-base-300 text-base-content mt-10">
            <aside><p>Copyright © {new Date().getFullYear()}</p></aside>
            {/* Add other footer sections if needed */}
        </footer>
      </body>
      {/* Ensure NO whitespace here */}
    </html>
  );
}