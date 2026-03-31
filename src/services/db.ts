import { User, SportCategory, AuctionItem, Bid, Auction, Team, Player, AuctionRegistration } from '../types';

const INITIAL_CATEGORIES: SportCategory[] = [
  { id: '1', name: 'Football', icon: '⚽' },
  { id: '2', name: 'Cricket', icon: '🏏' },
  { id: '3', name: 'NBA', icon: '🏀' },
  { id: '4', name: 'Tennis', icon: '🎾' },
  { id: '5', name: 'Volleyball', icon: '🏐' },
  { id: '6', name: 'Table Tennis', icon: '🏓' },
  { id: '7', name: 'Badminton', icon: '🏸' },
  { id: '8', name: 'Kabaddi', icon: '🤼' },
];

const INITIAL_USERS: User[] = [
  { id: 'admin-1', name: 'Admin User', email: 'admin@auction.com', password: 'admin123', phone: '9876543210', city: 'Mumbai', role: 'Admin' },
  { id: 'org-1', name: 'Organizer Sam', email: 'org@auction.com', password: 'org123', phone: '9847128669', city: 'Trivandrum', role: 'Organizer' },
  { id: 'bidder-1', name: 'Bidder Bob', email: 'bidder@auction.com', password: 'bidder123', phone: '9123456789', city: 'Delhi', role: 'Bidder', purse: 500000 },
  { id: 'player-user-1', name: 'Virat Kohli', email: 'player@auction.com', password: 'player123', phone: '9000000001', city: 'Delhi', role: 'Player' },
];

const INITIAL_ITEMS: AuctionItem[] = [
  {
    id: 'item-1',
    categoryId: '1',
    title: 'Lionel Messi Signed Jersey',
    description: 'Authentic signed jersey from the 2022 World Cup finals.',
    imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    basePrice: 500,
    currentPrice: 500,
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    status: 'live',
    organizerId: 'org-1'
  },
  {
    id: 'item-2',
    categoryId: '2',
    title: 'Virat Kohli Signed Bat',
    description: 'Match-played bat used during the 2011 World Cup.',
    imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    basePrice: 1000,
    currentPrice: 1500,
    endTime: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
    status: 'live',
    organizerId: 'org-1'
  },
  {
    id: 'item-3',
    categoryId: '3',
    title: 'Michael Jordan Rookie Card',
    description: 'PSA 10 Gem Mint condition rookie card.',
    imageUrl: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a26?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    basePrice: 5000,
    currentPrice: 5000,
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    status: 'upcoming',
    organizerId: 'org-1'
  }
];

// ─── Seed Draft Auctions ──────────────────────────────────────

const INITIAL_AUCTIONS: Auction[] = [
  {
    id: 'auction-1',
    organizerId: 'org-1',
    categoryId: '2',
    name: 'Perinthani Premier League 2025',
    auctionCode: '59872084',
    date: new Date(Date.now() + 1000 * 60 * 60 * 1).toISOString(),
    time: '10:00 AM',
    venue: 'University Stadium, Trivandrum',
    playersPerTeam: 15,
    pointsPerTeam: 100000,
    minimumBid: 5000,
    bidIncreaseBy: 1000,
    totalTeams: 8,
    status: 'live',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 'auction-2',
    organizerId: 'org-1',
    categoryId: '1',
    name: 'European Giants League Draft',
    auctionCode: '73491520',
    date: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    time: '02:00 PM',
    venue: 'Grand Arena, London',
    playersPerTeam: 24,
    pointsPerTeam: 500000,
    minimumBid: 10000,
    bidIncreaseBy: 5000,
    totalTeams: 6,
    status: 'upcoming',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'auction-3',
    organizerId: 'org-1',
    categoryId: '3',
    name: 'NBA All-Star Legends Auction',
    auctionCode: '81265437',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    time: '06:00 PM',
    venue: 'Madison Square Garden, NYC',
    playersPerTeam: 12,
    pointsPerTeam: 200000,
    minimumBid: 8000,
    bidIncreaseBy: 2000,
    totalTeams: 4,
    status: 'closed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
  },
];

const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-1', auctionId: 'auction-1', name: 'Royal Challengers', ownerName: 'Rajesh Kumar',
    isOwnerPlaying: true, ownerPlayerId: 'player-icon-1', iconPlayerId: 'player-icon-2',
    pointsSpent: 35000, players: ['player-1', 'player-2'],
  },
  {
    id: 'team-2', auctionId: 'auction-1', name: 'Super Kings', ownerName: 'Anita Sharma',
    isOwnerPlaying: false, iconPlayerId: 'player-icon-3',
    pointsSpent: 28000, players: ['player-3'],
  },
  {
    id: 'team-3', auctionId: 'auction-1', name: 'Mumbai Warriors', ownerName: 'Vikas Patel',
    isOwnerPlaying: false,
    pointsSpent: 0, players: [],
  },
  {
    id: 'team-4', auctionId: 'auction-2', name: 'London Lions', ownerName: 'James Smith',
    isOwnerPlaying: false,
    pointsSpent: 0, players: [],
  },
  {
    id: 'team-5', auctionId: 'auction-2', name: 'Madrid Matadors', ownerName: 'Carlos Ruiz',
    isOwnerPlaying: false,
    pointsSpent: 0, players: [],
  },
];

const INITIAL_PLAYERS: Player[] = [
  // ── Retained (Icon/Owner) players ──
  { id: 'player-icon-1', auctionId: 'auction-1', name: 'Rajesh Kumar', sport: 'Cricket', role: 'All-rounder', basePrice: 0, isIcon: false, isOwner: true, status: 'retained', soldToTeamId: 'team-1' },
  { id: 'player-icon-2', auctionId: 'auction-1', name: 'Sachin Tendulkar', sport: 'Cricket', role: 'Batsman', basePrice: 0, isIcon: true, isOwner: false, status: 'retained', soldToTeamId: 'team-1' },
  { id: 'player-icon-3', auctionId: 'auction-1', name: 'AB de Villiers', sport: 'Cricket', role: 'Batsman', basePrice: 0, isIcon: true, isOwner: false, status: 'retained', soldToTeamId: 'team-2' },
  // ── Regular players ──
  { id: 'player-1', auctionId: 'auction-1', name: 'Rahul Dravid', sport: 'Cricket', role: 'Batsman', basePrice: 10000, soldPrice: 18000, soldToTeamId: 'team-1', isIcon: false, isOwner: false, status: 'sold' },
  { id: 'player-2', auctionId: 'auction-1', name: 'Jasprit Bumrah', sport: 'Cricket', role: 'Bowler', basePrice: 15000, soldPrice: 17000, soldToTeamId: 'team-1', isIcon: false, isOwner: false, status: 'sold' },
  { id: 'player-3', auctionId: 'auction-1', name: 'MS Dhoni', sport: 'Cricket', role: 'Wicketkeeper', basePrice: 20000, soldPrice: 28000, soldToTeamId: 'team-2', isIcon: false, isOwner: false, status: 'sold' },
  { id: 'player-4', auctionId: 'auction-1', name: 'Rohit Sharma', sport: 'Cricket', role: 'Batsman', basePrice: 15000, isIcon: false, isOwner: false, status: 'available' },
  { id: 'player-5', auctionId: 'auction-1', name: 'Ravindra Jadeja', sport: 'Cricket', role: 'All-rounder', basePrice: 12000, isIcon: false, isOwner: false, status: 'available' },
  { id: 'player-6', auctionId: 'auction-1', name: 'KL Rahul', sport: 'Cricket', role: 'Batsman', basePrice: 10000, isIcon: false, isOwner: false, status: 'available' },
  { id: 'player-7', auctionId: 'auction-2', name: 'Marcus Rashford', sport: 'Football', role: 'Forward', basePrice: 50000, isIcon: false, isOwner: false, status: 'available' },
  { id: 'player-8', auctionId: 'auction-2', name: 'Kevin De Bruyne', sport: 'Football', role: 'Midfielder', basePrice: 60000, isIcon: false, isOwner: false, status: 'available' },
  { id: 'player-9', auctionId: 'auction-2', name: 'Virgil van Dijk', sport: 'Football', role: 'Defender', basePrice: 45000, isIcon: false, isOwner: false, status: 'available' },
];

const INITIAL_REGISTRATIONS: AuctionRegistration[] = [];

// ─── Mock Database ────────────────────────────────────────────

class MockDatabase {
  private get<T>(key: string, initial: T): T {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  }

  private set<T>(key: string, data: T) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  initialize() {
    this.get('users', INITIAL_USERS);
    this.get('categories', INITIAL_CATEGORIES);
    this.get('items', INITIAL_ITEMS);
    this.get('bids', [] as Bid[]);
    this.get('auctions', INITIAL_AUCTIONS);
    this.get('teams', INITIAL_TEAMS);
    this.get('players', INITIAL_PLAYERS);
    this.get('registrations', INITIAL_REGISTRATIONS);
  }

  // ─── Users ────────────────────────────────────

  getUsers(): User[] { return this.get('users', INITIAL_USERS); }

  addUser(user: User): { success: boolean; message: string } {
    const users = this.getUsers();
    if (users.find(u => u.email === user.email)) {
      return { success: false, message: 'A user with this email already exists.' };
    }
    users.push(user);
    this.set('users', users);
    return { success: true, message: 'Registration successful!' };
  }

  updateUser(user: User) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
      this.set('users', users);
    }
  }

  // ─── Categories ────────────────────────────────

  getCategories(): SportCategory[] { return this.get('categories', INITIAL_CATEGORIES); }

  // ─── Legacy Auction Items ──────────────────────

  getItems(): AuctionItem[] { return this.get('items', INITIAL_ITEMS); }

  saveItem(item: AuctionItem) {
    const items = this.getItems();
    const idx = items.findIndex(i => i.id === item.id);
    if (idx >= 0) items[idx] = item;
    else items.push(item);
    this.set('items', items);
  }

  // ─── Legacy Bids ──────────────────────────────

  getAllBids(): Bid[] {
    return this.get<Bid[]>('bids', []);
  }

  getBidCountForItem(itemId: string): number {
    return this.getAllBids().filter(b => b.itemId === itemId).length;
  }

  getBids(itemId: string): Bid[] {
    const bids = this.get<Bid[]>('bids', []);
    return bids.filter(b => b.itemId === itemId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  placeBid(bid: Bid): { success: boolean, message: string } {
    const items = this.getItems();
    const item = items.find(i => i.id === bid.itemId);
    if (!item) return { success: false, message: 'Item not found' };
    if (item.status !== 'live') return { success: false, message: 'Auction is not live' };

    const minIncrement = item.currentPrice * 0.05;
    const requiredBid = item.currentPrice === item.basePrice && this.getBids(item.id).length === 0
      ? item.basePrice
      : item.currentPrice + minIncrement;

    if (bid.amount < requiredBid) {
      return { success: false, message: `Bid must be at least ₹${requiredBid.toFixed(0)}` };
    }

    const user = this.getUsers().find(u => u.id === bid.userId);
    const userPurse = user?.purse ?? 0;
    if (user?.role === 'Bidder' && bid.amount > userPurse) {
      return { success: false, message: `Insufficient purse balance. Available: ₹${userPurse.toLocaleString()}` };
    }

    const bids = this.get<Bid[]>('bids', []);
    bids.push(bid);
    this.set('bids', bids);

    item.currentPrice = bid.amount;
    this.saveItem(item);

    return { success: true, message: 'Bid placed successfully!' };
  }

  // ─── Draft Auctions ───────────────────────────

  getAuctions(): Auction[] { return this.get('auctions', INITIAL_AUCTIONS); }

  getAuction(id: string): Auction | undefined {
    return this.getAuctions().find(a => a.id === id);
  }

  getAuctionByCode(code: string): Auction | undefined {
    return this.getAuctions().find(a => a.auctionCode === code);
  }

  saveAuction(auction: Auction) {
    const auctions = this.getAuctions();
    const idx = auctions.findIndex(a => a.id === auction.id);
    if (idx >= 0) auctions[idx] = auction;
    else auctions.push(auction);
    this.set('auctions', auctions);
  }

  deleteAuction(id: string) {
    const auctions = this.getAuctions().filter(a => a.id !== id);
    this.set('auctions', auctions);
    // cascade delete teams & players
    const teams = this.get<Team[]>('teams', []).filter(t => t.auctionId !== id);
    this.set('teams', teams);
    const players = this.get<Player[]>('players', []).filter(p => p.auctionId !== id);
    this.set('players', players);
    const regs = this.get<AuctionRegistration[]>('registrations', []).filter(r => r.auctionId !== id);
    this.set('registrations', regs);
  }

  generateAuctionCode(): string {
    const existing = this.getAuctions().map(a => a.auctionCode);
    let code: string;
    do {
      code = Math.floor(10000000 + Math.random() * 90000000).toString();
    } while (existing.includes(code));
    return code;
  }

  // ─── Teams ────────────────────────────────────

  getTeams(auctionId?: string): Team[] {
    const teams = this.get<Team[]>('teams', INITIAL_TEAMS);
    return auctionId ? teams.filter(t => t.auctionId === auctionId) : teams;
  }

  getTeam(id: string): Team | undefined {
    return this.get<Team[]>('teams', INITIAL_TEAMS).find(t => t.id === id);
  }

  saveTeam(team: Team) {
    const teams = this.get<Team[]>('teams', INITIAL_TEAMS);
    const idx = teams.findIndex(t => t.id === team.id);
    if (idx >= 0) teams[idx] = team;
    else teams.push(team);
    this.set('teams', teams);
  }

  deleteTeam(id: string) {
    const teams = this.get<Team[]>('teams', INITIAL_TEAMS).filter(t => t.id !== id);
    this.set('teams', teams);
  }

  // ─── Players ──────────────────────────────────

  getPlayers(auctionId?: string): Player[] {
    const players = this.get<Player[]>('players', INITIAL_PLAYERS);
    return auctionId ? players.filter(p => p.auctionId === auctionId) : players;
  }

  getPlayer(id: string): Player | undefined {
    return this.get<Player[]>('players', INITIAL_PLAYERS).find(p => p.id === id);
  }

  savePlayer(player: Player) {
    const players = this.get<Player[]>('players', INITIAL_PLAYERS);
    const idx = players.findIndex(p => p.id === player.id);
    if (idx >= 0) players[idx] = player;
    else players.push(player);
    this.set('players', players);
  }

  deletePlayer(id: string) {
    const players = this.get<Player[]>('players', INITIAL_PLAYERS).filter(p => p.id !== id);
    this.set('players', players);
  }

  // ─── Player Registration (Join Auction) ───────

  getRegistrations(auctionId?: string): AuctionRegistration[] {
    const regs = this.get<AuctionRegistration[]>('registrations', INITIAL_REGISTRATIONS);
    return auctionId ? regs.filter(r => r.auctionId === auctionId) : regs;
  }

  getRegistrationsByUser(userId: string): AuctionRegistration[] {
    return this.get<AuctionRegistration[]>('registrations', INITIAL_REGISTRATIONS).filter(r => r.userId === userId);
  }

  registerPlayerForAuction(
    userId: string, 
    auctionCode: string, 
    extraData?: Partial<Player>
  ): { success: boolean; message: string; auctionId?: string } {
    const auction = this.getAuctionByCode(auctionCode);
    if (!auction) return { success: false, message: 'Invalid auction code. Please check and try again.' };
    if (auction.status === 'closed') return { success: false, message: 'This auction has already ended.' };

    // Check if already registered
    const existing = this.getRegistrations(auction.id).find(r => r.userId === userId);
    if (existing) return { success: false, message: 'You are already registered for this auction.' };

    const user = this.getUsers().find(u => u.id === userId);
    if (!user) return { success: false, message: 'User not found.' };

    const cat = this.getCategories().find(c => c.id === auction.categoryId);

    // Create a player entry for this user in this auction
    const player: Player = {
      id: `player-${Date.now()}`,
      auctionId: auction.id,
      name: user.name,
      sport: cat?.name || '',
      role: extraData?.category || extraData?.role || 'Registered Player',   // organizer can update the role later
      basePrice: auction.minimumBid,
      isIcon: false,
      isOwner: false,
      userId: user.id,
      status: 'available',
      ...extraData,
    };
    this.savePlayer(player);

    // Create registration record
    const reg: AuctionRegistration = {
      id: `reg-${Date.now()}`,
      auctionId: auction.id,
      userId: user.id,
      playerId: player.id,
      registeredAt: new Date().toISOString(),
    };
    const regs = this.get<AuctionRegistration[]>('registrations', INITIAL_REGISTRATIONS);
    regs.push(reg);
    this.set('registrations', regs);

    return { success: true, message: `Successfully registered for "${auction.name}"!`, auctionId: auction.id };
  }

  // ─── Purchase Player (Bid Sold) ───────────────

  purchasePlayer(playerId: string, teamId: string, soldPrice: number): { success: boolean; message: string } {
    const player = this.getPlayer(playerId);
    if (!player) return { success: false, message: 'Player not found.' };
    if (player.status !== 'available') return { success: false, message: 'Player is not available for bidding.' };

    const team = this.getTeam(teamId);
    if (!team) return { success: false, message: 'Team not found.' };

    const auction = this.getAuction(team.auctionId);
    if (!auction) return { success: false, message: 'Auction not found.' };

    const balance = auction.pointsPerTeam - team.pointsSpent;
    if (soldPrice > balance) return { success: false, message: `Insufficient balance. Team has ₹${balance.toLocaleString()} remaining.` };

    // Update player
    player.status = 'sold';
    player.soldPrice = soldPrice;
    player.soldToTeamId = teamId;
    this.savePlayer(player);

    // Update team
    team.pointsSpent += soldPrice;
    team.players.push(playerId);
    this.saveTeam(team);

    return { success: true, message: `${player.name} sold to ${team.name} for ₹${soldPrice.toLocaleString()}!` };
  }

  markPlayerUnsold(playerId: string): { success: boolean; message: string } {
    const player = this.getPlayer(playerId);
    if (!player) return { success: false, message: 'Player not found.' };
    player.status = 'unsold';
    this.savePlayer(player);
    return { success: true, message: `${player.name} marked as unsold.` };
  }
}

export const db = new MockDatabase();
db.initialize();
