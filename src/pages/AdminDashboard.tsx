

import { useState, useEffect } from 'react';
import { AlertCircle, X, Plus, Pencil, Trash2, Star } from 'lucide-react';
import { db } from '../services/db';
import { PricingPlan } from '../types';

interface Transaction {
  id: string;
  utr: string;
  league: string;
  amount: number;
  status: 'Success' | 'Pending' | 'Failed';
  date: string;
}

interface ActiveRoom {
  id: string;
  league: string;
  players: number;
  bidsPerSecond: number;
  paused: boolean;
}

interface ErrorLog {
  id: string;
  type: 'LoginFailed' | 'PaymentFailed' | 'SystemError';
  message: string;
  timestamp: string;
  count: number;
}

interface Payout {
  id: string;
  organizer: string;
  amount: number;
  status: 'Pending' | 'Processed' | 'Failed';
  date: string;
}

export default function AdminDashboard() {
  const [sports, setSports] = useState(['Cricket', 'Football', 'NBA', 'Tennis', 'Volleyball', 'Badminton', 'Kabadi']);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [planForm, setPlanForm] = useState({ name: '', price: 0, teams: 2, features: '', recommended: false });
  const [stateLeagues, setStateLeagues] = useState(['Maharashtra', 'Delhi', 'Karnataka']);
  const [teamLimit, setTeamLimit] = useState(12);
  const [playerCategory, setPlayerCategory] = useState('All-rounder');
  const [pursePoints] = useState(10000);
  const [minBidAmount] = useState(500);
  const [auctionSchedule] = useState('2026-04-10 16:00');
  const [pendingTeams] = useState(['Team A', 'Team B', 'Team C']);
  const [approvedTeams] = useState<string[]>([]);
  const [registrationFee] = useState(500);

  // Dashboard overview state
  const [totalUsers] = useState(1245);
  const [activeUsers] = useState(892);
  const [inactiveUsers] = useState(353);
  const [liveAuctions] = useState(3);
  const [scheduledAuctions] = useState(8);
  const [upcomingAuctions] = useState(5);
  const [totalRevenue] = useState(45200);
  const [pendingAuctions, setPendingAuctions] = useState([
    { id: 'auction-1', name: 'Perinthani Premier League 2025', organizer: 'John Doe', teams: 8, status: 'pending' },
    { id: 'auction-2', name: 'Chennai Champions Cup 2026', organizer: 'Jane Smith', teams: 6, status: 'pending' },
  ]);

  // System Health state
  const [serverLatency] = useState(45);
  const [socketConnections] = useState(342);
  const [systemStatus] = useState('Healthy');
  const [errorCount] = useState(2);

  // Recent Transactions state
  const [transactions] = useState<Transaction[]>([
    { id: 'TXN001', utr: 'UTR123456789', league: 'Perinthani Premier League 2025', amount: 3000, status: 'Success', date: '2026-04-01 14:30' },
    { id: 'TXN002', utr: 'UTR123456790', league: 'Chennai Champions Cup 2026', amount: 5000, status: 'Success', date: '2026-04-01 13:15' },
    { id: 'TXN003', utr: 'UTR123456791', league: 'Mumbai Masters League', amount: 3000, status: 'Pending', date: '2026-04-01 12:45' },
    { id: 'TXN004', utr: 'UTR123456792', league: 'Delhi Elite Auction', amount: 5000, status: 'Failed', date: '2026-03-31 16:20' },
  ]);
  const [transactionSearch, setTransactionSearch] = useState('');

  // Payout Tracker state
  const [payouts] = useState<Payout[]>([
    { id: 'PYT001', organizer: 'John Doe', amount: 12500, status: 'Pending', date: '2026-03-25' },
    { id: 'PYT002', organizer: 'Jane Smith', amount: 8750, status: 'Processed', date: '2026-03-20' },
    { id: 'PYT003', organizer: 'Kumar Singh', amount: 15600, status: 'Pending', date: '2026-03-15' },
  ]);

  // Coupon Manager state
  const [coupons, setCoupons] = useState([
    { code: 'SILVER10', discount: 10, plan: 'Silver', uses: 45 },
    { code: 'GOLD20', discount: 20, plan: 'Gold', uses: 23 },
  ]);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponPlan, setCouponPlan] = useState('Silver');

  // Active Rooms Monitor state
  const [activeRooms] = useState<ActiveRoom[]>([
    { id: 'room-1', league: 'Perinthani Premier League 2025', players: 145, bidsPerSecond: 28, paused: false },
    { id: 'room-2', league: 'Chennai Champions Cup 2026', players: 89, bidsPerSecond: 15, paused: false },
    { id: 'room-3', league: 'Mumbai Masters League', players: 203, bidsPerSecond: 42, paused: false },
  ]);
  const [pausedRooms, setPausedRooms] = useState<string[]>([]);

  // Bid Audit Logs state
  const [auditLogs] = useState([
    { id: 'audit-1', user: 'Team A', action: 'Bid Placed', amount: 5000, timestamp: '2026-04-01 14:28', room: 'Perinthani Premier League 2025' },
    { id: 'audit-2', user: 'Team B', action: 'Bid Placed', amount: 5200, timestamp: '2026-04-01 14:29', room: 'Perinthani Premier League 2025' },
    { id: 'audit-3', user: 'Team C', action: 'Bid Cancelled', amount: 4800, timestamp: '2026-04-01 14:27', room: 'Chennai Champions Cup 2026' },
  ]);

  // Error Logs state
  const [errorLogs] = useState<ErrorLog[]>([
    { id: 'err-1', type: 'LoginFailed', message: 'Invalid credentials attempt', timestamp: '2026-04-01 12:45', count: 3 },
    { id: 'err-2', type: 'PaymentFailed', message: 'Payment gateway timeout', timestamp: '2026-03-31 16:20', count: 1 },
  ]);

  // Emergency Stop Modal state
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyConfirm, setEmergencyConfirm] = useState('');

  const requireFee = approvedTeams.length + pendingTeams.length > 2;

  useEffect(() => {
    setPricingPlans(db.getPricingPlans());
  }, []);

  const refreshPlans = () => setPricingPlans(db.getPricingPlans());

  const openAddPlan = () => {
    setEditingPlan(null);
    setPlanForm({ name: '', price: 0, teams: 2, features: '', recommended: false });
    setShowPlanForm(true);
  };

  const openEditPlan = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setPlanForm({ name: plan.name, price: plan.price, teams: plan.teams, features: plan.features.join(', '), recommended: plan.recommended || false });
    setShowPlanForm(true);
  };

  const savePlan = () => {
    if (!planForm.name.trim()) return;
    const plan: PricingPlan = {
      id: editingPlan ? editingPlan.id : `plan-${Date.now()}`,
      name: planForm.name.trim(),
      price: planForm.price,
      teams: planForm.teams,
      features: planForm.features.split(',').map(f => f.trim()).filter(Boolean),
      recommended: planForm.recommended,
    };
    db.savePricingPlan(plan);
    refreshPlans();
    setShowPlanForm(false);
    setEditingPlan(null);
  };

  const deletePlan = (id: string) => {
    db.deletePricingPlan(id);
    refreshPlans();
  };

  const toggleRecommended = (plan: PricingPlan) => {
    // Only one plan can be recommended
    pricingPlans.forEach(p => {
      if (p.recommended && p.id !== plan.id) {
        db.savePricingPlan({ ...p, recommended: false });
      }
    });
    db.savePricingPlan({ ...plan, recommended: !plan.recommended });
    refreshPlans();
  };

  const approveAuction = (auctionId: string) => {
    setPendingAuctions(prev => prev.filter(a => a.id !== auctionId));
  };

  const toggleRoomPause = (roomId: string) => {
    setPausedRooms(prev =>
      prev.includes(roomId) ? prev.filter(r => r !== roomId) : [...prev, roomId]
    );
  };

  const addCoupon = () => {
    if (!couponCode.trim() || couponDiscount <= 0) return;
    setCoupons(prev => [...prev, {
      code: couponCode.toUpperCase(),
      discount: couponDiscount,
      plan: couponPlan,
      uses: 0,
    }]);
    setCouponCode('');
    setCouponDiscount(0);
  };

  const triggerEmergencyStop = () => {
    if (emergencyConfirm === 'STOP ALL') {
      // Execute emergency stop for all auctions
      setPausedRooms(activeRooms.map(r => r.id));
      setShowEmergencyModal(false);
      setEmergencyConfirm('');
    }
  };

  const addSports = (newSport: string) => {
    if (!newSport.trim()) return;
    setSports(prev => [...prev, newSport.trim()]);
  };

  const addStateLeague = (newState: string) => {
    if (!newState.trim()) return;
    setStateLeagues(prev => [...prev, newState.trim()]);
  };

  const filteredTransactions = transactions.filter(t =>
    t.id.toLowerCase().includes(transactionSearch.toLowerCase()) ||
    t.utr.toLowerCase().includes(transactionSearch.toLowerCase()) ||
    t.league.toLowerCase().includes(transactionSearch.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-dark-500 mt-2">SuperAdmin + League Admin controls for auction ecosystem.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <h3 className="text-lg font-bold text-white">Total Users</h3>
          <p className="text-2xl text-primary-500 font-bold mt-1">{totalUsers.toLocaleString()}</p>
          <div className="text-xs text-dark-400 mt-2">
            <span className="text-green-400">Active: {activeUsers}</span> | <span className="text-red-400">Inactive: {inactiveUsers}</span>
          </div>
        </div>
        <div className="card p-4">
          <h3 className="text-lg font-bold text-white">Total Auctions</h3>
          <p className="text-2xl text-accent-500 font-bold mt-1">{liveAuctions + scheduledAuctions + upcomingAuctions}</p>
          <div className="text-xs text-dark-400 mt-2">
            <span className="text-red-500">Live: {liveAuctions}</span> | <span className="text-blue-400">Scheduled: {scheduledAuctions}</span> | <span className="text-yellow-400">Upcoming: {upcomingAuctions}</span>
          </div>
        </div>
        <div className="card p-4">
          <h3 className="text-lg font-bold text-white">Total Revenue</h3>
          <p className="text-2xl text-green-500 font-bold mt-1">₹{totalRevenue.toLocaleString()}</p>
          <div className="text-xs text-dark-400 mt-2">
            From {liveAuctions + scheduledAuctions} events
          </div>
        </div>
        <div className="card p-4">
          <h3 className="text-lg font-bold text-white">Live Auctions</h3>
          <p className="text-2xl text-red-500 font-bold mt-1">{liveAuctions}</p>
          <div className="text-xs text-dark-400 mt-2">
            Currently active
          </div>
        </div>
      </div>

      {/* System Health & Emergency Stop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6 border border-green-900/30">
          <h3 className="text-lg font-bold text-white mb-4">System Health</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-dark-400">Server Status</p>
              <p className="text-lg font-bold text-green-400">{systemStatus}</p>
            </div>
            <div>
              <p className="text-sm text-dark-400">Server Latency</p>
              <p className="text-lg font-bold text-blue-400">{serverLatency}ms</p>
            </div>
            <div>
              <p className="text-sm text-dark-400">Socket Connections</p>
              <p className="text-lg font-bold text-accent-400">{socketConnections.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-dark-400">Active Errors</p>
              <p className={`text-lg font-bold ${errorCount > 0 ? 'text-red-400' : 'text-green-400'}`}>{errorCount}</p>
            </div>
          </div>
        </div>

        {/* Emergency Stop Button */}
        <div className="card p-6 border border-red-900/30 flex flex-col justify-center">
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition"
          >
            🛑 Global Emergency Stop
          </button>
          <p className="text-xs text-dark-400 mt-3 text-center">Freezes all live auctions immediately</p>
        </div>

        {/* Pause Status */}
        <div className="card p-6 border border-yellow-900/30">
          <h3 className="text-lg font-bold text-white mb-4">Auction Control</h3>
          <div className="space-y-2">
            <p className="text-sm text-dark-400">Active Rooms: {activeRooms.length}</p>
            <p className="text-sm text-dark-400">Paused Rooms: <span className="text-yellow-400 font-bold">{pausedRooms.length}</span></p>
            <p className="text-sm text-dark-400">Running Rooms: <span className="text-green-400 font-bold">{activeRooms.length - pausedRooms.length}</span></p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card p-6">
        <h3 className="text-xl font-bold text-white mb-4">Recent Transactions</h3>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by Transaction ID, UTR, or League Name..."
            value={transactionSearch}
            onChange={(e) => setTransactionSearch(e.target.value)}
            className="input-field w-full"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left py-2 text-dark-300 font-semibold">Transaction ID</th>
                <th className="text-left py-2 text-dark-300 font-semibold">UTR</th>
                <th className="text-left py-2 text-dark-300 font-semibold">League Name</th>
                <th className="text-left py-2 text-dark-300 font-semibold">Amount</th>
                <th className="text-left py-2 text-dark-300 font-semibold">Status</th>
                <th className="text-left py-2 text-dark-300 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(txn => (
                <tr key={txn.id} className="border-b border-dark-800 hover:bg-dark-900/50">
                  <td className="py-3 text-white">{txn.id}</td>
                  <td className="py-3 text-dark-400 font-mono">{txn.utr}</td>
                  <td className="py-3 text-dark-400">{txn.league}</td>
                  <td className="py-3 text-green-400 font-semibold">₹{txn.amount.toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      txn.status === 'Success' ? 'bg-green-900/30 text-green-400' :
                      txn.status === 'Pending' ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-red-900/30 text-red-400'
                    }`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="py-3 text-dark-400 text-xs">{txn.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial & Payment Oversight */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payout Tracker */}
        <div className="card p-6">
          <h3 className="text-xl font-bold text-white mb-4">Payout Tracker</h3>
          <div className="space-y-3">
            {payouts.map(payout => (
              <div key={payout.id} className="bg-dark-900 p-4 rounded border border-dark-700">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white">{payout.organizer}</h4>
                  <span className={`text-sm font-bold px-2 py-1 rounded ${
                    payout.status === 'Processed' ? 'bg-green-900/30 text-green-400' :
                    'bg-yellow-900/30 text-yellow-400'
                  }`}>
                    {payout.status}
                  </span>
                </div>
                <p className="text-accent-400 font-bold">₹{payout.amount.toLocaleString()}</p>
                <p className="text-xs text-dark-400 mt-1">{payout.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Coupon Manager */}
        <div className="card p-6">
          <h3 className="text-xl font-bold text-white mb-4">Coupon Manager</h3>
          <div className="space-y-3 mb-4">
            {coupons.map(coupon => (
              <div key={coupon.code} className="bg-dark-900 p-3 rounded border border-dark-700 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">{coupon.code}</p>
                  <p className="text-xs text-dark-400">{coupon.discount}% off - {coupon.plan} Plan</p>
                </div>
                <p className="text-accent-400 text-sm">Used: {coupon.uses}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Coupon Code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="input-field w-full"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Discount %"
                value={couponDiscount}
                onChange={(e) => setCouponDiscount(parseInt(e.target.value))}
                className="input-field"
              />
              <select
                value={couponPlan}
                onChange={(e) => setCouponPlan(e.target.value)}
                className="input-field"
              >
                <option>Silver</option>
                <option>Gold</option>
              </select>
            </div>
            <button
              onClick={addCoupon}
              className="btn-primary w-full"
            >
              Create Coupon
            </button>
          </div>
        </div>
      </div>

      {/* Active Rooms Monitor & Bid Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Rooms Monitor */}
        <div className="card p-6">
          <h3 className="text-xl font-bold text-white mb-4">Active Rooms Monitor</h3>
          <div className="space-y-3">
            {activeRooms.map(room => (
              <div key={room.id} className={`p-4 rounded border ${
                pausedRooms.includes(room.id) ? 'border-yellow-900/50 bg-yellow-900/20' : 'border-green-900/50 bg-green-900/20'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white">{room.league}</h4>
                  <button
                    onClick={() => toggleRoomPause(room.id)}
                    className={`text-xs font-bold px-3 py-1 rounded ${
                      pausedRooms.includes(room.id)
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    }`}
                  >
                    {pausedRooms.includes(room.id) ? 'Resume' : 'Pause'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-dark-400">Players: <span className="text-white font-bold">{room.players}</span></p>
                  <p className="text-dark-400">Bids/sec: <span className="text-accent-400 font-bold">{room.bidsPerSecond}</span></p>
                </div>
                {pausedRooms.includes(room.id) && (
                  <p className="text-xs text-yellow-400 mt-2">⏸️ Auction Paused</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bid Audit Logs */}
        <div className="card p-6">
          <h3 className="text-xl font-bold text-white mb-4">Bid Audit Logs</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {auditLogs.map(log => (
              <div key={log.id} className="bg-dark-900 p-3 rounded border border-dark-700 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-white">{log.user}</p>
                  <span className={`px-2 py-0.5 rounded ${
                    log.action === 'Bid Placed' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                  }`}>
                    {log.action}
                  </span>
                </div>
                <p className="text-dark-400">League: {log.room}</p>
                <p className="text-accent-400">Amount: ₹{log.amount.toLocaleString()}</p>
                <p className="text-dark-500 text-xs">{log.timestamp}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-xl font-bold text-white">Super Admin</h3>
          <p className="text-dark-400 text-sm mt-2">Global platform configuration.</p>
          <div className="mt-4 text-sm text-dark-400 space-y-2">
            <p>Sports: {sports.join(', ')}</p>
            <p>Pricing Plans: {pricingPlans.map(p => `${p.name} (₹${p.price}/${p.teams} teams)`).join(' | ') || 'None configured'}</p>
            <p>Leagues: {stateLeagues.join(', ')}</p>
            <p>Registration Fee: ₹{registrationFee}</p>
          </div>

          <div className="mt-4">
            <input
              type="text"
              placeholder="Add sport"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  addSports((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
              className="input-field w-full mb-2" />
            <input
              type="text"
              placeholder="Add state league"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  addStateLeague((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
              className="input-field w-full" />
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-bold text-white">League Admin / Organizer</h3>
          <p className="text-dark-400 text-sm mt-2">Create auction, define rules, approve teams.</p>

          <div className="mt-4 text-sm text-dark-400 space-y-2">
            <p>Team Limit: {teamLimit}</p>
            <p>Player Category: {playerCategory}</p>
            <p>Purse: {pursePoints}</p>
            <p>Min Base Bid: ₹{minBidAmount}</p>
            <p>Schedule: {auctionSchedule}</p>
            <p>Pending Approval: {pendingTeams.length}</p>
            <p>Approved Teams: {approvedTeams.length}</p>
            <p>Registration Fee Required: {requireFee ? 'Yes' : 'No'}</p>
          </div>

          <div className="mt-4 space-y-2">
            <button onClick={() => setTeamLimit(teamLimit + 1)} className="btn-primary w-full">Increase Team Limit</button>
            <button onClick={() => setPlayerCategory('Multi-Sport')} className="btn-secondary w-full">Set category: Multi-Sport</button>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-bold text-white">Auction Approval</h3>
          <p className="text-dark-400 text-sm mt-2">Approve auction events and enforce rules.</p>

          <div className="mt-4 space-y-3 text-sm">
            {pendingAuctions.map(auction => (
              <div key={auction.id} className="bg-dark-900 p-3 rounded border border-dark-700">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white">{auction.name}</h4>
                  <button
                    className="text-green-400 hover:text-green-300 text-sm font-bold"
                    onClick={() => approveAuction(auction.id)}
                  >
                    Approve
                  </button>
                </div>
                <div className="text-dark-400 text-xs space-y-1">
                  <p>Organizer: {auction.organizer}</p>
                  <p>Teams: {auction.teams}</p>
                  <p>Status: <span className="text-yellow-400">{auction.status}</span></p>
                </div>
              </div>
            ))}
            {pendingAuctions.length === 0 && (
              <p className="text-dark-500 text-center py-4">No auctions pending approval</p>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Plans Management */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Pricing Plans Management</h3>
            <p className="text-dark-400 text-sm mt-1">Add, edit, or remove pricing plans visible to organizers.</p>
          </div>
          <button onClick={openAddPlan} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Add Plan
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700 text-left">
                <th className="pb-3 text-dark-400 font-semibold">Name</th>
                <th className="pb-3 text-dark-400 font-semibold">Price (Rs)</th>
                <th className="pb-3 text-dark-400 font-semibold">Teams</th>
                <th className="pb-3 text-dark-400 font-semibold">Features</th>
                <th className="pb-3 text-dark-400 font-semibold text-center">Recommended</th>
                <th className="pb-3 text-dark-400 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {pricingPlans.map(plan => (
                <tr key={plan.id} className="hover:bg-dark-700/30">
                  <td className="py-3 text-white font-bold">{plan.name}</td>
                  <td className="py-3 text-dark-300">{plan.price === 0 ? 'Free' : plan.price.toLocaleString()}</td>
                  <td className="py-3 text-dark-300">{plan.teams}</td>
                  <td className="py-3 text-dark-400 text-xs max-w-[200px]">
                    <div className="flex flex-wrap gap-1">
                      {plan.features.map((f, i) => (
                        <span key={i} className="bg-dark-700 px-2 py-0.5 rounded text-dark-300">{f}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <button onClick={() => toggleRecommended(plan)} className="mx-auto block">
                      <Star size={18} className={plan.recommended ? 'text-primary-500 fill-primary-500' : 'text-dark-600 hover:text-dark-400'} />
                    </button>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditPlan(plan)} className="text-primary-500 hover:text-primary-400 p-1">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => deletePlan(plan.id)} className="text-red-500 hover:text-red-400 p-1">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pricingPlans.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-dark-500">No pricing plans configured</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Plan Modal */}
      {showPlanForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-md w-full relative">
            <button onClick={() => setShowPlanForm(false)} className="absolute top-4 right-4 text-dark-400 hover:text-white">
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">{editingPlan ? 'Edit Plan' : 'Add New Plan'}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-dark-400 block mb-1">Plan Name</label>
                <input type="text" className="input-field w-full" placeholder="e.g. Pro" value={planForm.name} onChange={e => setPlanForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-dark-400 block mb-1">Price (Rs)</label>
                  <input type="number" className="input-field w-full" min={0} value={planForm.price} onChange={e => setPlanForm(f => ({ ...f, price: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-sm text-dark-400 block mb-1">Max Teams</label>
                  <input type="number" className="input-field w-full" min={1} value={planForm.teams} onChange={e => setPlanForm(f => ({ ...f, teams: Number(e.target.value) }))} />
                </div>
              </div>
              <div>
                <label className="text-sm text-dark-400 block mb-1">Features (comma separated)</label>
                <input type="text" className="input-field w-full" placeholder="Up to 12 Teams, Priority Analytics" value={planForm.features} onChange={e => setPlanForm(f => ({ ...f, features: e.target.value }))} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={planForm.recommended} onChange={e => setPlanForm(f => ({ ...f, recommended: e.target.checked }))} className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500 bg-dark-700" />
                <span className="text-sm text-dark-300">Mark as Recommended</span>
              </label>
              <button onClick={savePlan} className="btn-primary w-full mt-2">{editingPlan ? 'Update Plan' : 'Add Plan'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Error Logs */}
      <div className="card p-6">
        <h3 className="text-xl font-bold text-white mb-4">Error Logs</h3>
        <div className="space-y-3">
          {errorLogs.map(log => (
            <div key={log.id} className="bg-dark-900 p-4 rounded border border-red-900/30 flex items-start gap-3">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-white">
                    {log.type === 'LoginFailed' ? 'Failed Login Attempts' :
                     log.type === 'PaymentFailed' ? 'Payment Failures' :
                     'System Error'}
                  </h4>
                  <span className="bg-red-900/30 text-red-400 text-xs px-2 py-1 rounded font-bold">
                    {log.count}
                  </span>
                </div>
                <p className="text-dark-400 text-sm">{log.message}</p>
                <p className="text-dark-500 text-xs mt-1">{log.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auction Rules */}
      <div className="card p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-dark-900 rounded">
          <h3 className="text-lg font-bold text-white">Auction Rules</h3>
          <ul className="list-disc list-inside text-dark-400 mt-2 text-sm space-y-1">
            <li>Teams more than 2 must pay registration fee before entering auction room.</li>
            <li>SuperAdmin sets sports, plans, and platform flags.</li>
            <li>Organizer sets limit, purse, and auction schedule.</li>
            <li>Emergency Stop freezes all active auctions immediately.</li>
            <li>Bid Audit Logs track all user actions for dispute resolution.</li>
          </ul>
        </div>
        <div className="p-4 bg-dark-900 rounded">
          <h3 className="text-lg font-bold text-white">Top Stats</h3>
          <div className="mt-2 text-dark-400 text-sm space-y-1">
            <p>Teams eligible for auction: {approvedTeams.length}</p>
            <p>Pending payment check: {requireFee ? 'Yes (Fee required)' : 'No'}</p>
            <p>Auctions pending approval: {pendingAuctions.length}</p>
            <p>System Health: <span className="text-green-400 font-bold">{systemStatus}</span></p>
            <p>Server Latency: <span className="text-blue-400 font-bold">{serverLatency}ms</span></p>
            <p>Active Connections: <span className="text-accent-400 font-bold">{socketConnections.toLocaleString()}</span></p>
          </div>
        </div>
      </div>

      {/* Emergency Stop Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-8 max-w-md w-full border-2 border-red-600">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-red-400" size={24} />
              <h2 className="text-xl font-bold text-white">Emergency Stop - All Auctions</h2>
            </div>
            <p className="text-dark-400 mb-6">
              This will immediately pause ALL live auctions. Users will not be able to place bids until auctions are resumed.
            </p>
            <div className="bg-red-900/20 border border-red-700 rounded p-3 mb-6">
              <p className="text-red-400 text-sm mb-2">⚠️ Warning: Action is immediate and affects all users</p>
              <p className="text-dark-400 text-xs">Confirm by typing "STOP ALL" below:</p>
            </div>
            <input
              type="text"
              placeholder="Type 'STOP ALL' to confirm"
              value={emergencyConfirm}
              onChange={(e) => setEmergencyConfirm(e.target.value)}
              className="input-field w-full mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEmergencyModal(false);
                  setEmergencyConfirm('');
                }}
                className="flex-1 bg-dark-700 hover:bg-dark-600 text-white font-bold py-2 px-4 rounded transition"
              >
                Cancel
              </button>
              <button
                onClick={triggerEmergencyStop}
                disabled={emergencyConfirm !== 'STOP ALL'}
                className={`flex-1 font-bold py-2 px-4 rounded transition ${
                  emergencyConfirm === 'STOP ALL'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-red-900/30 text-red-600 cursor-not-allowed'
                }`}
              >
                Execute Stop
              </button>
            </div>
            <button
              onClick={() => {
                setShowEmergencyModal(false);
                setEmergencyConfirm('');
              }}
              className="absolute top-4 right-4 text-dark-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
