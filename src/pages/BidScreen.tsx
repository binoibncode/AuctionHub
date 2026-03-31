import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/db';
import { Auction, Team, Player } from '../types';
import {
  ArrowLeft, Zap, Users, DollarSign, TrendingUp,
  ChevronRight, Check, X, RotateCcw, Eye, ZoomIn, Info,
  ChevronDown, ChevronUp, Shield, Image
} from 'lucide-react';
import TeamRosterModal from '../components/auction/TeamRosterModal';
import TeamGalleryModal from '../components/auction/TeamGalleryModal';
import ImageModal from '../components/ui/ImageModal';

export default function BidScreen() {
  const { id } = useParams<{ id: string }>();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [currentBid, setCurrentBid] = useState(0);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [bidLog, setBidLog] = useState<{ playerName: string; teamName: string; price: number }[]>([]);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const [rosterTeam, setRosterTeam] = useState<Team | null>(null);
  const [galleryTeam, setGalleryTeam] = useState<Team | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [showAttributes, setShowAttributes] = useState(false);
  const [useRandomOrder, setUseRandomOrder] = useState(false);
  const [shuffledIds, setShuffledIds] = useState<string[] | null>(null);
  const categories = db.getCategories();
  const allUsers = db.getUsers();

  const loadData = () => {
    if (!id) return;
    const a = db.getAuction(id);
    setAuction(a || null);
    setTeams(db.getTeams(id));
    
    const players = db.getPlayers(id);
    setAllPlayers(players);
  };

  const generateRandomOrder = (availablePlayerIds: string[]) => {
    const ids = [...availablePlayerIds];
    // Fisher-Yates shuffle algorithm
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    setShuffledIds(ids);
  };

  const handleToggleShuffle = () => {
    const availableIds = allPlayers
      .filter(p => p.status === 'available')
      .map(p => p.id);

    if (!useRandomOrder) {
      // Switching to random order
      generateRandomOrder(availableIds);
      setUseRandomOrder(true);
      setCurrentPlayerIdx(0); // Reset to first player in random order
      showToast('🔀 Random order enabled', true);
    } else {
      // Switching back to price/name order
      setShuffledIds(null);
      setUseRandomOrder(false);
      setCurrentPlayerIdx(0); // Reset to first player in sorted order
      showToast('📋 Sorted order enabled', true);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  // Compute derived state (safe even when auction is null)
  const cat = auction ? categories.find(c => c.id === auction.categoryId) : null;
  const biddablePlayers = allPlayers
    .filter(p => p.status === 'available')
    .sort((a, b) => {
      if (useRandomOrder && shuffledIds) {
        // Use random order from shuffledIds
        const indexA = shuffledIds.indexOf(a.id);
        const indexB = shuffledIds.indexOf(b.id);
        return indexA - indexB;
      } else {
        // Deterministic order: first by base price, then by name
        if (a.basePrice !== b.basePrice) return a.basePrice - b.basePrice;
        return a.name.localeCompare(b.name);
      }
    });
  const soldPlayers = allPlayers.filter(p => p.status === 'sold');
  const currentPlayer = biddablePlayers[currentPlayerIdx] || null;

  // When currentPlayerIdx changes, init bid for the new player
  useEffect(() => {
    if (currentPlayer) {
      setCurrentBid(currentPlayer.basePrice);
      setSelectedTeamId(null);
    }
  }, [currentPlayerIdx, biddablePlayers.length]);

  if (!auction) return <div className="p-8 text-white">Auction not found.</div>;

  const showToast = (text: string, ok: boolean) => {
    setToast({ text, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const handleBidIncrease = (multiplier: number) => {
    setCurrentBid(prev => prev + auction.bidIncreaseBy * multiplier);
  };

  const handleTeamBid = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team || !currentPlayer) return;

    const balance = auction.pointsPerTeam - team.pointsSpent;
    const newBid = selectedTeamId === teamId
      ? currentBid + auction.bidIncreaseBy
      : currentBid;

    // Check basic balance
    if (newBid > balance) {
      showToast(`${team.name} doesn't have enough balance (₹${balance.toLocaleString()})`, false);
      return;
    }

    // Calculate maximum permissible bid
    const retainedPlayers = allPlayers.filter(p => (p.isIcon || p.isOwner) && p.soldToTeamId === team.id);
    const playersNeeded = auction.playersPerTeam - (team.players.length + retainedPlayers.length);
    const minBasePrice = Math.min(...biddablePlayers.map(p => p.basePrice));
    const maxPermissibleBid = balance - ((playersNeeded - 1) * minBasePrice);

    // Check against maximum permissible bid
    if (newBid > maxPermissibleBid) {
      showToast(`${team.name} cannot bid above ₹${maxPermissibleBid.toLocaleString()} (must reserve funds for remaining players)`, false);
      return;
    }

    setSelectedTeamId(teamId);
    if (selectedTeamId === teamId) {
      setCurrentBid(newBid);
    }
  };

  const handleSold = () => {
    if (!currentPlayer || !selectedTeamId) return;
    const result = db.purchasePlayer(currentPlayer.id, selectedTeamId, currentBid);
    if (result.success) {
      const team = teams.find(t => t.id === selectedTeamId);
      setBidLog(prev => [{
        playerName: currentPlayer.name,
        teamName: team?.name || '',
        price: currentBid,
      }, ...prev]);
      showToast(result.message, true);
      loadData();
      setShowAttributes(false);
      // Reset to first player after sale (since the list has changed)
      setCurrentPlayerIdx(0);
      setSelectedTeamId(null);
      // If in random mode, update shuffledIds to remove sold player
      if (useRandomOrder && shuffledIds) {
        const updatedShuffledIds = shuffledIds.filter(id => id !== currentPlayer.id);
        setShuffledIds(updatedShuffledIds);
      }    } else {
      showToast(result.message, false);
    }
  };

  const handleUnsold = () => {
    if (!currentPlayer) return;
    db.markPlayerUnsold(currentPlayer.id);
    showToast(`${currentPlayer.name} marked as unsold`, false);
    loadData();
    setShowAttributes(false);
    // Reset to first player after marking unsold
    setCurrentPlayerIdx(0);
    setSelectedTeamId(null);

    // If in random mode, regenerate shuffled order to include the unsold player
    if (useRandomOrder) {
      const availableIds = allPlayers
        .filter(p => p.status === 'available')
        .map(p => p.id);
      generateRandomOrder(availableIds);
    }
  };

  const handleNextPlayer = () => {
    if (biddablePlayers.length === 0) return;
    setCurrentPlayerIdx(prev => (prev + 1) % biddablePlayers.length);
    setSelectedTeamId(null);
    setShowAttributes(false);
  };

  const handleResetBid = () => {
    if (currentPlayer) {
      setCurrentBid(currentPlayer.basePrice);
      setSelectedTeamId(null);
    }
  };

  return (
    <div className="p-4 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Link to={`/organizer/auction/${id}`} className="text-dark-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            {auction.logoUrl && (
              <img src={auction.logoUrl} alt="Logo" className="w-12 h-12 object-cover rounded-lg border border-dark-600 shadow-xl" />
            )}
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 bg-red-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> LIVE
                </span>
                <span className="text-xs text-dark-400 font-medium">{cat?.icon} {cat?.name}</span>
              </div>
              <h1 className="text-2xl font-black text-white leading-tight">{auction.name}</h1>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="card px-3 py-1.5 text-center">
            <span className="text-dark-500 text-[10px] uppercase font-bold">Sold</span>
            <p className="text-primary-500 font-black">{soldPlayers.length}</p>
          </div>
          <div className="card px-3 py-1.5 text-center">
            <span className="text-dark-500 text-[10px] uppercase font-bold">Remaining</span>
            <p className="text-blue-400 font-black">{biddablePlayers.length}</p>
          </div>
          <button
            onClick={handleToggleShuffle}
            title={useRandomOrder ? 'Switch to sorted order' : 'Shuffle player order'}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all border flex items-center gap-1.5 ${
              useRandomOrder
                ? 'bg-orange-500/10 text-orange-400 border-orange-500/30 hover:bg-orange-500/20'
                : 'bg-dark-700 text-dark-400 border-dark-600 hover:bg-dark-600'
            }`}
          >
            {useRandomOrder ? '🔀' : '📋'} {useRandomOrder ? 'Random' : 'Sorted'}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg font-bold text-sm shadow-xl animate-pulse ${
          toast.ok ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.text}
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        {/* ═══════════ LEFT — CURRENT PLAYER ═══════════ */}
        <div className="col-span-12 lg:col-span-4">
          <div className="card p-6">
            {biddablePlayers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-xl font-black text-white mb-2">All Players Auctioned!</h2>
                <p className="text-dark-400">No more players remaining in the pool.</p>
              </div>
            ) : currentPlayer ? (
              <>
                <div className="text-center mb-4">
                  <div className="w-48 h-48 rounded-full mx-auto flex items-center justify-center text-5xl font-black text-white mb-4 overflow-hidden border-[6px] border-dark-700 shadow-2xl bg-dark-600">
                    {(() => {
                      const linkedUser = currentPlayer.userId ? allUsers.find(u => u.id === currentPlayer.userId) : null;
                      const photoUrl = currentPlayer.photoUrl || linkedUser?.photoUrl;
                      return photoUrl ? (
                         <button onClick={() => setEnlargedImage(photoUrl)} className="w-full h-full relative group block cursor-pointer bg-dark-800" title="View Photo">
                           <img src={photoUrl} alt={currentPlayer.name} className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-dark-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <ZoomIn className="w-8 h-8 text-white" />
                           </div>
                         </button>
                      ) : (
                         <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                           {currentPlayer.name.charAt(0)}
                         </div>
                      );
                    })()}
                  </div>
                  <h2 className="text-3xl font-black text-white">{currentPlayer.name}</h2>
                  <p className="text-dark-400 text-sm mt-1 mb-3">{currentPlayer.role} {currentPlayer.playerTag ? `• ${currentPlayer.playerTag}` : ''}</p>
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex items-center gap-1.5 bg-dark-800 border border-dark-700 px-4 py-1.5 rounded-full">
                      <DollarSign className="w-4 h-4 text-dark-400" />
                      <span className="text-dark-300 text-sm">Base: <span className="text-white font-bold">₹{currentPlayer.basePrice.toLocaleString()}</span></span>
                    </div>
                    <button 
                      onClick={() => setShowAttributes(!showAttributes)}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold transition-all border ${showAttributes ? 'bg-primary-500 text-white border-primary-500' : 'bg-primary-500/10 hover:bg-primary-500/20 text-primary-500 border-primary-500/20'}`}
                    >
                      <Info className="w-4 h-4" /> Attributes {showAttributes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Inline Attributes HTML Card view */}
                  {showAttributes && (
                    <div className="bg-dark-900 border border-dark-700 rounded-xl p-4 mt-4 text-left space-y-3 animate-fadeIn shadow-2xl">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                        <div>
                          <span className="text-dark-500 text-[10px] uppercase font-bold tracking-wider block mb-0.5">Category</span>
                          <span className="text-white font-medium">{currentPlayer.category || '—'}</span>
                        </div>
                        <div>
                          <span className="text-dark-500 text-[10px] uppercase font-bold tracking-wider block mb-0.5">Specification</span>
                          <span className="text-white font-medium">{currentPlayer.specification || '—'}</span>
                        </div>
                        <div>
                          <span className="text-dark-500 text-[10px] uppercase font-bold tracking-wider block mb-0.5">Skill</span>
                          <span className="text-white font-medium">{currentPlayer.skill || '—'}</span>
                        </div>
                        <div>
                          <span className="text-dark-500 text-[10px] uppercase font-bold tracking-wider block mb-0.5">Age</span>
                          <span className="text-white font-medium">{currentPlayer.age || '—'}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-dark-500 text-[10px] uppercase font-bold tracking-wider block mb-0.5">Father's Name</span>
                          <span className="text-white font-medium">{currentPlayer.fatherName || '—'}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-dark-500 text-[10px] uppercase font-bold tracking-wider block mb-0.5">Measurements</span>
                          <span className="text-white font-medium">Jersey: {currentPlayer.jerseySize || '—'} {currentPlayer.jerseyNumber ? `#${currentPlayer.jerseyNumber}` : ''} | Trouser: {currentPlayer.trouserSize || '—'}</span>
                        </div>
                        {currentPlayer.extraDetails && (
                          <div className="col-span-2 pt-2 border-t border-dark-700">
                            <span className="text-dark-500 text-[10px] uppercase font-bold tracking-wider block mb-1">Notes</span>
                            <span className="text-dark-300 font-medium text-xs leading-relaxed">{currentPlayer.extraDetails}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Current Bid */}
                <div className="bg-dark-800 rounded-xl p-4 text-center mb-4">
                  <p className="text-dark-500 text-xs uppercase font-bold tracking-wider mb-1">Current Bid</p>
                  <p className="text-4xl font-black text-primary-500">
                    ₹{currentBid.toLocaleString()}
                  </p>
                  {selectedTeamId && (
                    <p className="text-sm text-accent-500 font-bold mt-1">
                      → {teams.find(t => t.id === selectedTeamId)?.name}
                    </p>
                  )}
                </div>

                {/* Bid Increment Buttons */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[1, 2, 5].map(m => (
                    <button
                      key={m}
                      onClick={() => handleBidIncrease(m)}
                      className="bg-dark-700 hover:bg-dark-600 text-white py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-1"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                      +₹{(auction.bidIncreaseBy * m).toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={handleSold}
                    disabled={!selectedTeamId}
                    className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-black text-lg rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Check className="w-5 h-5" /> SOLD!
                  </button>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={handleUnsold}
                      className="py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Unsold
                    </button>
                    <button
                      onClick={handleResetBid}
                      className="py-2 bg-dark-700 hover:bg-dark-600 text-dark-400 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset
                    </button>
                    <button
                      onClick={handleNextPlayer}
                      className="py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Player Queue Preview */}
                <div className="mt-4 pt-4 border-t border-dark-700">
                  <p className="text-dark-500 text-xs uppercase font-bold mb-2">Up Next</p>
                  <div className="space-y-1.5">
                    {biddablePlayers.slice(currentPlayerIdx + 1, currentPlayerIdx + 4).map(p => (
                      <div key={p.id} className="flex items-center justify-between text-sm">
                        <span className="text-dark-400">{p.name}</span>
                        <span className="text-dark-500 text-xs">₹{p.basePrice.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* ═══════════ CENTER — TEAM BALANCE BOARD ═══════════ */}
        <div className="col-span-12 lg:col-span-5">
          <div className="mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white">Team Balance Board</h2>
            <span className="text-xs text-dark-500 ml-auto">Click a team to place bid</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {teams.map(team => {
              const balance = auction.pointsPerTeam - team.pointsSpent;
              const usedPct = (team.pointsSpent / auction.pointsPerTeam) * 100;
              const isSelected = selectedTeamId === team.id;
              const canAfford = balance >= currentBid;
              const retainedPlayers = allPlayers.filter(p => (p.isIcon || p.isOwner) && p.soldToTeamId === team.id);

              return (
                <button
                  key={team.id}
                  onClick={() => handleTeamBid(team.id)}
                  disabled={!currentPlayer || !canAfford}
                  className={`card p-4 text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-primary-500 ring-2 ring-primary-500/30 bg-primary-500/5'
                      : canAfford
                        ? 'hover:border-dark-500 cursor-pointer'
                        : 'opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    {/* Team Logo */}
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 overflow-hidden ${isSelected ? 'bg-primary-500/20 border border-primary-500/50' : 'bg-dark-800 border border-dark-600'}`}>
                      {team.logoUrl ? (
                        <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
                      ) : (
                        <Shield className={`w-4 h-4 ${isSelected ? 'text-primary-500' : 'text-dark-500'}`} />
                      )}
                    </div>
                    
                    <h3 className={`font-bold flex-1 truncate ${isSelected ? 'text-primary-500' : 'text-white'}`}>
                      {team.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setGalleryTeam(team);
                        }}
                        className="p-1.5 rounded-md bg-dark-800 hover:bg-dark-600 text-dark-400 hover:text-accent-500 transition-colors"
                        title="Photo Gallery"
                      >
                        <Image className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRosterTeam(team);
                        }}
                        className="p-1.5 rounded-md bg-dark-800 hover:bg-dark-600 text-dark-400 hover:text-white transition-colors"
                        title="View Roster"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {isSelected && <Zap className="w-4 h-4 text-primary-500 shrink-0" />}
                  </div>
                  <p className="text-xs text-dark-500 mb-2">Owner: {team.ownerName}</p>

                  {/* Retained Players */}
                  {retainedPlayers.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {retainedPlayers.map(rp => (
                        <span key={rp.id} className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-purple-500/10 text-purple-400">
                          {rp.isIcon ? '👑' : '🏷️'} {rp.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Balance */}
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-dark-500">
                      Spent: <span className="text-accent-500 font-bold">₹{team.pointsSpent.toLocaleString()}</span>
                    </span>
                    <span className={`font-bold ${balance < auction.minimumBid ? 'text-red-500' : 'text-primary-500'}`}>
                      ₹{balance.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-1.5 mb-2">
                    <div
                      className={`h-1.5 rounded-full transition-all ${usedPct > 80 ? 'bg-red-500' : usedPct > 50 ? 'bg-accent-500' : 'bg-primary-500'}`}
                      style={{ width: `${Math.min(usedPct, 100)}%` }}
                    />
                  </div>

                  {/* Squad Info */}
                  <div className="flex justify-between text-[10px] text-dark-500">
                    <span>Players: {team.players.length + retainedPlayers.length}/{auction.playersPerTeam}</span>
                    <span>Bought: {team.players.length}</span>
                  </div>

                  {/* Maximum Bid Calculation */}
                  {currentPlayer && (() => {
                    const remainingBudget = auction.pointsPerTeam - team.pointsSpent;
                    const playersNeeded = auction.playersPerTeam - (team.players.length + retainedPlayers.length);
                    const minBasePrice = Math.min(...biddablePlayers.map(p => p.basePrice));
                    const maxBid = remainingBudget - ((playersNeeded - 1) * minBasePrice);
                    const canAffordMaxBid = maxBid >= currentPlayer.basePrice;

                    return (
                      <div className="mt-2 pt-2 border-t border-dark-700">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-dark-500">Max Bid:</span>
                          <span className={`font-bold ${canAffordMaxBid ? 'text-green-400' : 'text-red-400'}`}>
                            ₹{Math.max(0, maxBid).toLocaleString()}
                          </span>
                        </div>
                        {maxBid < currentPlayer.basePrice && (
                          <div className="text-[9px] text-red-400 mt-1">
                            Can't afford base price
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══════════ RIGHT — SOLD LOG ═══════════ */}
        <div className="col-span-12 lg:col-span-3">
          <div className="mb-3 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-bold text-white">Sold Log</h2>
            <span className="text-xs font-bold text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-full ml-auto">
              {soldPlayers.length}
            </span>
          </div>

          <div className="card p-3 max-h-[calc(100vh-200px)] overflow-y-auto">
            {soldPlayers.length === 0 && bidLog.length === 0 ? (
              <div className="text-center py-8 text-dark-500 text-sm">
                No players sold yet.
              </div>
            ) : (
              <div className="space-y-2">
                {/* Show bid log first (current session) */}
                {bidLog.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-dark-800 rounded-lg">
                    <div>
                      <p className="text-white font-bold text-sm">{entry.playerName}</p>
                      <p className="text-dark-500 text-xs">→ {entry.teamName}</p>
                    </div>
                    <span className="text-primary-500 font-black text-sm">₹{entry.price.toLocaleString()}</span>
                  </div>
                ))}
                {/* Also show pre-existing sold players not in bid log */}
                {soldPlayers
                  .filter(p => !bidLog.find(b => b.playerName === p.name))
                  .map(p => {
                    const team = teams.find(t => t.id === p.soldToTeamId);
                    return (
                      <div key={p.id} className="flex items-center justify-between p-2 bg-dark-800 rounded-lg opacity-60">
                        <div>
                          <p className="text-white font-bold text-sm">{p.name}</p>
                          <p className="text-dark-500 text-xs">→ {team?.name}</p>
                        </div>
                        <span className="text-primary-500 font-black text-sm">₹{p.soldPrice?.toLocaleString()}</span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>

      <TeamRosterModal 
        isOpen={!!rosterTeam} 
        onClose={() => setRosterTeam(null)} 
        team={rosterTeam ? teams.find(t => t.id === rosterTeam.id) || rosterTeam : null} 
        onPlayerUpdate={loadData}
      />

      <TeamGalleryModal
        isOpen={!!galleryTeam}
        onClose={() => setGalleryTeam(null)}
        team={galleryTeam ? teams.find(t => t.id === galleryTeam.id) || galleryTeam : null}
        auction={auction}
      />

      <ImageModal 
        isOpen={!!enlargedImage} 
        onClose={() => setEnlargedImage(null)} 
        imageUrl={enlargedImage} 
        altText={currentPlayer?.name || "Player Photo"} 
      />
    </div>
  );
}
