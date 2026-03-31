import { useRef, useState } from 'react';
import { X, Share2, Download, Shield } from 'lucide-react';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { Team, Auction } from '../../types';
import { db } from '../../services/db';

interface TeamGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  auction: Auction | null;
}

export default function TeamGalleryModal({ isOpen, onClose, team, auction }: TeamGalleryModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !team || !auction) return null;

  // Fetch players for the team
  const allUsers = db.getUsers();
  const auctionPlayers = db.getPlayers(team.auctionId);
  const teamPlayers = auctionPlayers.filter(p => p.soldToTeamId === team.id);

  // Sort players - Owner first, then Icon, then the rest by price
  const sortedPlayers = [...teamPlayers].sort((a, b) => {
    if (a.isOwner) return -1;
    if (b.isOwner) return 1;
    if (a.isIcon) return -1;
    if (b.isIcon) return 1;
    return (b.soldPrice || 0) - (a.soldPrice || 0);
  });

  const handleExport = async () => {
    if (!galleryRef.current || !team) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(galleryRef.current, {
        backgroundColor: '#FFFFFF', // White background
        scale: 2,
        useCORS: true,
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      const blob = await (await fetch(dataUrl)).blob();
      const filename = `${team.name.replace(/\s+/g, '-').toLowerCase()}-gallery.png`;
      const file = new File([blob], filename, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${team.name} Photo Gallery`,
          text: `Check out the team photo gallery for ${team.name}!`,
        });
      } else {
        const link = document.createElement('a');
        link.download = file.name;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Failed to export gallery', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-dark-900/90 backdrop-blur-md animate-fadeIn overflow-y-auto">
      {/* Scrollable Container */}
      <div className="relative w-full max-w-[1040px] shadow-2xl animate-slideUp my-auto">
        
        {/* Floating Actions Strip */}
        <div className="absolute -top-14 right-0 flex items-center gap-3">
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-lg transition-transform active:scale-95 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export Image"
          >
            {isExporting ? <Download className="w-4 h-4 animate-bounce" /> : <Share2 className="w-4 h-4" />}
            {isExporting ? 'Generating Image...' : 'Export Gallery'}
          </button>
          <button 
            onClick={onClose}
            className="p-2.5 rounded-full bg-dark-800 hover:bg-dark-700 border border-dark-600 shadow-lg text-dark-300 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Gallery Capture Area */}
        <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
          <div 
            ref={galleryRef} 
            className="bg-white mx-auto relative px-8 py-10" 
            style={{ width: '1000px', minHeight: '800px' }}
          >
            {/* Gallery Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-200 pb-8 mb-8">
              {/* Left Side: Team Logo & Name */}
              <div className="flex items-center gap-6">
                {team.logoUrl ? (
                  <img src={team.logoUrl} alt={team.name} className="w-32 h-32 object-contain" />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center bg-slate-100 rounded-2xl border-2 border-slate-200">
                    <Shield className="w-16 h-16 text-slate-300" />
                  </div>
                )}
                <div>
                  <h1 className="text-5xl font-black uppercase tracking-tighter" style={{ color: '#093153' }}>
                    {team.name}
                  </h1>
                  <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-sm">
                    Owner: <span className="text-slate-700">{team.ownerName}</span>
                  </p>
                </div>
              </div>
              
              {/* Right Side: Auction Details */}
              <div className="flex flex-col items-end text-right">
                {auction.logoUrl && (
                  <img src={auction.logoUrl} alt={auction.name} className="h-28 object-contain mb-3 drop-shadow-sm" />
                )}
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{auction.name}</h2>
                {auction.date && (
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">
                    {format(new Date(auction.date), 'MMMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>

            {/* Gallery Empty State */}
            {sortedPlayers.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-slate-400 text-xl font-bold">No players assigned to this team yet.</p>
              </div>
            ) : (
              /* Player Grid */
              <div className="grid grid-cols-4 gap-x-6 gap-y-8">
                {sortedPlayers.map(player => {
                  const linkedUser = player.userId ? allUsers.find(u => u.id === player.userId) : null;
                  const photoUrl = player.photoUrl || linkedUser?.photoUrl;
                  
                  return (
                    <div key={player.id} className="flex flex-col border border-slate-200 shadow-md bg-white overflow-hidden transform transition-transform hover:-translate-y-1">
                      {/* Photo Area (3:4 aspect ratio) */}
                      <div className="w-full aspect-[3/4] bg-slate-100 relative group">
                        {photoUrl ? (
                          <img src={photoUrl} alt={player.name} className="w-full h-full object-cover object-top" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-slate-300 font-black text-6xl">?</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Name Banner - Solid Blue matching the reference UI */}
                      <div className="bg-[#026cb6] text-white text-center py-2.5 px-2 flex items-center justify-center min-h-[44px]">
                        <h3 className="font-bold text-[15px] leading-tight truncate uppercase tracking-widest">
                          {player.name}
                        </h3>
                      </div>
                      
                      {/* Role Banner - Light Blue/Gray matching reference UI */}
                      <div className="bg-[#e2f1f8] text-slate-800 text-center py-2 px-2 border-t border-white/20 flex items-center justify-center min-h-[36px]">
                        <span className="font-bold text-xs uppercase tracking-wide truncate">
                          {player.role || player.category || 'PLAYER'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
