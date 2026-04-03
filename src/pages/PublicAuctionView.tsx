import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { SPORT_CATEGORIES } from '../constants/sports';
import { Auction, Team, Player } from '../types';
import PublicNavbar from '../components/layout/PublicNavbar';
import {
  ArrowLeft, Clock, CheckCircle, XCircle,
  RefreshCw, Trophy,
} from 'lucide-react';

type TabType = 'updates' | 'teams' | 'sold' | 'unsold' | 'available';

export default function PublicAuctionView() {
  const { id } = useParams<{ id: string }>();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [tab, setTab] = useState<TabType>('updates');
  const categories = SPORT_CATEGORIES;

  const loadData = async () => {
    if (!id) return;
    try {
      const [auctionRes, teamsRes, playersRes] = await Promise.all([
        api.getAuctionById(id),
        api.getTeams({ auctionId: id }),
        api.getPlayers({ auctionId: id }),
      ]);

      setAuction((auctionRes.data as unknown as Auction) || null);
      setTeams((teamsRes.data as unknown as Team[]) || []);
      setPlayers((playersRes.data as unknown as Player[]) || []);
    } catch (error) {
      console.error('Failed to load public auction data', error);
      setAuction(null);
    }
  };

  useEffect(() => { void loadData(); }, [id]);

  // Auto-refresh every 5 seconds for live feel
  useEffect(() => {
    if (!auction || auction.status !== 'live') return;
    const interval = setInterval(() => { void loadData(); }, 5000);
    return () => clearInterval(interval);
  }, [auction?.id, auction?.status]);

  if (!auction) {
    return (
      <div className="min-h-screen bg-dark-900 text-white">
        <PublicNavbar />
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-dark-400 text-lg">Auction not found.</p>
        </div>
      </div>
    );
  }

  const cat = categories.find(c => c.id === auction.categoryId);
  const soldPlayers = players.filter(p => p.status === 'sold');
  const unsoldPlayers = players.filter(p => p.status === 'unsold');
  const availablePlayers = players.filter(p => p.status === 'available');

  // Build update log from sold/unsold players
  const updates = [
    ...soldPlayers.map(p => {
      const team = teams.find(t => t.id === p.soldToTeamId);
      return { player: p.name, action: 'SOLD TO', detail: `${team?.name || 'Unknown'} (₹${p.soldPrice?.toLocaleString()})`, type: 'sold' as const };
    }),
    ...unsoldPlayers.map(p => ({
      player: p.name, action: 'went UNSOLD', detail: '', type: 'unsold' as const,
    })),
  ];

  // Current player on bid (first available)
  const currentPlayer = players.find(p => p.status === 'available');

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'updates', label: 'Updates', count: updates.length },
    { key: 'teams', label: 'Teams', count: teams.length },
    { key: 'sold', label: 'Sold Players', count: soldPlayers.length },
    { key: 'unsold', label: 'Unsold Players', count: unsoldPlayers.length },
    { key: 'available', label: 'Yet to Auction', count: availablePlayers.length },
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <PublicNavbar />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-dark-400 hover:text-white mb-6 text-sm font-bold transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Auction Header */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            {auction.status === 'live' ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Auction Live
              </span>
            ) : auction.status === 'upcoming' ? (
              <span className="flex items-center gap-1 text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
                <Clock className="w-3 h-3" /> Upcoming
              </span>
            ) : (
              <span className="text-xs font-bold text-dark-500 bg-dark-700 px-3 py-1 rounded-full">Completed</span>
            )}
            <span className="text-xs text-dark-500">{cat?.icon} {cat?.name}</span>
          </div>
          <h1 className="text-2xl font-black text-white mb-4">{auction.name}</h1>

          {/* Current Player on Bid */}
          {auction.status === 'live' && currentPlayer && (
            <div className="bg-dark-800 rounded-xl p-5 border border-dark-700">
              <div className="flex items-center gap-5">
                <div className="w-24 h-24 rounded-lg bg-dark-700 overflow-hidden flex-shrink-0">
                  {currentPlayer.photoUrl ? (
                    <img src={currentPlayer.photoUrl} alt={currentPlayer.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-black text-dark-500">
                      {currentPlayer.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-black text-white">
                    {currentPlayer.name}
                    {currentPlayer.age ? <span className="text-dark-400 font-normal text-sm ml-2">(Age - {currentPlayer.age})</span> : ''}
                  </p>
                  <p className="text-dark-400 text-sm">{currentPlayer.role || currentPlayer.category}</p>
                  <div className="mt-2">
                    <p className="text-dark-500 text-xs uppercase font-bold">Bid Details</p>
                    <div className="grid grid-cols-2 gap-4 mt-1">
                      <div>
                        <p className="text-2xl font-black text-primary-500">₹{currentPlayer.basePrice.toLocaleString()}</p>
                        <p className="text-dark-500 text-xs">Amount</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-dark-300">—</p>
                        <p className="text-dark-500 text-xs">Team</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-dark-700 mb-6">
          <div className="flex overflow-x-auto gap-0 -mb-px">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                  tab === t.key
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-dark-400 hover:text-white'
                }`}
              >
                {t.label} <span className="text-dark-500 ml-1">({t.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {tab === 'updates' && (
            <div className="space-y-2">
              {updates.length === 0 ? (
                <p className="text-dark-500 text-center py-12">No updates yet. The auction is just getting started!</p>
              ) : (
                updates.map((u, i) => (
                  <div key={i} className="flex items-center justify-between py-3 px-4 border-b border-dark-800">
                    <p className="text-sm">
                      <span className={u.type === 'sold' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                        {u.player}
                      </span>
                      {' '}<span className={u.type === 'sold' ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>{u.action}</span>{' '}
                      <span className="text-white">{u.detail}</span>
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'teams' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map(team => (
                <div key={team.id} className="card p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {team.logoUrl ? (
                      <img src={team.logoUrl} className="w-10 h-10 rounded-lg object-cover" alt="" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-primary-500" />
                      </div>
                    )}
                    <div>
                      <p className="text-white font-bold">{team.name}</p>
                      <p className="text-dark-500 text-xs">Owner: {team.ownerName}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-dark-800 rounded-lg p-2 text-center">
                      <p className="text-dark-500 uppercase font-bold">Players</p>
                      <p className="text-white font-black">{team.players.length}</p>
                    </div>
                    <div className="bg-dark-800 rounded-lg p-2 text-center">
                      <p className="text-dark-500 uppercase font-bold">Spent</p>
                      <p className="text-primary-500 font-black">₹{team.pointsSpent.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'sold' && (
            <div className="space-y-2">
              {soldPlayers.length === 0 ? (
                <p className="text-dark-500 text-center py-12">No players sold yet.</p>
              ) : (
                soldPlayers.map(p => {
                  const team = teams.find(t => t.id === p.soldToTeamId);
                  return (
                    <div key={p.id} className="flex items-center justify-between py-3 px-4 bg-dark-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-white font-bold">{p.name}</span>
                        <span className="text-dark-500 text-xs">{p.role}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-primary-500 font-bold text-sm">₹{p.soldPrice?.toLocaleString()}</p>
                        <p className="text-dark-500 text-xs">{team?.name}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {tab === 'unsold' && (
            <div className="space-y-2">
              {unsoldPlayers.length === 0 ? (
                <p className="text-dark-500 text-center py-12">No unsold players.</p>
              ) : (
                unsoldPlayers.map(p => (
                  <div key={p.id} className="flex items-center gap-3 py-3 px-4 bg-dark-800 rounded-lg">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-white font-bold">{p.name}</span>
                    <span className="text-dark-500 text-xs">{p.role}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'available' && (
            <div className="space-y-2">
              {availablePlayers.length === 0 ? (
                <p className="text-dark-500 text-center py-12">All players have been auctioned.</p>
              ) : (
                availablePlayers.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-3 px-4 bg-dark-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-bold">{p.name}</span>
                      <span className="text-dark-500 text-xs">{p.role}</span>
                    </div>
                    <span className="text-dark-400 text-xs font-bold">₹{p.basePrice.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Auto-refresh indicator */}
        {auction.status === 'live' && (
          <div className="mt-8 text-center">
            <p className="text-dark-500 text-xs flex items-center justify-center gap-2">
              <RefreshCw className="w-3 h-3 animate-spin" /> Auto-refreshing every 5 seconds
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-dark-700/50 py-8 mt-12">
        <div className="max-w-5xl mx-auto px-6 text-center text-dark-500 text-sm">
          &copy; {new Date().getFullYear()} AuctionHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
