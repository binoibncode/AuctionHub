import PublicNavbar from '../components/layout/PublicNavbar';
import { Link } from 'react-router-dom';
import {
  Gavel, UserPlus, Bell, Briefcase, Monitor, LayoutGrid,
  Wallet, History, Users, BarChart3, MessageSquare, Trophy,
} from 'lucide-react';

const FEATURES = [
  { icon: Gavel, title: 'Live Auction Bidding', desc: 'Real-time player auction with live bidding and updates.', color: 'text-primary-500', bg: 'bg-primary-500/10 group-hover:bg-primary-500/20' },
  { icon: UserPlus, title: 'Online Player Registration', desc: 'Easy player registration with profile and verification.', color: 'text-blue-400', bg: 'bg-blue-400/10 group-hover:bg-blue-400/20' },
  { icon: Bell, title: 'Real-Time Auction Updates', desc: 'Get instant updates on bids, players, and teams.', color: 'text-amber-400', bg: 'bg-amber-400/10 group-hover:bg-amber-400/20' },
  { icon: Briefcase, title: 'Team Owner Bidding Panel', desc: 'A simple panel for team owners to manage bids.', color: 'text-cyan-400', bg: 'bg-cyan-400/10 group-hover:bg-cyan-400/20' },
  { icon: LayoutGrid, title: 'Admin Control Dashboard', desc: 'Powerful admin panel to manage the entire system.', color: 'text-purple-400', bg: 'bg-purple-400/10 group-hover:bg-purple-400/20' },
  { icon: Monitor, title: 'Live Streaming & Display Screens', desc: 'Display live auction updates on screens.', color: 'text-sky-400', bg: 'bg-sky-400/10 group-hover:bg-sky-400/20' },
  { icon: Users, title: 'Player Categories Management', desc: 'Organize players into multiple categories.', color: 'text-rose-400', bg: 'bg-rose-400/10 group-hover:bg-rose-400/20' },
  { icon: Wallet, title: 'Team Budget Control', desc: 'Control budgets with automatic deductions.', color: 'text-emerald-400', bg: 'bg-emerald-400/10 group-hover:bg-emerald-400/20' },
  { icon: History, title: 'Player Auction History', desc: 'View detailed player bidding history.', color: 'text-orange-400', bg: 'bg-orange-400/10 group-hover:bg-orange-400/20' },
  { icon: Trophy, title: 'Team Squad Display', desc: 'See all purchased players organized by teams.', color: 'text-yellow-400', bg: 'bg-yellow-400/10 group-hover:bg-yellow-400/20' },
  { icon: BarChart3, title: 'Auction Reports & Analytics', desc: 'Detailed reports and insights of auction data.', color: 'text-indigo-400', bg: 'bg-indigo-400/10 group-hover:bg-indigo-400/20' },
  { icon: MessageSquare, title: 'Notifications & Alerts', desc: 'Stay updated with instant notifications.', color: 'text-pink-400', bg: 'bg-pink-400/10 group-hover:bg-pink-400/20' },
];

export default function Features() {
  return (
    <div className="min-h-screen bg-dark-900 text-white font-sans">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl lg:text-5xl font-black mb-4">
            Powerful <span className="text-primary-500">Features</span>
          </h1>
          <p className="text-dark-400 text-lg max-w-2xl mx-auto">
            Everything you need to create, manage, and conduct exciting player auctions for your sports community.
          </p>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="card p-6 hover:border-primary-500/30 transition-all duration-300 hover:-translate-y-1 group">
              <div className={`w-14 h-14 rounded-xl ${f.bg} flex items-center justify-center mb-4 transition-colors`}>
                <f.icon className={`w-7 h-7 ${f.color}`} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-dark-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-dark-700/50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Ready to get started?</h2>
          <p className="text-dark-400 mb-8">Create your first auction in minutes. No credit card required.</p>
          <Link to="/register" className="btn-primary px-8 py-4 text-lg font-bold inline-flex items-center gap-2">
            Register Now →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-700/50 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-dark-500 text-sm">
          &copy; {new Date().getFullYear()} AuctionHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
