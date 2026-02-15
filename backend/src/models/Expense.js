import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['salary', 'supplies', 'equipment', 'utilities', 'rent', 'marketing', 'insurance', 'taxes', 'maintenance', 'professional_fees', 'other'],
        index: true
    },
    subcategory: {
        type: String,
        trim: true
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
    vendor: {
        type: String,
        trim: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'transfer', 'check', 'other'],
        default: 'transfer'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'paid', 'rejected'],
        default: 'pending',
        index: true
    },
    receipt: {
        url: String,
        publicId: String
    },
    description: {
        type: String,
        trim: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    paidAt: {
        type: Date
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurringPeriod: {
        type: String,
        enum: ['monthly', 'quarterly', 'yearly']
    },
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Compound indexes
expenseSchema.index({ clinic: 1, date: -1 });
expenseSchema.index({ clinic: 1, category: 1, date: -1 });
expenseSchema.index({ status: 1, date: -1 });

// Static method to get expenses by period
expenseSchema.statics.getByPeriod = function (startDate, endDate, filters = {}) {
    const query = {
        date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        },
        ...filters
    };

    return this.find(query).populate('clinic approvedBy vendor');
};

// Static method to get expenses by category
expenseSchema.statics.getByCategory = async function (startDate, endDate, clinic) {
    return await this.aggregate([
        {
            $match: {
                date: { $gte: new Date(startDate), $lte: new Date(endDate) },
                status: { $in: ['approved', 'paid'] },
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

// Static method to get total expenses
expenseSchema.statics.getTotalExpenses = async function (startDate, endDate, filters = {}) {
    const result = await this.aggregate([
        {
            $match: {
                date: { $gte: new Date(startDate), $lte: new Date(endDate) },
                status: { $in: ['approved', 'paid'] },
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

// Static method to get expense trends
expenseSchema.statics.getTrends = async function (startDate, endDate, period = 'month', filters = {}) {
    const groupBy = period === 'day'
        ? { year: { $year: '$date' }, month: { $month: '$date' }, day: { $dayOfMonth: '$date' } }
        : period === 'month'
            ? { year: { $year: '$date' }, month: { $month: '$date' } }
            : { year: { $year: '$date' } };

    return await this.aggregate([
        {
            $match: {
                date: { $gte: new Date(startDate), $lte: new Date(endDate) },
                status: { $in: ['approved', 'paid'] },
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

// Method to approve expense
expenseSchema.methods.approve = function (userId) {
    this.status = 'approved';
    this.approvedBy = userId;
    this.approvedAt = new Date();
    return this.save();
};

// Method to mark as paid
expenseSchema.methods.markAsPaid = function () {
    this.status = 'paid';
    this.paidAt = new Date();
    return this.save();
};

export default mongoose.model('Expense', expenseSchema);
