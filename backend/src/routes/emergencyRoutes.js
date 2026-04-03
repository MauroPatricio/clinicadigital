import express from 'express';
import { submitEmergency, getEmergencyRequests, updateEmergencyStatus } from '../controllers/emergencyController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', submitEmergency);
router.get('/', authorize('admin', 'staff'), getEmergencyRequests);
router.put('/:id', authorize('admin', 'staff'), updateEmergencyStatus);

export default router;
