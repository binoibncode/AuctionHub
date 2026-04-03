import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { SPORT_CATEGORIES } from '../constants/sports';
import {
  Calendar, Clock, MapPin, Users, Trophy,
  DollarSign, TrendingUp, Hash, ArrowLeft, Zap, Camera
} from 'lucide-react';
import { compressImage } from '../utils/image';

export default function CreateAuction() {
  const navigate = useNavigate();
  const categories = SPORT_CATEGORIES;

  const [form, setForm] = useState({
    categoryId: '',
    name: '',
    date: '',
    time: '',
    venue: '',
    playersPerTeam: 11,
    pointsPerTeam: 100000,
    minimumBid: 5000,
    bidIncreaseBy: 1000,
    totalTeams: 8,
    logoUrl: '',
  });
  const [error, setError] = useState('');

  const set = (key: string, value: string | number) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Logo must be under 5MB');
      return;
    }
    try {
      const compressedUrl = await compressImage(file, 400, 0.7);
      setForm(prev => ({ ...prev, logoUrl: compressedUrl }));
    } catch (err) {
      console.error('Error processing logo:', err);
      setError('Failed to process logo image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.categoryId) { setError('Please select a sport category.'); return; }
    if (form.name.trim().length < 3) { setError('Auction name must be at least 3 characters.'); return; }
    if (!form.date) { setError('Please select a date.'); return; }
    if (!form.time) { setError('Please select a time.'); return; }
    if (!form.venue.trim()) { setError('Venue is required.'); return; }
    if (form.playersPerTeam < 1) { setError('Players per team must be at least 1.'); return; }
    if (form.pointsPerTeam < 1000) { setError('Points per team must be at least 1,000.'); return; }
    if (form.minimumBid < 100) { setError('Minimum bid must be at least 100.'); return; }
    if (form.bidIncreaseBy < 50) { setError('Bid increase must be at least 50.'); return; }
    if (form.totalTeams < 2) { setError('There must be at least 2 teams.'); return; }

    const payload = {
      categoryId: form.categoryId,
      name: form.name.trim(),
      date: new Date(form.date).toISOString(),
      time: form.time,
      venue: form.venue.trim(),
      playersPerTeam: form.playersPerTeam,
      pointsPerTeam: form.pointsPerTeam,
      minimumBid: form.minimumBid,
      bidIncreaseBy: form.bidIncreaseBy,
      totalTeams: form.totalTeams,
      status: 'upcoming',
      logoUrl: form.logoUrl || undefined,
    };

    try {
      await api.createAuction(payload);
      navigate('/organizer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create auction.');
    }
  };

  const selectedCat = categories.find(c => c.id === form.categoryId);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <button
        onClick={() => navigate('/organizer')}
        className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-bold mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Auctions
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Create New Auction</h1>
        <p className="text-dark-500 mt-2">Set up your sport draft auction event</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ── Sport Category ── */}
        <div className="card p-6">
          <label className="flex items-center gap-2 text-sm font-bold text-dark-400 uppercase tracking-wider mb-4">
            <Trophy className="w-4 h-4 text-primary-500" /> Sport Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => set('categoryId', cat.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                  form.categoryId === cat.id
                    ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/10'
                    : 'border-dark-700 bg-dark-800 hover:border-dark-500'
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className={`text-sm font-bold ${form.categoryId === cat.id ? 'text-primary-500' : 'text-dark-400'}`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Auction Details ── */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent-500" /> Auction Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            
            {/* Logo Upload */}
            <div className="md:col-span-2 flex flex-col items-center mb-2">
              <label className="block text-sm font-medium text-dark-500 mb-2">Auction Logo (Optional)</label>
              <label className="cursor-pointer group relative">
                <div className="w-24 h-24 rounded-full bg-dark-800 border-2 border-dashed border-dark-500 group-hover:border-primary-500 flex items-center justify-center overflow-hidden transition-colors shadow-lg">
                  {form.logoUrl ? (
                    <img src={form.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2">
                      <Camera className="w-6 h-6 text-dark-500 group-hover:text-primary-500 mx-auto transition-colors" />
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
              {form.logoUrl && (
                <button type="button" onClick={() => setForm(prev => ({ ...prev, logoUrl: '' }))} className="text-[10px] text-red-500 mt-2 font-bold hover:text-red-400">
                  Remove Logo
                </button>
              )}
            </div>

            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark-500 mb-2">Auction Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Premier League Summer Draft"
                value={form.name}
                onChange={e => set('name', e.target.value)}
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-dark-500 mb-2">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Auction Date</span>
              </label>
              <input
                type="date"
                className="input-field"
                value={form.date}
                onChange={e => set('date', e.target.value)}
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-dark-500 mb-2">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Auction Time</span>
              </label>
              <input
                type="time"
                className="input-field"
                value={form.time}
                onChange={e => set('time', e.target.value)}
              />
            </div>

            {/* Venue */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark-500 mb-2">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Venue</span>
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. University Stadium, Trivandrum"
                value={form.venue}
                onChange={e => set('venue', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── Configuration ── */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Hash className="w-5 h-5 text-blue-400" /> Configuration
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-dark-500 mb-2">
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Players per Team</span>
              </label>
              <input
                type="number"
                className="input-field"
                min={1}
                value={form.playersPerTeam}
                onChange={e => set('playersPerTeam', Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-500 mb-2">
                <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Points per Team</span>
              </label>
              <input
                type="number"
                className="input-field"
                min={1000}
                step={1000}
                value={form.pointsPerTeam}
                onChange={e => set('pointsPerTeam', Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-500 mb-2">
                <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Minimum Bid</span>
              </label>
              <input
                type="number"
                className="input-field"
                min={100}
                step={100}
                value={form.minimumBid}
                onChange={e => set('minimumBid', Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-500 mb-2">
                <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> Bid Increase By</span>
              </label>
              <input
                type="number"
                className="input-field"
                min={50}
                step={50}
                value={form.bidIncreaseBy}
                onChange={e => set('bidIncreaseBy', Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-500 mb-2">
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Total Teams</span>
              </label>
              <input
                type="number"
                className="input-field"
                min={2}
                value={form.totalTeams}
                onChange={e => set('totalTeams', Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* ── Summary preview ── */}
        {form.name && form.categoryId && (
          <div className="card p-6 bg-gradient-to-r from-primary-500/5 to-transparent border-l-4 border-l-primary-500">
            <h3 className="text-sm font-bold text-dark-400 uppercase tracking-wider mb-3">Preview</h3>
            <p className="text-xl font-black text-white mb-1">{form.name}</p>
            <p className="text-dark-400 text-sm">
              {selectedCat?.icon} {selectedCat?.name} &nbsp;•&nbsp; {form.totalTeams} Teams &nbsp;•&nbsp; {form.playersPerTeam} Players/Team &nbsp;•&nbsp; ₹{form.pointsPerTeam.toLocaleString()} Budget
            </p>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm font-bold text-center bg-red-500/10 p-3 rounded-lg">{error}</p>
        )}

        <div className="flex gap-4">
          <button type="submit" className="btn-primary px-8 py-3 text-lg flex-1">
            Create Auction
          </button>
          <button
            type="button"
            onClick={() => navigate('/organizer')}
            className="btn-secondary px-8 py-3 text-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
