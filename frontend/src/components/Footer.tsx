import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMemo } from 'react';

function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, roles } = useMemo(() => {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');
    let parsedRoles: string[] = [];
    try {
      if (userRaw) {
        const u = JSON.parse(userRaw);
        if (Array.isArray(u?.roles)) parsedRoles = u.roles;
      }
    } catch {
      parsedRoles = [];
    }
    return { isLoggedIn: !!token, roles: parsedRoles };
  }, []);

  const isAdmin = roles.includes('admin');
  const isManager = roles.includes('manager');
  const isGroupManager = roles.includes('groupmanager');

  // Hide footer on login/front page and register
  if (
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/register'
  ) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <footer className="bg-karspex-cream border-t border-karspex-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Desktop & Tablet Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold text-karspex-black mb-4">Spexadmin</h3>
            <p className="text-karspex-gray-800 text-sm">Ett administrationssystem för spex</p>
          </div>

          {/* Quick Links */}
          <div className="md:col-start-3 md:text-right">
            <h3 className="text-lg font-bold text-karspex-black mb-4">Snabblänkar</h3>
            <ul className="space-y-2">
              {!isLoggedIn && (
                <li>
                  <Link
                    to="/login"
                    className="text-karspex-gray-800 hover:text-karspex-gold transition-colors duration-200 text-sm"
                  >
                    Login
                  </Link>
                </li>
              )}
              {(isAdmin || isManager) && (
                <li>
                  <Link
                    to="/dashboard"
                    className="text-karspex-gray-800 hover:text-karspex-gold transition-colors duration-200 text-sm"
                  >
                    Dashboard
                  </Link>
                </li>
              )}
              {isLoggedIn && (
                <li>
                  <Link
                    to="/events"
                    className="text-karspex-gray-800 hover:text-karspex-gold transition-colors duration-200 text-sm"
                  >
                    Events
                  </Link>
                </li>
              )}
              {(isAdmin || isManager || isGroupManager) && (
                <li>
                  <Link
                    to="/groups"
                    className="text-karspex-gray-800 hover:text-karspex-gold transition-colors duration-200 text-sm"
                  >
                    Groups
                  </Link>
                </li>
              )}
              {isAdmin && (
                <li>
                  <Link
                    to="/users"
                    className="text-karspex-gray-800 hover:text-karspex-gold transition-colors duration-200 text-sm"
                  >
                    Users
                  </Link>
                </li>
              )}
              {isLoggedIn && (
                <li>
                  <Link
                    to="/profile"
                    className="text-karspex-gray-800 hover:text-karspex-gold transition-colors duration-200 text-sm"
                  >
                    Profile
                  </Link>
                </li>
              )}
              {isLoggedIn && (
                <li>
                  <Link
                    to="/settings"
                    className="text-karspex-gray-800 hover:text-karspex-gold transition-colors duration-200 text-sm"
                  >
                    Settings
                  </Link>
                </li>
              )}
              {isLoggedIn && (
                <li>
                  <button
                    onClick={handleLogout}
                    className="text-karspex-gray-800 hover:text-karspex-gold transition-colors duration-200 text-sm"
                  >
                    Logout
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-karspex-gray-100">
          <p className="text-center text-karspex-gray-800 text-sm">
            &copy; {new Date().getFullYear()} Spexadmin. Alla rättigheter förbehållna.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
