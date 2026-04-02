import PublicNavbar from '../components/layout/PublicNavbar';
import { Link } from 'react-router-dom';
import {
  Gavel, UserPlus, Bell, Briefcase, Monitor, LayoutGrid,
  Wallet, History, Users, BarChart3, MessageSquare, Trophy,
} from 'lucide-react';

const FEATURES = [
  { icon: Gavel, title: 'Live Auction Bidding', desc: 'Real-time player auction with live bidding and updates.' },
  { icon: UserPlus, title: 'Online Player Registration', desc: 'Easy player registration with profile and verification.' },
  { icon: Bell, title: 'Real-Time Auction Updates', desc: 'Get instant updates on bids, players, and teams.' },
  { icon: Briefcase, title: 'Team Owner Bidding Panel', desc: 'A simple panel for team owners to manage bids.' },
  { icon: LayoutGrid, title: 'Admin Control Dashboard', desc: 'Powerful admin panel to manage the entire system.' },
  { icon: Monitor, title: 'Live Streaming & Display Screens', desc: 'Display live auction updates on screens.' },
  { icon: Users, title: 'Player Categories Management', desc: 'Organize players into multiple categories.' },
  { icon: Wallet, title: 'Team Budget Control', desc: 'Control budgets with automatic deductions.' },
  { icon: History, title: 'Player Auction History', desc: 'View detailed player bidding history.' },
  { icon: Trophy, title: 'Team Squad Display', desc: 'See all purchased players organized by teams.' },
  { icon: BarChart3, title: 'Auction Reports & Analytics', desc: 'Detailed reports and insights of auction data.' },
  { icon: MessageSquare, title: 'Notifications & Alerts', desc: 'Stay updated with instant notifications.' },
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
              <div className="w-14 h-14 rounded-xl bg-primary-500/10 flex items-center justify-center mb-4 group-hover:bg-primary-500/20 transition-colors">
                <f.icon className="w-7 h-7 text-primary-500" />
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
