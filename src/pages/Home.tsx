import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/db';
import { Auction, Player } from '../types';
import PublicNavbar from '../components/layout/PublicNavbar';
import ChatWidget from '../components/ui/ChatWidget';
import {
  Flame, Calendar, Users, Gavel, Trophy, ArrowRight,
  MapPin, Clock, UserPlus, Monitor, CheckCircle, Star,
} from 'lucide-react';

export default function Home() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    setAuctions(db.getAuctions());
    setPlayers(db.getPlayers());
  }, []);

  const liveAuctions = auctions.filter(a => a.status === 'live');
  const upcomingAuctions = auctions.filter(a => a.status === 'upcoming');

  // Trending = sold players with highest sold price
  const trendingPlayers = [...players]
    .filter(p => p.status === 'sold' && p.soldPrice)
    .sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0))
    .slice(0, 8);

  const totalAuctions = auctions.length;
  const totalPlayers = players.length;
  const totalTeams = auctions.reduce((sum, a) => sum + a.totalTeams, 0);

  return (
    <div className="min-h-screen bg-dark-900 text-white font-sans">
      <PublicNavbar />

      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-dark-900 to-dark-900" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-36 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-5 py-2 mb-8">
            <Flame className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-bold text-primary-500 uppercase tracking-wider">
              {liveAuctions.length > 0 ? `${liveAuctions.length} Live Auction${liveAuctions.length > 1 ? 's' : ''} Now` : 'Player Auctions Made Easy'}
            </span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-black leading-tight mb-6">
            Auction Like the Pros —<br />
            <span className="bg-gradient-to-r from-primary-500 to-emerald-400 bg-clip-text text-transparent">
              From Anywhere
            </span>
          </h1>

          <p className="text-dark-400 text-lg lg:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            The complete platform to create, manage, and conduct exciting player auctions for cricket, football, kabaddi, and more. 
            Real-time bidding, team management, and live streaming — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary px-8 py-4 text-lg flex items-center gap-2 group">
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 rounded-lg text-lg font-bold text-dark-400 hover:text-white border border-dark-700 hover:border-dark-500 transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== TODAY'S LIVE AUCTIONS ===================== */}
      {liveAuctions.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Flame className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Today's Live Auctions</h2>
              <p className="text-dark-500 text-sm">Watch live auction updates — no login required</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveAuctions.map(auction => {
              const auctionPlayers = players.filter(p => p.auctionId === auction.id);
              const soldCount = auctionPlayers.filter(p => p.status === 'sold').length;
              return (
                <Link to={`/live/${auction.id}`} key={auction.id} className="card group hover:border-red-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-500/5">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-white rounded-full" /> LIVE
                      </span>
                      <span className="text-dark-500 text-xs font-bold">{auction.totalTeams} Teams</span>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      {auction.logoUrl ? (
                        <img src={auction.logoUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-dark-700 flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-primary-500" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-primary-500 transition-colors">{auction.name}</h3>
                        <p className="text-dark-500 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> {auction.venue}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-4 pt-3 border-t border-dark-700/50">
                      <span className="text-dark-400">{soldCount}/{auctionPlayers.length} Players Sold</span>
                      <span className="text-primary-500 font-bold text-xs flex items-center gap-1">
                        Watch Live <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ===================== UPCOMING AUCTIONS ===================== */}
      {upcomingAuctions.length > 0 && (
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800/50 to-dark-900" />
          <div className="relative max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Upcoming Auctions</h2>
                <p className="text-dark-500 text-sm">Register now to participate in these upcoming events</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingAuctions.map(auction => {
                const playerCount = players.filter(p => p.auctionId === auction.id).length;
                return (
                  <div key={auction.id} className="card group hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1">
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="bg-blue-500/90 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> UPCOMING
                        </span>
                        <span className="text-dark-500 text-xs font-bold">{auction.totalTeams} Teams</span>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        {auction.logoUrl ? (
                          <img src={auction.logoUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-dark-700 flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-blue-500" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{auction.name}</h3>
                          <p className="text-dark-500 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> {auction.venue}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-dark-400 mt-4 pt-3 border-t border-dark-700/50">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {auction.date} | {auction.time}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {playerCount} Players</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===================== HOW IT WORKS ===================== */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white mb-3">How It Works</h2>
          <p className="text-dark-400 max-w-xl mx-auto">Get your player auction up and running in 4 simple steps</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: UserPlus, step: '01', title: 'Create Tournament', desc: 'Create a tournament and define auction rules, player categories, and budgets.' },
            { icon: Gavel, step: '02', title: 'Register Players', desc: 'Players register online or organizers add them to the auction list.' },
            { icon: Monitor, step: '03', title: 'Create Teams', desc: 'Set up teams with budgets and owners to participate in the auction.' },
            { icon: CheckCircle, step: '04', title: 'Go Live!', desc: 'Conduct the live auction with real-time bidding and instant results.' },
          ].map((item, i) => (
            <div key={i} className="card p-6 text-center hover:border-primary-500/30 transition-all relative group">
              <div className="text-5xl font-black text-dark-700 absolute top-3 right-4 group-hover:text-dark-600 transition-colors">{item.step}</div>
              <div className="w-14 h-14 rounded-xl bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-7 h-7 text-primary-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-dark-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link to="/how-it-works" className="text-primary-500 hover:text-primary-400 font-bold text-sm inline-flex items-center gap-1">
            Learn More About How It Works <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ===================== TRENDING PLAYERS ===================== */}
      {trendingPlayers.length > 0 && (
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800/30 to-dark-900" />
          <div className="relative max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-accent-500/10 rounded-lg">
                <Star className="w-6 h-6 text-accent-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Trending Players</h2>
                <p className="text-dark-500 text-sm">Top valued players across all auctions</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {trendingPlayers.map(player => {
                const team = player.soldToTeamId ? db.getTeams().find(t => t.id === player.soldToTeamId) : null;
                return (
                  <div key={player.id} className="card p-4 hover:border-accent-500/30 transition-all group hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-3">
                      {player.photoUrl ? (
                        <img src={player.photoUrl} alt="" className="w-11 h-11 rounded-full object-cover border-2 border-dark-700" />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-dark-700 flex items-center justify-center text-dark-400 font-bold text-sm">
                          {player.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate group-hover:text-accent-500 transition-colors">{player.name}</p>
                        <p className="text-xs text-dark-500 truncate">{player.role}</p>
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] text-dark-600 uppercase font-bold">Sold For</p>
                        <p className="text-lg font-black text-accent-500">₹{(player.soldPrice || 0).toLocaleString()}</p>
                      </div>
                      {team && (
                        <span className="text-[10px] font-bold text-dark-500 bg-dark-700 px-2 py-1 rounded-full truncate max-w-[80px]">
                          {team.name}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===================== STATS ===================== */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="card bg-gradient-to-r from-dark-800 to-dark-800/50 p-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-500/10 mb-4">
                <Gavel className="w-7 h-7 text-primary-500" />
              </div>
              <p className="text-4xl font-black text-white mb-1">{totalAuctions}</p>
              <p className="text-dark-500 font-bold text-sm uppercase tracking-wider">Auctions</p>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent-500/10 mb-4">
                <Users className="w-7 h-7 text-accent-500" />
              </div>
              <p className="text-4xl font-black text-white mb-1">{totalPlayers}</p>
              <p className="text-dark-500 font-bold text-sm uppercase tracking-wider">Players</p>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-500/10 mb-4">
                <Trophy className="w-7 h-7 text-blue-500" />
              </div>
              <p className="text-4xl font-black text-white mb-1">{totalTeams}</p>
              <p className="text-dark-500 font-bold text-sm uppercase tracking-wider">Teams</p>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 mb-4">
                <Flame className="w-7 h-7 text-red-500" />
              </div>
              <p className="text-4xl font-black text-white mb-1">{liveAuctions.length}</p>
              <p className="text-dark-500 font-bold text-sm uppercase tracking-wider">Live Now</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="border-t border-dark-700/50 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 text-white font-black uppercase tracking-wider mb-4">
                <Trophy className="w-5 h-5 text-primary-500" />
                Auction<span className="text-primary-500">Hub</span>
              </div>
              <p className="text-dark-500 text-sm leading-relaxed">The complete platform for player auctions across all sports.</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Pages</h4>
              <div className="flex flex-col gap-2 text-sm text-dark-500">
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
                <Link to="/features" className="hover:text-white transition-colors">Features</Link>
                <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
                <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Links</h4>
              <div className="flex flex-col gap-2 text-sm text-dark-500">
                <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                <Link to="/login" className="hover:text-white transition-colors">Login</Link>
                <Link to="/register" className="hover:text-white transition-colors">Register</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Support</h4>
              <div className="flex flex-col gap-2 text-sm text-dark-500">
                <Link to="/contact" className="hover:text-white transition-colors">Help Center</Link>
                <span>support@auctionhub.com</span>
              </div>
            </div>
          </div>
          <div className="border-t border-dark-700/50 pt-6 text-center text-dark-500 text-sm">
            &copy; {new Date().getFullYear()} AuctionHub. All rights reserved.
          </div>
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
}
