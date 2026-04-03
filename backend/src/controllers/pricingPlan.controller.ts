import { StatusCodes } from 'http-status-codes';
import { PricingPlanModel } from '../models/PricingPlan.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const getPricingPlans = asyncHandler(async (_req, res) => {
  const plans = await PricingPlanModel.find().sort({ price: 1, createdAt: 1 });
  res.status(StatusCodes.OK).json({ success: true, data: plans });
});

export const createPricingPlan = asyncHandler(async (req, res) => {
  const { recommended } = req.body as { recommended?: boolean };

  if (recommended) {
    await PricingPlanModel.updateMany({}, { $set: { recommended: false } });
  }

  const plan = await PricingPlanModel.create(req.body);
  res.status(StatusCodes.CREATED).json({ success: true, data: plan });
});

export const updatePricingPlan = asyncHandler(async (req, res) => {
  const { recommended } = req.body as { recommended?: boolean };

  if (recommended) {
    await PricingPlanModel.updateMany(
      { _id: { $ne: req.params.id } },
      { $set: { recommended: false } }
    );
  }

  const plan = await PricingPlanModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!plan) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Pricing plan not found');
  }

  res.status(StatusCodes.OK).json({ success: true, data: plan });
});

export const deletePricingPlan = asyncHandler(async (req, res) => {
  const plan = await PricingPlanModel.findByIdAndDelete(req.params.id);
  if (!plan) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Pricing plan not found');
  }

  res.status(StatusCodes.OK).json({ success: true, message: 'Pricing plan deleted successfully' });
});
