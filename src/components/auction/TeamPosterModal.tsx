import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Auction, Team } from '../../types';
import { X, Download, Trophy } from 'lucide-react';

interface TeamPosterModalProps {
  auction: Auction;
  teams: Team[];
  categoryName?: string;
  onClose: () => void;
}

export default function TeamPosterModal({ auction, teams, categoryName, onClose }: TeamPosterModalProps) {
  const posterRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!posterRef.current) return;
    const canvas = await html2canvas(posterRef.current, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
    });
    const link = document.createElement('a');
    link.download = `${auction.name.replace(/\s+/g, '_')}_Teams.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="max-w-3xl w-full relative">
        {/* Controls */}
        <div data-html2canvas-ignore className="flex items-center justify-end gap-2 mb-3">
          <button
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" /> Download Poster
          </button>
          <button
            onClick={onClose}
            className="bg-dark-700 hover:bg-dark-600 text-white font-bold py-2 px-3 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Poster Content */}
        <div
          ref={posterRef}
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #0f1729 0%, #1a2340 40%, #0f1729 100%)',
          }}
        >
          {/* Top Section */}
          <div className="text-center pt-8 pb-4 px-6">
            {/* Event Logo */}
            <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden border-2 border-primary-500/50 bg-dark-800 flex items-center justify-center mb-4 shadow-lg shadow-primary-500/20">
              {auction.logoUrl ? (
                <img src={auction.logoUrl} alt={auction.name} className="w-full h-full object-cover" />
              ) : (
                <Trophy className="w-10 h-10 text-primary-500" />
              )}
            </div>

            {/* Event Title */}
            <h1 className="text-2xl font-black text-white tracking-wide mb-1">{auction.name}</h1>
            {categoryName && (
              <p className="text-primary-400 text-sm font-bold uppercase tracking-widest mb-2">{categoryName}</p>
            )}

            {/* Event Details */}
            <div className="flex items-center justify-center gap-4 text-xs text-dark-400 mb-2">
              <span>📅 {new Date(auction.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span>🕐 {auction.time}</span>
              <span>📍 {auction.venue}</span>
            </div>

            <div className="flex items-center justify-center gap-3 text-xs text-dark-500">
              <span>{teams.length} / {auction.totalTeams} Teams</span>
              <span>•</span>
              <span>{auction.playersPerTeam} Players/Team</span>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-8 h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />

          {/* Teams Grid */}
          <div className="p-6">
            <h2 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] text-center mb-5">Participating Teams</h2>
            <div className={`grid gap-4 ${
              teams.length <= 4 ? 'grid-cols-2' :
              teams.length <= 6 ? 'grid-cols-3' :
              'grid-cols-4'
            }`}>
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="bg-dark-800/80 border border-dark-700 rounded-xl p-4 text-center hover:border-primary-500/30 transition-colors"
                >
                  {/* Team Logo */}
                  <div className="w-16 h-16 mx-auto rounded-xl overflow-hidden bg-dark-700 border border-dark-600 flex items-center justify-center mb-3 shadow-md">
                    {team.logoUrl ? (
                      <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-primary-500">{team.name.charAt(0)}</span>
                    )}
                  </div>
                  {/* Team Name */}
                  <h3 className="text-xs font-bold text-white leading-tight mb-1 break-words">{team.name}</h3>
                  {/* Owner */}
                  <p className="text-[10px] text-dark-400 break-words">👤 {team.ownerName}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-2">
            <div className="mx-auto h-px bg-gradient-to-r from-transparent via-dark-600 to-transparent mb-4" />
            <div className="flex items-center justify-center gap-2 text-dark-600 text-[10px]">
              <Trophy className="w-3 h-3" />
              <span>AuctionHub • {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
