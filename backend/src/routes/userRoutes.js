import express from 'express';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus,
    resetUserPassword,
    getUserStats
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditLog, storeOriginalData } from '../middleware/auditLog.js';
import User from '../models/User.js';

const router = express.Router();

// All user management routes require authentication
router.use(protect);

// All routes require owner role
router.use(authorize('owner'));

// User routes with audit logging
router.get('/stats', getUserStats);
router.get('/', auditLog('users'), getAllUsers);
router.get('/:id', auditLog('users'), getUserById);
router.post('/', auditLog('users'), createUser);
router.patch('/:id', storeOriginalData(User), auditLog('users'), updateUser);
router.delete('/:id', storeOriginalData(User), auditLog('users'), deleteUser);
router.patch('/:id/status', storeOriginalData(User), auditLog('users'), updateUserStatus);
router.patch('/:id/password', auditLog('users'), resetUserPassword);

export default router;
