import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
    getConsolidatedStats,
    getClinicComparison
} from '../controllers/multiClinicController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('owner'));

router.get('/dashboard', getConsolidatedStats);
router.get('/compare', getClinicComparison);

export default router;
