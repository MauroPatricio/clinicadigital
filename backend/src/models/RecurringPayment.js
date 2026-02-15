import mongoose from 'mongoose';

const RecurringPaymentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        required: true
    },

    // Schedule
    frequency: {
        type: String,
        enum: ['weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly'],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: Date,
    nextPaymentDate: {
        type: Date,
        required: true
    },

    // Payment Details
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: 'treatment'
    },

    // Status
    status: {
        type: String,
        enum: ['active', 'paused', 'completed', 'cancelled'],
        default: 'active'
    },
    paymentMethod: {
        type: String,
        required: true
    },

    // History
    payments: [{
        date: Date,
        amount: Number,
        status: { type: String, enum: ['success', 'failed', 'pending'] },
        invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
        errorMessage: String
    }],

    // Auto-generation
    autoInvoice: {
        type: Boolean,
        default: true
    },
    lastProcessedDate: Date,
    totalPaid: {
        type: Number,
        default: 0
    },
    remainingPayments: Number,

    // Notifications
    notifyBeforeDays: {
        type: Number,
        default: 3
    },
    lastNotificationDate: Date
}, {
    timestamps: true
});

// Indexes
RecurringPaymentSchema.index({ patient: 1, status: 1 });
RecurringPaymentSchema.index({ clinic: 1, status: 1 });
RecurringPaymentSchema.index({ nextPaymentDate: 1, status: 1 });

// Calculate next payment date
RecurringPaymentSchema.methods.calculateNextDate = function () {
    const current = this.nextPaymentDate || this.startDate;
    const next = new Date(current);

    switch (this.frequency) {
        case 'weekly':
            next.setDate(next.getDate() + 7);
            break;
        case 'bi-weekly':
            next.setDate(next.getDate() + 14);
            break;
        case 'monthly':
            next.setMonth(next.getMonth() + 1);
            break;
        case 'quarterly':
            next.setMonth(next.getMonth() + 3);
            break;
        case 'yearly':
            next.setFullYear(next.getFullYear() + 1);
            break;
    }

    return next;
};

// Process payment
RecurringPaymentSchema.methods.processPayment = async function (invoiceId = null, status = 'success', errorMessage = null) {
    const payment = {
        date: new Date(),
        amount: this.amount,
        status,
        invoiceId,
        errorMessage
    };

    this.payments.push(payment);

    if (status === 'success') {
        this.totalPaid += this.amount;
        this.lastProcessedDate = new Date();
        this.nextPaymentDate = this.calculateNextDate();

        // Check if completed
        if (this.endDate && this.nextPaymentDate > this.endDate) {
            this.status = 'completed';
        }

        if (this.remainingPayments !== undefined) {
            this.remainingPayments--;
            if (this.remainingPayments <= 0) {
                this.status = 'completed';
            }
        }
    }

    await this.save();
    return this;
};

// Pause recurring payment
RecurringPaymentSchema.methods.pause = async function () {
    this.status = 'paused';
    await this.save();
    return this;
};

// Resume recurring payment
RecurringPaymentSchema.methods.resume = async function () {
    this.status = 'active';
    // Recalculate next payment date if it's in the past
    if (this.nextPaymentDate < new Date()) {
        this.nextPaymentDate = this.calculateNextDate();
    }
    await this.save();
    return this;
};

// Cancel recurring payment
RecurringPaymentSchema.methods.cancel = async function () {
    this.status = 'cancelled';
    await this.save();
    return this;
};

// Static: Get payments due
RecurringPaymentSchema.statics.getDuePayments = async function () {
    return await this.find({
        status: 'active',
        nextPaymentDate: { $lte: new Date() }
    }).populate('patient clinic');
};

// Static: Get upcoming payments
RecurringPaymentSchema.statics.getUpcomingPayments = async function (days = 7) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return await this.find({
        status: 'active',
        nextPaymentDate: { $gte: new Date(), $lte: endDate }
    }).populate('patient clinic');
};

export default mongoose.model('RecurringPayment', RecurringPaymentSchema);
