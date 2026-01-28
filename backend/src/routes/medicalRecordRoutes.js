import express from 'express';
import {
    getMedicalRecords,
    getMedicalRecord,
    createMedicalRecord,
    updateMedicalRecord,
    addAttachment,
    getPatientHistory,
    deleteMedicalRecord
} from '../controllers/medicalRecordController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getMedicalRecords)
    .post(authorize('doctor'), createMedicalRecord);

router.get('/patient/:patientId/history',
    authorize('doctor', 'admin', 'nurse'),
    getPatientHistory
);

router.route('/:id')
    .get(getMedicalRecord)
    .put(authorize('doctor'), updateMedicalRecord)
    .delete(authorize('admin'), deleteMedicalRecord);

router.post('/:id/attachments',
    authorize('doctor'),
    addAttachment
);

export default router;
