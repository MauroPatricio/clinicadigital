import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic'
    },
    action: {
        type: String,
        required: true,
        enum: [
            'login',
            'logout',
            'create_clinic',
            'update_clinic',
            'delete_clinic',
            'create_staff',
            'update_staff',
            'delete_staff',
            'create_patient',
            'update_patient',
            'delete_patient',
            'create_appointment',
            'update_appointment',
            'cancel_appointment',
            'create_medical_record',
            'update_medical_record',
            'view_medical_record',
            'create_prescription',
            'create_bill',
            'process_payment',
            'update_subscription',
            'export_data',
            'change_settings',
            'other'
        ]
    },
    actionDetails: {
        type: String
    },
    resource: {
        type: String
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId
    },
    ipAddress: String,
    userAgent: String,
    status: {
        type: String,
        enum: ['success', 'failed', 'error'],
        default: 'success'
    },
    errorMessage: String,
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ clinic: 1, createdAt: -1 });
activityLogSchema.index({ organization: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

// TTL index to auto-delete logs after 90 days (optional)
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

export default mongoose.model('ActivityLog', activityLogSchema);
