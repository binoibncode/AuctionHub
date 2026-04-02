import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/features', label: 'Features' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/contact', label: 'Contact Us' },
];

export default function PublicNavbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <Trophy className="w-7 h-7 text-primary-500 group-hover:scale-110 transition-transform" />
          <span className="text-xl font-black uppercase tracking-wider text-white">
            Auction<span className="text-primary-500">Hub</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
                location.pathname === link.to
                  ? 'text-primary-500 bg-primary-500/10'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className={`px-5 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
              location.pathname === '/login'
                ? 'bg-dark-700 text-white'
                : 'text-dark-400 hover:text-white hover:bg-dark-800'
            }`}
          >
            Login
          </Link>
          <Link
            to="/register"
            className={`px-5 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
              location.pathname === '/register'
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                : 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40'
            }`}
          >
            Register
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2 text-dark-400 hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-dark-900 border-t border-dark-700/50 px-6 py-4 space-y-1">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${
                location.pathname === link.to
                  ? 'text-primary-500 bg-primary-500/10'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-3 border-t border-dark-700/50">
            <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center px-4 py-2.5 rounded-lg font-bold text-sm text-dark-400 hover:text-white bg-dark-800">Login</Link>
            <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center px-4 py-2.5 rounded-lg font-bold text-sm bg-primary-500 text-white hover:bg-primary-600">Register</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
