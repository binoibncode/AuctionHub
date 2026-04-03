import { Router } from 'express';
import {
  createAuction,
  deleteAuction,
  getAuctionByCode,
  getAuctionById,
  getAuctions,
  updateAuction,
  updateAuctionStatus,
} from '../controllers/auction.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getAuctions);
router.get('/code/:code', getAuctionByCode);
router.get('/:id', getAuctionById);
router.post('/', requireAuth, requireRole('Organizer', 'Admin'), createAuction);
router.patch('/:id', requireAuth, requireRole('Organizer', 'Admin'), updateAuction);
router.patch('/:id/status', requireAuth, requireRole('Organizer', 'Admin'), updateAuctionStatus);
router.delete('/:id', requireAuth, requireRole('Organizer', 'Admin'), deleteAuction);

export { router as auctionRoutes };
