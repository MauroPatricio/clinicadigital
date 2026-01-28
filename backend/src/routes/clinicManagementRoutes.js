import express from 'express';
import {
    createClinic,
    getClinics,
    getClinic,
    updateClinic,
    deleteClinic,
    compareClinics
} from '../controllers/clinicManagementController.js';
import {
    protect,
    requireOwner,
    requireManager,
    requireActiveSubscription,
    auditLog
} from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);
router.use(requireActiveSubscription);

// Routes
router
    .route('/')
    .get(getClinics) // Owner, Manager, Staff can view
    .post(requireOwner, auditLog('create_clinic'), createClinic); // Owner only

router.get('/compare', requireOwner, compareClinics); // Owner only

router
    .route('/:id')
    .get(getClinic) // Owner, Manager, Staff
    .put(auditLog('update_clinic'), updateClinic) // Owner or Manager
    .delete(requireOwner, auditLog('delete_clinic'), deleteClinic); // Owner only

export default router;
