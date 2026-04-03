import { StatusCodes } from 'http-status-codes';
import { AuctionModel } from '../models/Auction.js';
import { TeamModel } from '../models/Team.js';
import { PlayerModel } from '../models/Player.js';
import { BidModel } from '../models/Bid.js';
import { AuctionRegistrationModel } from '../models/AuctionRegistration.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

function generateAuctionCode() {
  return String(Math.floor(10000000 + Math.random() * 90000000));
}

export const getAuctions = asyncHandler(async (req, res) => {
  const { organizerId, status } = req.query;

  const filter: Record<string, unknown> = {};
  if (organizerId) filter.organizerId = organizerId;
  if (status) filter.status = status;

  const auctions = await AuctionModel.find(filter).sort({ createdAt: -1 });
  res.status(StatusCodes.OK).json({ success: true, data: auctions });
});

export const getAuctionById = asyncHandler(async (req, res) => {
  const auction = await AuctionModel.findById(req.params.id);
  if (!auction) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Auction not found');
  }
  res.status(StatusCodes.OK).json({ success: true, data: auction });
});

export const getAuctionByCode = asyncHandler(async (req, res) => {
  const auction = await AuctionModel.findOne({ auctionCode: req.params.code });
  if (!auction) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Auction not found');
  }
  res.status(StatusCodes.OK).json({ success: true, data: auction });
});

export const createAuction = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
  }

  const auction = await AuctionModel.create({
    ...req.body,
    organizerId: req.user.userId,
    auctionCode: req.body.auctionCode || generateAuctionCode(),
    status: req.body.status || 'upcoming',
  });

  res.status(StatusCodes.CREATED).json({ success: true, data: auction });
});

export const updateAuctionStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const auction = await AuctionModel.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!auction) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Auction not found');
  }

  res.status(StatusCodes.OK).json({ success: true, data: auction });
});

export const updateAuction = asyncHandler(async (req, res) => {
  const auction = await AuctionModel.findByIdAndUpdate(req.params.id, req.body, { new: true });

  if (!auction) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Auction not found');
  }

  res.status(StatusCodes.OK).json({ success: true, data: auction });
});

export const deleteAuction = asyncHandler(async (req, res) => {
  const auction = await AuctionModel.findById(req.params.id);
  if (!auction) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Auction not found');
  }

  if (!req.user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
  }

  // Organizers can only delete their own auctions. Admins can delete any auction.
  if (req.user.role !== 'Admin' && String(auction.organizerId) !== req.user.userId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to delete this auction');
  }

  await Promise.all([
    TeamModel.deleteMany({ auctionId: auction._id }),
    PlayerModel.deleteMany({ auctionId: auction._id }),
    BidModel.deleteMany({ auctionId: auction._id }),
    AuctionRegistrationModel.deleteMany({ auctionId: auction._id }),
    AuctionModel.findByIdAndDelete(auction._id),
  ]);

  res.status(StatusCodes.OK).json({ success: true, message: 'Auction deleted successfully' });
});
