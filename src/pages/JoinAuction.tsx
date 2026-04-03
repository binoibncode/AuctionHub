import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SPORT_CATEGORIES } from '../constants/sports';
import { Auction, Player } from '../types';
import { format } from 'date-fns';
import {
  Calendar, MapPin, Users, Hash, Edit3
} from 'lucide-react';

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

const getSportType = (sportName?: string): SportType => {
  const name = (sportName || '').toLowerCase();
  if (name.includes('football')) return 'football';
  if (name.includes('nba') || name.includes('basketball')) return 'nba';
  if (name.includes('tennis')) return 'tennis';
  if (name.includes('volleyball')) return 'volleyball';
  if (name.includes('badminton')) return 'badminton';
  if (name.includes('kabadi') || name.includes('kabaddi')) return 'kabadi';
  return 'cricket';
};

const getSkillOptions = (sportType: SportType, specification?: string, category?: string) => {
  const skillsBySpec = SPORT_PLAYER_OPTIONS[sportType].skillsBySpec;
  if (specification && skillsBySpec[specification]) {
    return skillsBySpec[specification];
  }
  if (category && skillsBySpec[category]) {
    return skillsBySpec[category];
  }
  return [];
};

const getFieldTextBySport = (sportType: SportType) => {
  switch (sportType) {
    case 'football':
    case 'nba':
      return {
        roleLabel: 'Position',
        roleHint: 'Select primary on-field position.',
        specLabel: 'Position Profile',
        specHint: 'Choose your specific playing profile.',
        skillLabel: 'Core Skill',
        skillHint: 'Pick your strongest competitive skill.',
      };
    case 'tennis':
    case 'badminton':
      return {
        roleLabel: 'Category',
        roleHint: 'Choose your event category.',
        specLabel: 'Play Style',
        specHint: 'Select your preferred style.',
        skillLabel: 'Key Strength',
        skillHint: 'Select your best match skill.',
      };
    case 'volleyball':
      return {
        roleLabel: 'Court Role',
        roleHint: 'Select your main court responsibility.',
        specLabel: 'Specialization',
        specHint: 'Choose your specific role focus.',
        skillLabel: 'Core Skill',
        skillHint: 'Pick your strongest volleyball skill.',
      };
    case 'kabadi':
      return {
        roleLabel: 'Role',
        roleHint: 'Choose your kabadi role.',
        specLabel: 'Play Side',
        specHint: 'Select your tactical position.',
        skillLabel: 'Key Skill',
        skillHint: 'Pick your strongest kabadi move.',
      };
    default:
      return {
        roleLabel: 'Role / Category',
        roleHint: 'Choose your primary cricket role.',
        specLabel: 'Specification',
        specHint: 'Choose your detailed specialization.',
        skillLabel: 'Skill',
        skillHint: 'Select your strongest cricket skill.',
      };
  }
};

export default function JoinAuction() {
  const { code } = useParams<{ code: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [status, setStatus] = useState<'loading' | 'found' | 'notfound' | 'joined' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredCount, setRegisteredCount] = useState(0);
  const categories = SPORT_CATEGORIES;

  // Extended Player Fields State
  const [formData, setFormData] = useState<Partial<Player>>({
    category: 'Batsman',
    age: 18,
    fatherName: '',
    playerTag: 'Player',
    specification: 'Batsman',
    skill: 'Top Order Batter',
    jerseySize: 'L',
    jerseyName: '',
    jerseyNumber: '',
    trouserSize: 'L',
    extraDetails: ''
  });

  const currentSportType = getSportType(auction ? categories.find(c => c.id === auction.categoryId)?.name : undefined);
  const currentRoleOptions = SPORT_PLAYER_OPTIONS[currentSportType].roles;
  const currentSpecOptions = SPORT_PLAYER_OPTIONS[currentSportType].specifications;
  const fieldText = getFieldTextBySport(currentSportType);

  useEffect(() => {
    if (user?.role === 'Player' && user.isIcon) {
      setFormData(prev => ({ 
        ...prev, 
        playerTag: 'Icon',
        basePrice: user.purse || prev.basePrice 
      }));
    }
  }, [user]);

  useEffect(() => {
    const loadAuction = async () => {
      if (!code) {
        setStatus('notfound');
        return;
      }

      setStatus('loading');
      try {
        const auctionRes = await api.getAuctionByCode(code);
        const auctionData = (auctionRes.data || null) as unknown as Auction | null;
        if (!auctionData) {
          setStatus('notfound');
          return;
        }

        setAuction(auctionData);
        const playersRes = await api.getPlayers({ auctionId: auctionData.id });
        setRegisteredCount((playersRes.data || []).length);
        setStatus('found');
      } catch {
        setStatus('notfound');
      }
    };

    void loadAuction();
  }, [code]);

  useEffect(() => {
    if (!auction) return;
    const auctionCategory = categories.find(c => c.id === auction.categoryId);
    const sportType = getSportType(auctionCategory?.name);
    const defaultsBySport: Record<SportType, { category: string; specification: string; skill: string }> = {
      cricket: { category: 'Batsman', specification: 'Batsman', skill: 'Top Order Batter' },
      football: { category: 'Forward', specification: 'Striker', skill: 'Poacher' },
      nba: { category: 'Point Guard', specification: 'Point Guard', skill: 'Playmaker' },
      tennis: { category: 'Singles', specification: 'Baseline Player', skill: 'Topspin Rally' },
      volleyball: { category: 'Setter', specification: 'Setter', skill: 'Quick Set' },
      badminton: { category: 'Singles', specification: 'All-Round Player', skill: 'Balanced Rally' },
      kabadi: { category: 'Raider', specification: 'Left Raider', skill: 'Toe Touch' },
    };

    const defaults = defaultsBySport[sportType];

    setFormData(prev => {
      const nextSkills = getSkillOptions(sportType, prev.specification || defaults.specification, prev.category || defaults.category);
      const nextSkill = prev.skill && nextSkills.includes(prev.skill) ? prev.skill : defaults.skill;
      return {
        ...prev,
        category: defaults.category,
        specification: defaults.specification,
        skill: nextSkill,
      };
    });
  }, [auction, categories]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (!prev) return prev;

      if (name === 'specification') {
        const nextSkills = getSkillOptions(currentSportType, value, prev.category);
        const shouldResetSkill = prev.skill ? !nextSkills.includes(prev.skill) : false;
        return {
          ...prev,
          specification: value,
          skill: shouldResetSkill ? '' : prev.skill,
        };
      }

      if (name === 'category') {
        const nextSkills = getSkillOptions(currentSportType, prev.specification, value);
        const shouldResetSkill = prev.skill ? !nextSkills.includes(prev.skill) : false;
        return {
          ...prev,
          category: value,
          skill: shouldResetSkill ? '' : prev.skill,
        };
      }

      return { ...prev, [name]: name === 'age' ? Number(value) : value };
    });
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !auction) return;

    if (user.role !== 'Player') {
      setMessage('Only Player accounts can register for auctions.');
      setStatus('error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.registerPlayerForAuction(auction.auctionCode, {
        ...formData,
        sport: cat?.name || 'Draft Player',
        role: formData.category || formData.role || 'Registered Player',
      });
      setStatus('joined');
      setMessage(`Successfully registered for "${auction.name}"!`);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cat = auction ? categories.find(c => c.id === auction.categoryId) : null;
  const availableSkills = getSkillOptions(currentSportType, formData.specification, formData.category);

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">🏏</div>
          <h1 className="text-2xl font-black text-white mb-2">Auction Invitation</h1>
          <p className="text-dark-400 mb-6">You need to log in as a Player to join this auction.</p>
          <Link
            to={`/login?redirect=/join/${code}`}
            className="btn-primary py-3 px-6 font-bold inline-block"
          >
            Login to Join
          </Link>
          <p className="text-dark-500 text-sm mt-4">
            Don't have an account? <Link to={`/register?redirect=/join/${code}`} className="text-primary-500 font-bold">Register</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center py-12 px-6">
      <div className="max-w-2xl w-full">
        {status === 'notfound' && (
          <div className="card p-8 text-center">
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-black text-white mb-2">Invalid Code</h1>
            <p className="text-dark-400 mb-6">No auction found with code <span className="font-mono text-primary-500">{code}</span></p>
            <Link to="/player" className="btn-primary py-2 px-6 font-bold">Go to Dashboard</Link>
          </div>
        )}

        {status === 'loading' && (
          <div className="text-center text-dark-400 py-8">Loading...</div>
        )}

        {status === 'joined' && (
          <div className="card p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-black text-white mb-2">You're In!</h1>
            <p className="text-dark-400 mb-2">{message}</p>
            <p className="text-dark-500 text-sm mb-6">You'll be notified when the auction goes live.</p>
            <button onClick={() => navigate('/player')} className="btn-primary py-2 px-6 font-bold">
              Go to Dashboard
            </button>
          </div>
        )}

        {(status === 'found' || status === 'error') && auction && (
          <div className="card p-8">
            <div className="text-center mb-6 border-b border-dark-700 pb-6">
              <div className="text-4xl mb-2">{cat?.icon}</div>
              <h1 className="text-2xl font-black text-white">{auction.name}</h1>
              <p className="text-dark-400 text-sm mt-1">{cat?.name} Draft Auction</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8 bg-dark-700/30 p-4 rounded-xl">
              <div className="flex items-center gap-3 text-dark-300 text-sm">
                <Hash className="w-5 h-5 text-primary-500" />
                <span>Code:<br/><span className="font-mono text-white font-bold">{auction.auctionCode}</span></span>
              </div>
              <div className="flex items-center gap-3 text-dark-300 text-sm">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span>Starts:<br/><span className="text-white font-bold">{format(new Date(auction.date), 'MMM dd')} at {auction.time}</span></span>
              </div>
              <div className="flex items-center gap-3 text-dark-300 text-sm">
                <MapPin className="w-5 h-5 text-green-400" />
                <span>Venue:<br/><span className="text-white font-bold">{auction.venue}</span></span>
              </div>
              <div className="flex items-center gap-3 text-dark-300 text-sm">
                <Users className="w-5 h-5 text-orange-400" />
                <span>Registered:<br/><span className="text-white font-bold">{registeredCount} Players</span></span>
              </div>
            </div>

            {auction.status === 'closed' ? (
              <div className="bg-dark-700 rounded-lg p-4 text-center">
                <p className="text-dark-400">This auction has already ended.</p>
              </div>
            ) : (
              <form onSubmit={handleJoin} className="space-y-6">
                <div className="flex items-center gap-2 mb-4 text-white font-bold">
                  <Edit3 className="w-5 h-5 text-primary-500" /> 
                  <h2>Player Registration Details</h2>
                </div>

                {/* Personal Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-400 mb-1">Age</label>
                    <input type="number" name="age" min={5} max={100} required className="input-field" value={formData.age} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-400 mb-1">Father's Name</label>
                    <input type="text" name="fatherName" required placeholder="Full Name" className="input-field" value={formData.fatherName} onChange={handleInputChange} />
                  </div>
                </div>

                {/* Player Profile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-dark-700 pt-5">
                  <div>
                    <label className="block text-sm font-medium text-dark-400 mb-1">{fieldText.roleLabel}</label>
                    <select name="category" className="input-field" value={formData.category} onChange={handleInputChange}>
                      {currentRoleOptions.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-dark-500 mt-1">{fieldText.roleHint}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-400 mb-1">Player Tag</label>
                    <select name="playerTag" className="input-field" value={formData.playerTag} onChange={handleInputChange}>
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
                    <label className="block text-sm font-medium text-dark-400 mb-1">{fieldText.specLabel}</label>
                    <select name="specification" className="input-field" value={formData.specification} onChange={handleInputChange}>
                      {currentSpecOptions.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-dark-500 mt-1">{fieldText.specHint}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-400 mb-1">{fieldText.skillLabel}</label>
                    <select name="skill" className="input-field" value={formData.skill} onChange={handleInputChange}>
                      <option value="">-- None --</option>
                      {availableSkills.map(skill => (
                        <option key={skill} value={skill}>{skill}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-dark-500 mt-1">{fieldText.skillHint}</p>
                  </div>
                </div>

                {/* Clothing & Gear */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-dark-700 pt-5">
                  <div>
                    <label className="block text-sm font-medium text-dark-400 mb-1">Jersey Name</label>
                    <input type="text" name="jerseyName" required placeholder="Name on back" className="input-field" value={formData.jerseyName} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-400 mb-1">Jersey Number</label>
                    <input type="text" name="jerseyNumber" required placeholder="e.g. 10" className="input-field" value={formData.jerseyNumber} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-400 mb-1">Jersey Size</label>
                    <select name="jerseySize" className="input-field" value={formData.jerseySize} onChange={handleInputChange}>
                      <option value="S">Small (S)</option>
                      <option value="M">Medium (M)</option>
                      <option value="L">Large (L)</option>
                      <option value="XL">Extra Large (XL)</option>
                      <option value="XXL">XXL</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-400 mb-1">Trouser Size</label>
                    <select name="trouserSize" className="input-field" value={formData.trouserSize} onChange={handleInputChange}>
                      <option value="S">Small (S)</option>
                      <option value="M">Medium (M)</option>
                      <option value="L">Large (L)</option>
                      <option value="XL">Extra Large (XL)</option>
                      <option value="XXL">XXL</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-dark-400 mb-1">Extra Details</label>
                    <input type="text" name="extraDetails" placeholder="Any additional info..." className="input-field" value={formData.extraDetails} onChange={handleInputChange} />
                  </div>
                </div>

                {status === 'error' && message && (
                  <div className="bg-red-500/10 text-red-500 rounded-lg p-3 text-sm font-bold text-center">
                    {message}
                  </div>
                )}

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-4 font-bold text-lg mt-4 hocus:scale-[1.02] transition-transform">
                  {isSubmitting ? 'Registering...' : '🎯 Submit Registration'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
