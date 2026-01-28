import express from 'express';
import {
    getBills,
    getBill,
    createBill,
    updateBill,
    getFinancialReports,
    getBillingStats
} from '../controllers/billingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/invoices')
    .get(getBills)
    .post(authorize('admin', 'receptionist'), createBill);

router.get('/reports',
    authorize('admin'),
    getFinancialReports
);

router.get('/stats',
    authorize('admin'),
    getBillingStats
);

router.route('/invoices/:id')
    .get(getBill)
    .put(authorize('admin'), updateBill);

export default router;
