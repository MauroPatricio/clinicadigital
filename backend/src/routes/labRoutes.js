import express from 'express';
import labController from '../controllers/labController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/orders')
    .get(labController.getLabOrders)
    .post(authorize('doctor'), labController.createLabOrder);

router.route('/orders/:id')
    .get(labController.getLabOrder)
    .put(authorize('admin', 'nurse'), labController.updateLabOrder);

router.post('/orders/:id/results',
    authorize('admin', 'nurse'),
    labController.uploadLabResults
);

router.post('/orders/:id/notify',
    authorize('admin'),
    labController.notifyPatient
);

export default router;
