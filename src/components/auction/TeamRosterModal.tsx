import { useState, useRef } from 'react';
import { X, User as UserIcon, Edit2, ZoomIn, Share2, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Team, Player } from '../../types';
import { db } from '../../services/db';
import EditPlayerModal from './EditPlayerModal';
import ImageModal from '../ui/ImageModal';

interface TeamRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  onPlayerUpdate?: () => void;
  readOnly?: boolean;
  hidePoints?: boolean;
}

export default function TeamRosterModal({
  isOpen,
  onClose,
  team,
  onPlayerUpdate,
  readOnly = false,
  hidePoints = false,
}: TeamRosterModalProps) {
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const rosterRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!rosterRef.current || !team) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(rosterRef.current, {
        backgroundColor: '#1E2330', // dark-800
        scale: 2,
        useCORS: true,
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      const blob = await (await fetch(dataUrl)).blob();
      const filename = `${team.name.replace(/\s+/g, '-').toLowerCase()}-roster.png`;
      const file = new File([blob], filename, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${team.name} Roster`,
          text: `Check out the team roster for ${team.name}!`,
        });
      } else {
        const link = document.createElement('a');
        link.download = file.name;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Failed to export roster', err);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen || !team) return null;

  // Get all users to fetch photos
  const allUsers = db.getUsers();
  
  // Get players in this team
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-dark-900/80 backdrop-blur-sm animate-fadeIn">
      <div ref={rosterRef} className="bg-dark-800 rounded-xl w-full max-w-5xl shadow-2xl border border-dark-700 flex flex-col max-h-[90vh] animate-slideUp">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-dark-700">
          <div>
            <h2 className="text-2xl font-black text-white">{team.name}</h2>
            <p className="text-dark-400 text-sm mt-1">Owner: {team.ownerName} • Total Players: {team.players.length}</p>
          </div>
          <div data-html2canvas-ignore className="flex items-center gap-2">
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500/10 text-primary-500 hover:bg-primary-500/20 transition-colors font-bold text-sm disabled:opacity-50"
              title="Share or Download Roster"
            >
              {isExporting ? <Download className="w-4 h-4 animate-bounce" /> : <Share2 className="w-4 h-4" />}
              {isExporting ? 'Exporting...' : 'Share'}
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-dark-700 transition-colors text-dark-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          {sortedPlayers.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block p-4 rounded-full bg-dark-700 mb-4">
                <UserIcon className="w-8 h-8 text-dark-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">No Players Yet</h3>
              <p className="text-dark-400">This team hasn't purchased any players.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-dark-700">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-primary-600 text-white text-sm uppercase tracking-wider">
                    <th className="p-4 font-black">Photo</th>
                    <th className="p-4 font-black">Player Name</th>
                    <th className="p-4 font-black">Age</th>
                    <th className="p-4 font-black">Player Type</th>
                    <th className="p-4 font-black">Role</th>
                    {!hidePoints && <th className="p-4 font-black text-right">Points</th>}
                    {!readOnly && <th data-html2canvas-ignore className="p-4 font-black text-center">Edit</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700 bg-dark-800/50">
                  {sortedPlayers.map((player) => {
                    const linkedUser = player.userId ? allUsers.find(u => u.id === player.userId) : null;
                    const photoUrl = player.photoUrl || linkedUser?.photoUrl;
                    
                    // Determine display tag
                    let displayTag = player.playerTag || 'PLAYER';
                    if (player.isIcon) displayTag = 'ICON';
                    if (player.isOwner) displayTag = 'OWNER';

                    return (
                      <tr key={player.id} className="hover:bg-dark-700 transition-colors">
                        <td className="p-4">
                          <div className="w-12 h-12 rounded-full bg-dark-600 overflow-hidden flex items-center justify-center border-2 border-dark-700">
                            {photoUrl ? (
                              <button onClick={() => setEnlargedImage(photoUrl)} className="w-full h-full relative group block" title="View Photo">
                                <img src={photoUrl} alt={player.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-dark-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <ZoomIn className="w-4 h-4 text-white" />
                                </div>
                              </button>
                            ) : (
                              <UserIcon className="w-6 h-6 text-dark-400" />
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-white text-lg">{player.name}</div>
                          {player.fatherName && (
                            <div className="text-xs text-dark-400 mt-1">S/o: {player.fatherName}</div>
                          )}
                        </td>
                        <td className="p-4 text-dark-300 font-medium">
                          {player.age ? `${player.age}` : '-'}
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-3 py-1 text-xs font-black uppercase rounded-full ${
                            displayTag === 'ICON' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                            displayTag === 'OWNER' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                            displayTag === 'CAPTAIN' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            'bg-dark-600 text-dark-300 font-bold'
                          }`}>
                            {displayTag}
                          </span>
                        </td>
                        <td className="p-4 text-dark-300 font-medium">
                          {player.role || player.category || '-'}
                        </td>
                        {!hidePoints && (
                          <td className="p-4 text-right font-black text-xl text-primary-400">
                            {player.soldPrice?.toLocaleString() || '0'}
                          </td>
                        )}
                        {!readOnly && (
                          <td data-html2canvas-ignore className="p-4 text-center">
                            <button
                              onClick={() => setEditingPlayer(player)}
                              className="p-2 rounded-md bg-dark-700 hover:bg-primary-500/20 text-dark-400 hover:text-primary-500 transition-colors"
                              title="Edit Player"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-dark-900 border-t border-dark-700 flex justify-end rounded-b-xl">
          <div className="flex items-center gap-6 mr-6">
            {!hidePoints && (
              <div className="text-right">
                <span className="text-xs text-dark-400 uppercase font-bold block mb-1">Total Spent</span>
                <span className="text-lg font-black text-white">₹{team.pointsSpent.toLocaleString()}</span>
              </div>
            )}
            <button data-html2canvas-ignore onClick={onClose} className="btn-primary py-2 px-6">Close</button>
          </div>
        </div>
      </div>

      {!readOnly && (
        <EditPlayerModal
          isOpen={!!editingPlayer}
          onClose={() => setEditingPlayer(null)}
          player={editingPlayer}
          onSave={(updatedPlayer) => {
            db.savePlayer(updatedPlayer);
            
            const auctionPlayers = db.getPlayers(updatedPlayer.auctionId);
            const idx = auctionPlayers.findIndex(p => p.id === updatedPlayer.id);
            if (idx !== -1) auctionPlayers[idx] = updatedPlayer;
            
            const teamSpent = auctionPlayers
              .filter(p => p.soldToTeamId === team.id && p.status === 'sold')
              .reduce((sum, p) => sum + (p.soldPrice || 0), 0);
            
            const t = db.getTeam(team.id);
            if (t) {
              db.saveTeam({ ...t, pointsSpent: teamSpent });
            }

            setEditingPlayer(null);
            if (onPlayerUpdate) onPlayerUpdate();
          }}
        />
      )}

      <ImageModal 
        isOpen={!!enlargedImage} 
        onClose={() => setEnlargedImage(null)} 
        imageUrl={enlargedImage} 
        altText="Player Photo" 
      />
    </div>
  );
}
