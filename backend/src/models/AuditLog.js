import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    action: {
        type: String,
        required: true,
        enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW', 'EXPORT'],
        index: true
    },
    module: {
        type: String,
        required: true,
        index: true
    },
    resourceType: {
        type: String,
        trim: true
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
    },
    changes: {
        before: {
            type: Map,
            of: mongoose.Schema.Types.Mixed
        },
        after: {
            type: Map,
            of: mongoose.Schema.Types.Mixed
        }
    },
    ipAddress: {
        type: String,
        trim: true
    },
    userAgent: {
        type: String,
        trim: true
    },
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        index: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: false // Using custom timestamp field
});

// Compound indexes for common queries
auditLogSchema.index({ user: 1, timestamp: -1 });
auditLogSchema.index({ module: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

// Static method to log an action
auditLogSchema.statics.logAction = async function (data) {
    return await this.create({
        user: data.user,
        action: data.action,
        module: data.module,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        changes: data.changes,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        clinic: data.clinic,
        metadata: data.metadata
    });
};

// Static method to get logs with filters
auditLogSchema.statics.getLogs = function (filters = {}, options = {}) {
    const query = {};

    if (filters.user) query.user = filters.user;
    if (filters.action) query.action = filters.action;
    if (filters.module) query.module = filters.module;
    if (filters.clinic) query.clinic = filters.clinic;

    if (filters.startDate && filters.endDate) {
        query.timestamp = {
            $gte: new Date(filters.startDate),
            $lte: new Date(filters.endDate)
        };
    } else if (filters.startDate) {
        query.timestamp = { $gte: new Date(filters.startDate) };
    } else if (filters.endDate) {
        query.timestamp = { $lte: new Date(filters.endDate) };
    }

    const {
        page = 1,
        limit = 50,
        sort = '-timestamp'
    } = options;

    return this.find(query)
        .populate('user', 'profile.firstName profile.lastName email')
        .populate('clinic', 'name')
        .sort(sort)
        .limit(limit)
        .skip((page - 1) * limit);
};

export default mongoose.model('AuditLog', auditLogSchema);
