import { StatusCodes } from 'http-status-codes';
import { PlayerModel } from '../models/Player.js';
import { TeamModel } from '../models/Team.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const getPlayers = asyncHandler(async (req, res) => {
  const { auctionId, status } = req.query;
  const filter: Record<string, unknown> = {};
  if (auctionId) filter.auctionId = auctionId;
  if (status) filter.status = status;

  const players = await PlayerModel.find(filter).sort({ createdAt: -1 });
  res.status(StatusCodes.OK).json({ success: true, data: players });
});

export const createPlayer = asyncHandler(async (req, res) => {
  const player = await PlayerModel.create(req.body);
  res.status(StatusCodes.CREATED).json({ success: true, data: player });
});

export const updatePlayer = asyncHandler(async (req, res) => {
  const player = await PlayerModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!player) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Player not found');
  }
  res.status(StatusCodes.OK).json({ success: true, data: player });
});

export const deletePlayer = asyncHandler(async (req, res) => {
  const player = await PlayerModel.findByIdAndDelete(req.params.id);
  if (!player) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Player not found');
  }

  await Promise.all([
    TeamModel.updateMany({ players: player._id }, { $pull: { players: player._id } }),
    TeamModel.updateMany({ iconPlayerId: player._id }, { $unset: { iconPlayerId: '' } }),
    TeamModel.updateMany({ ownerPlayerId: player._id }, { $unset: { ownerPlayerId: '' } }),
  ]);

  res.status(StatusCodes.OK).json({ success: true, message: 'Player deleted successfully' });
});

export const markPlayerUnsold = asyncHandler(async (req, res) => {
  const player = await PlayerModel.findByIdAndUpdate(
    req.params.id,
    { status: 'unsold', soldPrice: null, soldToTeamId: null },
    { new: true }
  );
  if (!player) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Player not found');
  }
  res.status(StatusCodes.OK).json({ success: true, data: player });
});

export const purchasePlayer = asyncHandler(async (req, res) => {
  const { teamId, amount } = req.body;
  const player = await PlayerModel.findById(req.params.id);

  if (!player) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Player not found');
  }

  const team = await TeamModel.findById(teamId);
  if (!team) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Team not found');
  }

  player.status = 'sold';
  player.soldPrice = amount;
  player.soldToTeamId = team._id;
  await player.save();

  team.players.push(player._id);
  team.pointsSpent += Number(amount || 0);
  await team.save();

  res.status(StatusCodes.OK).json({ success: true, data: player });
});
