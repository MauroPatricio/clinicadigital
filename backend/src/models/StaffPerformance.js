import mongoose from 'mongoose';

const staffPerformanceSchema = new mongoose.Schema({
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        required: true
    },
    // Time period for this performance record
    period: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'quarterly', 'annual'],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    // Appointment metrics
    appointments: {
        total: {
            type: Number,
            default: 0
        },
        completed: {
            type: Number,
            default: 0
        },
        cancelled: {
            type: Number,
            default: 0
        },
        noShow: {
            type: Number,
            default: 0
        },
        averageDuration: {
            type: Number,
            default: 0 // in minutes
        }
    },
    // Time management
    timeMetrics: {
        totalWorkingHours: {
            type: Number,
            default: 0
        },
        averageWaitTime: {
            type: Number,
            default: 0 // minutes patients wait
        },
        averageConsultationTime: {
            type: Number,
            default: 0 // minutes per consultation
        },
        overtimeHours: {
            type: Number,
            default: 0
        }
    },
    // Patient satisfaction
    patientFeedback: {
        totalReviews: {
            type: Number,
            default: 0
        },
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        ratings: {
            five: { type: Number, default: 0 },
            four: { type: Number, default: 0 },
            three: { type: Number, default: 0 },
            two: { type: Number, default: 0 },
            one: { type: Number, default: 0 }
        },
        positiveComments: {
            type: Number,
            default: 0
        },
        negativeComments: {
            type: Number,
            default: 0
        }
    },
    // Revenue contribution (if applicable)
    revenue: {
        totalGenerated: {
            type: Number,
            default: 0
        },
        consultations: {
            type: Number,
            default: 0
        },
        procedures: {
            type: Number,
            default: 0
        },
        prescriptions: {
            type: Number,
            default: 0
        }
    },
    // Medical records
    medicalRecords: {
        created: {
            type: Number,
            default: 0
        },
        updated: {
            type: Number,
            default: 0
        },
        prescriptionsIssued: {
            type: Number,
            default: 0
        },
        labOrdersRequested: {
            type: Number,
            default: 0
        }
    },
    // Efficiency metrics
    efficiency: {
        appointmentsPerDay: {
            type: Number,
            default: 0
        },
        onTimeRate: {
            type: Number,
            default: 0 // percentage
        },
        completionRate: {
            type: Number,
            default: 0 // percentage of appointments completed
        }
    },
    // Rankings (within clinic)
    rankings: {
        appointmentVolume: Number, // 1 = highest
        patientSatisfaction: Number,
        revenue: Number,
        overallScore: Number
    },
    // Performance score (calculated)
    score: {
        total: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        breakdown: {
            productivity: Number,
            quality: Number,
            patientSatisfaction: Number,
            timeliness: Number
        }
    },
    // Recognition
    achievements: [{
        type: String,
        date: Date,
        description: String
    }],
    // Areas for improvement
    improvements: [{
        area: String,
        priority: {
            type: String,
            enum: ['low', 'medium', 'high']
        },
        notes: String,
        identifiedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Manager notes
    managerNotes: String,
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: Date
}, {
    timestamps: true
});

// Compound index for staff and period
staffPerformanceSchema.index({ staff: 1, clinic: 1, period: 1, startDate: -1 });

// Index for date range queries
staffPerformanceSchema.index({ startDate: 1, endDate: 1 });

// Method to calculate overall performance score
staffPerformanceSchema.methods.calculateScore = function () {
    // Productivity (30%)
    const productivityScore = Math.min(
        (this.appointments.completed / Math.max(this.appointments.total, 1)) * 30,
        30
    );

    // Quality (30%) - based on completion rate and patient satisfaction
    const qualityScore = (
        (this.efficiency.completionRate / 100) * 15 +
        (this.patientFeedback.averageRating / 5) * 15
    );

    // Patient Satisfaction (25%)
    const satisfactionScore = (this.patientFeedback.averageRating / 5) * 25;

    // Timeliness (15%) - based on onTime rate
    const timelinessScore = (this.efficiency.onTimeRate / 100) * 15;

    this.score.breakdown = {
        productivity: Math.round(productivityScore),
        quality: Math.round(qualityScore),
        patientSatisfaction: Math.round(satisfactionScore),
        timeliness: Math.round(timelinessScore)
    };

    this.score.total = Math.round(
        productivityScore + qualityScore + satisfactionScore + timelinessScore
    );

    return this.score.total;
};

// Static method to get top performers in a clinic
staffPerformanceSchema.statics.getTopPerformers = async function (clinicId, period, limit = 5) {
    return await this.find({ clinic: clinicId, period })
        .sort({ 'score.total': -1 })
        .limit(limit)
        .populate('staff', 'profile.firstName profile.lastName staffRole');
};

export default mongoose.model('StaffPerformance', staffPerformanceSchema);
