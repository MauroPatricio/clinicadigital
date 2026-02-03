import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import { AppError } from './errorHandler.js';

// Protect routes - verify JWT token
export const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token (select password false by default in schema)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                res.status(401);
                throw new Error('User not found');
            }

            if (!req.user.isActive) {
                res.status(401);
                throw new Error('User account is deactivated');
            }

            next();
        } catch (error) {
            console.error('Auth verify error:', error.message);
            res.status(401);
            // Re-throw with status code for global error handler
            if (!error.statusCode) error.statusCode = 401;
            throw error;
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token provided');
    }
});

// Role-based access control - hierarchical roles
export const requireRoleType = (...allowedRoleTypes) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.user) {
            res.status(401);
            throw new Error('Not authorized - authentication required');
        }

        if (!allowedRoleTypes.includes(req.user.roleType)) {
            res.status(403);
            throw new Error(`Access denied. Required role: ${allowedRoleTypes.join(' or ')}`);
        }

        next();
    });
};

// Owner-only middleware
export const requireOwner = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        res.status(401);
        throw new Error('Not authorized - authentication required');
    }

    if (req.user.roleType !== 'owner') {
        res.status(403);
        throw new Error('Access denied. Owner privileges required');
    }

    next();
});

// Manager-only middleware (or owner)
export const requireManager = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        res.status(401);
        throw new Error('Not authorized - authentication required');
    }

    if (req.user.roleType !== 'manager' && req.user.roleType !== 'owner') {
        res.status(403);
        throw new Error('Access denied. Manager privileges required');
    }

    next();
});

// Staff-only middleware (with optional specific staff role)
export const requireStaff = (specificRole = null) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.user) {
            res.status(401);
            throw new Error('Not authorized - authentication required');
        }

        if (req.user.roleType !== 'staff') {
            res.status(403);
            throw new Error('Access denied. Staff privileges required');
        }

        if (specificRole && req.user.staffRole !== specificRole) {
            res.status(403);
            throw new Error(`Access denied. ${specificRole} role required`);
        }

        next();
    });
};

// Permission-based access control
export const requirePermission = (...requiredPermissions) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.user) {
            res.status(401);
            throw new Error('Not authorized - authentication required');
        }

        // Owners have all permissions
        if (req.user.roleType === 'owner') {
            return next();
        }

        // Check if user has required permissions
        const userPermissions = req.user.permissions || [];
        const hasPermission = requiredPermissions.some(permission =>
            userPermissions.includes(permission)
        );

        if (!hasPermission) {
            res.status(403);
            throw new Error(`Access denied. Required permission: ${requiredPermissions.join(' or ')}`);
        }

        next();
    });
};

// Clinic context middleware - verify user has access to specific clinic
export const requireClinicAccess = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        res.status(401);
        throw new Error('Not authorized - authentication required');
    }

    const clinicId = req.params.clinicId || req.body.clinicId || req.query.clinicId;

    if (!clinicId) {
        res.status(400);
        throw new Error('Clinic ID is required');
    }

    // Owners can access any clinic in their organization
    if (req.user.roleType === 'owner') {
        // We'll verify the clinic belongs to their organization in the controller
        return next();
    }

    // Managers and staff can only access their assigned clinic
    if (req.user.roleType === 'manager' || req.user.roleType === 'staff') {
        if (!req.user.clinic || req.user.clinic.toString() !== clinicId) {
            res.status(403);
            throw new Error('Access denied to this clinic');
        }
    }

    next();
});

// Organization context middleware - verify user belongs to organization
export const requireOrganizationAccess = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        res.status(401);
        throw new Error('Not authorized - authentication required');
    }

    const orgId = req.params.organizationId || req.body.organizationId || req.query.organizationId;

    if (!orgId) {
        res.status(400);
        throw new Error('Organization ID is required');
    }

    // Only owners have organization access
    if (req.user.roleType !== 'owner') {
        res.status(403);
        throw new Error('Access denied. Owner privileges required');
    }

    if (!req.user.organization || req.user.organization.toString() !== orgId) {
        res.status(403);
        throw new Error('Access denied to this organization');
    }

    next();
});

// Check subscription status
export const requireActiveSubscription = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        res.status(401);
        throw new Error('Not authorized - authentication required');
    }

    // Import Organization model here to avoid circular dependency
    const Organization = (await import('../models/Organization.js')).default;

    let organization;

    if (req.user.roleType === 'owner') {
        organization = await Organization.findById(req.user.organization);
    } else if (req.user.roleType === 'manager' || req.user.roleType === 'staff') {
        // Get organization from clinic
        const Clinic = (await import('../models/Clinic.js')).default;
        const clinic = await Clinic.findById(req.user.clinic).populate('organization');
        organization = clinic?.organization;
    }

    if (!organization) {
        // If it's an owner and no organization is found, allow them to proceed 
        // purely so they can CREATE their organization/clinic.
        if (req.user.roleType === 'owner') {
            return next();
        }
        return next(new AppError('Organization not found', 403));
    }

    if (!organization.isSubscriptionActive()) {
        return next(new AppError('Subscription is not active. Please renew to continue', 403));
    }

    // Attach organization to request for later use
    req.organization = organization;

    next();
});

// Check if feature is available in subscription
export const requireFeature = (featureName) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.organization) {
            // If organization not attached, requireActiveSubscription should run first
            res.status(500);
            throw new Error('Organization context not available. Use requireActiveSubscription middleware first');
        }

        if (!req.organization.hasFeature(featureName)) {
            res.status(403);
            throw new Error(`This feature (${featureName}) is not available in your current plan. Please upgrade`);
        }

        next();
    });
};

// Audit logging middleware (attach to sensitive routes)
export const auditLog = (action) => {
    return asyncHandler(async (req, res, next) => {
        // Import ActivityLog to avoid circular dependency
        const ActivityLog = (await import('../models/ActivityLog.js')).default;

        // Store original json function
        const originalJson = res.json.bind(res);

        // Override res.json to log after successful response
        res.json = function (data) {
            // Only log successful operations (2xx status codes)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                ActivityLog.create({
                    user: req.user?._id,
                    organization: req.user?.organization,
                    clinic: req.user?.clinic,
                    action,
                    actionDetails: `${req.method} ${req.originalUrl}`,
                    resource: req.params.id ? req.params : null,
                    resourceId: req.params.id || null,
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('user-agent'),
                    status: 'success'
                }).catch(err => console.error('Failed to create activity log:', err));
            }

            // Call original json function
            return originalJson(data);
        };

        next();
    });
};

// Legacy role support (for backward compatibility with existing routes)
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401);
            throw new Error('Not authorized');
        }

        if (!roles.includes(req.user.role)) {
            res.status(403);
            throw new Error(`User role ${req.user.role} is not authorized to access this route`);
        }

        next();
    };
};

// Optional auth (for public routes that can benefit from user context)
export const optionalAuth = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            // Token invalid, but continue without user
            req.user = null;
        }
    }

    next();
});

