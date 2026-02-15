import express from 'express';
import {
    getAuditLogs,
    getUserAuditLogs,
    exportAuditLogs,
    createAuditLog,
    getAuditStats
} from '../controllers/auditLogController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All audit log routes require authentication
router.use(protect);

// Most routes require owner role (except user-specific logs)
router.get('/', authorize('owner'), getAuditLogs);
router.get('/stats', authorize('owner'), getAuditStats);
router.get('/export', authorize('owner'), exportAuditLogs);
router.get('/user/:userId', getUserAuditLogs); // Users can view their own logs
router.post('/', createAuditLog); // Can be called by middleware

export default router;
