import express from 'express';
import patientController from '../controllers/patientController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/',
    authorize('admin', 'doctor', 'nurse', 'receptionist'),
    patientController.createPatient
);

router.get('/',
    authorize('admin', 'doctor', 'nurse', 'receptionist'),
    patientController.getPatients
);

router.route('/:id')
    .get(patientController.getPatient)
    .put(authorize('admin', 'doctor', 'nurse'), patientController.updatePatient);

router.post('/:id/triage',
    authorize('doctor', 'nurse'),
    patientController.setRiskClassification
);

export default router;
