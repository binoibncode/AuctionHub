export type Role = 'Admin' | 'Organizer' | 'Bidder' | 'Player';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  city?: string;
  photoUrl?: string;
  role: Role;
  purse?: number;
  isIcon?: boolean;
}

export interface SportCategory {
  id: string;
  name: string;
  icon: string;
}

export type AuctionStatus = 'upcoming' | 'live' | 'closed';

// ─── Sports Draft Auction System ─────────────────────────────

export interface Auction {
  id: string;
  organizerId: string;
  categoryId: string;
  name: string;
  auctionCode: string;
  date: string;             // ISO date string
  time: string;             // e.g. "10:00 AM"
  venue: string;
  playersPerTeam: number;
  pointsPerTeam: number;
  minimumBid: number;
  bidIncreaseBy: number;
  totalTeams: number;
  status: AuctionStatus;
  logoUrl?: string;         // Auction Event Logo
  createdAt: string;
}

export interface Team {
  id: string;
  auctionId: string;
  name: string;
  ownerName: string;
  isOwnerPlaying: boolean;   // owner is also a player?
  ownerPlayerId?: string;    // if owner is playing, their player ID
  iconPlayerId?: string;     // icon player's player ID
  pointsSpent: number;
  players: string[];         // Player IDs (sold players)
  logoUrl?: string;          // Team Logo
  place?: string;             // Team home place/city
}

export interface Player {
  id: string;
  auctionId: string;
  name: string;
  sport: string;
  role: string;
  basePrice: number;
  soldPrice?: number;
  soldToTeamId?: string;
  isIcon: boolean;           // icon player (auto-retained)
  isOwner: boolean;          // owner player (auto-retained)
  category?: string;         // 'Bstman', 'Bowler', 'All Rounder', 'Wicket Keeper'
  age?: number;
  fatherName?: string;
  playerTag?: string;        // 'Owner', 'Captain', 'Vice Captain', 'Icon', 'Retain', 'Other', 'Player', etc.
  specification?: string;    // 'All Rounder', 'All Rounder WK', 'Batsman', 'Bowler', 'Wicket Keeper'
  skill?: string;            // 'Right Arm Fast', 'Off-Break', etc.
  jerseySize?: string;
  jerseyName?: string;
  jerseyNumber?: string;
  trouserSize?: string;
  extraDetails?: string;
  careerDetails?: Record<string, { debut?: string; lastMatch?: string }>;

  photoUrl?: string;         // Auction-specific player photo (overrides user photo)
  secondReferenceUrl?: string; // Second reference document/image

  userId?: string;           // linked user account (for player login)
  status: 'unsold' | 'sold' | 'available' | 'retained';
}

// ─── Player Registration for Auction ─────────────────────────

export interface AuctionRegistration {
  id: string;
  auctionId: string;
  userId: string;
  playerId: string;          // the Player entity created
  registeredAt: string;
}

// ─── Pricing Plans ───────────────────────────────

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  teams: number;
  features: string[];
  recommended?: boolean;
}
