import mongoose from 'mongoose';

const auditTrailSchema = new mongoose.Schema({
    resource: {
        type: String,
        required: true // e.g., 'Patient', 'MedicalRecord', 'Appointment'
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['create', 'update', 'delete', 'view']
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic'
    },
    // Snapshot of data before change
    before: {
        type: mongoose.Schema.Types.Mixed
    },
    // Snapshot of data after change
    after: {
        type: mongoose.Schema.Types.Mixed
    },
    // Field-level changes
    changes: [{
        field: String,
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed
    }],
    reason: String,
    ipAddress: String,
    userAgent: String,
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Indexes
auditTrailSchema.index({ resource: 1, resourceId: 1, createdAt: -1 });
auditTrailSchema.index({ performedBy: 1, createdAt: -1 });
auditTrailSchema.index({ clinic: 1, createdAt: -1 });
auditTrailSchema.index({ createdAt: -1 });

// TTL index - keep audit trails for 2 years
auditTrailSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 }); // 2 years

// Static method to create audit trail
auditTrailSchema.statics.log = async function (data) {
    try {
        return await this.create(data);
    } catch (error) {
        console.error('Failed to create audit trail:', error);
        // Don't throw error - audit logging should not break the main operation
    }
};

export default mongoose.model('AuditTrail', auditTrailSchema);
