import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Auction, Player } from '../types';
import { api } from '../services/api';
import { SPORT_CATEGORIES } from '../constants/sports';
import {
  User, Mail, Phone, MapPin, Shield, Camera,
  Edit3, Lock, Check, X, Eye, EyeOff,
} from 'lucide-react';

export default function Profile() {
  const { user, updateProfile, changePassword } = useAuth();
  const [mode, setMode] = useState<'view' | 'edit' | 'password'>('view');
  const categories = SPORT_CATEGORIES;

  // Edit fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '');
  const [purseValue, setPurseValue] = useState(user?.purse || 0);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Messages
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  // Player profile & career
  const [registrations, setRegistrations] = useState<Array<{
    id: string;
    auctionId: Auction | null;
    playerId: Player | null;
    registeredAt: string;
  }>>([]);
  const [playerDrafts, setPlayerDrafts] = useState<Record<string, { bio: string; career: Record<string, { debut?: string; lastMatch?: string }> }>>({});

  useEffect(() => {
    const loadPlayerRegistrations = async () => {
      if (user?.role !== 'Player' || mode !== 'edit') return;

      try {
        const res = await api.getMyRegistrations();
        const regs = (res.data as unknown as Array<{
          id: string;
          auctionId: Auction | null;
          playerId: Player | null;
          registeredAt: string;
        }>) || [];

        setRegistrations(regs);
        const drafts: Record<string, { bio: string; career: Record<string, { debut?: string; lastMatch?: string }> }> = {};
        regs.forEach((reg) => {
          const player = reg.playerId;
          if (player) {
            drafts[player.id] = {
              bio: player.extraDetails || '',
              career: player.careerDetails ? { ...player.careerDetails } : {},
            };
          }
        });
        setPlayerDrafts(drafts);
      } catch (error) {
        console.error('Failed to load player registrations for profile', error);
      }
    };

    void loadPlayerRegistrations();
  }, [mode, user?.role]);

  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    setPhone(user.phone || '');
    setCity(user.city || '');
    setPhotoUrl(user.photoUrl || '');
    setPurseValue(user.purse || 0);
  }, [user]);

  if (!user) return null;

  const getCareerFormats = (sport: string): string[] => {
    const s = sport.toLowerCase();
    if (s.includes('cricket')) return ['ODI', 'T20I', 'Test', 'IPL'];
    if (s.includes('football')) return ['Club', 'National'];
    if (s.includes('nba') || s.includes('basketball')) return ['NBA', 'Champion'];
    if (s.includes('tennis')) return ['Grand Slam', 'ATP/WTA'];
    if (s.includes('badminton')) return ['Singles', 'Doubles', 'Mixed Doubles'];
    if (s.includes('volleyball')) return ['Club', 'League', 'National'];
    if (s.includes('kabadi') || s.includes('kabaddi')) return ['Pro League', 'State', 'National'];
    return ['Professional', 'National'];
  };

  const updateDraft = (playerId: string, value: string) => {
    setPlayerDrafts(prev => ({ ...prev, [playerId]: { ...(prev[playerId] || { bio: '', career: {} }), bio: value } }));
  };

  const updateCareer = (playerId: string, fmt: string, key: 'debut' | 'lastMatch', value: string) => {
    setPlayerDrafts(prev => {
      const existing = prev[playerId] || { bio: '', career: {} };
      return { ...prev, [playerId]: { ...existing, career: { ...existing.career, [fmt]: { ...(existing.career[fmt] || {}), [key]: value } } } };
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ text: 'Photo must be under 2MB', ok: false });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setPhotoUrl(dataUrl);
      // In view mode, immediately save
      if (mode === 'view') {
        updateProfile({ photoUrl: dataUrl }).then((result) => {
          setMessage({ text: result.message, ok: result.success });
          setTimeout(() => setMessage(null), 2000);
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      setMessage({ text: 'Name is required', ok: false });
      return;
    }

    const result = await updateProfile({
      name: name.trim(),
      phone: phone.trim() || undefined,
      city: city.trim() || undefined,
      photoUrl: photoUrl || undefined,
      purse: purseValue,
    });

    if (!result.success) {
      setMessage({ text: result.message, ok: false });
      return;
    }

    if (user.role === 'Player') {
      await Promise.all(
        Object.entries(playerDrafts).map(([playerId, draft]) =>
          api.updatePlayer(playerId, {
            extraDetails: draft.bio,
            careerDetails: draft.career,
          })
        )
      );
    }
    setMessage({ text: result.message || 'Profile updated successfully!', ok: true });
    setMode('view');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      setMessage({ text: 'New password must be at least 6 characters', ok: false });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match', ok: false });
      return;
    }

    const result = await changePassword(currentPassword, newPassword);
    if (!result.success) {
      setMessage({ text: result.message, ok: false });
      return;
    }

    setMessage({ text: result.message || 'Password changed successfully!', ok: true });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setMode('view');
    setTimeout(() => setMessage(null), 3000);
  };

  const cancelEdit = () => {
    setName(user.name);
    setPhone(user.phone || '');
    setCity(user.city || '');
    setPhotoUrl(user.photoUrl || '');
    setPurseValue(user.purse || 0);
    setMode('view');
    setMessage(null);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-black text-white mb-1">My Profile</h1>
      <p className="text-dark-400 mb-8">Manage your account settings</p>

      {/* Toast */}
      {message && (
        <div className={`mb-6 px-4 py-3 rounded-lg font-medium text-sm ${
          message.ok ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ═══════════ LEFT — PROFILE CARD ═══════════ */}
        <div className="card p-6 text-center lg:col-span-1">
          {/* Photo */}
          <label className="cursor-pointer group relative inline-block mb-4">
            <div className="w-28 h-28 rounded-full mx-auto bg-dark-700 border-4 border-dark-600 group-hover:border-primary-500 flex items-center justify-center overflow-hidden transition-all duration-200">
              {(photoUrl || user.photoUrl) ? (
                <img src={photoUrl || user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-primary-500">{user.name.charAt(0)}</span>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 hover:bg-primary-600 rounded-full flex items-center justify-center shadow-lg transition-colors">
              <Camera className="w-4 h-4 text-white" />
            </div>
          </label>

          <h2 className="text-xl font-black text-white">{user.name}</h2>
          <p className="text-dark-400 text-sm mt-1">{user.email}</p>
          <span className="inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full bg-primary-500/10 text-primary-500 uppercase">
            {user.role}
          </span>

          {/* Quick Actions */}
          <div className="mt-6 space-y-2">
            <button
              onClick={() => { setMode('edit'); setMessage(null); }}
              className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-colors ${
                mode === 'edit'
                  ? 'bg-primary-500/10 text-primary-500'
                  : 'text-dark-400 hover:bg-dark-700 hover:text-white'
              }`}
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
            <button
              onClick={() => { setMode('password'); setMessage(null); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}
              className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-colors ${
                mode === 'password'
                  ? 'bg-primary-500/10 text-primary-500'
                  : 'text-dark-400 hover:bg-dark-700 hover:text-white'
              }`}
            >
              <Lock className="w-4 h-4" /> Change Password
            </button>
          </div>
        </div>

        {/* ═══════════ RIGHT — CONTENT ═══════════ */}
        <div className="lg:col-span-2">
          {/* ── VIEW MODE ── */}
          {mode === 'view' && (
            <div className="card p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-500" /> Profile Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InfoRow icon={<User className="w-4 h-4" />} label="Full Name" value={user.name} />
                <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={user.email} />
                <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={user.phone || 'Not set'} muted={!user.phone} />
                <InfoRow icon={<MapPin className="w-4 h-4" />} label="City" value={user.city || 'Not set'} muted={!user.city} />
                <InfoRow icon={<Shield className="w-4 h-4" />} label="Account Type" value={user.role} />
                {user.role === 'Bidder' && user.purse !== undefined && (
                  <InfoRow icon={<span className="text-sm">₹</span>} label="Purse Balance" value={`₹${user.purse.toLocaleString()}`} />
                )}
                {user.role === 'Player' && user.isIcon && user.purse !== undefined && (
                  <InfoRow icon={<span className="text-sm">₹</span>} label="Base Point" value={`₹${user.purse.toLocaleString()}`} />
                )}
              </div>
            </div>
          )}

          {/* ── EDIT MODE ── */}
          {mode === 'edit' && (
            <div className="card p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-primary-500" /> Edit Profile
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-500 mb-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-dark-500" />
                    </div>
                    <input className="input-field pl-10" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-500 mb-1">Email <span className="text-dark-600">(read-only)</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-dark-500" />
                    </div>
                    <input className="input-field pl-10 opacity-50 cursor-not-allowed" value={user.email} readOnly />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-500 mb-1">Phone</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-dark-500" />
                      </div>
                      <input className="input-field pl-10" placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-500 mb-1">City</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-4 w-4 text-dark-500" />
                      </div>
                      <input className="input-field pl-10" placeholder="Mumbai" value={city} onChange={e => setCity(e.target.value)} />
                    </div>
                  </div>
                </div>

                {(user.role === 'Bidder' || (user.role === 'Player' && user.isIcon)) && (
                  <div>
                    <label className="block text-sm font-medium text-dark-500 mb-1">
                      {user.role === 'Bidder' ? 'Purse Balance' : 'Base Point'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-500 font-bold">
                        ₹
                      </div>
                      <input 
                        type="number"
                        className="input-field pl-8" 
                        value={purseValue} 
                        onChange={e => setPurseValue(Number(e.target.value))} 
                      />
                    </div>
                  </div>
                )}

                {/* ── Player Profile & Career ── */}
                {user.role === 'Player' && registrations.length > 0 && (
                  <div className="pt-4 border-t border-dark-700 space-y-4">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-primary-500" /> Player Profile &amp; Career
                    </h4>
                    {registrations.map(reg => {
                      const auction = reg.auctionId;
                      const player = reg.playerId;
                      if (!auction || !player) return null;
                      const cat = categories.find(c => c.id === auction.categoryId);
                      const sportName = cat?.name || '';
                      const formats = getCareerFormats(sportName);
                      const draft = playerDrafts[player.id] || { bio: '', career: {} };
                      return (
                        <div key={reg.id} className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-bold text-white">{auction.name}</p>
                            <span className="text-xs text-dark-500">{cat?.icon} {sportName}</span>
                          </div>
                          <div className="mb-4">
                            <label className="text-xs text-dark-400 uppercase font-bold block mb-1">Profile Description</label>
                            <textarea
                              rows={4}
                              value={draft.bio}
                              onChange={e => updateDraft(player.id, e.target.value)}
                              className="input-field w-full text-sm resize-y"
                              placeholder={`e.g. ${user.name} is a talented ${sportName.toLowerCase()} player who has been making waves...`}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-dark-400 uppercase font-bold block mb-2">
                              Career Details <span className="text-dark-600 font-normal normal-case">({sportName})</span>
                            </label>
                            <div className="space-y-2">
                              {formats.map(fmt => (
                                <div key={fmt} className="bg-dark-700 rounded-lg p-3 border border-dark-600">
                                  <p className="text-xs font-bold text-white uppercase mb-2">{fmt}</p>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-xs text-dark-500 block mb-1">Debut</label>
                                      <input
                                        type="text"
                                        value={draft.career[fmt]?.debut || ''}
                                        onChange={e => updateCareer(player.id, fmt, 'debut', e.target.value)}
                                        className="input-field text-xs py-1.5"
                                        placeholder="e.g. Jan 2020"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-dark-500 block mb-1">Last Match</label>
                                      <input
                                        type="text"
                                        value={draft.career[fmt]?.lastMatch || ''}
                                        onChange={e => updateCareer(player.id, fmt, 'lastMatch', e.target.value)}
                                        className="input-field text-xs py-1.5"
                                        placeholder="e.g. Mar 2024"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button onClick={handleSaveProfile} className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5 font-bold">
                    <Check className="w-4 h-4" /> Save Changes
                  </button>
                  <button onClick={cancelEdit} className="btn-secondary py-2.5 px-5 text-sm font-bold flex items-center gap-1.5">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── PASSWORD MODE ── */}
          {mode === 'password' && (
            <div className="card p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary-500" /> Change Password
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-500 mb-1">Current Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-dark-500" />
                    </div>
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      className="input-field pl-10 pr-10"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-dark-500 hover:text-white"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-500 mb-1">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-dark-500" />
                    </div>
                    <input
                      type={showNew ? 'text' : 'password'}
                      className="input-field pl-10 pr-10"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-dark-500 hover:text-white"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-500 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-dark-500" />
                    </div>
                    <input
                      type="password"
                      className="input-field pl-10"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={handleChangePassword} className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5 font-bold">
                    <Check className="w-4 h-4" /> Update Password
                  </button>
                  <button onClick={() => { setMode('view'); setMessage(null); }} className="btn-secondary py-2.5 px-5 text-sm font-bold flex items-center gap-1.5">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Helper Component ── */
function InfoRow({ icon, label, value, muted }: { icon: React.ReactNode; label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-dark-700 rounded-lg flex items-center justify-center text-dark-500 flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-xs text-dark-500 uppercase font-bold tracking-wider">{label}</p>
        <p className={`text-sm font-bold ${muted ? 'text-dark-600' : 'text-white'}`}>{value}</p>
      </div>
    </div>
  );
}
