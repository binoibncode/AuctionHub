import { useState, useEffect } from 'react';
import { db } from '../services/db';
import { AuctionItem, Auction } from '../types';
import { useSearchParams, Link } from 'react-router-dom';
import { Clock, Zap, Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function BidderDashboard() {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category');
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [draftAuctions, setDraftAuctions] = useState<Auction[]>([]);
  const categories = db.getCategories();

  useEffect(() => {
    let allItems = db.getItems();
    if (categoryId) {
      allItems = allItems.filter(i => i.categoryId === categoryId);
    }
    setItems(allItems);

    let allAuctions = db.getAuctions().filter(a => a.status === 'live' || a.status === 'upcoming');
    if (categoryId) {
      allAuctions = allAuctions.filter(a => a.categoryId === categoryId);
    }
    setDraftAuctions(allAuctions);
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
              const players = db.getPlayers(auction.id);
              const teams = db.getTeams(auction.id);
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
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {players.length} Players</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {teams.length} Teams</span>
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

                    <button className="w-full py-2.5 rounded-lg font-bold text-sm bg-primary-500 hover:bg-primary-600 text-white transition-all flex items-center justify-center gap-2">
                      JOIN NOW →
                    </button>
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
              const players = db.getPlayers(auction.id);
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
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {players.length} Players</span>
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

      {/* ═══════════ MEMORABILIA AUCTIONS (existing) ═══════════ */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Live & Upcoming Auctions</h1>
        <p className="text-dark-500 mt-2">Find and bid on premium sports memorabilia.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => (
          <div key={item.id} className="card group hover:border-primary-500 transition-colors duration-300">
            <div className="relative h-48 overflow-hidden">
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 space-x-2">
                {item.status === 'live' ? (
                  <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                    LIVE
                  </span>
                ) : (
                  <span className="bg-dark-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3"/> Upcoming
                  </span>
                )}
              </div>
            </div>
            
            <div className="p-5">
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-dark-500 text-sm line-clamp-2 mb-4">{item.description}</p>
              
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-dark-500 text-xs uppercase font-bold tracking-wider">Current Bid</p>
                  <p className="text-2xl font-bold text-primary-500">₹{item.currentPrice}</p>
                </div>
              </div>

              <Link 
                to={`/auction/${item.id}`} 
                className={`block text-center w-full py-2.5 rounded-lg font-bold transition-all ${
                  item.status === 'live' 
                    ? 'bg-primary-500 hover:bg-primary-600 text-white' 
                    : 'bg-dark-700 hover:bg-dark-600 text-white'
                }`}
              >
                {item.status === 'live' ? 'Enter Auction Room' : 'View Details'}
              </Link>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="col-span-full py-12 text-center text-dark-500">
            <p className="text-lg">No auctions found for this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
