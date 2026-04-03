import { useState, useEffect } from 'react';
import { Auction, Player, Team } from '../types';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import TeamRosterModal from '../components/auction/TeamRosterModal';
import { api } from '../services/api';
import { SPORT_CATEGORIES } from '../constants/sports';
import {
  Hash, Calendar, MapPin, Users, CheckCircle,
  Clock, Zap, Shield, Eye,
} from 'lucide-react';

export default function PlayerDashboard() {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [registrations, setRegistrations] = useState<Array<{
    id: string;
    auctionId: Auction | null;
    playerId: Player | null;
    registeredAt: string;
  }>>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const categories = SPORT_CATEGORIES;

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const [registrationsRes, teamsRes] = await Promise.all([
          api.getMyRegistrations(),
          api.getTeams(),
        ]);
        setRegistrations((registrationsRes.data as unknown as Array<{
          id: string;
          auctionId: Auction | null;
          playerId: Player | null;
          registeredAt: string;
        }>) || []);
        setTeams((teamsRes.data as unknown as Team[]) || []);
      } catch (error) {
        console.error('Failed to load player dashboard data', error);
      }
    };

    void load();
  }, [user]);

  const handleJoin = async () => {
    if (!user || !code.trim()) return;

    try {
      await api.registerPlayerForAuction(code.trim(), {});
      setMessage({ text: 'Successfully registered for this auction!', ok: true });
      setCode('');
      const registrationsRes = await api.getMyRegistrations();
      setRegistrations((registrationsRes.data as unknown as Array<{
        id: string;
        auctionId: Auction | null;
        playerId: Player | null;
        registeredAt: string;
      }>) || []);
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Failed to join auction.', ok: false });
    }
  };

  const getPlayerTeam = (playerId?: string, soldToTeamId?: string): Team | null => {
    if (soldToTeamId) {
      return teams.find((team) => team.id === soldToTeamId) || null;
    }
    if (!playerId) {
      return null;
    }
    return teams.find(team => team.ownerPlayerId === playerId || team.iconPlayerId === playerId) || null;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Player Dashboard</h1>
        <p className="text-dark-400 mt-1">Join auctions and track your registrations</p>
      </div>

      {/* ═══════════ JOIN AUCTION ═══════════ */}
      <div className="card p-6 mb-8">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Hash className="w-5 h-5 text-primary-500" /> Join Auction
        </h2>
        <p className="text-sm text-dark-400 mb-4">
          Enter the invitation code shared by the auction organizer to register for the event.
        </p>
        <div className="flex gap-3">
          <input
            className="input-field flex-1 text-lg font-mono tracking-widest text-center"
            placeholder="Enter 8-digit code"
            maxLength={8}
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
          />
          <button
            onClick={handleJoin}
            disabled={code.length < 8}
            className="btn-primary px-6 py-3 font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Join →
          </button>
        </div>
        {message && (
          <div className={`mt-3 text-sm font-medium px-4 py-2 rounded-lg ${
            message.ok ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {message.text}
          </div>
        )}
      </div>

      {/* ═══════════ MY REGISTRATIONS ═══════════ */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" /> My Auctions
          <span className="text-sm text-dark-500">({registrations.length})</span>
        </h2>

        {registrations.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-dark-500 text-lg">You haven't joined any auctions yet.</p>
            <p className="text-dark-600 text-sm mt-1">Use the invitation code above to register.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {registrations.map(reg => {
              const auction = reg.auctionId;
              if (!auction) return null;
              const cat = categories.find(c => c.id === auction.categoryId);
              const player = reg.playerId;
              const soldTeam = getPlayerTeam(player?.id, player?.soldToTeamId);

              return (
                <div key={reg.id} className="card p-5 hover:border-dark-600 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    {auction.status === 'live' && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> LIVE
                      </span>
                    )}
                    {auction.status === 'upcoming' && (
                      <span className="flex items-center gap-1 text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
                        <Clock className="w-3 h-3" /> UPCOMING
                      </span>
                    )}
                    {auction.status === 'closed' && (
                      <span className="flex items-center gap-1 text-xs font-bold text-dark-500 bg-dark-700 px-3 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" /> COMPLETED
                      </span>
                    )}
                    <span className="text-xs text-dark-500">{cat?.icon} {cat?.name}</span>
                  </div>

                  <h3 className="text-lg font-black text-white mb-2">{auction.name}</h3>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-dark-400 mb-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {format(new Date(auction.date), 'MMM dd, yyyy')}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {auction.venue}</span>
                  </div>

                  {/* Player Status */}
                  {player && (
                    <div className={`mt-3 p-3 rounded-lg text-sm ${
                      player.status === 'sold'
                        ? 'bg-primary-500/10 border border-primary-500/20'
                        : player.status === 'retained'
                          ? 'bg-purple-500/10 border border-purple-500/20'
                          : 'bg-dark-700'
                    }`}>
                      {player.status === 'sold' && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary-500" />
                          <span className="text-primary-500 font-bold">
                            Sold to {soldTeam?.name} for ₹{player.soldPrice?.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {player.status === 'retained' && (
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-purple-400" />
                          <span className="text-purple-400 font-bold">
                            {player.isIcon ? '👑 Icon Player' : '🏷️ Team Owner'} — Retained
                          </span>
                        </div>
                      )}
                      {player.status === 'available' && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-400">Registered — Waiting for auction</span>
                        </div>
                      )}
                      {player.status === 'unsold' && (
                        <div className="flex items-center gap-2">
                          <span className="text-red-400">Unsold in this round</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-3 text-xs text-dark-600">
                    Registered: {format(new Date(reg.registeredAt), 'MMM dd, yyyy · hh:mm a')}
                  </div>

                  {player && soldTeam && (player.status === 'sold' || player.status === 'retained') && (
                    <div className="mt-4 pt-4 border-t border-dark-700">
                      <button
                        onClick={() => setSelectedTeam(soldTeam)}
                        className="w-full bg-dark-700 hover:bg-dark-600 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 py-2.5 px-4 transition-colors border border-dark-600"
                      >
                        <Eye className="w-4 h-4" /> View Team
                      </button>
                    </div>
                  )}


                </div>
              );
            })}
          </div>
        )}
      </div>

      <TeamRosterModal
        isOpen={!!selectedTeam}
        onClose={() => setSelectedTeam(null)}
        team={selectedTeam}
        readOnly={true}
        hidePoints={true}
      />
    </div>
  );
}
