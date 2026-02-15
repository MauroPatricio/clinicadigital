import AuditLog from '../models/AuditLog.js';
import { AppError } from '../middleware/errorHandler.js';

// Get audit logs with filters
export const getAuditLogs = async (req, res, next) => {
    try {
        const {
            user,
            action,
            module,
            clinic,
            startDate,
            endDate,
            page = 1,
            limit = 50
        } = req.query;

        const filters = {
            user,
            action,
            module,
            clinic,
            startDate,
            endDate
        };

        const options = {
            page: parseInt(page),
            limit: parseInt(limit)
        };

        const logs = await AuditLog.getLogs(filters, options);

        // Get total count for pagination
        const totalQuery = {};
        if (filters.user) totalQuery.user = filters.user;
        if (filters.action) totalQuery.action = filters.action;
        if (filters.module) totalQuery.module = filters.module;
        if (filters.clinic) totalQuery.clinic = filters.clinic;

        if (filters.startDate && filters.endDate) {
            totalQuery.timestamp = {
                $gte: new Date(filters.startDate),
                $lte: new Date(filters.endDate)
            };
        }

        const total = await AuditLog.countDocuments(totalQuery);

        res.status(200).json({
            success: true,
            data: logs,
            pagination: {
                page: options.page,
                limit: options.limit,
                total,
                pages: Math.ceil(total / options.limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get audit logs for specific user
export const getUserAuditLogs = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        const filters = { user: userId };
        const options = {
            page: parseInt(page),
            limit: parseInt(limit)
        };

        const logs = await AuditLog.getLogs(filters, options);
        const total = await AuditLog.countDocuments({ user: userId });

        res.status(200).json({
            success: true,
            data: logs,
            pagination: {
                page: options.page,
                limit: options.limit,
                total,
                pages: Math.ceil(total / options.limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// Export audit logs to CSV
export const exportAuditLogs = async (req, res, next) => {
    try {
        const {
            user,
            action,
            module,
            clinic,
            startDate,
            endDate
        } = req.query;

        const filters = {
            user,
            action,
            module,
            clinic,
            startDate,
            endDate
        };

        const logs = await AuditLog.getLogs(filters, { limit: 10000 });

        // Convert to CSV
        const csvHeaders = 'Timestamp,User,Action,Module,Resource Type,Resource ID,IP Address,Clinic\n';
        const csvRows = logs.map(log => {
            const userName = log.user ? `${log.user.profile?.firstName || ''} ${log.user.profile?.lastName || ''}`.trim() : 'N/A';
            const clinicName = log.clinic?.name || 'N/A';

            return [
                log.timestamp.toISOString(),
                userName,
                log.action,
                log.module,
                log.resourceType || 'N/A',
                log.resourceId || 'N/A',
                log.ipAddress || 'N/A',
                clinicName
            ].join(',');
        }).join('\n');

        const csv = csvHeaders + csvRows;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
        res.status(200).send(csv);
    } catch (error) {
        next(error);
    }
};

// Create audit log entry (usually called by middleware)
export const createAuditLog = async (req, res, next) => {
    try {
        const {
            user,
            action,
            module,
            resourceType,
            resourceId,
            changes,
            metadata
        } = req.body;

        if (!user || !action || !module) {
            return next(new AppError('User, action, and module are required', 400));
        }

        const log = await AuditLog.logAction({
            user,
            action,
            module,
            resourceType,
            resourceId,
            changes,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            clinic: req.user?.clinicId,
            metadata
        });

        res.status(201).json({
            success: true,
            data: log
        });
    } catch (error) {
        next(error);
    }
};

// Get audit log statistics
export const getAuditStats = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        const dateFilter = {};
        if (startDate && endDate) {
            dateFilter.timestamp = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Activity by action
        const actionStats = await AuditLog.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: '$action',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Activity by module
        const moduleStats = await AuditLog.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: '$module',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Top active users
        const userStats = await AuditLog.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: '$user',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                byAction: actionStats,
                byModule: moduleStats,
                topUsers: userStats
            }
        });
    } catch (error) {
        next(error);
    }
};
