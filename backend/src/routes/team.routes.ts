import { Router } from 'express';
import { createTeam, deleteTeam, getTeams, updateTeam } from '../controllers/team.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getTeams);
router.post('/', requireAuth, requireRole('Organizer', 'Admin'), createTeam);
router.patch('/:id', requireAuth, requireRole('Organizer', 'Admin'), updateTeam);
router.delete('/:id', requireAuth, requireRole('Organizer', 'Admin'), deleteTeam);

export { router as teamRoutes };
