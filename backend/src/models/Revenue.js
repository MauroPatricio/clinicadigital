import mongoose from 'mongoose';

const revenueSchema = new mongoose.Schema({
    source: {
        type: String,
        required: true,
        enum: ['appointment', 'service', 'product', 'insurance', 'pharmacy', 'lab', 'other'],
        index: true
    },
    category: {
        type: String,
        required: true,
        enum: ['consultation', 'exam', 'procedure', 'medication', 'insurance_claim', 'product_sale', 'other'],
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
        index: true
    },
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        required: true,
        index: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    bill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bill'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'transfer', 'check', 'insurance', 'other'],
        default: 'cash'
    },
    status: {
        type: String,
        enum: ['confirmed', 'pending', 'cancelled'],
        default: 'confirmed',
        index: true
    },
    notes: {
        type: String,
        trim: true
    },
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Compound indexes for common queries
revenueSchema.index({ clinic: 1, date: -1 });
revenueSchema.index({ clinic: 1, category: 1, date: -1 });
revenueSchema.index({ status: 1, date: -1 });

// Static method to get revenue by period
revenueSchema.statics.getByPeriod = function (startDate, endDate, filters = {}) {
    const query = {
        date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        },
        status: 'confirmed',
        ...filters
    };

    return this.find(query).populate('clinic patient appointment');
};

// Static method to get revenue by category
revenueSchema.statics.getByCategory = async function (startDate, endDate, clinic) {
    return await this.aggregate([
        {
            $match: {
                date: { $gte: new Date(startDate), $lte: new Date(endDate) },
                status: 'confirmed',
                ...(clinic && { clinic: mongoose.Types.ObjectId(clinic) })
            }
        },
        {
            $group: {
                _id: '$category',
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        },
        { $sort: { total: -1 } }
    ]);
};

// Static method to get total revenue
revenueSchema.statics.getTotalRevenue = async function (startDate, endDate, filters = {}) {
    const result = await this.aggregate([
        {
            $match: {
                date: { $gte: new Date(startDate), $lte: new Date(endDate) },
                status: 'confirmed',
                ...filters
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        }
    ]);

    return result[0] || { total: 0, count: 0 };
};

// Static method to get revenue trends
revenueSchema.statics.getTrends = async function (startDate, endDate, period = 'day', filters = {}) {
    const groupBy = period === 'day'
        ? { year: { $year: '$date' }, month: { $month: '$date' }, day: { $dayOfMonth: '$date' } }
        : period === 'month'
            ? { year: { $year: '$date' }, month: { $month: '$date' } }
            : { year: { $year: '$date' } };

    return await this.aggregate([
        {
            $match: {
                date: { $gte: new Date(startDate), $lte: new Date(endDate) },
                status: 'confirmed',
                ...filters
            }
        },
        {
            $group: {
                _id: groupBy,
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
};

export default mongoose.model('Revenue', revenueSchema);
