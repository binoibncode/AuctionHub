import { Link } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';

const STEPS = [
  {
    step: '01',
    title: 'Create Tournament',
    desc: 'The organizer creates a tournament and defines auction rules such as teams, player categories, and budgets.',
    color: 'primary',
    svg: (
      <svg viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Background card */}
        <rect x="20" y="20" width="360" height="220" rx="16" fill="#1a1f2e" stroke="#2d3548" strokeWidth="2"/>
        {/* Header bar */}
        <rect x="20" y="20" width="360" height="44" rx="16" fill="#232a3b"/>
        <rect x="20" y="48" width="360" height="16" fill="#232a3b"/>
        <circle cx="48" cy="42" r="8" fill="#ef4444" opacity="0.7"/>
        <circle cx="72" cy="42" r="8" fill="#eab308" opacity="0.7"/>
        <circle cx="96" cy="42" r="8" fill="#22c55e" opacity="0.7"/>
        <text x="200" y="46" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="bold">CREATE AUCTION</text>
        {/* Form fields */}
        <rect x="44" y="80" width="140" height="14" rx="4" fill="#2d3548"/>
        <rect x="44" y="100" width="180" height="28" rx="6" fill="#1e2536" stroke="#3b4560" strokeWidth="1.5"/>
        <text x="54" y="119" fill="#64748b" fontSize="11">Tournament Name...</text>
        <rect x="44" y="140" width="140" height="14" rx="4" fill="#2d3548"/>
        <rect x="44" y="160" width="180" height="28" rx="6" fill="#1e2536" stroke="#3b4560" strokeWidth="1.5"/>
        <text x="54" y="179" fill="#64748b" fontSize="11">Select Sport...</text>
        {/* Right side - settings */}
        <rect x="250" y="80" width="110" height="14" rx="4" fill="#2d3548"/>
        <rect x="250" y="100" width="110" height="28" rx="6" fill="#1e2536" stroke="#3b4560" strokeWidth="1.5"/>
        <text x="260" y="119" fill="#64748b" fontSize="11">8 Teams</text>
        <rect x="250" y="140" width="110" height="14" rx="4" fill="#2d3548"/>
        <rect x="250" y="160" width="110" height="28" rx="6" fill="#1e2536" stroke="#3b4560" strokeWidth="1.5"/>
        <text x="260" y="179" fill="#64748b" fontSize="11">₹50,000</text>
        {/* Create button */}
        <rect x="250" y="204" width="110" height="28" rx="8" fill="#10b981"/>
        <text x="305" y="222" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">Create Auction</text>
        {/* Person illustration */}
        <circle cx="80" cy="218" r="14" fill="#6366f1" opacity="0.2"/>
        <circle cx="80" cy="212" r="6" fill="#818cf8"/>
        <path d="M68 232 Q80 224 92 232" fill="#818cf8" opacity="0.6"/>
      </svg>
    ),
  },
  {
    step: '02',
    title: 'Register Players',
    desc: 'Players register online or organizers add players to the auction list with their details, roles, and base price.',
    color: 'accent',
    svg: (
      <svg viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Background card */}
        <rect x="20" y="20" width="360" height="220" rx="16" fill="#1a1f2e" stroke="#2d3548" strokeWidth="2"/>
        {/* Header */}
        <rect x="20" y="20" width="360" height="44" rx="16" fill="#232a3b"/>
        <rect x="20" y="48" width="360" height="16" fill="#232a3b"/>
        <text x="200" y="46" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="bold">PLAYER REGISTRATION</text>
        {/* Player cards */}
        {[0, 1, 2, 3].map(i => (
          <g key={i}>
            <rect x={44 + i * 82} y="78" width="72" height="90" rx="10" fill="#1e2536" stroke="#3b4560" strokeWidth="1.5"/>
            <circle cx={80 + i * 82} cy="104" r="16" fill={['#6366f1', '#10b981', '#f59e0b', '#ef4444'][i]} opacity="0.2"/>
            <circle cx={80 + i * 82} cy="100" r="7" fill={['#818cf8', '#34d399', '#fbbf24', '#f87171'][i]}/>
            <path d={`M${68 + i * 82} 118 Q${80 + i * 82} 112 ${92 + i * 82} 118`} fill={['#818cf8', '#34d399', '#fbbf24', '#f87171'][i]} opacity="0.5"/>
            <rect x={60 + i * 82} y="128" width="40" height="6" rx="3" fill="#2d3548"/>
            <rect x={64 + i * 82} y="140" width="32" height="4" rx="2" fill="#1e2536"/>
            <rect x={56 + i * 82} y="150" width="48" height="10" rx="4" fill={['#6366f1', '#10b981', '#f59e0b', '#ef4444'][i]} opacity="0.15"/>
            <text x={80 + i * 82} y="158" textAnchor="middle" fill={['#818cf8', '#34d399', '#fbbf24', '#f87171'][i]} fontSize="7" fontWeight="bold">
              {['Batsman', 'Bowler', 'Keeper', 'All-Round'][i]}
            </text>
          </g>
        ))}
        {/* Add player button */}
        <rect x="44" y="184" width="130" height="28" rx="8" fill="#10b981" opacity="0.15" stroke="#10b981" strokeWidth="1.5"/>
        <text x="109" y="202" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="bold">+ Add Player</text>
        {/* Stats */}
        <rect x="200" y="184" width="80" height="28" rx="8" fill="#1e2536" stroke="#3b4560" strokeWidth="1"/>
        <text x="240" y="202" textAnchor="middle" fill="#94a3b8" fontSize="10">32 Players</text>
        <rect x="290" y="184" width="80" height="28" rx="8" fill="#1e2536" stroke="#3b4560" strokeWidth="1"/>
        <text x="330" y="202" textAnchor="middle" fill="#94a3b8" fontSize="10">4 Categories</text>
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Create Teams',
    desc: 'Teams are created and assigned a specific budget to participate in the auction. Set team owners and logos.',
    color: 'blue',
    svg: (
      <svg viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Background card */}
        <rect x="20" y="20" width="360" height="220" rx="16" fill="#1a1f2e" stroke="#2d3548" strokeWidth="2"/>
        {/* Header */}
        <rect x="20" y="20" width="360" height="44" rx="16" fill="#232a3b"/>
        <rect x="20" y="48" width="360" height="16" fill="#232a3b"/>
        <text x="200" y="46" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="bold">TEAM FORMATION & BUDGETS</text>
        {/* Team cards */}
        {[0, 1, 2].map(i => (
          <g key={i}>
            <rect x={40 + i * 115} y="78" width="100" height="130" rx="12" fill="#1e2536" stroke={['#6366f1', '#10b981', '#f59e0b'][i]} strokeWidth="1.5" opacity="0.8"/>
            {/* Team logo circle */}
            <circle cx={90 + i * 115} cy="108" r="18" fill={['#6366f1', '#10b981', '#f59e0b'][i]} opacity="0.15"/>
            <text x={90 + i * 115} y="114" textAnchor="middle" fill={['#818cf8', '#34d399', '#fbbf24'][i]} fontSize="16" fontWeight="bold">
              {['A', 'B', 'C'][i]}
            </text>
            {/* Team name */}
            <rect x={60 + i * 115} y="134" width="60" height="8" rx="4" fill="#2d3548"/>
            {/* Budget bar */}
            <rect x={52 + i * 115} y="152" width="76" height="16" rx="4" fill="#0f1724"/>
            <rect x={52 + i * 115} y="152" width={[56, 38, 66][i]} height="16" rx="4" fill={['#6366f1', '#10b981', '#f59e0b'][i]} opacity="0.3"/>
            <text x={90 + i * 115} y="163" textAnchor="middle" fill={['#818cf8', '#34d399', '#fbbf24'][i]} fontSize="8" fontWeight="bold">
              {['₹50,000', '₹50,000', '₹50,000'][i]}
            </text>
            {/* Player count */}
            <rect x={60 + i * 115} y="176" width="60" height="18" rx="6" fill={['#6366f1', '#10b981', '#f59e0b'][i]} opacity="0.1"/>
            <text x={90 + i * 115} y="189" textAnchor="middle" fill={['#818cf8', '#34d399', '#fbbf24'][i]} fontSize="8">
              0/{[8, 8, 8][i]} Players
            </text>
          </g>
        ))}
        {/* Add team button */}
        <rect x="140" y="220" width="120" height="6" rx="3" fill="#2d3548"/>
      </svg>
    ),
  },
  {
    step: '04',
    title: 'Conduct Live Auction',
    desc: 'Teams place bids on players during the live auction. Real-time updates, sold animations, and instant squad building.',
    color: 'red',
    svg: (
      <svg viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Background card */}
        <rect x="20" y="20" width="360" height="220" rx="16" fill="#1a1f2e" stroke="#2d3548" strokeWidth="2"/>
        {/* Header */}
        <rect x="20" y="20" width="360" height="44" rx="16" fill="#232a3b"/>
        <rect x="20" y="48" width="360" height="16" fill="#232a3b"/>
        <rect x="44" y="34" width="48" height="18" rx="9" fill="#ef4444" opacity="0.9"/>
        <text x="68" y="47" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">● LIVE</text>
        <text x="240" y="46" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="bold">BID SCREEN</text>
        {/* Player photo area */}
        <rect x="44" y="78" width="130" height="130" rx="12" fill="#1e2536" stroke="#3b4560" strokeWidth="1.5"/>
        <circle cx="109" cy="120" r="28" fill="#6366f1" opacity="0.15"/>
        <circle cx="109" cy="112" r="14" fill="#818cf8"/>
        <path d="M85 140 Q109 128 133 140" fill="#818cf8" opacity="0.5"/>
        <rect x="70" y="150" width="78" height="10" rx="4" fill="#2d3548"/>
        <text x="109" y="178" textAnchor="middle" fill="#94a3b8" fontSize="10">Base: ₹1,000</text>
        <rect x="66" y="186" width="86" height="14" rx="6" fill="#10b981" opacity="0.15"/>
        <text x="109" y="196" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="bold">Current: ₹3,500</text>
        {/* Bid panel */}
        <rect x="190" y="78" width="170" height="50" rx="10" fill="#1e2536" stroke="#10b981" strokeWidth="1.5"/>
        <text x="275" y="98" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="bold">CURRENT BID</text>
        <text x="275" y="118" textAnchor="middle" fill="#34d399" fontSize="20" fontWeight="bold">₹3,500</text>
        {/* Team bid buttons */}
        {[0, 1, 2, 3].map(i => (
          <g key={i}>
            <rect x={190 + i * 42} y="140" width="36" height="30" rx="6" fill={i === 2 ? '#10b981' : '#1e2536'} stroke={i === 2 ? '#10b981' : '#3b4560'} strokeWidth="1"/>
            <text x={208 + i * 42} y="160" textAnchor="middle" fill={i === 2 ? '#fff' : '#94a3b8'} fontSize="8" fontWeight="bold">
              {['T1', 'T2', 'T3', 'T4'][i]}
            </text>
          </g>
        ))}
        {/* Sold button */}
        <rect x="190" y="182" width="80" height="26" rx="8" fill="#10b981"/>
        <text x="230" y="199" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">SOLD!</text>
        {/* Unsold button */}
        <rect x="280" y="182" width="80" height="26" rx="8" fill="#ef4444" opacity="0.15" stroke="#ef4444" strokeWidth="1"/>
        <text x="320" y="199" textAnchor="middle" fill="#f87171" fontSize="11" fontWeight="bold">Unsold</text>
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-dark-900 text-white font-sans">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl lg:text-5xl font-black mb-4">
            How Our Auction <span className="text-primary-500">Platform Works</span>
          </h1>
          <p className="text-dark-400 text-lg max-w-2xl mx-auto">
            From creating your tournament to conducting a live auction — here's everything you need to know.
          </p>
        </div>
      </section>

      {/* Steps - alternating layout */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="space-y-20">
          {STEPS.map((item, i) => {
            const isEven = i % 2 === 0;
            const colorMap: Record<string, { badge: string; num: string; border: string }> = {
              primary: { badge: 'bg-primary-500', num: 'text-primary-500', border: 'border-primary-500/20' },
              accent: { badge: 'bg-accent-500', num: 'text-accent-500', border: 'border-accent-500/20' },
              blue: { badge: 'bg-blue-500', num: 'text-blue-500', border: 'border-blue-500/20' },
              red: { badge: 'bg-red-500', num: 'text-red-500', border: 'border-red-500/20' },
            };
            const c = colorMap[item.color];

            return (
              <div key={i} className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-10 lg:gap-16`}>
                {/* Illustration */}
                <div className={`w-full lg:w-1/2 rounded-2xl border ${c.border} bg-dark-800/50 p-4 shadow-2xl hover:shadow-primary-500/5 transition-shadow`}>
                  {item.svg}
                </div>

                {/* Text */}
                <div className="w-full lg:w-1/2">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${c.badge} text-white font-black text-sm mb-4`}>
                    {item.step}
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-black text-white mb-3">{item.title}</h3>
                  <p className="text-dark-400 text-lg leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-dark-700/50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Ready to start your auction?</h2>
          <p className="text-dark-400 mb-8">Create your first tournament in minutes. Free to get started!</p>
          <Link to="/register" className="btn-primary px-8 py-4 text-lg font-bold inline-flex items-center gap-2">
            Get Started Free →
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
