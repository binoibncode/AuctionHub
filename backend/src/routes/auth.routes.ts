import { Router } from 'express';
import {
	changePassword,
	forgotPasswordDemo,
	login,
	me,
	register,
	updateMe,
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password-demo', forgotPasswordDemo);
router.get('/me', requireAuth, me);
router.patch('/me', requireAuth, updateMe);
router.post('/change-password', requireAuth, changePassword);

export { router as authRoutes };
