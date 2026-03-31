import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { UserPlus, Mail, User, Shield, Wallet, Phone, MapPin, Lock, Camera } from 'lucide-react';
import { Role } from '../types';
import { compressImage } from '../utils/image';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [role, setRole] = useState<Role>('Bidder');
  const [isIcon, setIsIcon] = useState(false);
  const [purse, setPurse] = useState(100000);
  const [error, setError] = useState('');
  const { user, register } = useAuth();

  if (user) {
    if (user.role === 'Admin') return <Navigate to="/admin" replace />;
    if (user.role === 'Organizer') return <Navigate to="/organizer" replace />;
    if (user.role === 'Player') return <Navigate to="/player" replace />;
    return <Navigate to="/bidder" replace />;
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo must be less than 5MB');
        return;
      }
      try {
        const compressedDataUrl = await compressImage(file, 400, 0.7);
        setPhotoUrl(compressedDataUrl);
      } catch (err) {
        console.error('Error processing image:', err);
        setError('Failed to process image');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Name is required.'); return; }
    if (!email.trim()) { setError('Email is required.'); return; }
    if (!password.trim()) { setError('Password is required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (role === 'Bidder' && purse <= 0) { setError('Purse amount must be greater than 0.'); return; }

    const result = register({
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      phone: phone.trim() || undefined,
      city: city.trim() || undefined,
      photoUrl: photoUrl || undefined,
      isIcon: role === 'Player' ? isIcon : undefined,
      purse: (role === 'Bidder' || (role === 'Player' && isIcon)) ? purse : undefined,
    });

    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-black uppercase tracking-wider text-white">
            Auction<span className="text-primary-500">Hub</span>
          </Link>
        </div>

        <div className="card p-8 relative overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent pointer-events-none" />

          <div className="relative">
            <div className="text-center mb-8">
              <div className="inline-block p-4 rounded-full bg-dark-700 mb-4 ring-2 ring-primary-500/20">
                <UserPlus className="w-8 h-8 text-primary-500" />
              </div>
              <h2 className="text-3xl font-bold text-white">Create Account</h2>
              <p className="text-dark-500 mt-2">Join the premier auction platform</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Photo Upload */}
              <div className="flex justify-center mb-2">
                <label className="cursor-pointer group relative">
                  <div className="w-24 h-24 rounded-full bg-dark-700 border-2 border-dashed border-dark-500 group-hover:border-primary-500 flex items-center justify-center overflow-hidden transition-colors">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Camera className="w-6 h-6 text-dark-500 group-hover:text-primary-500 mx-auto transition-colors" />
                        <span className="text-[10px] text-dark-500 mt-1 block">Upload</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  {photoUrl && (
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
                      <Camera className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </label>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="reg-name" className="block text-sm font-medium text-dark-500 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-dark-500" />
                  </div>
                  <input id="reg-name" type="text" required className="input-field pl-10" placeholder="John Doe"
                    value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-dark-500 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-dark-500" />
                  </div>
                  <input id="reg-email" type="email" required className="input-field pl-10" placeholder="you@example.com"
                    value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              {/* Phone + City in row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-phone" className="block text-sm font-medium text-dark-500 mb-1">Phone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-dark-500" />
                    </div>
                    <input id="reg-phone" type="tel" className="input-field pl-9 text-sm" placeholder="9876543210"
                      value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label htmlFor="reg-city" className="block text-sm font-medium text-dark-500 mb-1">City</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-4 w-4 text-dark-500" />
                    </div>
                    <input id="reg-city" type="text" className="input-field pl-9 text-sm" placeholder="Mumbai"
                      value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Password + Confirm */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-pass" className="block text-sm font-medium text-dark-500 mb-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-dark-500" />
                    </div>
                    <input id="reg-pass" type="password" required className="input-field pl-9 text-sm" placeholder="Min 6 chars"
                      value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label htmlFor="reg-cpass" className="block text-sm font-medium text-dark-500 mb-1">Confirm</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-dark-500" />
                    </div>
                    <input id="reg-cpass" type="password" required className="input-field pl-9 text-sm" placeholder="Re-enter"
                      value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-dark-500 mb-1">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Account Type</span>
                  </div>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Bidder', 'Organizer', 'Player'] as Role[]).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-2.5 px-3 rounded-lg font-bold text-sm transition-all duration-200 border ${
                        role === r
                          ? 'bg-primary-500/10 border-primary-500 text-primary-500 shadow-lg shadow-primary-500/10'
                          : 'bg-dark-700 border-dark-600 text-dark-400 hover:border-dark-500'
                      }`}
                    >
                      {r === 'Bidder' ? '🏷️' : r === 'Organizer' ? '🎯' : '🏏'} {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon Player Toggle — only for Player */}
              {role === 'Player' && (
                <div className="animate-fadeIn bg-dark-700/50 p-4 rounded-xl border border-dark-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Icon Player</h4>
                      <p className="text-[10px] text-dark-500">Are you a pre-retained icon player?</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={isIcon} onChange={(e) => setIsIcon(e.target.checked)} />
                      <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* Purse / Base Point — for Bidder or Icon Player */}
              {(role === 'Bidder' || (role === 'Player' && isIcon)) && (
                <div className="animate-fadeIn">
                  <label htmlFor="reg-purse" className="block text-sm font-medium text-dark-500 mb-1">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      <span>{role === 'Bidder' ? 'Starting Purse (₹)' : 'Base Point (₹)'}</span>
                    </div>
                  </label>
                  <input id="reg-purse" type="number" min={1} required className="input-field"
                    placeholder="100000" value={purse} onChange={(e) => setPurse(Number(e.target.value))} />
                </div>
              )}

              {error && (
                <p className="text-red-500 text-sm font-bold text-center bg-red-500/10 p-3 rounded-lg">
                  {error}
                </p>
              )}

              <button type="submit" className="btn-primary w-full py-3 text-lg">
                Create Account
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-dark-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-500 hover:text-primary-600 font-bold">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
