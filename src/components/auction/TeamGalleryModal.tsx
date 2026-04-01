import { useRef, useState } from 'react';
import { X, Share2, Download, Shield, Printer } from 'lucide-react';
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

  const handlePrintPdf = async () => {
    if (!galleryRef.current || !team) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(galleryRef.current, {
        backgroundColor: '#FFFFFF',
        scale: 2,
        useCORS: true,
      });

      const dataUrl = canvas.toDataURL('image/png');
      const printWindow = window.open('', '_blank', 'width=1200,height=900');
      if (!printWindow) return;

      printWindow.document.write(`
        <html>
          <head>
            <title>${team.name} Gallery</title>
            <style>
              body { margin: 0; padding: 16px; background: #fff; }
              img { width: 100%; height: auto; display: block; }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" alt="${team.name} Gallery" />
            <script>
              window.onload = function() {
                window.focus();
                window.print();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error('Failed to prepare print view', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-dark-900/90 backdrop-blur-md animate-fadeIn overflow-y-auto">
      {/* Scrollable Container */}
      <div className="relative w-full max-w-[1040px] mx-auto px-3 sm:px-4 py-3 sm:py-4 animate-slideUp">

        {/* Sticky Actions Strip */}
        <div className="sticky top-2 z-20 flex justify-end items-center gap-3 mb-3">
          <button
            onClick={handlePrintPdf}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent-500 hover:bg-accent-600 text-white shadow-lg transition-transform active:scale-95 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Print / Save as PDF"
          >
            <Printer className="w-4 h-4" />
            PDF Print
          </button>
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
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Gallery Capture Area */}
        <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
          <div 
            ref={galleryRef} 
            className="bg-white mx-auto relative px-4 sm:px-5 lg:px-6 py-5 sm:py-6"
            style={{ width: '100%', maxWidth: '900px', minHeight: '560px' }}
          >
            {/* Gallery Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-200 pb-5 mb-5 gap-4">
              {/* Left Side: Team Logo & Name */}
              <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                {team.logoUrl ? (
                  <img src={team.logoUrl} alt={team.name} className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 object-contain" />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex items-center justify-center bg-slate-100 rounded-2xl border-2 border-slate-200">
                    <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300" />
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight break-words" style={{ color: '#093153' }}>
                    {team.name}
                  </h1>
                  <p className="text-slate-500 font-bold mt-1.5 uppercase tracking-widest text-xs sm:text-sm">
                    Owner: <span className="text-slate-700">{team.ownerName}</span>
                  </p>
                </div>
              </div>
              
              {/* Right Side: Auction Details */}
              <div className="flex flex-col items-end text-right shrink-0">
                {auction.logoUrl && (
                  <img src={auction.logoUrl} alt={auction.name} className="h-14 sm:h-16 lg:h-20 object-contain mb-2 drop-shadow-sm" />
                )}
                <h2 className="text-base sm:text-lg lg:text-xl font-black text-slate-800 tracking-tight max-w-[300px] break-words">{auction.name}</h2>
                {auction.date && (
                  <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3 sm:gap-x-4 gap-y-4 sm:gap-y-5">
                {sortedPlayers.map(player => {
                  const linkedUser = player.userId ? allUsers.find(u => u.id === player.userId) : null;
                  const photoUrl = player.photoUrl || linkedUser?.photoUrl;
                  
                  return (
                    <div key={player.id} className="flex flex-col rounded-[10px] border border-slate-200 bg-slate-50 shadow-sm overflow-hidden transform transition-all hover:-translate-y-0.5 hover:shadow-md">
                      {/* Photo Area */}
                      <div className="w-full p-1.5 bg-gradient-to-b from-slate-100 to-slate-200">
                        <div className="w-full aspect-[7/8] rounded-lg overflow-hidden bg-slate-300 relative">
                          {photoUrl ? (
                            <img src={photoUrl} alt={player.name} className="w-full h-full object-cover object-center" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-slate-200 font-black text-5xl">?</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Combined Name + Role Banner */}
                      <div className="bg-white border-t border-slate-200 text-slate-800 text-center px-2 py-1.5 flex flex-col items-center justify-center rounded-b-[10px]">
                        <h3 className="font-extrabold text-[12px] leading-tight uppercase tracking-wide truncate w-full">
                          {player.name}
                        </h3>
                        <span className="font-bold text-[9px] leading-tight uppercase tracking-wider text-slate-500 truncate w-full mt-0.5">
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
