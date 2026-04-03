import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/db.js';
import { UserModel } from '../models/User.js';
import { AuctionModel } from '../models/Auction.js';
import { TeamModel } from '../models/Team.js';
import { PlayerModel } from '../models/Player.js';
import { PricingPlanModel } from '../models/PricingPlan.js';

async function seed() {
  await connectDatabase();

  await Promise.all([
    UserModel.deleteMany({}),
    AuctionModel.deleteMany({}),
    TeamModel.deleteMany({}),
    PlayerModel.deleteMany({}),
    PricingPlanModel.deleteMany({}),
  ]);

  const [adminPass, organizerPass, bidderPass, playerPass] = await Promise.all([
    bcrypt.hash('admin123', 10),
    bcrypt.hash('org123', 10),
    bcrypt.hash('bidder123', 10),
    bcrypt.hash('player123', 10),
  ]);

  const [admin, organizer, bidder] = await UserModel.create([
    {
      name: 'Admin User',
      email: 'admin@auction.com',
      password: adminPass,
      role: 'Admin',
      phone: '9876543210',
      city: 'Mumbai',
    },
    {
      name: 'Organizer Sam',
      email: 'org@auction.com',
      password: organizerPass,
      role: 'Organizer',
      phone: '9847128669',
      city: 'Trivandrum',
    },
    {
      name: 'Bidder Bob',
      email: 'bidder@auction.com',
      password: bidderPass,
      role: 'Bidder',
      purse: 500000,
      phone: '9123456789',
      city: 'Delhi',
    },
    {
      name: 'Virat Kohli',
      email: 'player@auction.com',
      password: playerPass,
      role: 'Player',
      phone: '9000000001',
      city: 'Delhi',
    },
  ]);

  const auction = await AuctionModel.create({
    organizerId: organizer._id,
    categoryId: '2',
    name: 'Perinthani Premier League 2025',
    auctionCode: '59872084',
    date: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    time: '10:00 AM',
    venue: 'University Stadium, Trivandrum',
    playersPerTeam: 15,
    pointsPerTeam: 100000,
    minimumBid: 5000,
    bidIncreaseBy: 1000,
    totalTeams: 8,
    status: 'live',
  });

  const teams = await TeamModel.create([
    {
      auctionId: auction._id,
      name: 'Royal Challengers',
      ownerName: 'Rajesh Kumar',
      isOwnerPlaying: false,
      pointsSpent: 0,
      players: [],
    },
    {
      auctionId: auction._id,
      name: 'Super Kings',
      ownerName: 'Anita Sharma',
      isOwnerPlaying: false,
      pointsSpent: 0,
      players: [],
    },
  ]);

  await PlayerModel.create([
    {
      auctionId: auction._id,
      name: 'Rohit Sharma',
      sport: 'Cricket',
      role: 'Batsman',
      basePrice: 15000,
      status: 'available',
      isIcon: false,
      isOwner: false,
    },
    {
      auctionId: auction._id,
      name: 'Jasprit Bumrah',
      sport: 'Cricket',
      role: 'Bowler',
      basePrice: 14000,
      status: 'available',
      isIcon: false,
      isOwner: false,
    },
  ]);

  await PricingPlanModel.create([
    {
      name: 'Free',
      price: 0,
      teams: 2,
      features: ['Up to 2 Teams', 'Basic Auction Access'],
      recommended: false,
    },
    {
      name: 'Pro',
      price: 5000,
      teams: 12,
      features: ['Up to 12 Teams', 'Priority Analytics', 'Advanced Features'],
      recommended: true,
    },
  ]);

  console.log('Seed complete');
  console.log('Users:', { admin: admin.email, organizer: organizer.email, bidder: bidder.email });
  console.log('Auction:', auction.name, 'Teams:', teams.map((t) => t.name).join(', '));

  process.exit(0);
}

seed().catch((error) => {
  console.error('Seed failed', error);
  process.exit(1);
});
