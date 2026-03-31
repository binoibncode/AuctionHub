import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/db';
import { AuctionItem } from '../types';
import CountdownTimer from '../components/auction/CountdownTimer';
import BidPanel from '../components/auction/BidPanel';
import { ArrowLeft } from 'lucide-react';

export default function LiveAuction() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<AuctionItem | null>(null);

  useEffect(() => {
    if (id) {
      const items = db.getItems();
      const found = items.find(i => i.id === id);
      setItem(found || null);
    }
  }, [id]);

  if (!item) return <div className="p-8 text-white">Loading or item not found...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Link to="/bidder" className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-bold mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Auctions
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <div className="card overflow-hidden">
            <div className="relative h-96">
               <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
               <div className="absolute top-4 left-4">
                  {item.status === 'live' ? (
                    <span className="bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full animate-pulse shadow-lg">
                      LIVE AUCTION
                    </span>
                  ) : (
                    <span className="bg-dark-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                      UPCOMING
                    </span>
                  )}
               </div>
            </div>
            <div className="p-6">
              <h1 className="text-3xl font-black text-white mb-2">{item.title}</h1>
              <p className="text-dark-400 text-lg leading-relaxed">{item.description}</p>
            </div>
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <CountdownTimer endTime={item.endTime} status={item.status} />
          
          <div className="card p-6">
            <div className="text-center mb-6">
              <p className="text-dark-500 font-bold uppercase tracking-widest text-sm mb-1">Current Highest Bid</p>
              <p className="text-5xl font-black text-primary-500">₹{item.currentPrice}</p>
            </div>
            <BidPanel item={item} onBidPlaced={() => {
              // Refresh item
              const items = db.getItems();
              setItem(items.find(i => i.id === id) || null);
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
