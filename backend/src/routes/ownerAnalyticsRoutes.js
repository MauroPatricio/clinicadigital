import express from 'express';
import {
    getExecutiveKPIs,
    getRevenueBreakdown,
    getDoctorOccupancy,
    getTopServices,
    getBusinessAlerts
} from '../controllers/ownerAnalyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and owner role
router.use(protect);
router.use(authorize('owner'));

// Executive Dashboard KPIs
router.get('/kpis', getExecutiveKPIs);

// Revenue Analytics
router.get('/revenue', getRevenueBreakdown);

// Doctor Performance
router.get('/doctor-occupancy', getDoctorOccupancy);

// Service Analytics
router.get('/top-services', getTopServices);

// Business Alerts
router.get('/alerts', getBusinessAlerts);

export default router;
