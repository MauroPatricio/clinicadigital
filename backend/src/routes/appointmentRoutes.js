import express from 'express';
import {
    getAppointments,
    createAppointment,
    getDoctorAvailability,
    updateAppointment,
    cancelAppointment,
    confirmAppointment
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/availability', getDoctorAvailability);

// Protected routes
router.use(protect);

router.route('/')
    .get(getAppointments)
    .post(authorize('patient', 'admin', 'receptionist', 'doctor'), createAppointment);

router.route('/:id')
    .put(authorize('admin', 'receptionist', 'doctor'), updateAppointment)
    .delete(authorize('patient', 'admin', 'receptionist'), cancelAppointment);

router.post('/:id/confirm', authorize('admin', 'receptionist'), confirmAppointment);

export default router;
