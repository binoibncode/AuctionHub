import { useState, useEffect } from 'react';
import { Auction } from '../types';
import { useSearchParams, Link } from 'react-router-dom';
import { Clock, Zap, Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '../services/api';
import { SPORT_CATEGORIES } from '../constants/sports';

export default function BidderDashboard() {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category');
  const [draftAuctions, setDraftAuctions] = useState<Auction[]>([]);
  const [teamCounts, setTeamCounts] = useState<Record<string, number>>({});
  const [playerCounts, setPlayerCounts] = useState<Record<string, number>>({});
  const categories = SPORT_CATEGORIES;

  useEffect(() => {
    const load = async () => {
      try {
        const [auctionRes, teamRes, playerRes] = await Promise.all([
          api.getAuctions(),
          api.getTeams(),
          api.getPlayers(),
        ]);

        let allAuctions = (auctionRes.data as unknown as Auction[]) || [];
        allAuctions = allAuctions.filter((a) => a.status === 'live' || a.status === 'upcoming');
        if (categoryId) {
          allAuctions = allAuctions.filter((a) => a.categoryId === categoryId);
        }

        const nextTeamCounts: Record<string, number> = {};
        ((teamRes.data as Array<{ auctionId: string }>) || []).forEach((team) => {
          const auctionKey = String(team.auctionId);
          nextTeamCounts[auctionKey] = (nextTeamCounts[auctionKey] || 0) + 1;
        });

        const nextPlayerCounts: Record<string, number> = {};
        ((playerRes.data as Array<{ auctionId: string }>) || []).forEach((player) => {
          const auctionKey = String(player.auctionId);
          nextPlayerCounts[auctionKey] = (nextPlayerCounts[auctionKey] || 0) + 1;
        });

        setDraftAuctions(allAuctions);
        setTeamCounts(nextTeamCounts);
        setPlayerCounts(nextPlayerCounts);
      } catch (error) {
        console.error('Failed to load bidder dashboard data', error);
      }
    };

    void load();
  }, [categoryId]);

  const liveAuctions = draftAuctions.filter(a => a.status === 'live');
  const upcomingAuctions = draftAuctions.filter(a => a.status === 'upcoming');

  return (
    <div className="p-6">
      {/* ═══════════ DRAFT AUCTIONS ═══════════ */}
      {liveAuctions.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Zap className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Live Auctions</h2>
                <p className="text-dark-500 text-sm">Join a live draft now</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-500/10 px-3 py-1 rounded-full animate-pulse">
              <span className="w-2 h-2 bg-red-500 rounded-full" /> {liveAuctions.length} Live
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveAuctions.map(auction => {
              const cat = categories.find(c => c.id === auction.categoryId);
              const players = playerCounts[auction.id] || 0;
              const teams = teamCounts[auction.id] || 0;
              return (
                <div key={auction.id} className="card hover:border-primary-500/50 transition-all duration-300 group">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> LIVE NOW
                      </span>
                      <span className="text-xs text-dark-500 font-mono">{cat?.icon} {cat?.name}</span>
                    </div>

                    <h3 className="text-lg font-black text-white mb-2 group-hover:text-primary-500 transition-colors">
                      {auction.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-dark-400 mb-4">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {players} Players</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {teams} Teams</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {auction.venue}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-dark-800 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-dark-500 uppercase font-bold">Code</p>
                        <p className="text-xs font-black text-primary-500 font-mono">{auction.auctionCode}</p>
                      </div>
                      <div className="bg-dark-800 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-dark-500 uppercase font-bold">Budget</p>
                        <p className="text-xs font-bold text-white">₹{auction.pointsPerTeam.toLocaleString()}</p>
                      </div>
                      <div className="bg-dark-800 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-dark-500 uppercase font-bold">Min Bid</p>
                        <p className="text-xs font-bold text-white">₹{auction.minimumBid.toLocaleString()}</p>
                      </div>
                    </div>

                    <Link
                      to={`/live/${auction.id}`}
                      className="w-full py-2.5 rounded-lg font-bold text-sm bg-primary-500 hover:bg-primary-600 text-white transition-all flex items-center justify-center gap-2"
                    >
                      JOIN NOW →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Upcoming Draft Auctions */}
      {upcomingAuctions.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Upcoming Auctions</h2>
                <p className="text-dark-500 text-sm">Upcoming sport draft events</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingAuctions.map(auction => {
              const cat = categories.find(c => c.id === auction.categoryId);
              const players = playerCounts[auction.id] || 0;
              return (
                <div key={auction.id} className="card hover:border-blue-500/30 transition-all duration-300 group">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
                        <Clock className="w-3 h-3" /> UPCOMING
                      </span>
                      <span className="text-xs text-dark-500">{cat?.icon} {cat?.name}</span>
                    </div>

                    <h3 className="text-lg font-black text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {auction.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-dark-400 mb-3">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {format(new Date(auction.date), 'MMM dd, yyyy')}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {auction.time}</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {players} Players</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-dark-400 mb-4">
                      <MapPin className="w-3.5 h-3.5" /> {auction.venue}
                    </div>

                    <button className="w-full py-2.5 rounded-lg font-bold text-sm bg-dark-700 hover:bg-dark-600 text-white transition-all flex items-center justify-center gap-2">
                      🔔 REMIND ME
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {liveAuctions.length === 0 && upcomingAuctions.length === 0 && (
        <div className="card p-10 text-center text-dark-500">
          <p className="text-lg">No auctions found for this category.</p>
        </div>
      )}
    </div>
  );
}
