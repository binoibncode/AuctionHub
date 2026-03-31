import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import { Auction, Player } from '../types';
import { format } from 'date-fns';
import {
  Calendar, MapPin, Users, Hash, Edit3
} from 'lucide-react';

export default function JoinAuction() {
  const { code } = useParams<{ code: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [status, setStatus] = useState<'loading' | 'found' | 'notfound' | 'joined' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const categories = db.getCategories();

  // Extended Player Fields State
  const [formData, setFormData] = useState<Partial<Player>>({
    category: 'Batsman',
    age: 18,
    fatherName: '',
    playerTag: 'Player',
    specification: 'Batsman',
    skill: 'Right Arm Medium',
    jerseySize: 'L',
    jerseyName: '',
    jerseyNumber: '',
    trouserSize: 'L',
    extraDetails: ''
  });

  useEffect(() => {
    if (user?.role === 'Player' && user.isIcon) {
      setFormData(prev => ({ 
        ...prev, 
        playerTag: 'Icon',
        basePrice: user.purse || prev.basePrice 
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!code) { setStatus('notfound'); return; }
    const a = db.getAuctionByCode(code);
    if (a) {
      setAuction(a);
      setStatus('found');
    } else {
      setStatus('notfound');
    }
  }, [code]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'age' ? Number(value) : value }));
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !auction) return;

    if (user.role !== 'Player') {
      setMessage('Only Player accounts can register for auctions.');
      setStatus('error');
      return;
    }

    setIsSubmitting(true);
    const result = db.registerPlayerForAuction(user.id, auction.auctionCode, formData);
    setIsSubmitting(false);

    if (result.success) {
      setStatus('joined');
      setMessage(result.message);
    } else {
      setStatus('error');
      setMessage(result.message);
    }
  };

  const cat = auction ? categories.find(c => c.id === auction.categoryId) : null;
  const players = auction ? db.getPlayers(auction.id) : [];

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">🏏</div>
          <h1 className="text-2xl font-black text-white mb-2">Auction Invitation</h1>
          <p className="text-dark-400 mb-6">You need to log in as a Player to join this auction.</p>
          <Link
            to={`/login?redirect=/join/${code}`}
            className="btn-primary py-3 px-6 font-bold inline-block"
          >
            Login to Join
          </Link>
          <p className="text-dark-500 text-sm mt-4">
            Don't have an account? <Link to={`/register?redirect=/join/${code}`} className="text-primary-500 font-bold">Register</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center py-12 px-6">
      <div className="max-w-2xl w-full">
        {status === 'notfound' && (
          <div className="card p-8 text-center">
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-black text-white mb-2">Invalid Code</h1>
            <p className="text-dark-400 mb-6">No auction found with code <span className="font-mono text-primary-500">{code}</span></p>
            <Link to="/player" className="btn-primary py-2 px-6 font-bold">Go to Dashboard</Link>
          </div>
        )}

        {status === 'loading' && (
          <div className="text-center text-dark-400 py-8">Loading...</div>
        )}

        {status === 'joined' && (
          <div className="card p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-black text-white mb-2">You're In!</h1>
            <p className="text-dark-400 mb-2">{message}</p>
            <p className="text-dark-500 text-sm mb-6">You'll be notified when the auction goes live.</p>
            <button onClick={() => navigate('/player')} className="btn-primary py-2 px-6 font-bold">
              Go to Dashboard
            </button>
          </div>
        )}

        {(status === 'found' || status === 'error') && auction && (
          <div className="card p-8">
            <div className="text-center mb-6 border-b border-dark-700 pb-6">
              <div className="text-4xl mb-2">{cat?.icon}</div>
              <h1 className="text-2xl font-black text-white">{auction.name}</h1>
              <p className="text-dark-400 text-sm mt-1">{cat?.name} Draft Auction</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8 bg-dark-700/30 p-4 rounded-xl">
              <div className="flex items-center gap-3 text-dark-300 text-sm">
                <Hash className="w-5 h-5 text-primary-500" />
                <span>Code:<br/><span className="font-mono text-white font-bold">{auction.auctionCode}</span></span>
              </div>
              <div className="flex items-center gap-3 text-dark-300 text-sm">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span>Starts:<br/><span className="text-white font-bold">{format(new Date(auction.date), 'MMM dd')} at {auction.time}</span></span>
              </div>
              <div className="flex items-center gap-3 text-dark-300 text-sm">
                <MapPin className="w-5 h-5 text-green-400" />
                <span>Venue:<br/><span className="text-white font-bold">{auction.venue}</span></span>
              </div>
              <div className="flex items-center gap-3 text-dark-300 text-sm">
                <Users className="w-5 h-5 text-orange-400" />
                <span>Registered:<br/><span className="text-white font-bold">{players.length} Players</span></span>
              </div>
            </div>

            {auction.status === 'closed' ? (
              <div className="bg-dark-700 rounded-lg p-4 text-center">
                <p className="text-dark-400">This auction has already ended.</p>
              </div>
            ) : (
              <form onSubmit={handleJoin} className="space-y-6">
                <div className="flex items-center gap-2 mb-4 text-white font-bold">
                  <Edit3 className="w-5 h-5 text-primary-500" /> 
                  <h2>Player Registration Details</h2>
                </div>

                {/* Personal Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-400 mb-1">Age</label>
                    <input type="number" name="age" min={5} max={100} required className="input-field" value={formData.age} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-400 mb-1">Father's Name</label>
                    <input type="text" name="fatherName" required placeholder="Full Name" className="input-field" value={formData.fatherName} onChange={handleInputChange} />
                  </div>
                </div>

                {/* Cricket Profile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-dark-700 pt-5">
                  <div>
                    <label className="block text-sm font-medium text-dark-400 mb-1">Category</label>
                    <select name="category" className="input-field" value={formData.category} onChange={handleInputChange}>
                      <option value="Batsman">Batsman</option>
                      <option value="Bowler">Bowler</option>
                      <option value="All Rounder">All Rounder</option>
                      <option value="Wicket Keeper">Wicket Keeper</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-400 mb-1">Player Tag</label>
                    <select name="playerTag" className="input-field" value={formData.playerTag} onChange={handleInputChange}>
                      <option value="Player">Player</option>
                      <option value="Owner">Owner</option>
                      <option value="Captain">Captain</option>
                      <option value="Vice Captain">Vice Captain</option>
                      <option value="Icon">Icon</option>
                      <option value="Retain">Retain</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-400 mb-1">Specification</label>
                    <select name="specification" className="input-field" value={formData.specification} onChange={handleInputChange}>
                      <option value="Batsman">Batsman</option>
                      <option value="Bowler">Bowler</option>
                      <option value="All Rounder">All Rounder</option>
                      <option value="All Rounder WK">All Rounder WK</option>
                      <option value="Wicket Keeper">Wicket Keeper</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-400 mb-1">Skill</label>
                    <select name="skill" className="input-field" value={formData.skill} onChange={handleInputChange}>
                      <option value="Right Arm Fast">Right Arm Fast</option>
                      <option value="Right Arm Medium">Right Arm Medium</option>
                      <option value="Left Arm Medium">Left Arm Medium</option>
                      <option value="Off-Break">Off-Break</option>
                      <option value="Leg-Break">Leg-Break</option>
                      <option value="Left Arm Orthdox">Left Arm Orthdox</option>
                      <option value="Left Arm Chinaman">Left Arm Chinaman</option>
                    </select>
                  </div>
                </div>

                {/* Clothing & Gear */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-dark-700 pt-5">
                  <div>
                    <label className="block text-sm font-medium text-dark-400 mb-1">Jersey Name</label>
                    <input type="text" name="jerseyName" required placeholder="Name on back" className="input-field" value={formData.jerseyName} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-400 mb-1">Jersey Number</label>
                    <input type="text" name="jerseyNumber" required placeholder="e.g. 10" className="input-field" value={formData.jerseyNumber} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-400 mb-1">Jersey Size</label>
                    <select name="jerseySize" className="input-field" value={formData.jerseySize} onChange={handleInputChange}>
                      <option value="S">Small (S)</option>
                      <option value="M">Medium (M)</option>
                      <option value="L">Large (L)</option>
                      <option value="XL">Extra Large (XL)</option>
                      <option value="XXL">XXL</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-400 mb-1">Trouser Size</label>
                    <select name="trouserSize" className="input-field" value={formData.trouserSize} onChange={handleInputChange}>
                      <option value="S">Small (S)</option>
                      <option value="M">Medium (M)</option>
                      <option value="L">Large (L)</option>
                      <option value="XL">Extra Large (XL)</option>
                      <option value="XXL">XXL</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-dark-400 mb-1">Extra Details</label>
                    <input type="text" name="extraDetails" placeholder="Any additional info..." className="input-field" value={formData.extraDetails} onChange={handleInputChange} />
                  </div>
                </div>

                {status === 'error' && message && (
                  <div className="bg-red-500/10 text-red-500 rounded-lg p-3 text-sm font-bold text-center">
                    {message}
                  </div>
                )}

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-4 font-bold text-lg mt-4 hocus:scale-[1.02] transition-transform">
                  {isSubmitting ? 'Registering...' : '🎯 Submit Registration'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
