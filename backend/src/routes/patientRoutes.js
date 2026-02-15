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

// Timeline routes
router.route('/:id/timeline')
    .get(patientController.getPatientTimeline)
    .post(authorize('admin', 'doctor', 'nurse'), patientController.addTimelineEvent);

// Alert routes
router.route('/:id/alerts')
    .get(patientController.getPatientAlerts)
    .post(authorize('admin', 'doctor', 'nurse'), patientController.createPatientAlert);

router.patch('/:id/alerts/:alertId',
    authorize('admin', 'doctor', 'nurse'),
    patientController.updateAlertStatus
);

export default router;
