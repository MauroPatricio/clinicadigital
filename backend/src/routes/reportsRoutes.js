import express from 'express';
import {
    getOperationalReport,
    getClinicalReport,
    getFinancialReport
} from '../controllers/reportsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// All routes require manager or owner access
router.get('/operational', authorize('manager', 'owner', 'admin'), getOperationalReport);
router.get('/clinical', authorize('manager', 'owner', 'admin'), getClinicalReport);
router.get('/financial', authorize('manager', 'owner', 'admin'), getFinancialReport);

export default router;
