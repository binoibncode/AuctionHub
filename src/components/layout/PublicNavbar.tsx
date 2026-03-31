import { Link, useLocation } from 'react-router-dom';
import { Trophy } from 'lucide-react';

export default function PublicNavbar() {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <Trophy className="w-7 h-7 text-primary-500 group-hover:scale-110 transition-transform" />
          <span className="text-xl font-black uppercase tracking-wider text-white">
            Auction<span className="text-primary-500">Hub</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
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
      </div>
    </nav>
  );
}
