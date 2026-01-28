import express from 'express';
import {
    processMpesaPayment,
    processCardPayment,
    getPayment,
    getPaymentReceipt,
    refundPayment
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/mpesa', processMpesaPayment);
router.post('/card', processCardPayment);

router.get('/:id', getPayment);
router.get('/:id/receipt', getPaymentReceipt);
router.post('/:id/refund', authorize('admin'), refundPayment);

export default router;
