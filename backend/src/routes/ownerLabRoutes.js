import express from 'express';
import labController from '../controllers/labController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and owner role
router.use(protect);
router.use(authorize('owner'));

// Owner laboratory management routes
router.get('/requests', labController.getLabRequestsForOwner);
router.get('/results', labController.getLabResultsForOwner);
router.get('/history', labController.getLabHistoryForOwner);

export default router;
