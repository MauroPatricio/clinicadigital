import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
    getPatientFlow,
    getDoctorProductivity,
    getRetentionMetrics,
    getRevenueBySpecialty,
    getGrowthTrends,
    getOperationalEfficiency,
    getFinancialKPIs,
    getPredictions
} from '../controllers/phase4AnalyticsController.js';

const router = express.Router();

// All routes require authentication and owner role
router.use(protect);
router.use(authorize('owner'));

// Phase 4: Advanced Analytics Endpoints
router.get('/patient-flow', getPatientFlow);
router.get('/doctor-productivity', getDoctorProductivity);
router.get('/retention', getRetentionMetrics);
router.get('/revenue-by-specialty', getRevenueBySpecialty);
router.get('/growth-trends', getGrowthTrends);
router.get('/operational-efficiency', getOperationalEfficiency);
router.get('/financial-kpis', getFinancialKPIs);
router.get('/predictions', getPredictions);

export default router;
