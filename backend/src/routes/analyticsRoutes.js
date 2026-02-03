import express from 'express';
import {
    getOwnerDashboard,
    getManagerDashboard,
    getStaffDashboard,
    getClinicAnalytics,
    getStaffPerformanceReport,
    getUnitDashboard
} from '../controllers/analyticsController.js';
import {
    protect,
    requireOwner,
    requireManager,
    requireRoleType,
    requireActiveSubscription,
    requireFeature
} from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and active subscription
router.use(protect);
router.use(requireActiveSubscription);

// Dashboard routes
router.get(
    '/owner-dashboard',
    requireOwner,
    requireFeature('analytics'),
    getOwnerDashboard
);

router.get(
    '/manager-dashboard',
    requireRoleType('manager', 'owner'),
    getManagerDashboard
);

router.get(
    '/staff-dashboard',
    requireRoleType('staff'),
    getStaffDashboard
);

// Detailed analytics
router.get(
    '/clinic/:clinicId',
    requireFeature('analytics'),
    getClinicAnalytics
);

router.get(
    '/staff-performance/:clinicId',
    requireFeature('analytics'),
    getStaffPerformanceReport
);

router.get(
    '/unit/:unitId',
    getUnitDashboard
);

export default router;
