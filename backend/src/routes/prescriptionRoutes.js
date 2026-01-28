import express from 'express';
import prescriptionController from '../controllers/prescriptionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/',
    authorize('doctor'),
    prescriptionController.createPrescription
);

router.get('/check-interactions',
    authorize('doctor'),
    prescriptionController.checkInteractions
);

router.get('/:id', prescriptionController.getPrescription);

export default router;
