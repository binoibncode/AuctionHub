import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { auctionRoutes } from './auction.routes.js';
import { teamRoutes } from './team.routes.js';
import { playerRoutes } from './player.routes.js';
import { bidRoutes } from './bid.routes.js';
import { registrationRoutes } from './registration.routes.js';
import { pricingPlanRoutes } from './pricingPlan.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/auctions', auctionRoutes);
router.use('/teams', teamRoutes);
router.use('/players', playerRoutes);
router.use('/bids', bidRoutes);
router.use('/registrations', registrationRoutes);
router.use('/pricing-plans', pricingPlanRoutes);

export { router as apiRouter };
