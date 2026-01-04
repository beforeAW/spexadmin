import { useState } from 'react';

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-karspex-cream shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop & Tablet Layout */}
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <h1 className="text-xl sm:text-2xl font-bold text-karspex-black">Spexadmin</h1>
          </div>

          {/* Desktop Navigation (lg and up) */}
          <nav className="hidden lg:flex space-x-8">
            <a
              href="/"
              className="text-karspex-black hover:text-karspex-gold transition-colors duration-200 font-medium"
            >
              Välkommen
            </a>
            <a
              href="/bli-spexare"
              className="text-karspex-black hover:text-karspex-gold transition-colors duration-200 font-medium"
            >
              Bli spexare
            </a>
            <a
              href="/produktioner"
              className="text-karspex-black hover:text-karspex-gold transition-colors duration-200 font-medium"
            >
              Produktioner
            </a>
            <a
              href="/webbutik"
              className="text-karspex-black hover:text-karspex-gold transition-colors duration-200 font-medium"
            >
              Webbutik
            </a>
          </nav>

          {/* Tablet Navigation (md to lg) */}
          <nav className="hidden md:flex lg:hidden space-x-4">
            <a
              href="/"
              className="text-karspex-black hover:text-karspex-gold transition-colors duration-200 text-sm font-medium"
            >
              Hem
            </a>
            <a
              href="/bli-spexare"
              className="text-karspex-black hover:text-karspex-gold transition-colors duration-200 text-sm font-medium"
            >
              Bli spexare
            </a>
            <a
              href="/produktioner"
              className="text-karspex-black hover:text-karspex-gold transition-colors duration-200 text-sm font-medium"
            >
              Produktioner
            </a>
          </nav>

          {/* Mobile menu button (phone only) */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-karspex-black hover:text-karspex-gold focus:outline-none focus:text-karspex-gold"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu (phone only) */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-karspex-cream">
            <nav className="py-4 space-y-3">
              <a
                href="/"
                className="block text-karspex-black hover:text-karspex-gold hover:bg-karspex-white transition-colors duration-200 font-medium py-2 px-4 rounded"
              >
                Välkommen
              </a>
              <a
                href="/bli-spexare"
                className="block text-karspex-black hover:text-karspex-gold hover:bg-karspex-white transition-colors duration-200 font-medium py-2 px-4 rounded"
              >
                Bli spexare
              </a>
              <a
                href="/produktioner"
                className="block text-karspex-black hover:text-karspex-gold hover:bg-karspex-white transition-colors duration-200 font-medium py-2 px-4 rounded"
              >
                Produktioner
              </a>
              <a
                href="/webbutik"
                className="block text-karspex-black hover:text-karspex-gold hover:bg-karspex-white transition-colors duration-200 font-medium py-2 px-4 rounded"
              >
                Webbutik
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
