import PublicNavbar from '../components/layout/PublicNavbar';
import { Link } from 'react-router-dom';
import { Target, Eye, Heart, Users, Award, Globe } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-dark-900 text-white font-sans">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent-500/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl lg:text-5xl font-black mb-4">
            About <span className="text-primary-500">AuctionHub</span>
          </h1>
          <p className="text-dark-400 text-lg max-w-2xl mx-auto">
            We are building the most complete platform for conducting player auctions across all sports — from cricket to football, kabaddi to basketball.
          </p>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card p-8 text-center hover:border-primary-500/30 transition-all">
            <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto mb-5">
              <Target className="w-8 h-8 text-primary-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Our Mission</h3>
            <p className="text-dark-400 leading-relaxed">
              To empower sports communities with a seamless, transparent, and exciting auction platform that brings fair play to team building.
            </p>
          </div>
          <div className="card p-8 text-center hover:border-accent-500/30 transition-all">
            <div className="w-16 h-16 rounded-full bg-accent-500/10 flex items-center justify-center mx-auto mb-5">
              <Eye className="w-8 h-8 text-accent-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Our Vision</h3>
            <p className="text-dark-400 leading-relaxed">
              To become the go-to platform for player auctions worldwide — making every local league as thrilling as the IPL or Premier League drafts.
            </p>
          </div>
          <div className="card p-8 text-center hover:border-blue-500/30 transition-all">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-5">
              <Heart className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Our Values</h3>
            <p className="text-dark-400 leading-relaxed">
              Fairness, transparency, excitement. We believe every player deserves a chance, and every team owner deserves a level playing field.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-t border-dark-700/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-primary-500" />
              </div>
              <p className="text-3xl font-black text-white">10K+</p>
              <p className="text-dark-500 text-sm font-bold uppercase">Users</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-accent-500/10 flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-accent-500" />
              </div>
              <p className="text-3xl font-black text-white">500+</p>
              <p className="text-dark-500 text-sm font-bold uppercase">Auctions Held</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                <Globe className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-3xl font-black text-white">8</p>
              <p className="text-dark-500 text-sm font-bold uppercase">Sports Supported</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-3xl font-black text-white">99%</p>
              <p className="text-dark-500 text-sm font-bold uppercase">Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-black text-white text-center mb-8">Our Story</h2>
        <div className="card p-8">
          <p className="text-dark-400 leading-relaxed mb-4">
            AuctionHub was born from a simple observation: organizing player auctions for local leagues was a painful, manual process. Pen-and-paper bidding, budget miscalculations, and chaotic player management were the norm.
          </p>
          <p className="text-dark-400 leading-relaxed mb-4">
            We set out to change that. Our team of sports enthusiasts and software engineers built a platform that handles everything — from player registration and team creation to live bidding and squad management — all in one place.
          </p>
          <p className="text-dark-400 leading-relaxed">
            Today, AuctionHub powers hundreds of tournaments across cricket, football, basketball, volleyball, and more. Whether you're running a weekend gully cricket auction or a professional league draft, we've got you covered.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-dark-700/50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Join the Community</h2>
          <p className="text-dark-400 mb-8">Start your first auction today — it's free to get started!</p>
          <Link to="/register" className="btn-primary px-8 py-4 text-lg font-bold inline-flex items-center gap-2">
            Get Started →
          </Link>
        </div>
      </section>

      <footer className="border-t border-dark-700/50 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-dark-500 text-sm">
          &copy; {new Date().getFullYear()} AuctionHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
