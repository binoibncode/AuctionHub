import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import { User, KeyRound, Lock, Mail, ArrowLeft, ShieldCheck } from 'lucide-react';
import { db } from '../services/db';
import Swal from 'sweetalert2';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
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

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';
    let pwd = '';
    for (let i = 0; i < 10; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    return pwd;
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your email address.');
      return;
    }
    const users = db.getUsers();
    const foundUser = users.find(u => u.email.toLowerCase() === forgotEmail.trim().toLowerCase());
    if (!foundUser) {
      setForgotError('No account found with this email address.');
      return;
    }
    setForgotLoading(true);
    // Simulate sending email
    setTimeout(() => {
      const newPassword = generatePassword();
      db.updateUser({ ...foundUser, password: newPassword });
      setForgotLoading(false);
      setShowForgot(false);
      setForgotEmail('');
      Swal.fire({
        icon: 'success',
        title: 'Password Reset Successful',
        html: `
          <p style="color:#9ca3af;margin-bottom:12px;">A new password has been sent to your registered email address.</p>
          <div style="background:#1f2937;border:1px solid #374151;border-radius:8px;padding:12px;margin-top:8px;">
            <p style="color:#6b7280;font-size:13px;margin-bottom:4px;">New Password</p>
            <p style="color:#22c55e;font-size:18px;font-weight:bold;letter-spacing:1px;">${newPassword}</p>
          </div>
          <p style="color:#6b7280;font-size:12px;margin-top:12px;">⚠️ Since this is a demo, the password is shown here instead of being emailed.</p>
        `,
        background: '#111827',
        color: '#fff',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Got it!',
      });
    }, 1500);
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
          {!showForgot ? (
            <>
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
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-sm font-medium text-dark-500">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => { setShowForgot(true); setForgotEmail(email); setForgotError(''); }}
                      className="text-xs text-primary-500 hover:text-primary-400 font-semibold transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
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
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="inline-block p-4 rounded-full bg-dark-700 mb-4">
                  <ShieldCheck className="w-8 h-8 text-accent-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Forgot Password</h2>
                <p className="text-dark-500 mt-2">Enter your registered email address and we'll send you a new password</p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div>
                  <label htmlFor="forgot-email" className="block text-sm font-medium text-dark-500 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-dark-500" />
                    </div>
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      className="input-field pl-10"
                      placeholder="Enter your registered email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>

                {forgotError && (
                  <p className="text-red-500 text-sm font-bold text-center bg-red-500/10 p-3 rounded-lg">
                    {forgotError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="btn-primary w-full py-3 text-lg flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {forgotLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Sending...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>

              <button
                onClick={() => { setShowForgot(false); setForgotError(''); }}
                className="mt-6 w-full text-center text-sm text-dark-500 hover:text-white transition-colors flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
