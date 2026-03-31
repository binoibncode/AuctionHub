import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/db';
import { AuctionItem, SportCategory } from '../types';
import PublicNavbar from '../components/layout/PublicNavbar';
import {
  Flame, TrendingUp, Calendar, ChevronRight,
  Users, Gavel, Trophy, ArrowRight,
} from 'lucide-react';

export default function Home() {
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [categories, setCategories] = useState<SportCategory[]>([]);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    setItems(db.getItems());
    setCategories(db.getCategories());
    setUserCount(db.getUsers().length);
  }, []);

  // Trending = live auctions sorted by bid count desc
  const trendingItems = items
    .filter(i => i.status === 'live')
    .sort((a, b) => db.getBidCountForItem(b.id) - db.getBidCountForItem(a.id));

  // Major = top items by current price desc
  const majorItems = [...items]
    .sort((a, b) => b.currentPrice - a.currentPrice)
    .slice(0, 6);

  // Standard = upcoming items
  const standardItems = items.filter(i => i.status === 'upcoming');

  const totalBids = db.getAllBids().length;
  const liveCount = items.filter(i => i.status === 'live').length;

  return (
    <div className="min-h-screen bg-dark-900 text-white font-sans">
      <PublicNavbar />

      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-dark-900 to-dark-900" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-36 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-5 py-2 mb-8">
            <Flame className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-bold text-primary-500 uppercase tracking-wider">Live Auctions Now</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-black leading-tight mb-6">
            The Premier<br />
            <span className="bg-gradient-to-r from-primary-500 to-emerald-400 bg-clip-text text-transparent">
              Auction Platform
            </span>
          </h1>

          <p className="text-dark-400 text-lg lg:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover, bid, and win exclusive sports memorabilia. From legendary jerseys to rare collectables — your next
            prized possession is just a bid away.
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

      {/* ===================== TRENDING AUCTIONS ===================== */}
      {trendingItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Flame className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Trending Auctions</h2>
                <p className="text-dark-500 text-sm">Hottest bids happening right now</p>
              </div>
            </div>
            <Link to="/login" className="text-primary-500 hover:text-primary-600 font-bold text-sm flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingItems.map(item => {
              const bidCount = db.getBidCountForItem(item.id);
              const category = categories.find(c => c.id === item.categoryId);
              return (
                <Link to="/login" key={item.id} className="card group hover:border-primary-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/5">
                  <div className="relative h-48 overflow-hidden">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-white rounded-full" /> LIVE
                      </span>
                      {category && (
                        <span className="bg-dark-800/80 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full">
                          {category.icon} {category.name}
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-dark-800/80 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full">
                      🔥 {bidCount} bid{bidCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary-500 transition-colors">{item.title}</h3>
                    <p className="text-dark-500 text-sm line-clamp-2 mb-4">{item.description}</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-dark-600 text-xs uppercase font-bold tracking-wider">Current Bid</p>
                        <p className="text-2xl font-black text-primary-500">₹{item.currentPrice.toLocaleString()}</p>
                      </div>
                      <span className="text-xs font-bold text-dark-500 bg-dark-700 px-3 py-1.5 rounded-full">
                        Enter →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ===================== MAJOR AUCTIONS ===================== */}
      {majorItems.length > 0 && (
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800/50 to-dark-900" />
          <div className="relative max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-500/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-accent-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">Major Auctions</h2>
                  <p className="text-dark-500 text-sm">High-value lots you don't want to miss</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {majorItems.map(item => {
                const category = categories.find(c => c.id === item.categoryId);
                return (
                  <Link to="/login" key={item.id} className="card group hover:border-accent-500/50 transition-all duration-300 hover:-translate-y-1">
                    <div className="relative h-44 overflow-hidden">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent" />
                      <div className="absolute top-3 left-3">
                        {item.status === 'live' ? (
                          <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">LIVE</span>
                        ) : (
                          <span className="bg-dark-600 text-white text-xs font-bold px-3 py-1 rounded-full">UPCOMING</span>
                        )}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        {category && <span className="text-sm">{category.icon}</span>}
                        <span className="text-xs text-dark-500 font-bold uppercase">{category?.name}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-3 group-hover:text-accent-500 transition-colors">{item.title}</h3>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-dark-600 text-xs uppercase font-bold tracking-wider">Price</p>
                          <p className="text-2xl font-black text-accent-500">₹{item.currentPrice.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===================== STANDARD / UPCOMING ===================== */}
      {standardItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Upcoming Auctions</h2>
                <p className="text-dark-500 text-sm">Mark your calendar for these upcoming drops</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {standardItems.map(item => {
              const category = categories.find(c => c.id === item.categoryId);
              return (
                <Link to="/login" key={item.id} className="card group hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-44 overflow-hidden">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="bg-blue-500/90 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> UPCOMING
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      {category && <span className="text-sm">{category.icon}</span>}
                      <span className="text-xs text-dark-500 font-bold uppercase">{category?.name}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{item.title}</h3>
                    <p className="text-dark-500 text-sm line-clamp-2 mb-3">{item.description}</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-dark-600 text-xs uppercase font-bold tracking-wider">Starting Price</p>
                        <p className="text-xl font-black text-white">₹{item.basePrice.toLocaleString()}</p>
                      </div>
                      <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full">
                        Notify Me →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ===================== CATEGORIES ===================== */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800/30 to-dark-900" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-white mb-2">Browse by Sport</h2>
            <p className="text-dark-500">Find auctions in your favourite category</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to="/login"
                className="bg-dark-800 border border-dark-700 rounded-xl p-6 text-center hover:border-primary-500/40 hover:bg-dark-700/50 transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl"
              >
                <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                <span className="text-sm font-bold text-white group-hover:text-primary-500 transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== STATS ===================== */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="card bg-gradient-to-r from-dark-800 to-dark-800/50 p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-500/10 mb-4">
                <Users className="w-7 h-7 text-primary-500" />
              </div>
              <p className="text-4xl font-black text-white mb-1">{userCount.toLocaleString()}</p>
              <p className="text-dark-500 font-bold text-sm uppercase tracking-wider">Registered Users</p>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent-500/10 mb-4">
                <Gavel className="w-7 h-7 text-accent-500" />
              </div>
              <p className="text-4xl font-black text-white mb-1">{liveCount}</p>
              <p className="text-dark-500 font-bold text-sm uppercase tracking-wider">Live Auctions</p>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-500/10 mb-4">
                <Trophy className="w-7 h-7 text-blue-500" />
              </div>
              <p className="text-4xl font-black text-white mb-1">{totalBids}</p>
              <p className="text-dark-500 font-bold text-sm uppercase tracking-wider">Total Bids Placed</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="border-t border-dark-700/50 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-black uppercase tracking-wider">
            <Trophy className="w-5 h-5 text-primary-500" />
            Auction<span className="text-primary-500">Hub</span>
          </div>
          <p className="text-dark-500 text-sm">
            &copy; {new Date().getFullYear()} AuctionHub. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-dark-500">
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
