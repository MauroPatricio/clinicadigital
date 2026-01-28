import Bill from '../models/Bill.js';
import Payment from '../models/Payment.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

// @desc    Get all bills
// @route   GET /api/billing/invoices
// @access  Private
export const getBills = async (req, res, next) => {
    try {
        const { status, patientId } = req.query;
        let query = {};

        // Role-based filtering
        if (req.user.role === 'patient') {
            const patient = await Patient.findOne({ user: req.user._id });
            query.patient = patient._id;
        } else if (patientId) {
            query.patient = patientId;
        }

        if (status) {
            query.paymentStatus = status;
        }

        const bills = await Bill.find(query)
            .populate('patient', 'patientNumber user')
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'profile email' }
            })
            .populate('appointment')
            .populate('payments')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bills.length,
            data: bills
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single bill
// @route   GET /api/billing/invoices/:id
// @access  Private
export const getBill = async (req, res, next) => {
    try {
        const bill = await Bill.findById(req.params.id)
            .populate('patient', 'patientNumber user')
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'profile email' }
            })
            .populate('appointment')
            .populate('payments');

        if (!bill) {
            return next(new AppError('Bill not found', 404));
        }

        // Authorization check
        if (req.user.role === 'patient') {
            const patient = await Patient.findOne({ user: req.user._id });
            if (bill.patient._id.toString() !== patient._id.toString()) {
                return next(new AppError('Not authorized to access this bill', 403));
            }
        }

        res.status(200).json({
            success: true,
            data: bill
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create bill
// @route   POST /api/billing/invoices
// @access  Private (Admin, Receptionist)
export const createBill = async (req, res, next) => {
    try {
        const {
            patientId,
            appointmentId,
            services,
            discount,
            tax
        } = req.body;

        // Verify patient
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return next(new AppError('Patient not found', 404));
        }

        // Calculate subtotal
        const subtotal = services.reduce((sum, service) => {
            return sum + (service.quantity * service.unitPrice);
        }, 0);

        // Calculate total
        const discountAmount = discount?.amount || 0;
        const taxRate = tax?.rate || 0;
        const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
        const total = subtotal - discountAmount + taxAmount;

        // Set due date (30 days from now)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);

        const bill = await Bill.create({
            patient: patientId,
            appointment: appointmentId,
            services,
            subtotal,
            discount: {
                amount: discountAmount,
                reason: discount?.reason
            },
            tax: {
                rate: taxRate,
                amount: taxAmount
            },
            total,
            dueDate,
            paymentStatus: 'pending'
        });

        await bill.populate(['patient', 'appointment']);

        logger.info(`Bill created: ${bill.billNumber} for patient ${patient.patientNumber}`);

        res.status(201).json({
            success: true,
            data: bill
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update bill
// @route   PUT /api/billing/invoices/:id
// @access  Private (Admin)
export const updateBill = async (req, res, next) => {
    try {
        let bill = await Bill.findById(req.params.id);

        if (!bill) {
            return next(new AppError('Bill not found', 404));
        }

        bill = await Bill.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate(['patient', 'appointment', 'payments']);

        res.status(200).json({
            success: true,
            data: bill
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get financial reports
// @route   GET /api/billing/reports
// @access  Private (Admin)
export const getFinancialReports = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }

        // Total revenue
        const totalRevenue = await Bill.aggregate([
            { $match: { paymentStatus: 'paid', ...dateFilter } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);

        // Revenue by payment method
        const revenueByMethod = await Payment.aggregate([
            { $match: { status: 'completed', ...dateFilter } },
            { $group: { _id: '$method', total: { $sum: '$amount' } } }
        ]);

        // Pending payments
        const pendingPayments = await Bill.aggregate([
            { $match: { paymentStatus: { $in: ['pending', 'partial'] } } },
            { $group: { _id: null, total: { $sum: '$balanceDue' }, count: { $sum: 1 } } }
        ]);

        // Monthly revenue trend
        const monthlyRevenue = await Bill.aggregate([
            { $match: { paymentStatus: 'paid', ...dateFilter } },
            {
                $group: {
                    _id: {
                        year: { $year: '$paidAt' },
                        month: { $month: '$paidAt' }
                    },
                    revenue: { $sum: '$total' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalRevenue: totalRevenue[0]?.total || 0,
                revenueByMethod,
                pendingPayments: pendingPayments[0] || { total: 0, count: 0 },
                monthlyRevenue
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get billing statistics
// @route   GET /api/billing/stats
// @access  Private (Admin)
export const getBillingStats = async (req, res, next) => {
    try {
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // This month stats
        const thisMonthStats = await Bill.aggregate([
            { $match: { createdAt: { $gte: thisMonth } } },
            {
                $group: {
                    _id: '$paymentStatus',
                    count: { $sum: 1 },
                    total: { $sum: '$total' }
                }
            }
        ]);

        // Last month stats
        const lastMonthStats = await Bill.aggregate([
            {
                $match: {
                    createdAt: { $gte: lastMonth, $lt: thisMonth }
                }
            },
            {
                $group: {
                    _id: '$paymentStatus',
                    count: { $sum: 1 },
                    total: { $sum: '$total' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                thisMonth: thisMonthStats,
                lastMonth: lastMonthStats
            }
        });
    } catch (error) {
        next(error);
    }
};
