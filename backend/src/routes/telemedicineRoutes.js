import express from 'express';
import {
    createVideoRoom,
    getAgoraToken,
    manageRecording,
    shareDocument,
    endConsultation,
    getActiveConsultations
} from '../controllers/telemedicineController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/room', createVideoRoom);
router.get('/token', getAgoraToken);
router.get('/active', authorize('doctor', 'admin'), getActiveConsultations);

router.post('/:appointmentId/recording',
    authorize('doctor'),
    manageRecording
);

router.post('/:appointmentId/documents', shareDocument);

router.post('/:appointmentId/end',
    authorize('doctor'),
    endConsultation
);

export default router;
