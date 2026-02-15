import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
    getInvoices,
    getInvoiceStats,
    getInvoiceById,
    createInvoice,
    generateInvoiceFromBill,
    updateInvoice,
    recordPayment,
    sendInvoice,
    deleteInvoice
} from '../controllers/invoiceController.js';
import {
    getRecurringPayments,
    createRecurringPayment,
    updateRecurringPayment,
    updateRecurringStatus,
    processDuePayments
} from '../controllers/recurringPaymentController.js';
import {
    getInsuranceProviders,
    getInsuranceProviderById,
    createInsuranceProvider,
    updateInsuranceProvider,
    deleteInsuranceProvider
} from '../controllers/insuranceProviderController.js';
import { getFinancialProjections } from '../controllers/projectionController.js';

const router = express.Router();

// All routes require authentication and owner role
router.use(protect);
router.use(authorize('owner'));

// --- Invoice Routes ---
router.get('/invoices', getInvoices);
router.get('/invoices/stats', getInvoiceStats);
router.get('/invoices/:id', getInvoiceById);
router.post('/invoices', createInvoice);
router.post('/invoices/generate-from-bill', generateInvoiceFromBill);
router.patch('/invoices/:id', updateInvoice);
router.post('/invoices/:id/payment', recordPayment);
router.patch('/invoices/:id/send', sendInvoice);
router.delete('/invoices/:id', deleteInvoice);

// --- Recurring Payment Routes ---
router.get('/recurring-payments', getRecurringPayments);
router.post('/recurring-payments', createRecurringPayment);
router.patch('/recurring-payments/:id', updateRecurringPayment);
router.patch('/recurring-payments/:id/status', updateRecurringStatus);
router.post('/recurring-payments/process', processDuePayments); // Manual trigger

// --- Insurance Provider Routes ---
router.get('/insurance-providers', getInsuranceProviders);
router.get('/insurance-providers/:id', getInsuranceProviderById);
router.post('/insurance-providers', createInsuranceProvider);
router.patch('/insurance-providers/:id', updateInsuranceProvider);
router.delete('/insurance-providers/:id', deleteInsuranceProvider);

// --- Projections ---
router.get('/projections', getFinancialProjections);

export default router;
