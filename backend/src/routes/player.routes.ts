import { Router } from 'express';
import {
  createPlayer,
  deletePlayer,
  getPlayers,
  markPlayerUnsold,
  purchasePlayer,
  updatePlayer,
} from '../controllers/player.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getPlayers);
router.post('/', requireAuth, requireRole('Organizer', 'Admin'), createPlayer);
router.patch('/:id', requireAuth, requireRole('Organizer', 'Admin'), updatePlayer);
router.patch('/:id/unsold', requireAuth, requireRole('Organizer', 'Admin'), markPlayerUnsold);
router.patch('/:id/purchase', requireAuth, requireRole('Organizer', 'Admin'), purchasePlayer);
router.delete('/:id', requireAuth, requireRole('Organizer', 'Admin'), deletePlayer);

export { router as playerRoutes };
