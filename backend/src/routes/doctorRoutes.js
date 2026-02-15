import express from 'express';
import doctorController from '../controllers/doctorController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, doctorController.getDoctors);
router.get('/:id', optionalAuth, doctorController.getDoctor);

// Protect all routes
router.use(protect);

// Admin and Owner routes
router.post('/', authorize('admin', 'owner'), doctorController.createDoctor);

router.put('/:id',
    authorize('doctor', 'admin'),
    doctorController.updateDoctor
);

router.get('/:id/stats',
    authorize('doctor', 'admin'),
    doctorController.getDoctorStats
);

export default router;
