import AuditLog from '../models/AuditLog.js';

// Middleware to automatically log user actions
export const auditLog = (module, resourceType = null) => {
    return async (req, res, next) => {
        // Store original send function
        const originalSend = res.send;

        // Override res.send to capture successful operations
        res.send = function (data) {
            // Only log on successful operations (2xx status codes)
            if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
                // Determine action based on HTTP method
                let action = 'VIEW';
                if (req.method === 'POST') action = 'CREATE';
                else if (req.method === 'PUT' || req.method === 'PATCH') action = 'UPDATE';
                else if (req.method === 'DELETE') action = 'DELETE';

                // Determine resource ID from params or body
                const resourceId = req.params.id || req.params.userId || req.body._id || null;

                // Log the action (fire and forget - don't wait)
                AuditLog.logAction({
                    user: req.user._id,
                    action,
                    module,
                    resourceType: resourceType || module,
                    resourceId,
                    changes: {
                        before: req.originalData || {},
                        after: req.body || {}
                    },
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('user-agent'),
                    clinic: req.user.clinicId,
                    metadata: {
                        method: req.method,
                        path: req.originalUrl
                    }
                }).catch(err => {
                    console.error('Audit log error:', err);
                    // Don't fail the request if audit logging fails
                });
            }

            // Call original send
            originalSend.call(this, data);
        };

        next();
    };
};

// Middleware to store original data before update
export const storeOriginalData = (Model) => {
    return async (req, res, next) => {
        try {
            if ((req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE') && req.params.id) {
                const original = await Model.findById(req.params.id).lean();
                req.originalData = original;
            }
        } catch (error) {
            console.error('Error storing original data:', error);
        }
        next();
    };
};

// Log login/logout explicitly
export const logAuth = async (userId, action, ipAddress, userAgent) => {
    try {
        await AuditLog.logAction({
            user: userId,
            action,
            module: 'auth',
            resourceType: 'session',
            ipAddress,
            userAgent,
            metadata: {
                timestamp: new Date()
            }
        });
    } catch (error) {
        console.error('Auth audit log error:', error);
    }
};
