import AuditTrail from '../models/AuditTrail.js';
import asyncHandler from 'express-async-handler';

/**
 * Middleware to create audit trails for sensitive operations
 * Usage: Apply to routes that modify medical records, patient data, billing, etc.
 */
export const createAuditTrail = (resource) => {
    return asyncHandler(async (req, res, next) => {
        // Store original send function
        const originalSend = res.send.bind(res);
        const originalJson = res.json.bind(res);

        // Capture request body and params for 'before' snapshot
        req.auditData = {
            resource,
            action: getActionFromMethod(req.method),
            requestBody: { ...req.body },
            requestParams: { ...req.params },
            requestQuery: { ...req.query }
        };

        // Override response methods to create audit trail after successful response
        const createAudit = function (data) {
            // Only create audit for successful modifications (2xx status codes)
            if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
                const auditData = {
                    resource,
                    resourceId: req.params.id || data?.data?._id || data?._id,
                    action: req.auditData.action,
                    performedBy: req.user._id,
                    clinic: req.user.clinic,
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('user-agent')
                };

                // Add before/after snapshots if available
                if (req.auditData.before) {
                    auditData.before = req.auditData.before;
                }
                if (req.auditData.after || data) {
                    auditData.after = req.auditData.after || data;
                }

                // Calculate field-level changes if both before and after exist
                if (auditData.before && auditData.after) {
                    auditData.changes = calculateChanges(auditData.before, auditData.after);
                }

                // Create audit trail asynchronously (don't block response)
                AuditTrail.log(auditData).catch(err =>
                    console.error('Failed to create audit trail:', err)
                );
            }
        };

        res.send = function (data) {
            createAudit(data);
            return originalSend(data);
        };

        res.json = function (data) {
            createAudit(data);
            return originalJson(data);
        };

        next();
    });
};

/**
 * Middleware to capture "before" state for audit trails
 * Use this BEFORE modifying the resource
 */
export const captureBeforeState = (Model) => {
    return asyncHandler(async (req, res, next) => {
        const resourceId = req.params.id;

        if (resourceId && (req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE')) {
            try {
                const document = await Model.findById(resourceId).lean();
                if (document) {
                    req.auditData = req.auditData || {};
                    req.auditData.before = document;
                }
            } catch (error) {
                console.error('Failed to capture before state:', error);
            }
        }

        next();
    });
};

/**
 * Helper function to determine action from HTTP method
 */
function getActionFromMethod(method) {
    switch (method) {
        case 'POST':
            return 'create';
        case 'PUT':
        case 'PATCH':
            return 'update';
        case 'DELETE':
            return 'delete';
        case 'GET':
            return 'view';
        default:
            return 'other';
    }
}

/**
 * Calculate field-level changes between two objects
 */
function calculateChanges(before, after) {
    const changes = [];
    const beforeObj = typeof before === 'object' ? before : {};
    const afterObj = typeof after?.data === 'object' ? after.data : (typeof after === 'object' ? after : {});

    // Get all unique keys from both objects
    const allKeys = new Set([
        ...Object.keys(beforeObj),
        ...Object.keys(afterObj)
    ]);

    for (const key of allKeys) {
        // Skip meta fields
        if (['__v', 'updatedAt', 'createdAt', '_id'].includes(key)) {
            continue;
        }

        const oldValue = beforeObj[key];
        const newValue = afterObj[key];

        // Compare values (simple equality check)
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            changes.push({
                field: key,
                oldValue,
                newValue
            });
        }
    }

    return changes;
}

export default {
    createAuditTrail,
    captureBeforeState
};
