import express from 'express';
import {
    createOrganization,
    getOrganization,
    updateOrganization,
    getOrganizationStats
} from '../controllers/organizationController.js';
import { protect, requireOwner } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/', createOrganization); // Owner registration

// Protected routes (Owner only)
router.use(protect); // All routes below require authentication
router.use(requireOwner); // All routes below require owner role

router.get('/:id', getOrganization);
router.put('/:id', updateOrganization);
router.get('/:id/stats', getOrganizationStats);

export default router;
