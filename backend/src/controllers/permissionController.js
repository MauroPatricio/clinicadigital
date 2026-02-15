import Permission from '../models/Permission.js';
import { AppError } from '../middleware/errorHandler.js';

// Get all permissions grouped by role
export const getAllPermissions = async (req, res, next) => {
    try {
        const permissions = await Permission.find({ isActive: true });

        // Group by role
        const groupedPermissions = permissions.reduce((acc, perm) => {
            if (!acc[perm.role]) {
                acc[perm.role] = [];
            }
            acc[perm.role].push({
                module: perm.module,
                permissions: perm.permissions,
                customPermissions: perm.customPermissions,
                description: perm.description
            });
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            data: groupedPermissions
        });
    } catch (error) {
        next(error);
    }
};

// Get permissions for specific role
export const getPermissionsByRole = async (req, res, next) => {
    try {
        const { role } = req.params;

        const permissions = await Permission.getByRole(role);

        res.status(200).json({
            success: true,
            data: permissions
        });
    } catch (error) {
        next(error);
    }
};

// Update permissions for a role
export const updateRolePermissions = async (req, res, next) => {
    try {
        const { role } = req.params;
        const { module, permissions, customPermissions, description } = req.body;

        if (!module) {
            return next(new AppError('Module is required', 400));
        }

        // Find and update or create permission
        const permission = await Permission.findOneAndUpdate(
            { role, module },
            {
                permissions,
                customPermissions,
                description,
                isActive: true
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            message: 'Permissions updated successfully',
            data: permission
        });
    } catch (error) {
        next(error);
    }
};

// Initialize default permissions
export const initializeDefaultPermissions = async (req, res, next) => {
    try {
        const defaultPermissions = [
            // Owner - Full access
            { role: 'owner', module: 'users', permissions: { read: true, write: true, delete: true } },
            { role: 'owner', module: 'permissions', permissions: { read: true, write: true, delete: true } },
            { role: 'owner', module: 'audit', permissions: { read: true, write: false, delete: false } },
            { role: 'owner', module: 'clinics', permissions: { read: true, write: true, delete: true } },
            { role: 'owner', module: 'finance', permissions: { read: true, write: true, delete: true } },
            { role: 'owner', module: 'analytics', permissions: { read: true, write: false, delete: false } },

            // Manager - Clinic management
            { role: 'manager', module: 'patients', permissions: { read: true, write: true, delete: false } },
            { role: 'manager', module: 'appointments', permissions: { read: true, write: true, delete: true } },
            { role: 'manager', module: 'staff', permissions: { read: true, write: true, delete: false } },
            { role: 'manager', module: 'reports', permissions: { read: true, write: false, delete: false } },
            { role: 'manager', module: 'finance', permissions: { read: true, write: false, delete: false } },

            // Staff - Basic operations
            { role: 'staff', module: 'patients', permissions: { read: true, write: true, delete: false } },
            { role: 'staff', module: 'appointments', permissions: { read: true, write: true, delete: false } },
            { role: 'staff', module: 'exams', permissions: { read: true, write: true, delete: false } },

            // Patient - View only
            { role: 'patient', module: 'appointments', permissions: { read: true, write: false, delete: false } },
            { role: 'patient', module: 'results', permissions: { read: true, write: false, delete: false } },
            { role: 'patient', module: 'prescriptions', permissions: { read: true, write: false, delete: false } }
        ];

        // Bulk upsert
        const operations = defaultPermissions.map(perm => ({
            updateOne: {
                filter: { role: perm.role, module: perm.module },
                update: { $set: perm },
                upsert: true
            }
        }));

        await Permission.bulkWrite(operations);

        res.status(200).json({
            success: true,
            message: 'Default permissions initialized successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Check if user has permission
export const checkPermission = async (req, res, next) => {
    try {
        const { role, module, action } = req.query;

        if (!role || !module || !action) {
            return next(new AppError('Role, module, and action are required', 400));
        }

        const hasPermission = await Permission.hasPermission(role, module, action);

        res.status(200).json({
            success: true,
            hasPermission
        });
    } catch (error) {
        next(error);
    }
};
