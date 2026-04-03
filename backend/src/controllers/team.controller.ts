import { StatusCodes } from 'http-status-codes';
import { TeamModel } from '../models/Team.js';
import { PlayerModel } from '../models/Player.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const getTeams = asyncHandler(async (req, res) => {
  const { auctionId } = req.query;
  const filter = auctionId ? { auctionId } : {};
  const teams = await TeamModel.find(filter).sort({ createdAt: -1 });
  res.status(StatusCodes.OK).json({ success: true, data: teams });
});

export const createTeam = asyncHandler(async (req, res) => {
  const team = await TeamModel.create(req.body);
  res.status(StatusCodes.CREATED).json({ success: true, data: team });
});

export const updateTeam = asyncHandler(async (req, res) => {
  const team = await TeamModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!team) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Team not found');
  }

  res.status(StatusCodes.OK).json({ success: true, data: team });
});

export const deleteTeam = asyncHandler(async (req, res) => {
  const team = await TeamModel.findById(req.params.id);
  if (!team) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Team not found');
  }

  await Promise.all([
    PlayerModel.updateMany(
      { soldToTeamId: team._id },
      { $set: { status: 'available' }, $unset: { soldToTeamId: '', soldPrice: '' } }
    ),
    TeamModel.findByIdAndDelete(team._id),
  ]);

  res.status(StatusCodes.OK).json({ success: true, message: 'Team deleted successfully' });
});
