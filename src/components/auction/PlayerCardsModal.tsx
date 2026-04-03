import { useRef, useState } from 'react';
import { X, Search, Printer, User as UserIcon, Shield } from 'lucide-react';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { Auction, Player } from '../../types';
import { SPORT_CATEGORIES } from '../../constants/sports';

interface PlayerCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  auction: Auction | null;
  players: Player[];
}

export default function PlayerCardsModal({ isOpen, onClose, auction, players }: PlayerCardsModalProps) {
  const [search, setSearch] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // All hooks above this line — then the guard
  if (!isOpen || !auction) return null;

  const categories = SPORT_CATEGORIES;
  const cat = categories.find(c => c.id === auction.categoryId);

  // Compute filtered players inline (no hook needed)
  const q = search.trim().toLowerCase();
  const filteredPlayers = [...players]
    .filter(p => !q || p.name.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name));
  const cardsPerPage = 8;
  const pages: Player[][] = [];
  for (let i = 0; i < filteredPlayers.length; i += cardsPerPage) {
    pages.push(filteredPlayers.slice(i, i + cardsPerPage));
  }

  const getCardDetails = (player: Player) => {
    const sport = (cat?.name || '').toLowerCase();
    if (sport.includes('cricket')) {
      return [
        { label: 'ROLE / CATEGORY', value: player.role || player.category || '-' },
        { label: 'PLACE', value: player.extraDetails || '-' },
        { label: 'SKILL', value: player.skill || '-' },
        { label: 'CONTACT', value: '-' },
      ];
    }
    if (sport.includes('football')) {
      return [
        { label: 'POSITION', value: player.role || '-' },
        { label: 'PLACE', value: player.extraDetails || '-' },
        { label: 'SKILL', value: player.skill || '-' },
        { label: 'CONTACT', value: '-' },
      ];
    }
    return [
      { label: 'ROLE / CATEGORY', value: player.role || player.category || '-' },
      { label: 'PLACE', value: player.extraDetails || '-' },
      { label: 'SKILL', value: player.skill || '-' },
      { label: 'CONTACT', value: '-' },
    ];
  };

  const handlePrintPdf = async () => {
    if (!printAreaRef.current) return;
    setIsPrinting(true);
    try {
      const canvas = await html2canvas(printAreaRef.current, {
        backgroundColor: '#f8fafc',
        scale: 2,
        useCORS: true,
        windowWidth: printAreaRef.current.scrollWidth,
        windowHeight: printAreaRef.current.scrollHeight,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      const imgW = canvas.width / 2;
      const imgH = canvas.height / 2;
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${auction.name} – Player Cards</title>
            <style>
              @page { margin: 0; size: A4; }
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { background: #fff; }
              img { display: block; width: 100%; height: auto; }
            </style>
          </head>
          <body>
            <img src="${imgData}" width="${imgW}" height="${imgH}" />
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
      console.error('Failed to generate PDF', err);
    } finally {
      setIsPrinting(false);
    }
  };

  const playerSerial = (pageIdx: number, cardIdx: number) => pageIdx * cardsPerPage + cardIdx + 1;

  return (
    <div className="fixed inset-0 z-[70] bg-dark-900/90 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-[900px] mx-auto px-3 sm:px-4 py-4 animate-slideUp">

        {/* ── Top Action Bar ── */}
        <div className="sticky top-2 z-20 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search player by name…"
              className="w-full pl-9 pr-4 py-2.5 rounded-full bg-dark-800 border border-dark-600 text-white placeholder:text-dark-500 text-sm font-medium focus:outline-none focus:border-primary-500 shadow-lg"
            />
          </div>
          {/* PDF Button */}
          <button
            onClick={handlePrintPdf}
            disabled={isPrinting || filteredPlayers.length === 0}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-accent-500 hover:bg-accent-600 text-white shadow-lg font-bold text-sm transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Printer className="w-4 h-4" />
            {isPrinting ? 'Generating…' : 'PDF Print'}
          </button>
          {/* Close */}
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-dark-800 hover:bg-dark-700 border border-dark-600 text-dark-300 hover:text-white shadow-lg transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Printable Area ── */}
        <div ref={printAreaRef} className="bg-slate-100 rounded-xl overflow-hidden shadow-2xl p-4 sm:p-6" style={{ fontFamily: 'sans-serif' }}>

          {/* Document Header */}
          <div className="flex items-center gap-3 border-b-2 border-slate-300 pb-4 mb-6">
            {auction.logoUrl ? (
              <img src={auction.logoUrl} alt={auction.name} className="h-12 w-12 object-contain shrink-0" />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-slate-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900 truncate">
                {auction.name} – Players List
              </h1>
              <p className="text-xs text-slate-500 font-semibold mt-0.5 truncate">
                {auction.venue && <span>Venue : {auction.venue}&#44;&nbsp;</span>}
                {auction.date && <span>date {format(new Date(auction.date), 'dd/MM/yyyy')}</span>}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <span className="text-xs font-bold text-slate-500 uppercase">Total Players</span>
              <p className="text-2xl font-black text-slate-800">{filteredPlayers.length}</p>
            </div>
          </div>

          {/* Pages */}
          {filteredPlayers.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-bold text-lg">No players found.</div>
          ) : (
            pages.map((pagePlayers, pageIdx) => (
              <div
                key={pageIdx}
                className="grid grid-cols-4 gap-3 sm:gap-4 mb-6 last:mb-0"
                style={{ pageBreakAfter: 'always' }}
              >
                {pagePlayers.map((player, cardIdx) => {
                  const photoUrl = player.photoUrl;
                  const serial = playerSerial(pageIdx, cardIdx);
                  const details = getCardDetails(player);

                  return (
                    <div
                      key={player.id}
                      className="bg-[#0f172a] rounded-xl overflow-hidden shadow-lg border border-slate-700 flex flex-col"
                    >
                      {/* Card Top Bar */}
                      <div className="flex items-center justify-between px-2 py-1.5 bg-[#1e293b] border-b border-slate-600">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {auction.logoUrl ? (
                            <img src={auction.logoUrl} alt="" className="h-5 w-5 object-contain shrink-0" />
                          ) : (
                            <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-[8px] font-black text-white uppercase tracking-wide leading-tight truncate">
                              {auction.name}
                            </p>
                            {auction.date && (
                              <p className="text-[7px] text-slate-400 font-semibold leading-tight">
                                {format(new Date(auction.date), 'MMM d, yyyy')}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="shrink-0 ml-1 bg-[#84CC16] text-black text-[9px] font-black rounded px-1 py-0.5 leading-none">
                          {serial}
                        </span>
                      </div>

                      {/* Photo — 3.5cm × 4.5cm ≈ aspect ratio 7:9 */}
                      <div className="relative w-full aspect-[7/9] bg-slate-800 overflow-hidden">
                        {photoUrl ? (
                          <img src={photoUrl} alt={player.name} className="w-full h-full object-cover object-top" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <UserIcon className="w-10 h-10 text-slate-600" />
                          </div>
                        )}
                        {/* Second reference badge */}
                        {player.secondReferenceUrl && (
                          <img
                            src={player.secondReferenceUrl}
                            alt="ref"
                            className="absolute bottom-2 right-2 w-8 h-10 object-cover rounded border border-slate-500 shadow"
                          />
                        )}
                        {/* Status strip */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 pt-4 pb-1">
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
                            <span className="w-2 h-2 rounded-full bg-green-400 inline-block opacity-60"></span>
                          </div>
                        </div>
                      </div>

                      {/* Player Name */}
                      <div className="px-2 pt-1.5 pb-1 bg-[#0f172a]">
                        <h2 className="text-white font-black text-[11px] sm:text-[13px] leading-tight uppercase tracking-tight">
                          {player.name}
                        </h2>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-px bg-slate-700 border-t border-slate-700">
                        {details.map((d, i) => (
                          <div key={i} className="bg-[#1e293b] px-1.5 py-1">
                            <p className="text-[6px] text-slate-400 uppercase font-black tracking-widest leading-none mb-0.5">{d.label}</p>
                            <p className="text-[9px] text-[#84CC16] font-bold leading-tight truncate">{d.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
