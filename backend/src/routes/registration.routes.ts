import { Router } from 'express';
import { getMyRegistrations, registerPlayerForAuction } from '../controllers/registration.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/me', requireAuth, requireRole('Player'), getMyRegistrations);
router.post('/join', requireAuth, requireRole('Player'), registerPlayerForAuction);

export { router as registrationRoutes };
