
import { Outlet, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { LogOut, Trophy, Activity, Users, CreditCard } from 'lucide-react';

export default function AppLayout({ roleRequired }: { roleRequired?: string }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roleRequired && user.role !== roleRequired) {
    return <Navigate to="/" replace />;
  }

  const categories = db.getCategories();

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden text-white font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-dark-800 border-r border-dark-700 hidden md:flex flex-col">
        <div className="p-6 border-b border-dark-700">
          <Link to="/" className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-primary-500" />
            <span className="text-xl font-black uppercase tracking-wider text-white">Auction<span className="text-primary-500">Hub</span></span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {user.role === 'Bidder' && (
            <>
              <div className="text-xs font-bold text-dark-500 uppercase tracking-wider mb-4 ml-3 mt-4">Sports</div>
              <Link
                to={`/${user.role.toLowerCase()}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  location.pathname === '/' || (!location.search)
                    ? 'bg-primary-500/10 text-primary-500'
                    : 'text-dark-400 hover:bg-dark-700 hover:text-white'
                }`}
              >
                <Activity className="w-5 h-5" />
                <span>All Sports</span>
              </Link>
              
              {categories.map((cat: any) => {
                const isActive = location.search.includes(`category=${cat.id}`);
                return (
                  <Link
                    key={cat.id}
                    to={`/${user.role.toLowerCase()}?category=${cat.id}`}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-500/10 text-primary-500'
                        : 'text-dark-400 hover:bg-dark-700 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span>{cat.name}</span>
                  </Link>
                );
              })}
            </>
          )}

          {user.role === 'Admin' && (
            <>
              <div className="text-xs font-bold text-dark-500 uppercase tracking-wider mb-4 ml-3 mt-4">Management</div>
              <Link
                to="/admin"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium bg-primary-500/10 text-primary-500"
              >
                <Users className="w-5 h-5" />
                <span>Users</span>
              </Link>
            </>
          )}

           {user.role === 'Organizer' && (
            <>
              <div className="text-xs font-bold text-dark-500 uppercase tracking-wider mb-4 ml-3 mt-4">Management</div>
              <Link
                to="/organizer"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  location.pathname === '/organizer' && !location.pathname.includes('/create')
                    ? 'bg-primary-500/10 text-primary-500'
                    : 'text-dark-400 hover:bg-dark-700 hover:text-white'
                }`}
              >
                <Activity className="w-5 h-5" />
                <span>My Auctions</span>
              </Link>
              <Link
                to="/organizer/create"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  location.pathname === '/organizer/create'
                    ? 'bg-primary-500/10 text-primary-500'
                    : 'text-dark-400 hover:bg-dark-700 hover:text-white'
                }`}
              >
                <span className="text-lg">➕</span>
                <span>Create Auction</span>
              </Link>
              <Link
                to="/organizer/pricing"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  location.pathname === '/organizer/pricing'
                    ? 'bg-primary-500/10 text-primary-500'
                    : 'text-dark-400 hover:bg-dark-700 hover:text-white'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Pricing Plans</span>
              </Link>
            </>
          )}

          {user.role === 'Player' && (
            <>
              <div className="text-xs font-bold text-dark-500 uppercase tracking-wider mb-4 ml-3 mt-4">Player Hub</div>
              <Link
                to="/player"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  location.pathname === '/player'
                    ? 'bg-primary-500/10 text-primary-500'
                    : 'text-dark-400 hover:bg-dark-700 hover:text-white'
                }`}
              >
                <Activity className="w-5 h-5" />
                <span>My Auctions</span>
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-dark-700">
          <Link to="/profile" className="flex items-center gap-3 px-3 py-3 mb-2 rounded-lg bg-dark-700/50 hover:bg-dark-700 transition-colors">
            <div className="w-10 h-10 rounded-full bg-dark-600 flex items-center justify-center overflow-hidden flex-shrink-0">
              {user.photoUrl ? (
                <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-primary-500">{user.name.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <p className="text-xs text-dark-500 truncate">{user.role}</p>
            </div>
          </Link>
          
          <button 
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-dark-900 border-l border-dark-800">
        <div className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
