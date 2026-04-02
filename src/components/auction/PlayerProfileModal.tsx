import { useState } from 'react';
import { X, Edit2, Check, User as UserIcon } from 'lucide-react';
import { Player, Auction } from '../../types';
import { db } from '../../services/db';

interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
  auction: Auction | null;
}

export default function PlayerProfileModal({
  isOpen,
  onClose,
  player,
  auction,
}: PlayerProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(player ? { ...player } : null);

  if (!isOpen || !player || !auction) return null;

  const allUsers = db.getUsers();
  const teams = db.getTeams(auction.id);
  const categories = db.getCategories();
  const cat = categories.find(c => c.id === auction.categoryId);
  const sport = (cat?.name || '').toLowerCase();

  const linkedUser = player.userId ? allUsers.find(u => u.id === player.userId) : null;
  const photoUrl = player.photoUrl || linkedUser?.photoUrl;
  const soldTeam = player.soldToTeamId ? teams.find(t => t.id === player.soldToTeamId) : null;

  // Get career stats based on sport
  const getCareerStats = () => {
    if (sport.includes('cricket')) {
      return [
        { format: 'ODI', debut: '-', lastMatch: '-' },
        { format: 'T20I', debut: '-', lastMatch: '-' },
        { format: 'Test', debut: '-', lastMatch: '-' },
        { format: 'IPL', debut: '-', lastMatch: '-' },
      ];
    }
    if (sport.includes('football')) {
      return [
        { format: 'Club', debut: '-', lastMatch: '-' },
        { format: 'National', debut: '-', lastMatch: '-' },
      ];
    }
    if (sport.includes('nba') || sport.includes('basketball')) {
      return [
        { format: 'NBA', debut: '-', lastMatch: '-' },
        { format: 'Champion', debut: '-', lastMatch: '-' },
      ];
    }
    if (sport.includes('tennis')) {
      return [
        { format: 'Grand Slam', debut: '-', lastMatch: '-' },
        { format: 'ATP/WTA', debut: '-', lastMatch: '-' },
      ];
    }
    return [
      { format: 'Professional', debut: '-', lastMatch: '-' },
      { format: 'National', debut: '-', lastMatch: '-' },
    ];
  };

  const getProfileFields = () => {
    if (sport.includes('cricket')) {
      return [
        { label: 'Batting Style', key: 'skill' },
        { label: 'Bowling Style', key: 'specification' },
        { label: 'Role', key: 'role' },
        { label: 'Jersey Size', key: 'jerseySize' },
        { label: 'Jersey Name', key: 'jerseyName' },
        { label: 'Jersey Number', key: 'jerseyNumber' },
        { label: 'Extra Details', key: 'extraDetails' },
      ];
    }
    if (sport.includes('football')) {
      return [
        { label: 'Position', key: 'role' },
        { label: 'Play Style', key: 'skill' },
        { label: 'Dominant Foot', key: 'specification' },
        { label: 'Jersey Size', key: 'jerseySize' },
        { label: 'Jersey Name', key: 'jerseyName' },
        { label: 'Jersey Number', key: 'jerseyNumber' },
        { label: 'Extra Details', key: 'extraDetails' },
      ];
    }
    return [
      { label: 'Role', key: 'role' },
      { label: 'Skill', key: 'skill' },
      { label: 'Specification', key: 'specification' },
      { label: 'Jersey Size', key: 'jerseySize' },
      { label: 'Jersey Name', key: 'jerseyName' },
      { label: 'Jersey Number', key: 'jerseyNumber' },
      { label: 'Extra Details', key: 'extraDetails' },
    ];
  };

  const handleSave = () => {
    if (!formData) return;
    db.savePlayer(formData);
    setIsEditing(false);
  };

  const handleChange = (key: keyof Player, value: any) => {
    if (formData) {
      setFormData({ ...formData, [key]: value });
    }
  };

  const careerStats = getCareerStats();
  const profileFields = getProfileFields();

  return (
    <div className="fixed inset-0 z-[80] bg-dark-900/90 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="w-full bg-gradient-to-b from-dark-800 via-dark-900 to-dark-900 relative">
        
        {/* Header with Player Info */}
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-600 opacity-20"></div>
          
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2.5 rounded-full bg-primary-500 hover:bg-primary-600 text-white transition-colors"
                title="Edit Profile"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}
            {isEditing && (
              <>
                <button
                  onClick={handleSave}
                  className="p-2.5 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors"
                  title="Save"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setFormData(player ? { ...player } : null);
                    setIsEditing(false);
                  }}
                  className="p-2.5 rounded-full bg-dark-700 hover:bg-dark-600 text-dark-300 transition-colors"
                  title="Cancel"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-dark-800 hover:bg-dark-700 border border-dark-600 text-dark-300 hover:text-white transition-colors"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative -mt-16 pb-6">
            <div className="flex items-end gap-6">
              {/* Player Photo */}
              <div className="w-32 h-32 rounded-xl bg-dark-700 overflow-hidden flex items-center justify-center border-4 border-dark-800 shadow-xl flex-shrink-0">
                {photoUrl ? (
                  <img src={photoUrl} alt={player.name} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-20 h-20 text-dark-500" />
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-3 mb-2">
                  {auction.logoUrl && (
                    <img src={auction.logoUrl} alt="" className="h-8 w-8 object-contain" />
                  )}
                  <span className="text-sm text-dark-500 font-semibold uppercase">{cat?.name || 'League'}</span>
                </div>
                <h1 className="text-4xl font-black text-white mb-2">{player.name}</h1>
                <div className="flex items-center gap-4 text-sm">
                  {player.age && (
                    <div>
                      <span className="text-dark-500 uppercase font-bold text-xs">Age</span>
                      <p className="text-white font-bold">{player.age} years</p>
                    </div>
                  )}
                  <div>
                    <span className="text-dark-500 uppercase font-bold text-xs">Role</span>
                    <p className="text-white font-bold">{player.role || player.category || '-'}</p>
                  </div>
                  {linkedUser?.city && (
                    <div>
                      <span className="text-dark-500 uppercase font-bold text-xs">Place</span>
                      <p className="text-white font-bold">{linkedUser.city}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-dark-500 uppercase font-bold text-xs">Status</span>
                    <p className="text-primary-400 font-bold capitalize">
                      {player.status === 'retained' && (player.isIcon ? '👑 Icon' : 'Retained')}
                      {player.status === 'sold' && 'Sold'}
                      {player.status === 'available' && 'Available'}
                      {player.status === 'unsold' && 'Unsold'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Info Panel */}
            <div>
              <h2 className="text-xl font-black text-white mb-4 pb-3 border-b border-dark-700">Info</h2>
              
              {isEditing ? (
                <div className="space-y-4">
                  {profileFields.map(f => (
                    <div key={f.key}>
                      <label className="text-xs text-dark-500 uppercase font-bold block mb-1">
                        {f.label}
                      </label>
                      <input
                        type={f.key === 'age' ? 'number' : 'text'}
                        value={formData?.[f.key as keyof Player] as string || ''}
                        onChange={e =>
                          handleChange(f.key as keyof Player, f.key === 'age' ? Number(e.target.value) : e.target.value)
                        }
                        className="input-field text-sm"
                        placeholder={`Enter ${f.label.toLowerCase()}`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {profileFields.map(f => (
                    <div key={f.key}>
                      <span className="text-xs text-dark-500 uppercase font-bold block mb-1">{f.label}</span>
                      <p className="text-white font-medium">
                        {(player[f.key as keyof Player] as any) || '-'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Teams Panel */}
            <div>
              <h2 className="text-xl font-black text-white mb-4 pb-3 border-b border-dark-700">Teams</h2>
              <div className="space-y-3">
                {soldTeam ? (
                  <div className="bg-dark-800 rounded-lg p-3 border border-dark-700">
                    <p className="text-sm text-dark-400 uppercase font-bold mb-1">Sold To</p>
                    <p className="text-white font-black text-lg">{soldTeam.name}</p>
                    <p className="text-primary-400 text-sm font-bold mt-1">
                      ₹{player.soldPrice?.toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-dark-500">
                    <p className="text-sm">Not yet assigned to any team</p>
                  </div>
                )}
              </div>
            </div>

            {/* Career Panel */}
            <div>
              <h2 className="text-xl font-black text-white mb-4 pb-3 border-b border-dark-700">Career</h2>
              <div className="space-y-3">
                {careerStats.map((stat, i) => (
                  <div key={i} className="bg-dark-800 rounded-lg p-3 border border-dark-700">
                    <p className="text-sm text-dark-400 uppercase font-bold mb-2">{stat.format}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-dark-500">Debut</span>
                        <p className="text-white font-bold">{stat.debut}</p>
                      </div>
                      <div>
                        <span className="text-dark-500">Last Match</span>
                        <p className="text-white font-bold">{stat.lastMatch}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Section */}
          <div className="mt-8">
            <h2 className="text-xl font-black text-white mb-4 pb-3 border-b border-dark-700">Profile</h2>
            {isEditing ? (
              <textarea
                value={formData?.extraDetails || ''}
                onChange={e => handleChange('extraDetails', e.target.value)}
                className="input-field w-full h-40 text-sm"
                placeholder="Enter player biography or additional details..."
              />
            ) : (
              <p className="text-dark-300 leading-relaxed">
                {player.extraDetails || 'No profile description added yet.'}
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
