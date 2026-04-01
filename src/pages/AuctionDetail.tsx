import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Auction, Team, Player } from '../types';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import {
  ArrowLeft, Calendar, Clock, MapPin, Hash,
  DollarSign, TrendingUp, Users, UserPlus,
  Plus, Trash2, Check, X, Zap, Shield,
  Copy, ExternalLink, Play, Eye, Edit2,
  User as UserIcon, ZoomIn, Camera, Trophy, Image
} from 'lucide-react';
import TeamRosterModal from '../components/auction/TeamRosterModal';
import TeamGalleryModal from '../components/auction/TeamGalleryModal';
import EditPlayerModal from '../components/auction/EditPlayerModal';
import PaymentModal from '../components/auction/PaymentModal';
import ImageModal from '../components/ui/ImageModal';
import TeamPosterModal from '../components/auction/TeamPosterModal';
import { compressImage } from '../utils/image';

const SPORT_ROLE_OPTIONS: Record<string, string[]> = {
  cricket: ['Batsman', 'Bowler', 'All Rounder', 'Wicket Keeper'],
  football: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'],
  nba: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'],
  tennis: ['Singles', 'Doubles', 'All Court Player'],
  volleyball: ['Setter', 'Outside Hitter', 'Opposite', 'Middle Blocker', 'Libero'],
  badminton: ['Singles', 'Doubles', 'Mixed Doubles'],
  kabadi: ['Raider', 'Defender', 'All Rounder'],
};

const getSportType = (sportName?: string) => {
  const name = (sportName || '').toLowerCase();
  if (name.includes('football')) return 'football';
  if (name.includes('nba') || name.includes('basketball')) return 'nba';
  if (name.includes('tennis')) return 'tennis';
  if (name.includes('volleyball')) return 'volleyball';
  if (name.includes('badminton')) return 'badminton';
  if (name.includes('kabadi') || name.includes('kabaddi')) return 'kabadi';
  return 'cricket';
};

const getRoleOptionsBySport = (sportName?: string) => {
  return SPORT_ROLE_OPTIONS[getSportType(sportName)] || SPORT_ROLE_OPTIONS.cricket;
};

export default function AuctionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const categories = db.getCategories();

  // Add Team form
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [teamLogo, setTeamLogo] = useState('');
  const [isOwnerPlaying, setIsOwnerPlaying] = useState(false);
  const [teamPlace, setTeamPlace] = useState('');
  // Edit Team form
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editTeamName, setEditTeamName] = useState('');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editTeamPlace, setEditTeamPlace] = useState('');
  const [rosterTeam, setRosterTeam] = useState<Team | null>(null);
  const [galleryTeam, setGalleryTeam] = useState<Team | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [showTeamPoster, setShowTeamPoster] = useState(false);
  const allUsers = db.getUsers();

  // Add Player form
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerRole, setPlayerRole] = useState('');
  const [playerBasePrice, setPlayerBasePrice] = useState(0);

  // Toast
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = () => {
    if (!id) return;
    const a = db.getAuction(id);
    setAuction(a || null);
    setTeams(db.getTeams(id));
    setPlayers(db.getPlayers(id));
  };

  if (!auction) return <div className="p-8 text-white">Auction not found.</div>;

  const cat = categories.find(c => c.id === auction.categoryId);
  const playerRoleOptions = getRoleOptionsBySport(cat?.name);
  const playerRoleLabel = ['football', 'nba'].includes(getSportType(cat?.name)) ? 'Select Position' : 'Select Role';
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.status !== b.status) {
      const statusOrder: Record<string, number> = { available: 0, retained: 1, unsold: 2, sold: 3 };
      return (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
    }
    if (a.basePrice !== b.basePrice) return a.basePrice - b.basePrice;
    return a.name.localeCompare(b.name);
  });

  const soldPlayers = sortedPlayers.filter(p => p.status === 'sold');
  const availablePlayers = sortedPlayers.filter(p => p.status === 'available');
  const unsoldPlayers = sortedPlayers.filter(p => p.status === 'unsold');
  const retainedPlayers = sortedPlayers.filter(p => p.status === 'retained');
  const inviteLink = `${window.location.origin}/join/${auction.auctionCode}`;

  // ── Copy Invite Link ──
  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Team Actions ──
  const handleAddTeam = () => {
    if (!teamName.trim() || !ownerName.trim()) return;
    if (teams.length >= auction.totalTeams) return;

    const team: Team = {
      id: `team-${Date.now()}`,
      auctionId: auction.id,
      name: teamName.trim(),
      ownerName: ownerName.trim(),
      isOwnerPlaying,
      pointsSpent: 0,
      players: [],
      logoUrl: teamLogo || undefined,
      place: teamPlace.trim() || undefined,
    };

    // If owner is playing, create a retained player entry
    if (isOwnerPlaying) {
      const ownerPlayer: Player = {
        id: `player-owner-${Date.now()}`,
        auctionId: auction.id,
        name: ownerName.trim(),
        sport: cat?.name || '',
        role: 'Owner (Player)',
        basePrice: 0,
        isIcon: false,
        isOwner: true,
        status: 'retained',
        soldToTeamId: team.id,
      };
      db.savePlayer(ownerPlayer);
      team.ownerPlayerId = ownerPlayer.id;
    }

    db.saveTeam(team);
    setTeamName('');
    setOwnerName('');
    setTeamLogo('');
    setIsOwnerPlaying(false);
    setTeamPlace('');
    setShowAddTeam(false);
    loadData();
  };

    const openEditTeam = (team: Team) => {
      setEditingTeam(team);
      setEditTeamName(team.name);
      setEditOwnerName(team.ownerName);
      setEditTeamPlace(team.place || '');
    };

    const handleSaveEditTeam = () => {
      if (!editingTeam || !editTeamName.trim() || !editOwnerName.trim()) return;
      db.saveTeam({ ...editingTeam, name: editTeamName.trim(), ownerName: editOwnerName.trim(), place: editTeamPlace.trim() || undefined });
      setEditingTeam(null);
      loadData();
    };

    const handleCancelEditTeam = () => setEditingTeam(null);

  const handleAuctionLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auction) return;
    try {
      const compressedUrl = await compressImage(file, 400, 0.7);
      const updated = { ...auction, logoUrl: compressedUrl };
      db.saveAuction(updated);
      setAuction(updated);
      loadData();
    } catch (err) {
      console.error('Error uploading auction logo:', err);
    }
  };

  const handleTeamLogoUpload = async (teamId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedUrl = await compressImage(file, 200, 0.7);
      const team = teams.find(t => t.id === teamId);
      if (team) {
        db.saveTeam({ ...team, logoUrl: compressedUrl });
        loadData();
      }
    } catch (err) {
      console.error('Error uploading team logo:', err);
    }
  };

  const handleDeleteTeam = (teamId: string) => {
    // Remove retained players for this team
    const teamPlayers = players.filter(p => p.soldToTeamId === teamId && (p.isIcon || p.isOwner));
    teamPlayers.forEach(p => db.deletePlayer(p.id));
    db.deleteTeam(teamId);
    loadData();
  };

  // ── Player Actions ──
  const handleAddPlayer = () => {
    if (!playerName.trim() || !playerRole.trim() || playerBasePrice < auction.minimumBid) return;
    const player: Player = {
      id: `player-${Date.now()}`,
      auctionId: auction.id,
      name: playerName.trim(),
      sport: cat?.name || '',
      role: playerRole.trim(),
      basePrice: playerBasePrice,
      isIcon: false,
      isOwner: false,
      status: 'available',
    };
    db.savePlayer(player);
    setPlayerName('');
    setPlayerRole('');
    setPlayerBasePrice(auction.minimumBid);
    setShowAddPlayer(false);
    loadData();
  };

  const handleDeletePlayer = (playerId: string) => {
    // Also clean up team references
    const player = players.find(p => p.id === playerId);
    if (player?.isIcon || player?.isOwner) {
      const team = teams.find(t => t.iconPlayerId === playerId || t.ownerPlayerId === playerId);
      if (team) {
        const updated = { ...team };
        if (updated.iconPlayerId === playerId) updated.iconPlayerId = undefined;
        if (updated.ownerPlayerId === playerId) updated.ownerPlayerId = undefined;
        db.saveTeam(updated);
      }
    }
    db.deletePlayer(playerId);
    loadData();
  };

  // ── Set Icon Player ──
  const handleSetIcon = (teamId: string, playerId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    // Remove old icon if exists
    if (team.iconPlayerId) {
      const oldIcon = players.find(p => p.id === team.iconPlayerId);
      if (oldIcon) {
        db.savePlayer({ ...oldIcon, isIcon: false, status: 'available', soldToTeamId: undefined });
      }
    }

    // Set new icon
    const player = players.find(p => p.id === playerId);
    if (player) {
      db.savePlayer({ ...player, isIcon: true, isOwner: false, status: 'retained', soldToTeamId: teamId, soldPrice: undefined });
      db.saveTeam({ ...team, iconPlayerId: playerId });
    }
    loadData();
  };

  // ── Auction Status ──
  const handleStatusChange = (newStatus: 'live' | 'upcoming' | 'closed') => {
    const updated = { ...auction, status: newStatus };
    db.saveAuction(updated);
    setAuction(updated);
  };

  // ── Payment Gate Handler ──
  const handleStartBidding = () => {
    // Check if more than 4 teams (payment required)
    if (teams.length > 4) {
      Swal.fire({
        title: '💳 Registration Fee Required',
        html: '<div style="text-align:left">' +
          '<p style="margin-bottom:16px;font-size:16px;color:#fff;">Teams more than 4 must pay a registration fee before entering the auction room.</p>' +
          '<div style="background:rgba(59,130,246,0.1);border:2px solid rgb(59,130,246);border-radius:8px;padding:12px;">' +
          '<p style="margin:0;font-size:14px;color:#93c5fd;font-weight:bold;">📋 Fee Details</p>' +
          '<p style="margin:8px 0 0 0;font-size:18px;color:#fff;font-weight:bold;">Team Count: ' + teams.length + '</p>' +
          '<p style="margin:4px 0 0 0;font-size:14px;color:#9ca3af;">Demo Payment Mode</p>' +
          '</div></div>',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Proceed to Payment',
        cancelButtonText: 'Cancel',
        background: '#1a1f2e',
        color: '#fff',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280',
      }).then((result) => {
        if (result.isConfirmed) {
          setShowPaymentModal(true);
        }
      });
    } else {
      // No payment required, go directly to bidding
      navigate(`/organizer/auction/${auction.id}/bid`);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Link to="/organizer" className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-bold mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Auctions
      </Link>

      {/* ═══════════ HEADER ═══════════ */}
      <div className="card p-6 mb-6 relative">
        {/* Top-right Teams Poster button */}
        {teams.length > 0 && (
          <button
            onClick={() => setShowTeamPoster(true)}
            title="Event Poster"
            className="absolute top-4 right-4 bg-dark-700 hover:bg-dark-600 text-white rounded-lg font-bold text-sm flex items-center gap-1.5 py-2 px-4 transition-colors border border-dark-600 z-10"
          >
            <Image className="w-4 h-4" /> 
          </button>
        )}
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {auction.status === 'live' && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> LIVE
                </span>
              )}
              {auction.status === 'upcoming' && (
                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">UPCOMING</span>
              )}
              {auction.status === 'closed' && (
                <span className="text-xs font-bold text-dark-500 bg-dark-700 px-3 py-1 rounded-full">COMPLETED</span>
              )}
              <span className="text-sm text-dark-400">{cat?.icon} {cat?.name}</span>
            </div>
            <div className="flex items-center gap-4 mb-2">
              {/* Auction Logo */}
              <label className="relative group cursor-pointer block shrink-0">
                <div className="w-20 h-20 rounded-xl bg-dark-800 border-2 border-dark-600 group-hover:border-primary-500 overflow-hidden flex items-center justify-center transition-colors shadow-lg">
                  {auction.logoUrl ? (
                    <img src={auction.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Trophy className="w-8 h-8 text-dark-500 group-hover:text-primary-500 transition-colors" />
                  )}
                  <div className="absolute inset-0 bg-dark-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </div>
                <input type="file" accept="image/*" onChange={handleAuctionLogoUpload} className="hidden" />
              </label>

              <div>
                <h1 className="text-3xl font-black text-white mb-2">{auction.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-dark-400">
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {format(new Date(auction.date), 'MMM dd, yyyy')}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {auction.time}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {auction.venue}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status & Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {auction.status === 'live' && (
              <button
                onClick={handleStartBidding}
                className="btn-primary flex items-center gap-1.5 py-2 px-4 font-bold text-sm"
              >
                <Play className="w-4 h-4" /> Start Bidding
              </button>
            )}
            {auction.status === 'upcoming' && (
              <button onClick={() => handleStatusChange('live')} className="btn-primary flex items-center gap-1.5 py-2">
                <Zap className="w-4 h-4" /> Start Auction
              </button>
            )}
            {auction.status === 'live' && (
              <button onClick={() => handleStatusChange('closed')} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-sm flex items-center gap-1.5 transition-colors">
                <X className="w-4 h-4" /> End Auction
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════ INVITE LINK ═══════════ */}
      <div className="card p-4 mb-6 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <ExternalLink className="w-4 h-4 text-primary-500" />
          <span className="text-dark-400 font-bold">Invitation Link:</span>
        </div>
        <div className="flex-1 bg-dark-800 rounded-lg px-4 py-2 font-mono text-sm text-primary-500 truncate">
          {inviteLink}
        </div>
        <button
          onClick={copyInviteLink}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
            copied ? 'bg-green-500/10 text-green-400' : 'bg-primary-500/10 text-primary-500 hover:bg-primary-500/20'
          }`}
        >
          <Copy className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy'}
        </button>
        <div className="text-dark-500 text-xs">
          Code: <span className="font-mono font-bold text-white">{auction.auctionCode}</span>
        </div>
      </div>

      {/* ═══════════ CONFIG CARDS ═══════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
        {[
          { label: 'Code', value: auction.auctionCode, icon: <Hash className="w-4 h-4 text-primary-500" />, mono: true },
          { label: 'Points/Team', value: `₹${auction.pointsPerTeam.toLocaleString()}`, icon: <DollarSign className="w-4 h-4 text-accent-500" /> },
          { label: 'Min Bid', value: `₹${auction.minimumBid.toLocaleString()}`, icon: <DollarSign className="w-4 h-4 text-blue-400" /> },
          { label: 'Bid Increase', value: `₹${auction.bidIncreaseBy.toLocaleString()}`, icon: <TrendingUp className="w-4 h-4 text-green-400" /> },
          { label: 'Teams', value: `${teams.length}/${auction.totalTeams}`, icon: <Shield className="w-4 h-4 text-purple-400" /> },
          { label: 'Players', value: `${players.length}`, icon: <Users className="w-4 h-4 text-orange-400" /> },
          { label: 'Retained', value: `${retainedPlayers.length}`, icon: <Zap className="w-4 h-4 text-yellow-400" /> },
        ].map((c, i) => (
          <div key={i} className="card p-3 text-center">
            <div className="flex justify-center mb-1">{c.icon}</div>
            <p className="text-[10px] text-dark-500 uppercase font-bold tracking-wider mb-0.5">{c.label}</p>
            <p className={`text-base font-black text-white ${c.mono ? 'font-mono text-sm' : ''}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ═══════════ TEAMS SECTION ═══════════ */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" /> Teams
              <span className="text-sm text-dark-500">({teams.length}/{auction.totalTeams})</span>
            </h2>
            {teams.length < auction.totalTeams && auction.status !== 'closed' && (
              <button onClick={() => setShowAddTeam(!showAddTeam)} className="text-sm text-primary-500 font-bold flex items-center gap-1 hover:text-primary-600">
                <Plus className="w-4 h-4" /> Add Team
              </button>
            )}
          </div>

          {/* Add Team Form */}
          {showAddTeam && (
            <div className="card p-4 mb-4 border border-primary-500/20">
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <label className="cursor-pointer group relative shrink-0">
                    <div className="w-16 h-16 rounded-xl bg-dark-800 border-2 border-dashed border-dark-500 group-hover:border-primary-500 flex items-center justify-center overflow-hidden transition-colors">
                      {teamLogo ? (
                        <img src={teamLogo} alt="Team Logo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <Camera className="w-5 h-5 text-dark-500 group-hover:text-primary-500 mx-auto transition-colors" />
                        </div>
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await compressImage(file, 200, 0.7);
                        setTeamLogo(url);
                      }
                    }} className="hidden" />
                  </label>
                  <div className="flex-1 space-y-3">
                    <input
                      className="input-field"
                      placeholder="Team Name"
                      value={teamName}
                      onChange={e => setTeamName(e.target.value)}
                    />
                    <input
                      className="input-field"
                      placeholder="Owner Name"
                      value={ownerName}
                      onChange={e => setOwnerName(e.target.value)}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-dark-400 cursor-pointer">
                                      <input
                                        className="input-field"
                                        placeholder="Place / City"
                                        value={teamPlace}
                                        onChange={e => setTeamPlace(e.target.value)}
                                      />
                  <input
                    type="checkbox"
                    checked={isOwnerPlaying}
                    onChange={e => setIsOwnerPlaying(e.target.checked)}
                    className="w-4 h-4 rounded bg-dark-700 border-dark-600 text-primary-500 focus:ring-primary-500"
                  />
                  Owner is also a player (auto-retained)
                </label>
                <div className="flex gap-2">
                  <button onClick={handleAddTeam} className="btn-primary flex-1 py-2 text-sm flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" /> Add
                  </button>
                  <button onClick={() => setShowAddTeam(false)} className="btn-secondary py-2 text-sm px-4">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Teams List */}
          <div className="space-y-3">
            {teams.length === 0 ? (
              <div className="card p-6 text-center text-dark-500">No teams registered yet.</div>
            ) : (
              teams.map(team => {
                const balance = auction.pointsPerTeam - team.pointsSpent;
                const usedPct = (team.pointsSpent / auction.pointsPerTeam) * 100;
                const teamRetained = players.filter(p => (p.isIcon || p.isOwner) && p.soldToTeamId === team.id);
                const iconPlayer = players.find(p => p.id === team.iconPlayerId);
                const ownerPlayer = players.find(p => p.id === team.ownerPlayerId);

                return (
                  <div key={team.id} className="card p-4 hover:border-dark-600 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {/* Team Logo with Edit option */}
                        <label className="relative group cursor-pointer block shrink-0">
                          <div className="w-12 h-12 rounded-lg bg-dark-800 border border-dark-600 group-hover:border-primary-500 overflow-hidden flex items-center justify-center transition-colors">
                            {team.logoUrl ? (
                              <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
                            ) : (
                              <Shield className="w-6 h-6 text-dark-500 group-hover:text-primary-500 transition-colors" />
                            )}
                            <div className="absolute inset-0 bg-dark-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Camera className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          <input type="file" accept="image/*" onChange={(e) => handleTeamLogoUpload(team.id, e)} className="hidden" />
                        </label>
                        <div>
                          <h4 className="font-bold text-white text-lg">{team.name}</h4>
                          {team.place && (
                            <p className="text-xs text-dark-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" /> {team.place}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-1">
                            <button
                              onClick={() => setRosterTeam(team)}
                              className="text-xs text-primary-500 hover:text-primary-400 flex items-center gap-1"
                              title="View Team"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Team
                            </button>
                             <button
                              onClick={() => setGalleryTeam(team)}
                              className="text-xs text-accent-500 hover:text-accent-400 flex items-center gap-1"
                              title="Photo Gallery"
                            >
                              <Image className="w-3.5 h-3.5" /> Gallery
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {auction.status !== 'closed' && (
                          <button onClick={() => openEditTeam(team)} className="text-dark-500 hover:text-blue-400 transition-colors" title="Edit Team">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {auction.status !== 'closed' && (
                          <button onClick={() => handleDeleteTeam(team.id)} className="text-dark-500 hover:text-red-500 transition-colors" title="Delete Team">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline Edit Form */}
                    {editingTeam?.id === team.id && (
                      <div className="mb-3 p-3 bg-dark-800 rounded-xl border border-primary-500/30 space-y-2">
                        <input
                          className="input-field text-sm py-1.5"
                          placeholder="Team Name"
                          value={editTeamName}
                          onChange={e => setEditTeamName(e.target.value)}
                        />
                        <input
                          className="input-field text-sm py-1.5"
                          placeholder="Owner Name"
                          value={editOwnerName}
                          onChange={e => setEditOwnerName(e.target.value)}
                        />
                        <input
                          className="input-field text-sm py-1.5"
                          placeholder="Place / City"
                          value={editTeamPlace}
                          onChange={e => setEditTeamPlace(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button onClick={handleSaveEditTeam} className="btn-primary flex-1 py-1.5 text-sm flex items-center justify-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Save
                          </button>
                          <button onClick={handleCancelEditTeam} className="btn-secondary py-1.5 text-sm px-4">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="mb-2">
                      <p className="text-xs text-dark-500">
                          Owner: {team.ownerName}
                          {team.isOwnerPlaying && <span className="text-purple-400 ml-1">(Playing)</span>}
                        </p>
                    </div>

                    {/* Retained Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {iconPlayer && (
                        <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          👑 {iconPlayer.name}
                        </span>
                      )}
                      {ownerPlayer && (
                        <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          🏷️ {ownerPlayer.name}
                        </span>
                      )}
                      {!iconPlayer && auction.status !== 'closed' && (
                        <div className="flex items-center gap-1">
                          <select
                            className="text-xs bg-dark-700 text-dark-400 rounded px-2 py-1 border border-dark-600"
                            value=""
                            onChange={e => {
                              if (e.target.value) handleSetIcon(team.id, e.target.value);
                            }}
                          >
                            <option value="">Set Icon Player 👑</option>
                            {availablePlayers.map(p => (
                              <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Budget Bar */}
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-dark-500">Spent: <span className="text-accent-500 font-bold">₹{team.pointsSpent.toLocaleString()}</span></span>
                        <span className="text-dark-500">Balance: <span className={`font-bold ${balance < auction.minimumBid ? 'text-red-500' : 'text-primary-500'}`}>₹{balance.toLocaleString()}</span></span>
                      </div>
                      <div className="w-full bg-dark-700 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${usedPct > 80 ? 'bg-red-500' : usedPct > 50 ? 'bg-accent-500' : 'bg-primary-500'}`}
                          style={{ width: `${Math.min(usedPct, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Players Won */}
                    {team.players.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {team.players.map(pid => {
                          const p = players.find(pl => pl.id === pid);
                          return p ? (
                            <span key={pid} className="text-xs bg-primary-500/10 text-primary-500 px-2 py-1 rounded-full font-medium">
                              {p.name} (₹{p.soldPrice?.toLocaleString()})
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}

                    <div className="mt-2 text-xs text-dark-500">
                      Players: {team.players.length + teamRetained.length}/{auction.playersPerTeam}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ═══════════ PLAYERS SECTION ═══════════ */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-orange-400" /> Players
              <span className="text-sm text-dark-500">({players.length})</span>
            </h2>
            {auction.status !== 'closed' && (
              <button onClick={() => { setShowAddPlayer(!showAddPlayer); setPlayerBasePrice(auction.minimumBid); }} className="text-sm text-primary-500 font-bold flex items-center gap-1 hover:text-primary-600">
                <Plus className="w-4 h-4" /> Add Player
              </button>
            )}
          </div>

          {/* Add Player Form */}
          {showAddPlayer && (
            <div className="card p-4 mb-4 border border-primary-500/20">
              <div className="space-y-3">
                <input
                  className="input-field"
                  placeholder="Player Name"
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                />
                <select className="input-field" value={playerRole} onChange={e => setPlayerRole(e.target.value)}>
                  <option value="">{playerRoleLabel}</option>
                  {playerRoleOptions.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <div>
                  <label className="text-xs text-dark-500 mb-1 block">Base Price (min ₹{auction.minimumBid.toLocaleString()})</label>
                  <input
                    type="number"
                    className="input-field"
                    min={auction.minimumBid}
                    step={auction.bidIncreaseBy}
                    value={playerBasePrice}
                    onChange={e => setPlayerBasePrice(Number(e.target.value))}
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddPlayer} className="btn-primary flex-1 py-2 text-sm flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" /> Add
                  </button>
                  <button onClick={() => setShowAddPlayer(false)} className="btn-secondary py-2 text-sm px-4">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Player Summary */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="card p-3 text-center">
              <p className="text-xs text-dark-500 uppercase font-bold">Available</p>
              <p className="text-lg font-black text-primary-500">{availablePlayers.length}</p>
            </div>
            <div className="card p-3 text-center">
              <p className="text-xs text-dark-500 uppercase font-bold">Sold</p>
              <p className="text-lg font-black text-accent-500">{soldPlayers.length}</p>
            </div>
            <div className="card p-3 text-center">
              <p className="text-xs text-dark-500 uppercase font-bold">Unsold</p>
              <p className="text-lg font-black text-red-500">{unsoldPlayers.length}</p>
            </div>
            <div className="card p-3 text-center">
              <p className="text-xs text-dark-500 uppercase font-bold">Retained</p>
              <p className="text-lg font-black text-yellow-400">{retainedPlayers.length}</p>
            </div>
          </div>

          {/* Players List */}
          <div className="space-y-2">
            {sortedPlayers.length === 0 ? (
              <div className="card p-6 text-center text-dark-500">No players added yet.</div>
            ) : (
              sortedPlayers.map(player => {
                const soldTeam = player.soldToTeamId ? teams.find(t => t.id === player.soldToTeamId) : null;
                const linkedUser = player.userId ? allUsers.find(u => u.id === player.userId) : null;
                const photoUrl = player.photoUrl || linkedUser?.photoUrl;

                return (
                  <div key={player.id} className={`card p-4 hover:border-dark-600 transition-colors ${
                    player.status === 'sold' ? 'border-l-4 border-l-primary-500' : ''
                  } ${player.status === 'retained' ? 'border-l-4 border-l-yellow-500' : ''}`}>
                    <div className="flex items-center justify-between gap-4">
                      {/* Photo Section */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-dark-600 overflow-hidden flex items-center justify-center border-2 border-dark-700">
                        {photoUrl ? (
                          <button onClick={() => setEnlargedImage(photoUrl)} className="w-full h-full relative group block cursor-pointer" title="View Photo">
                            <img src={photoUrl} alt={player.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-dark-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ZoomIn className="w-4 h-4 text-white" />
                            </div>
                          </button>
                        ) : (
                          <UserIcon className="w-6 h-6 text-dark-400" />
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <h4 className="font-bold text-white truncate">{player.name}</h4>
                          {player.status === 'sold' && (
                            <span className="text-[10px] bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded-full font-bold uppercase">Sold</span>
                          )}
                          {player.status === 'available' && (
                            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase">Available</span>
                          )}
                          {player.status === 'unsold' && (
                            <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-bold uppercase">Unsold</span>
                          )}
                          {player.status === 'retained' && (
                            <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full font-bold uppercase">
                              {player.isIcon ? '👑 Icon' : '🏷️ Owner'} — Retained
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-dark-500">{player.role} &nbsp;•&nbsp; Base: ₹{player.basePrice.toLocaleString()}</p>
                        {player.status === 'sold' && (
                          <p className="text-xs text-primary-500 mt-0.5">
                            Sold to <span className="font-bold">{soldTeam?.name}</span> for ₹{player.soldPrice?.toLocaleString()}
                          </p>
                        )}
                        {player.status === 'retained' && soldTeam && (
                          <p className="text-xs text-yellow-400 mt-0.5">
                            Retained by <span className="font-bold">{soldTeam.name}</span>
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {player.status === 'sold' && (
                          <span className="text-lg font-black text-primary-500">₹{player.soldPrice?.toLocaleString()}</span>
                        )}
                        <button onClick={() => setEditingPlayer(player)} className="text-dark-400 hover:text-primary-500 transition-colors p-1" title="Edit Player">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {auction.status !== 'closed' && player.status !== 'sold' && (
                          <button onClick={() => handleDeletePlayer(player.id)} className="text-dark-500 hover:text-red-500 transition-colors p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
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

      <EditPlayerModal
        isOpen={!!editingPlayer}
        onClose={() => setEditingPlayer(null)}
        player={editingPlayer}
        onSave={(updated) => {
          db.savePlayer(updated);
          
          if (updated.status === 'sold' && updated.soldToTeamId) {
            const auctionPlayers = db.getPlayers(updated.auctionId);
            const teamSpent = auctionPlayers
              .filter(p => p.soldToTeamId === updated.soldToTeamId && p.status === 'sold')
              .reduce((sum, p) => sum + (p.soldPrice || 0), 0);
              
            const t = db.getTeam(updated.soldToTeamId);
            if (t) {
              db.saveTeam({ ...t, pointsSpent: teamSpent });
            }
          }
          
          loadData();
          setEditingPlayer(null);
        }}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        teamName={teams.length > 0 ? `${teams.length} Teams` : 'Auction'}
        registrationFee={499}
        onPaymentComplete={() => {
          navigate(`/organizer/auction/${auction.id}/bid`);
        }}
      />

      <ImageModal 
        isOpen={!!enlargedImage} 
        onClose={() => setEnlargedImage(null)} 
        imageUrl={enlargedImage} 
        altText="Player Photo" 
      />

      {showTeamPoster && (
        <TeamPosterModal
          auction={auction}
          teams={teams}
          categoryName={cat?.name}
          onClose={() => setShowTeamPoster(false)}
        />
      )}
    </div>
  );
}
