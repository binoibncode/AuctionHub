import { Router } from 'express';
import { getBids, placeBid } from '../controllers/bid.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getBids);
router.post('/', requireAuth, requireRole('Bidder', 'Organizer', 'Admin'), placeBid);

export { router as bidRoutes };
