import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { Auction } from '../types';
import { format } from 'date-fns';
import {
  Plus, Search, MapPin, Users,
  Trash2, Eye,
  Zap, Clock, CheckCircle,
} from 'lucide-react';

type TabStatus = 'live' | 'upcoming' | 'closed';

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<TabStatus>('live');
  const categories = db.getCategories();

  useEffect(() => {
    loadAuctions();
  }, []);

  const loadAuctions = () => {
    const all = db.getAuctions().filter(a => a.organizerId === user?.id);
    setAuctions(all);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this auction?')) {
      db.deleteAuction(id);
      loadAuctions();
    }
  };

  // Filter
  let filtered = auctions.filter(a => a.status === activeTab);
  if (categoryFilter !== 'all') {
    filtered = filtered.filter(a => a.categoryId === categoryFilter);
  }
  if (search.trim()) {
    filtered = filtered.filter(a =>
      a.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  const counts = {
    live: auctions.filter(a => a.status === 'live').length,
    upcoming: auctions.filter(a => a.status === 'upcoming').length,
    closed: auctions.filter(a => a.status === 'closed').length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-white">My Auctions</h1>
          <p className="text-dark-500 mt-1">Manage your sport draft auction events</p>
        </div>
        <Link to="/organizer/create" className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Create Auction
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
        <input
          type="text"
          className="input-field pl-10"
          placeholder="Search auctions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
            categoryFilter === 'all'
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
              : 'bg-dark-800 text-dark-400 hover:bg-dark-700 border border-dark-700'
          }`}
        >
          All Sports
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 ${
              categoryFilter === cat.id
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                : 'bg-dark-800 text-dark-400 hover:bg-dark-700 border border-dark-700'
            }`}
          >
            <span>{cat.icon}</span> {cat.name}
          </button>
        ))}
      </div>

      {/* Status Tabs */}
      <div className="flex border-b border-dark-700 mb-6">
        {([
          { key: 'live' as TabStatus, label: 'Live', icon: <Zap className="w-4 h-4" />, color: 'text-red-500' },
          { key: 'upcoming' as TabStatus, label: 'Scheduled', icon: <Clock className="w-4 h-4" />, color: 'text-blue-400' },
          { key: 'closed' as TabStatus, label: 'Completed', icon: <CheckCircle className="w-4 h-4" />, color: 'text-dark-500' },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-all ${
              activeTab === tab.key
                ? `border-primary-500 text-white`
                : 'border-transparent text-dark-500 hover:text-dark-400'
            }`}
          >
            <span className={activeTab === tab.key ? tab.color : ''}>{tab.icon}</span>
            {tab.label}
            {counts[tab.key] > 0 && (
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.key ? 'bg-primary-500/20 text-primary-500' : 'bg-dark-700 text-dark-500'
              }`}>
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Auction Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-dark-500">
          <p className="text-lg mb-2">No {activeTab} auctions found.</p>
          {activeTab === 'upcoming' && (
            <Link to="/organizer/create" className="text-primary-500 hover:text-primary-600 font-bold">
              Create your first auction →
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map(auction => {
            const cat = categories.find(c => c.id === auction.categoryId);
            const teams = db.getTeams(auction.id);
            const players = db.getPlayers(auction.id);
            const soldPlayers = players.filter(p => p.status === 'sold').length;

            return (
              <div key={auction.id} className="card hover:border-dark-600 transition-all duration-300">
                {/* Status Badge & Date */}
                <div className="px-5 pt-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {auction.status === 'live' && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> LIVE NOW
                      </span>
                    )}
                    {auction.status === 'upcoming' && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
                        <Clock className="w-3 h-3" /> UPCOMING
                      </span>
                    )}
                    {auction.status === 'closed' && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-dark-500 bg-dark-700 px-3 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" /> COMPLETED
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-dark-500">
                    {format(new Date(auction.date), 'MMM dd, yyyy')} · {auction.time}
                  </span>
                </div>

                {/* Title & Sport */}
                <div className="px-5 pt-3 pb-2">
                  <h3 className="text-lg font-black text-white mb-1">{auction.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-dark-400">
                    <span className="flex items-center gap-1">
                      {cat?.icon} {cat?.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {players.length} Players
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {teams.length} Teams
                    </span>
                  </div>
                </div>

                {/* Config Grid */}
                <div className="px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-dark-800 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-dark-500 uppercase font-bold tracking-wider">Auction Code</p>
                    <p className="text-sm font-black text-primary-500 font-mono">{auction.auctionCode}</p>
                  </div>
                  <div className="bg-dark-800 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-dark-500 uppercase font-bold tracking-wider">Points/Team</p>
                    <p className="text-sm font-bold text-white">₹{auction.pointsPerTeam.toLocaleString()}</p>
                  </div>
                  <div className="bg-dark-800 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-dark-500 uppercase font-bold tracking-wider">Min Bid</p>
                    <p className="text-sm font-bold text-white">₹{auction.minimumBid.toLocaleString()}</p>
                  </div>
                  <div className="bg-dark-800 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-dark-500 uppercase font-bold tracking-wider">Bid Increase</p>
                    <p className="text-sm font-bold text-accent-500">₹{auction.bidIncreaseBy.toLocaleString()}</p>
                  </div>
                </div>

                {/* Venue */}
                <div className="px-5 py-2 flex items-center gap-1.5 text-sm text-dark-500">
                  <MapPin className="w-3.5 h-3.5" /> {auction.venue}
                </div>

                {/* Progress (for live auctions) */}
                {auction.status === 'live' && players.length > 0 && (
                  <div className="px-5 py-2">
                    <div className="flex justify-between text-xs text-dark-500 mb-1">
                      <span>Players Sold</span>
                      <span>{soldPlayers}/{players.length}</span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-1.5">
                      <div
                        className="bg-primary-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${(soldPlayers / players.length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="px-5 py-4 flex items-center gap-3 border-t border-dark-700/50">
                  <Link
                    to={`/organizer/auction/${auction.id}`}
                    className="btn-primary flex-1 py-2 text-sm text-center flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" /> View Details
                  </Link>
                  {auction.status !== 'closed' && (
                    <button
                      onClick={() => handleDelete(auction.id)}
                      className="p-2 rounded-lg text-dark-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Delete Auction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
