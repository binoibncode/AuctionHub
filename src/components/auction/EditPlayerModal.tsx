import React, { useState, useEffect } from 'react';
import { X, Camera, FileText } from 'lucide-react';
import { Player } from '../../types';
import { compressImage } from '../../utils/image';

const SPORT_PLAYER_OPTIONS = {
  cricket: {
    roles: ['Batsman', 'Bowler', 'All Rounder', 'Wicket Keeper'],
    specifications: ['Batsman', 'Bowler', 'All Rounder', 'All Rounder WK', 'Wicket Keeper'],
    skillsBySpec: {
      Batsman: ['Opening Batter', 'Top Order Batter', 'Middle Order Batter', 'Finisher', 'Anchor', 'Power Hitter'],
      Bowler: ['Right Arm Fast', 'Right Arm Medium', 'Left Arm Medium', 'Off-Break', 'Leg-Break', 'Left Arm Orthodox', 'Left Arm Chinaman'],
      'All Rounder': ['Batting All Rounder', 'Bowling All Rounder', 'Pace All Rounder', 'Spin All Rounder'],
      'All Rounder WK': ['Batting All Rounder', 'Wicket Keeper Batter', 'Finisher'],
      'Wicket Keeper': ['Wicket Keeper Batter', 'Top Order Keeper', 'Middle Order Keeper'],
    } as Record<string, string[]>,
  },
  football: {
    roles: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'],
    specifications: ['Goalkeeper', 'Center Back', 'Full Back', 'Defensive Midfielder', 'Central Midfielder', 'Attacking Midfielder', 'Winger', 'Striker'],
    skillsBySpec: {
      Goalkeeper: ['Shot Stopper', 'Sweeper Keeper', 'Penalty Specialist', 'Ball Distributor'],
      'Center Back': ['Man Marker', 'Ball Playing Defender', 'Aerial Defender', 'Tackling Specialist'],
      'Full Back': ['Overlapping Runner', 'Defensive Full Back', 'Cross Specialist', 'Inverted Full Back'],
      'Defensive Midfielder': ['Ball Winner', 'Deep-Lying Playmaker', 'Anchor', 'Press Resistant'],
      'Central Midfielder': ['Box-to-Box', 'Tempo Controller', 'Playmaker', 'Ball Carrier'],
      'Attacking Midfielder': ['Chance Creator', 'Advanced Playmaker', 'Set Piece Specialist', 'Dribbler'],
      Winger: ['Pace Dribbler', 'Inverted Winger', 'Cross Specialist', 'Wide Playmaker'],
      Striker: ['Poacher', 'Target Man', 'False 9', 'Pressing Forward'],
      Defender: ['Tackling Specialist', 'Man Marker', 'Ball Playing Defender'],
      Midfielder: ['Playmaker', 'Ball Winner', 'Box-to-Box'],
      Forward: ['Poacher', 'Target Man', 'Pressing Forward'],
    } as Record<string, string[]>,
  },
  nba: {
    roles: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'],
    specifications: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center', 'Combo Guard', 'Stretch Four', 'Sixth Man'],
    skillsBySpec: {
      'Point Guard': ['Playmaker', 'Floor General', 'Pick-and-Roll Specialist', 'Perimeter Defender'],
      'Shooting Guard': ['Sharpshooter', 'Slasher', 'Two-Way Guard', 'Shot Creator'],
      'Small Forward': ['Two-Way Wing', 'Perimeter Scorer', 'Defensive Stopper', 'Athletic Finisher'],
      'Power Forward': ['Rebounder', 'Stretch Four', 'Post Scorer', 'Rim Protector'],
      Center: ['Rim Protector', 'Post Anchor', 'Rebound Machine', 'Lob Threat'],
      'Combo Guard': ['Primary Ball Handler', 'Secondary Playmaker', 'Transition Finisher'],
      'Stretch Four': ['Corner Shooter', 'Pick-and-Pop Specialist', 'Floor Spacer'],
      'Sixth Man': ['Microwave Scorer', 'Bench Playmaker', 'Energy Booster'],
    } as Record<string, string[]>,
  },
  tennis: {
    roles: ['Singles', 'Doubles', 'All Court Player'],
    specifications: ['Baseline Player', 'Serve and Volley', 'Counter Puncher', 'Aggressive Baseliner', 'Doubles Specialist'],
    skillsBySpec: {
      'Baseline Player': ['Topspin Rally', 'Forehand Dominance', 'Backhand Control'],
      'Serve and Volley': ['Big Serve', 'Net Rush', 'Reflex Volley'],
      'Counter Puncher': ['Defensive Retrieval', 'Consistency', 'Passing Shot'],
      'Aggressive Baseliner': ['Power Groundstrokes', 'Inside-Out Forehand', 'Early Ball Strike'],
      'Doubles Specialist': ['Poaching', 'Net Positioning', 'Team Communication'],
      Singles: ['Endurance', 'Court Coverage', 'Point Construction'],
      Doubles: ['Net Reflex', 'Serve Return', 'Formation Awareness'],
      'All Court Player': ['Adaptive Strategy', 'Transition Game', 'Shot Variety'],
    } as Record<string, string[]>,
  },
  volleyball: {
    roles: ['Setter', 'Outside Hitter', 'Opposite', 'Middle Blocker', 'Libero'],
    specifications: ['Setter', 'Outside Hitter', 'Opposite', 'Middle Blocker', 'Libero', 'Defensive Specialist'],
    skillsBySpec: {
      Setter: ['Quick Set', 'Jump Set', 'Game Reading'],
      'Outside Hitter': ['Cross-Court Spike', 'Serve Receive', 'Back Row Attack'],
      Opposite: ['Power Spike', 'Block Timing', 'Transition Hitting'],
      'Middle Blocker': ['Quick Attack', 'Read Block', 'First Tempo'],
      Libero: ['Digging', 'Serve Receive', 'Floor Defense'],
      'Defensive Specialist': ['Coverage', 'Emergency Set', 'Back Court Control'],
    } as Record<string, string[]>,
  },
  badminton: {
    roles: ['Singles', 'Doubles', 'Mixed Doubles'],
    specifications: ['Attacking Player', 'Defensive Player', 'All-Round Player', 'Front Court Specialist', 'Back Court Specialist'],
    skillsBySpec: {
      'Attacking Player': ['Jump Smash', 'Steep Smash', 'Fast Drive'],
      'Defensive Player': ['Lift Control', 'Counter Defense', 'Net Retrieval'],
      'All-Round Player': ['Balanced Rally', 'Transition Speed', 'Shot Variation'],
      'Front Court Specialist': ['Net Kill', 'Net Tumble', 'Quick Interception'],
      'Back Court Specialist': ['Clear Length', 'Smash Setup', 'Drop Shot Accuracy'],
      Singles: ['Stamina', 'Court Coverage', 'Deception'],
      Doubles: ['Rotation', 'Fast Exchanges', 'Communication'],
      'Mixed Doubles': ['Front-Back Coordination', 'Serve Return Pressure', 'Net Dominance'],
    } as Record<string, string[]>,
  },
  kabadi: {
    roles: ['Raider', 'Defender', 'All Rounder'],
    specifications: ['Left Raider', 'Right Raider', 'Cover Defender', 'Corner Defender', 'All Rounder'],
    skillsBySpec: {
      'Left Raider': ['Toe Touch', 'Hand Touch', 'Bonus Point Specialist'],
      'Right Raider': ['Running Hand Touch', 'Dubki', 'Escape Artist'],
      'Cover Defender': ['Ankle Hold', 'Block', 'Chain Tackle'],
      'Corner Defender': ['Thigh Hold', 'Dash', 'Do-or-Die Defense'],
      'All Rounder': ['Multi-Role Impact', 'Stamina', 'Decision Making'],
      Raider: ['Quick Raids', 'Bonus Line Control', 'Revival Play'],
      Defender: ['Tackle Timing', 'Coordination', 'Mat Awareness'],
    } as Record<string, string[]>,
  },
};

type SportType = keyof typeof SPORT_PLAYER_OPTIONS;

const getSportType = (sport?: string): SportType => {
  const name = (sport || '').toLowerCase();
  if (name.includes('football')) return 'football';
  if (name.includes('nba') || name.includes('basketball')) return 'nba';
  if (name.includes('tennis')) return 'tennis';
  if (name.includes('volleyball')) return 'volleyball';
  if (name.includes('badminton')) return 'badminton';
  if (name.includes('kabadi') || name.includes('kabaddi')) return 'kabadi';
  return 'cricket';
};

const getSkillOptions = (sportType: SportType, specification?: string, role?: string) => {
  const skillsBySpec = SPORT_PLAYER_OPTIONS[sportType].skillsBySpec;
  if (specification && skillsBySpec[specification]) {
    return skillsBySpec[specification];
  }
  if (role && skillsBySpec[role]) {
    return skillsBySpec[role];
  }
  return [];
};

const getFieldTextBySport = (sportType: SportType) => {
  switch (sportType) {
    case 'football':
    case 'nba':
      return {
        roleLabel: 'Position',
        roleHint: 'Select primary on-field/court position.',
        specLabel: 'Position Profile',
        specHint: 'Choose specific playing profile.',
        skillLabel: 'Core Skill',
        skillHint: 'Pick strongest competitive skill.',
      };
    case 'tennis':
    case 'badminton':
      return {
        roleLabel: 'Category',
        roleHint: 'Choose event category.',
        specLabel: 'Play Style',
        specHint: 'Select preferred playing style.',
        skillLabel: 'Key Strength',
        skillHint: 'Pick strongest match skill.',
      };
    case 'volleyball':
      return {
        roleLabel: 'Court Role',
        roleHint: 'Select main court role.',
        specLabel: 'Specialization',
        specHint: 'Choose focused responsibility.',
        skillLabel: 'Core Skill',
        skillHint: 'Pick strongest volleyball skill.',
      };
    case 'kabadi':
      return {
        roleLabel: 'Role',
        roleHint: 'Choose kabadi role.',
        specLabel: 'Play Side',
        specHint: 'Select tactical side/profile.',
        skillLabel: 'Key Skill',
        skillHint: 'Pick strongest kabadi move.',
      };
    default:
      return {
        roleLabel: 'Role / Category',
        roleHint: 'Choose primary cricket role.',
        specLabel: 'Specification',
        specHint: 'Choose detailed specialization.',
        skillLabel: 'Skill',
        skillHint: 'Pick strongest cricket skill.',
      };
  }
};

interface EditPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
  onSave: (updatedPlayer: Player) => void;
}

export default function EditPlayerModal({ isOpen, onClose, player, onSave }: EditPlayerModalProps) {
  const [formData, setFormData] = useState<Player | null>(null);

  useEffect(() => {
    if (player && isOpen) {
      setFormData({ ...player });
    } else {
      setFormData(null);
    }
  }, [player, isOpen]);

  if (!isOpen || !formData) return null;

  const sportType = getSportType(formData.sport);
  const roleOptions = SPORT_PLAYER_OPTIONS[sportType].roles;
  const specificationOptions = SPORT_PLAYER_OPTIONS[sportType].specifications;
  const fieldText = getFieldTextBySport(sportType);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (!prev) return null;

      if (name === 'specification') {
        const nextSportType = getSportType(prev.sport);
        const nextSkills = getSkillOptions(nextSportType, value, prev.role);
        const shouldResetSkill = prev.skill ? !nextSkills.includes(prev.skill) : false;
        return {
          ...prev,
          specification: value,
          skill: shouldResetSkill ? '' : prev.skill,
        };
      }

      if (name === 'role') {
        const nextSportType = getSportType(prev.sport);
        const nextSkills = getSkillOptions(nextSportType, prev.specification, value);
        const shouldResetSkill = prev.skill ? !nextSkills.includes(prev.skill) : false;
        return {
          ...prev,
          role: value,
          skill: shouldResetSkill ? '' : prev.skill,
        };
      }

      return {
        ...prev,
        [name]: name === 'age' || name === 'soldPrice' ? Number(value) : value,
      };
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'photoUrl' | 'secondReferenceUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File must be under 5MB');
      return;
    }
    try {
      const compressedDataUrl = await compressImage(file, 800, 0.7);
      setFormData(prev => prev ? { ...prev, [field]: compressedDataUrl } : null);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) onSave(formData);
  };

  const availableSkills = getSkillOptions(sportType, formData.specification, formData.role);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-dark-900/90 backdrop-blur-sm animate-fadeIn">
      <div className="bg-dark-800 rounded-xl w-full max-w-4xl shadow-2xl border border-dark-700 flex flex-col max-h-[90vh] animate-slideUp">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-dark-700">
          <h2 className="text-2xl font-black text-white">Edit Player Profile</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-dark-700 transition-colors text-dark-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          <form id="edit-player-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Photos Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-dark-700/30 p-6 rounded-xl border border-dark-700">
              {/* Profile Photo */}
              <div className="flex flex-col items-center">
                <label className="block text-sm font-bold text-white mb-3 tracking-wide uppercase">Profile Photo</label>
                <label className="cursor-pointer group relative">
                  <div className="w-32 h-32 rounded-full bg-dark-800 border-2 border-dashed border-dark-500 group-hover:border-primary-500 flex items-center justify-center overflow-hidden transition-colors">
                    {formData.photoUrl ? (
                      <img src={formData.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <Camera className="w-8 h-8 text-dark-500 group-hover:text-primary-500 mx-auto transition-colors" />
                        <span className="text-xs text-dark-500 mt-2 block font-medium">Upload<br/>Photo</span>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'photoUrl')} className="hidden" />
                </label>
                {formData.photoUrl && (
                  <button type="button" onClick={() => setFormData(prev => prev ? { ...prev, photoUrl: undefined } : null)} className="text-xs text-red-500 mt-2 font-bold hover:text-red-400">
                    Remove Photo
                  </button>
                )}
              </div>

              {/* Second Reference */}
              <div className="flex flex-col items-center">
                <label className="block text-sm font-bold text-white mb-3 tracking-wide uppercase">Second Ref. (ID/Doc)</label>
                <label className="cursor-pointer group relative">
                  <div className="w-32 h-32 border-2 border-dashed border-dark-500 group-hover:border-blue-500 bg-dark-800 rounded-lg flex items-center justify-center overflow-hidden transition-colors">
                    {formData.secondReferenceUrl ? (
                      <img src={formData.secondReferenceUrl} alt="Reference" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <FileText className="w-8 h-8 text-dark-500 group-hover:text-blue-500 mx-auto transition-colors" />
                        <span className="text-xs text-dark-500 mt-2 block font-medium">Upload<br/>Image</span>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'secondReferenceUrl')} className="hidden" />
                </label>
                 {formData.secondReferenceUrl && (
                  <button type="button" onClick={() => setFormData(prev => prev ? { ...prev, secondReferenceUrl: undefined } : null)} className="text-xs text-red-500 mt-2 font-bold hover:text-red-400">
                    Remove Reference
                  </button>
                )}
              </div>
            </div>

            {/* Core Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-1">Player Name</label>
                <input type="text" name="name" required className="input-field" value={formData.name || ''} onChange={handleInputChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-1">Sold Price (Points)</label>
                <input type="number" name="soldPrice" className="input-field" value={formData.soldPrice || 0} onChange={handleInputChange} disabled={formData.status !== 'sold' && formData.status !== 'retained'} />
                {formData.status !== 'sold' && formData.status !== 'retained' && <p className="text-[10px] text-dark-500 mt-1">Player is not sold/retained yet.</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-1">Age</label>
                <input type="number" name="age" className="input-field" value={formData.age || ''} onChange={handleInputChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-1">Father's Name</label>
                <input type="text" name="fatherName" className="input-field" value={formData.fatherName || ''} onChange={handleInputChange} />
              </div>
            </div>

            {/* Classification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-dark-700 pt-5">
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-1">Player Tag (Type)</label>
                <select name="playerTag" className="input-field" value={formData.playerTag || 'Player'} onChange={handleInputChange}>
                  <option value="Player">Player</option>
                  <option value="Owner">Owner</option>
                  <option value="Captain">Captain</option>
                  <option value="Vice Captain">Vice Captain</option>
                  <option value="Icon">Icon</option>
                  <option value="Retain">Retain</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-1">{fieldText.roleLabel}</label>
                <select name="role" className="input-field" value={formData.role || roleOptions[0]} onChange={handleInputChange}>
                  {roleOptions.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <p className="text-[10px] text-dark-500 mt-1">{fieldText.roleHint}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-1">{fieldText.specLabel}</label>
                <select name="specification" className="input-field" value={formData.specification || ''} onChange={handleInputChange}>
                  <option value="">-- None --</option>
                  {specificationOptions.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
                <p className="text-[10px] text-dark-500 mt-1">{fieldText.specHint}</p>
              </div>
               <div>
                <label className="block text-sm font-medium text-dark-400 mb-1">{fieldText.skillLabel}</label>
                <select name="skill" className="input-field" value={formData.skill || ''} onChange={handleInputChange}>
                  <option value="">-- None --</option>
                  {availableSkills.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
                <p className="text-[10px] text-dark-500 mt-1">{fieldText.skillHint}</p>
              </div>
            </div>

            {/* Gear & Status */}
             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 border-t border-dark-700 pt-5">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-dark-400 mb-1">Jersey Name</label>
                <input type="text" name="jerseyName" className="input-field" value={formData.jerseyName || ''} onChange={handleInputChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-1">Jersey No.</label>
                <input type="text" name="jerseyNumber" className="input-field" value={formData.jerseyNumber || ''} onChange={handleInputChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-1">Jersey Size</label>
                <select name="jerseySize" className="input-field" value={formData.jerseySize || ''} onChange={handleInputChange}>
                  <option value="">-- None --</option>
                  {['S','M','L','XL','XXL','Custom'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-1">Trouser Size</label>
                <select name="trouserSize" className="input-field" value={formData.trouserSize || ''} onChange={handleInputChange}>
                  <option value="">-- None --</option>
                  {['S','M','L','XL','XXL','Custom'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              
              <div className="md:col-span-3 lg:col-span-5 pt-2">
                <label className="block text-sm font-medium text-dark-400 mb-1">Status</label>
                <select name="status" className="input-field max-w-xs" value={formData.status} onChange={handleInputChange}>
                  <option value="available">Available (Unsold)</option>
                  <option value="sold">Sold</option>
                  <option value="retained">Retained (Icon/Owner)</option>
                </select>
              </div>
            </div>
            
            <div className="border-t border-dark-700 pt-5">
              <label className="block text-sm font-medium text-dark-400 mb-1">Extra Details / Medical</label>
              <textarea name="extraDetails" className="input-field min-h-[80px] resize-y" value={formData.extraDetails || ''} onChange={handleInputChange} />
            </div>
          </form>
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-dark-900 border-t border-dark-700 flex justify-end gap-3 rounded-b-xl border-t-2">
          <button type="button" onClick={onClose} className="btn-secondary py-2 px-6">Cancel</button>
          <button type="submit" form="edit-player-form" className="btn-primary py-2 px-8 font-bold">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
