// app/layout.js
import './globals.css' // Make sure this path is correct

export const metadata = {
  title: 'Fact or Fiction?',
  description: 'Test your knowledge!',
}

// This layout applies to all routes
export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light"> {/* Optional: Set default DaisyUI theme */}
      <body>
        {/* Simple Navbar Example (Can be moved into page.js if preferred) */}
        <div className="navbar bg-base-300 shadow-md">
          <div className="flex-1">
            <a className="btn btn-ghost text-xl">Fact or Fiction?</a>
          </div>
          <div className="flex-none">
            {/* Auth state specific buttons could go here, potentially passed from page */}
          </div>
        </div>

        <main className="container mx-auto px-4 py-8">
          {children} {/* Page content will be injected here */}
        </main>

        <footer className="footer footer-center p-4 bg-base-300 text-base-content mt-10">
            <aside><p>Copyright © {new Date().getFullYear()}</p></aside>
        </footer>
      </body>
    </html>
  )
}