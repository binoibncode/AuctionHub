import { StatusCodes } from 'http-status-codes';
import { BidModel } from '../models/Bid.js';
import { AuctionModel } from '../models/Auction.js';
import { PlayerModel } from '../models/Player.js';
import { TeamModel } from '../models/Team.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { emitToAuction } from '../utils/socket.js';

export const getBids = asyncHandler(async (req, res) => {
  const { auctionId, playerId } = req.query;
  const filter: Record<string, unknown> = {};
  if (auctionId) filter.auctionId = auctionId;
  if (playerId) filter.playerId = playerId;

  const bids = await BidModel.find(filter).sort({ createdAt: -1 }).limit(100);
  res.status(StatusCodes.OK).json({ success: true, data: bids });
});

export const placeBid = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
  }

  const { auctionId, playerId, teamId, amount } = req.body;

  const [auction, player, team] = await Promise.all([
    AuctionModel.findById(auctionId),
    PlayerModel.findById(playerId),
    TeamModel.findById(teamId),
  ]);

  if (!auction) throw new ApiError(StatusCodes.NOT_FOUND, 'Auction not found');
  if (!player) throw new ApiError(StatusCodes.NOT_FOUND, 'Player not found');
  if (!team) throw new ApiError(StatusCodes.NOT_FOUND, 'Team not found');

  if (auction.status !== 'live') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Auction is not live');
  }

  const latestBid = await BidModel.findOne({ playerId }).sort({ createdAt: -1 });
  const minAllowed = latestBid ? latestBid.amount + auction.bidIncreaseBy : player.basePrice;

  if (Number(amount) < minAllowed) {
    throw new ApiError(StatusCodes.BAD_REQUEST, `Bid must be at least ${minAllowed}`);
  }

  const bid = await BidModel.create({
    auctionId,
    playerId,
    teamId,
    amount,
    userId: req.user.userId,
  });

  emitToAuction(String(auctionId), 'bid:placed', {
    id: bid._id,
    auctionId,
    playerId,
    teamId,
    amount,
    userId: req.user.userId,
    createdAt: bid.createdAt,
  });

  res.status(StatusCodes.CREATED).json({ success: true, data: bid });
});
