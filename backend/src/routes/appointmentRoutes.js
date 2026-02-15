import express from 'express';
import {
    getAppointments,
    createAppointment,
    getDoctorAvailability,
    updateAppointment,
    cancelAppointment,
    confirmAppointment,
    getQueueByDate,
    updateQueuePositions,
    callNextPatient,
    sendConfirmation,
    getPredictedWaitTime
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

// Queue management routes
router.get('/queue/:date', authorize('admin', 'doctor', 'nurse', 'receptionist'), getQueueByDate);
router.patch('/queue/:queueId', authorize('admin', 'doctor', 'nurse', 'receptionist'), updateQueuePositions);
router.post('/queue/:queueId/next', authorize('admin', 'doctor', 'nurse', 'receptionist'), callNextPatient);

router.route('/:id')
    .put(authorize('admin', 'receptionist', 'doctor'), updateAppointment)
    .delete(authorize('patient', 'admin', 'receptionist'), cancelAppointment);

router.post('/:id/confirm', authorize('admin', 'receptionist'), confirmAppointment);
router.post('/:id/send-confirmation', authorize('admin', 'receptionist'), sendConfirmation);
router.get('/:id/wait-time', getPredictedWaitTime);

export default router;
