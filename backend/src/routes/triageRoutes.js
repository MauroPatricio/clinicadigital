import express from 'express';
import { submitTriage, getTriageReports } from '../controllers/triageController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('nurse', 'doctor', 'staff', 'admin'), submitTriage);
router.get('/', getTriageReports);

export default router;
