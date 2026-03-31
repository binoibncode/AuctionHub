import { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { AuctionItem, Bid } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

interface BidPanelProps {
  item: AuctionItem;
  onBidPlaced: () => void;
}

export default function BidPanel({ item, onBidPlaced }: BidPanelProps) {
  const { user } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Poll for new bids every 2 sec (simulating real-time)
    const fetchBids = () => {
      setBids(db.getBids(item.id));
    };
    fetchBids();
    const interval = setInterval(fetchBids, 2000);
    return () => clearInterval(interval);
  }, [item.id, onBidPlaced]);

  const minIncrement = item.currentPrice * 0.05;
  const requiredBid = item.currentPrice === item.basePrice && bids.length === 0 
    ? item.basePrice 
    : item.currentPrice + minIncrement;

  const handleQuickBid = (bidAmount: number) => {
    setError('');
    
    if (!user) return;

    const newBid: Bid = {
      id: `bid-${Date.now()}`,
      itemId: item.id,
      userId: user.id,
      userName: user.name,
      amount: bidAmount,
      timestamp: new Date().toISOString()
    };

    const res = db.placeBid(newBid);
    if (res.success) {
      onBidPlaced();
    } else {
      setError(res.message);
    }
  };

  // Get freshest user data for purse from DB
  const currentUser = db.getUsers().find(u => u.id === user?.id) || user;
  const userPurse = currentUser?.purse ?? 0;

  return (
    <div className="flex flex-col h-[400px]">
      {/* Quick Bid Section */}
      {item.status === 'live' && user?.role === 'Bidder' && (
        <div className="mb-6 space-y-3">
          <div className="flex justify-between items-center bg-dark-800 p-3 rounded-lg border border-dark-700">
            <span className="text-dark-400 font-bold uppercase text-xs">Available Purse</span>
            <span className="text-primary-500 font-black text-lg">₹{userPurse.toLocaleString()}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleQuickBid(requiredBid)} 
              disabled={item.status !== 'live' || requiredBid > userPurse}
              className="btn-primary py-3 rounded-xl text-lg uppercase tracking-wider col-span-2 flex justify-center items-center gap-2"
            >
              <span>Bid</span>
              <span className="font-black bg-white/20 px-2 py-1 rounded-md">₹{Math.ceil(requiredBid).toLocaleString()}</span>
            </button>

            <button 
              onClick={() => handleQuickBid(requiredBid + minIncrement)} 
              disabled={item.status !== 'live' || (requiredBid + minIncrement) > userPurse}
              className="btn-secondary py-2 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-dark-500 text-white transition-colors"
            >
              + ₹{Math.ceil(minIncrement).toLocaleString()}
            </button>

            <button 
              onClick={() => handleQuickBid(requiredBid + minIncrement * 2)} 
              disabled={item.status !== 'live' || (requiredBid + minIncrement * 2) > userPurse}
              className="btn-secondary py-2 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-dark-500 text-white transition-colors"
            >
              + ₹{Math.ceil(minIncrement * 2).toLocaleString()}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm font-bold mt-2 text-center bg-red-500/10 p-2 rounded-lg">{error}</p>}
        </div>
      )}

      {/* Recent Bids List */}
      <div className="flex-1 overflow-y-auto pr-2">
        <h3 className="text-sm font-bold text-dark-400 uppercase tracking-widest mb-4">Recent Bids</h3>
        <div className="space-y-3">
          {bids.length === 0 ? (
            <p className="text-dark-500 italic text-center py-4">No bids yet. Be the first!</p>
          ) : (
             bids.map((bid, i) => (
              <div key={bid.id} className={`flex justify-between items-center p-3 rounded-lg ${i === 0 ? 'bg-primary-500/10 border border-primary-500/30' : 'bg-dark-800'}`}>
                <div>
                  <p className="font-bold text-white">{bid.userName}</p>
                  <p className="text-xs text-dark-500">{format(new Date(bid.timestamp), 'HH:mm:ss')}</p>
                </div>
                <div className={`font-black tracking-tight ${i === 0 ? 'text-primary-500 text-lg' : 'text-white'}`}>
                  ₹{bid.amount}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
