import express from 'express';
import {
    getAllPermissions,
    getPermissionsByRole,
    updateRolePermissions,
    initializeDefaultPermissions,
    checkPermission
} from '../controllers/permissionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All permission routes require owner role
router.use(protect);
router.use(authorize('owner'));

// Permission routes
router.get('/', getAllPermissions);
router.get('/check', checkPermission);
router.get('/:role', getPermissionsByRole);
router.patch('/:role', updateRolePermissions);
router.post('/initialize', initializeDefaultPermissions);

export default router;
