import Payment from '../models/Payment.js';
import Bill from '../models/Bill.js';
import Patient from '../models/Patient.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

// @desc    Process M-Pesa payment
// @route   POST /api/payments/mpesa
// @access  Private
export const processMpesaPayment = async (req, res, next) => {
    try {
        const { billId, amount, mpesaPhone } = req.body;

        const bill = await Bill.findById(billId);
        if (!bill) {
            return next(new AppError('Bill not found', 404));
        }

        // Verify patient ownership
        if (req.user.role === 'patient') {
            const patient = await Patient.findOne({ user: req.user._id });
            if (bill.patient.toString() !== patient._id.toString()) {
                return next(new AppError('Not authorized', 403));
            }
        }

        // TODO: Integrate with actual M-Pesa API
        // This is a placeholder implementation
        const mpesaReference = `MPESA${Date.now()}`;

        const payment = await Payment.create({
            bill: billId,
            patient: bill.patient,
            amount,
            method: 'mpesa',
            status: 'processing',
            mpesaReference,
            mpesaPhone,
            metadata: {
                ipAddress: req.ip,
                userAgent: req.get('user-agent')
            }
        });

        // Simulate successful payment (replace with actual M-Pesa callback)
        setTimeout(async () => {
            payment.status = 'completed';
            payment.processedAt = Date.now();
            await payment.save();

            // Update bill
            bill.amountPaid += amount;
            bill.payments.push(payment._id);

            if (bill.amountPaid >= bill.total) {
                bill.paymentStatus = 'paid';
                bill.paidAt = Date.now();
            } else {
                bill.paymentStatus = 'partial';
            }

            await bill.save();
        }, 2000);

        logger.info(`M-Pesa payment initiated: ${payment.transactionId}`);

        res.status(201).json({
            success: true,
            message: 'Payment initiated. Please check your phone.',
            data: payment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Process card payment
// @route   POST /api/payments/card
// @access  Private
export const processCardPayment = async (req, res, next) => {
    try {
        const { billId, amount, stripePaymentId } = req.body;

        const bill = await Bill.findById(billId);
        if (!bill) {
            return next(new AppError('Bill not found', 404));
        }

        // TODO: Integrate with Stripe API
        // This is a placeholder
        const payment = await Payment.create({
            bill: billId,
            patient: bill.patient,
            amount,
            method: 'card',
            status: 'completed',
            stripePaymentId,
            processedAt: Date.now(),
            metadata: {
                ipAddress: req.ip,
                userAgent: req.get('user-agent')
            }
        });

        // Update bill
        bill.amountPaid += amount;
        bill.payments.push(payment._id);

        if (bill.amountPaid >= bill.total) {
            bill.paymentStatus = 'paid';
            bill.paidAt = Date.now();
        } else {
            bill.paymentStatus = 'partial';
        }

        await bill.save();

        logger.info(`Card payment processed: ${payment.transactionId}`);

        res.status(201).json({
            success: true,
            data: payment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
export const getPayment = async (req, res, next) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('bill')
            .populate('patient', 'patientNumber user');

        if (!payment) {
            return next(new AppError('Payment not found', 404));
        }

        res.status(200).json({
            success: true,
            data: payment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get payment receipt
// @route   GET /api/payments/:id/receipt
// @access  Private
export const getPaymentReceipt = async (req, res, next) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('bill')
            .populate('patient', 'patientNumber user')
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'profile' }
            });

        if (!payment) {
            return next(new AppError('Payment not found', 404));
        }

        // TODO: Generate PDF receipt
        // For now, return payment data
        res.status(200).json({
            success: true,
            data: {
                receiptNumber: payment.transactionId,
                date: payment.processedAt,
                patient: payment.patient,
                amount: payment.amount,
                method: payment.method,
                status: payment.status
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Refund payment
// @route   POST /api/payments/:id/refund
// @access  Private (Admin only)
export const refundPayment = async (req, res, next) => {
    try {
        const { reason, amount } = req.body;

        const payment = await Payment.findById(req.params.id).populate('bill');

        if (!payment) {
            return next(new AppError('Payment not found', 404));
        }

        if (payment.status !== 'completed') {
            return next(new AppError('Can only refund completed payments', 400));
        }

        if (payment.refund.refunded) {
            return next(new AppError('Payment already refunded', 400));
        }

        // TODO: Integrate with actual payment gateway refund API
        payment.refund = {
            refunded: true,
            amount: amount || payment.amount,
            reason,
            refundedAt: Date.now(),
            refundTransactionId: `REF${Date.now()}`
        };

        payment.status = 'refunded';
        await payment.save();

        // Update bill
        const bill = payment.bill;
        bill.amountPaid -= payment.refund.amount;
        bill.paymentStatus = bill.amountPaid >= bill.total ? 'paid' : 'partial';
        await bill.save();

        logger.warn(`Payment refunded: ${payment.transactionId} - Reason: ${reason}`);

        res.status(200).json({
            success: true,
            data: payment
        });
    } catch (error) {
        next(error);
    }
};
