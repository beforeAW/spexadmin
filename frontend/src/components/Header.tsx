import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CircleUser, Settings, LogOut } from 'lucide-react';
import Button from './Button';

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('token') !== null;

  return (
    <header className="bg-karspex-cream shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop & Tablet Layout */}
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="text-xl sm:text-2xl font-bold text-karspex-black hover:text-karspex-gold transition-colors"
            >
              Spexadmin
            </Link>
          </div>

          {/* Desktop Navigation (lg and up) */}
          <nav className="hidden lg:flex space-x-8">
            <Link
              to="/login"
              className="text-karspex-black hover:text-karspex-gold transition-colors duration-200 font-medium"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-karspex-black hover:text-karspex-gold transition-colors duration-200 font-medium"
            >
              Register
            </Link>
            <Link
              to="/dashboard"
              className="text-karspex-black hover:text-karspex-gold transition-colors duration-200 font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/events"
              className="text-karspex-black hover:text-karspex-gold transition-colors duration-200 font-medium"
            >
              Events
            </Link>
            <Link
              to="/groups"
              className="text-karspex-black hover:text-karspex-gold transition-colors duration-200 font-medium"
            >
              Groups
            </Link>
            <Link
              to="/users"
              className="text-karspex-black hover:text-karspex-gold transition-colors duration-200 font-medium"
            >
              Users
            </Link>
            <Link
              to="/events/6"
              className="text-karspex-black hover:text-karspex-gold transition-colors duration-200 font-medium"
            >
              Event Detail
            </Link>
            <Link
              to="/profile"
              className="text-karspex-black hover:text-karspex-gold transition-colors duration-200 font-medium"
            >
              Profile
            </Link>
            <Link
              to="/settings"
              className="text-karspex-black hover:text-karspex-gold transition-colors duration-200 font-medium"
            >
              Settings
            </Link>
          </nav>

          {/* Logout Button */}
          {isLoggedIn && (
            <div className="hidden lg:block">
              <Button variant="outline" onClick={handleLogout} size="sm">
                Logout
              </Button>
            </div>
          )}

          {/* Tablet Navigation (md to lg) */}
          <nav className="hidden md:flex lg:hidden space-x-4">
            <Link
              to="/login"
              className="text-karspex-black hover:text-karspex-gold transition-colors duration-200 text-sm font-medium"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-karspex-black hover:text-karspex-gold transition-colors duration-200 text-sm font-medium"
            >
              Register
            </Link>
            <Link
              to="/events"
              className="text-karspex-black hover:text-karspex-gold transition-colors duration-200 text-sm font-medium"
            >
              Events
            </Link>
            <Link
              to="/events/6"
              className="text-karspex-black hover:text-karspex-gold transition-colors duration-200 text-sm font-medium"
            >
              Event Detail
            </Link>
            <Link
              to="/profile"
              className="text-karspex-black hover:text-karspex-gold transition-colors duration-200 text-sm font-medium"
              title="Profile"
            >
              <CircleUser size={20} />
            </Link>
            <Link
              to="/settings"
              className="text-karspex-black hover:text-karspex-gold transition-colors duration-200 text-sm font-medium"
              title="Settings"
            >
              <Settings size={20} />
            </Link>
          </nav>

          {/* Logout Button - Tablet */}
          {isLoggedIn && (
            <div className="hidden md:block lg:hidden">
              <Button variant="outline" onClick={handleLogout} size="sm" title="Logout">
                <LogOut size={20} />
              </Button>
            </div>
          )}

          {/* Mobile Icons and menu button (phone only) */}
          <div className="md:hidden flex items-center space-x-3">
            <Link
              to="/profile"
              className="text-karspex-black hover:text-karspex-gold transition-colors duration-200"
              title="Profile"
            >
              <CircleUser size={22} />
            </Link>
            <Link
              to="/settings"
              className="text-karspex-black hover:text-karspex-gold transition-colors duration-200"
              title="Settings"
            >
              <Settings size={22} />
            </Link>
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="text-karspex-black hover:text-karspex-gold transition-colors duration-200"
                title="Logout"
              >
                <LogOut size={22} />
              </button>
            )}
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
              <Link
                to="/login"
                className="block text-karspex-black hover:text-karspex-gold hover:bg-karspex-white transition-colors duration-200 font-medium py-2 px-4 rounded"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block text-karspex-black hover:text-karspex-gold hover:bg-karspex-white transition-colors duration-200 font-medium py-2 px-4 rounded"
              >
                Register
              </Link>
              <Link
                to="/dashboard"
                className="block text-karspex-black hover:text-karspex-gold hover:bg-karspex-white transition-colors duration-200 font-medium py-2 px-4 rounded"
              >
                Dashboard
              </Link>
              <Link
                to="/events"
                className="block text-karspex-black hover:text-karspex-gold hover:bg-karspex-white transition-colors duration-200 font-medium py-2 px-4 rounded"
              >
                Events
              </Link>
              <Link
                to="/groups"
                className="block text-karspex-black hover:text-karspex-gold hover:bg-karspex-white transition-colors duration-200 font-medium py-2 px-4 rounded"
              >
                Groups
              </Link>
              <Link
                to="/users"
                className="block text-karspex-black hover:text-karspex-gold hover:bg-karspex-white transition-colors duration-200 font-medium py-2 px-4 rounded"
              >
                Users
              </Link>
              <Link
                to="/events/6"
                className="block text-karspex-black hover:text-karspex-gold hover:bg-karspex-white transition-colors duration-200 font-medium py-2 px-4 rounded"
              >
                Event Detail
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
