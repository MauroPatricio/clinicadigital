import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { auditLog } from '../middleware/auditLog.js';

// Revenue routes
import {
    getRevenue,
    getRevenueStats,
    getRevenueTrends,
    getRevenueById,
    createRevenue,
    updateRevenue,
    deleteRevenue,
    exportRevenue
} from '../controllers/revenueController.js';

// Expense routes
import {
    getExpenses,
    getExpenseStats,
    getExpenseTrends,
    getExpenseById,
    createExpense,
    updateExpense,
    approveExpense,
    deleteExpense,
    exportExpenses
} from '../controllers/expenseController.js';

// Cash Flow routes
import {
    getCashFlow,
    getCashFlowProjection,
    getCashFlowSummary,
    getCashFlowBreakdown,
    exportCashFlow
} from '../controllers/cashFlowController.js';

// Commission routes
import {
    getCommissions,
    calculateCommissions,
    getCommissionById,
    updateCommission,
    approveCommission,
    markCommissionAsPaid,
    exportCommissions
} from '../controllers/commissionController.js';

const router = express.Router();

// All routes require authentication and owner role
router.use(protect);
router.use(authorize('owner'));

// ============= REVENUE ROUTES =============
router.get('/revenue/export', exportRevenue);
router.get('/revenue/stats', getRevenueStats);
router.get('/revenue/trends', getRevenueTrends);
router.get('/revenue/:id', getRevenueById);
router.get('/revenue', getRevenue);
router.post('/revenue', auditLog('finance', 'Revenue'), createRevenue);
router.patch('/revenue/:id', auditLog('finance', 'Revenue'), updateRevenue);
router.delete('/revenue/:id', auditLog('finance', 'Revenue'), deleteRevenue);

// ============= EXPENSE ROUTES =============
router.get('/expenses/export', exportExpenses);
router.get('/expenses/stats', getExpenseStats);
router.get('/expenses/trends', getExpenseTrends);
router.get('/expenses/:id', getExpenseById);
router.get('/expenses', getExpenses);
router.post('/expenses', auditLog('finance', 'Expense'), createExpense);
router.patch('/expenses/:id/approve', auditLog('finance', 'Expense'), approveExpense);
router.patch('/expenses/:id', auditLog('finance', 'Expense'), updateExpense);
router.delete('/expenses/:id', auditLog('finance', 'Expense'), deleteExpense);

// ============= CASH FLOW ROUTES =============
router.get('/cash-flow/export', exportCashFlow);
router.get('/cash-flow/projection', getCashFlowProjection);
router.get('/cash-flow/summary', getCashFlowSummary);
router.get('/cash-flow/breakdown', getCashFlowBreakdown);
router.get('/cash-flow', getCashFlow);

// ============= COMMISSION ROUTES =============
router.get('/commissions/export', exportCommissions);
router.get('/commissions/:id', getCommissionById);
router.get('/commissions', getCommissions);
router.post('/commissions/calculate', auditLog('finance', 'Commission'), calculateCommissions);
router.patch('/commissions/:id/approve', auditLog('finance', 'Commission'), approveCommission);
router.patch('/commissions/:id/pay', auditLog('finance', 'Commission'), markCommissionAsPaid);
router.patch('/commissions/:id', auditLog('finance', 'Commission'), updateCommission);

export default router;
