import { StatusCodes } from 'http-status-codes';
import { AuctionModel } from '../models/Auction.js';
import { AuctionRegistrationModel } from '../models/AuctionRegistration.js';
import { PlayerModel } from '../models/Player.js';
import { UserModel } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const getMyRegistrations = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
  }

  const registrations = await AuctionRegistrationModel.find({ userId: req.user.userId })
    .sort({ createdAt: -1 })
    .populate('auctionId')
    .populate('playerId');

  const data = registrations.map((reg) => ({
    id: reg._id,
    auctionId: (() => {
      if (!reg.auctionId) return null;
      const auctionDoc = reg.auctionId as unknown as Record<string, unknown> & { _id?: unknown };
      return {
        ...auctionDoc,
        id: String(auctionDoc._id || reg.auctionId),
      };
    })(),
    playerId: (() => {
      if (!reg.playerId) return null;
      const playerDoc = reg.playerId as unknown as Record<string, unknown> & { _id?: unknown };
      return {
        ...playerDoc,
        id: String(playerDoc._id || reg.playerId),
      };
    })(),
    registeredAt: reg.createdAt,
  }));

  res.status(StatusCodes.OK).json({ success: true, data });
});

export const registerPlayerForAuction = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
  }

  const { auctionCode, playerData } = req.body as {
    auctionCode?: string;
    playerData?: Record<string, unknown>;
  };

  if (!auctionCode) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Auction code is required');
  }

  const [auction, user] = await Promise.all([
    AuctionModel.findOne({ auctionCode }),
    UserModel.findById(req.user.userId),
  ]);

  if (!auction) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Invalid auction code. Please check and try again.');
  }

  if (auction.status === 'closed') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'This auction has already ended.');
  }

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const existingRegistration = await AuctionRegistrationModel.findOne({
    auctionId: auction._id,
    userId: user._id,
  });

  if (existingRegistration) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You are already registered for this auction.');
  }

  const roleValue = String((playerData?.category as string) || (playerData?.role as string) || 'Registered Player');

  const player = await PlayerModel.create({
    auctionId: auction._id,
    name: user.name,
    sport: 'Draft Player',
    role: roleValue,
    basePrice: auction.minimumBid,
    userId: user._id,
    status: 'available',
    isIcon: false,
    isOwner: false,
    ...(playerData || {}),
  });

  await AuctionRegistrationModel.create({
    auctionId: auction._id,
    userId: user._id,
    playerId: player._id,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: `Successfully registered for "${auction.name}"!`,
    data: {
      auction,
      player,
    },
  });
});
