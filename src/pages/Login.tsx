import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import { User, KeyRound, Lock } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { user, login } = useAuth();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  if (user) {
    if (redirect) return <Navigate to={redirect} replace />;
    if (user.role === 'Admin') return <Navigate to="/admin" replace />;
    if (user.role === 'Organizer') return <Navigate to="/organizer" replace />;
    if (user.role === 'Player') return <Navigate to="/player" replace />;
    return <Navigate to="/bidder" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = login(email, password || undefined);
    if (!result.success) {
      setError(result.message);
    }
  };

  const quickLogin = (mail: string) => {
    setEmail(mail);
    setPassword('');
    // Quick login skips password for demo accounts
    const result = login(mail);
    if (!result.success) setError(result.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-black uppercase tracking-wider text-white hover:opacity-80 transition-opacity">
            Auction<span className="text-primary-500">Hubs</span>
          </Link>
        </div>

        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="inline-block p-4 rounded-full bg-dark-700 mb-4">
              <KeyRound className="w-8 h-8 text-primary-500" />
            </div>
            <h2 className="text-3xl font-bold text-white">Login</h2>
            <p className="text-dark-500 mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-500 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-dark-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  className="input-field pl-10"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-500 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-dark-500" />
                </div>
                <input
                  id="password"
                  type="password"
                  className="input-field pl-10"
                  placeholder="Enter password (optional for demo)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm font-bold text-center bg-red-500/10 p-3 rounded-lg">
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary w-full py-3 text-lg">
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-dark-500 space-y-2">
            <p>Quick Login (Demo Accounts):</p>
            <div className="flex flex-col gap-1">
              <button onClick={() => quickLogin('admin@auction.com')} className="text-primary-500 hover:text-primary-600">Admin: admin@auction.com</button>
              <button onClick={() => quickLogin('org@auction.com')} className="text-primary-500 hover:text-primary-600">Organizer: org@auction.com</button>
              <button onClick={() => quickLogin('bidder@auction.com')} className="text-primary-500 hover:text-primary-600">Bidder: bidder@auction.com</button>
              <button onClick={() => quickLogin('player@auction.com')} className="text-primary-500 hover:text-primary-600">Player: player@auction.com</button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-dark-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-500 hover:text-primary-600 font-bold">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
