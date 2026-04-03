import { Router } from 'express';
import {
  createPricingPlan,
  deletePricingPlan,
  getPricingPlans,
  updatePricingPlan,
} from '../controllers/pricingPlan.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getPricingPlans);
router.post('/', requireAuth, requireRole('Admin'), createPricingPlan);
router.patch('/:id', requireAuth, requireRole('Admin'), updatePricingPlan);
router.delete('/:id', requireAuth, requireRole('Admin'), deletePricingPlan);

export { router as pricingPlanRoutes };
