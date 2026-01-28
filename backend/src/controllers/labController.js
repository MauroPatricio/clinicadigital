import LabOrder from '../models/LabOrder.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import MedicalRecord from '../models/MedicalRecord.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

// @desc    Create lab order
// @route   POST /api/lab/orders
// @access  Private (Doctor)
export const createLabOrder = async (req, res, next) => {
    try {
        const { patientId, medicalRecordId, exams, priority, notes } = req.body;

        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor) {
            return next(new AppError('Doctor profile not found', 404));
        }

        const patient = await Patient.findById(patientId);
        if (!patient) {
            return next(new AppError('Patient not found', 404));
        }

        const labOrder = await LabOrder.create({
            patient: patientId,
            doctor: doctor._id,
            medicalRecord: medicalRecordId,
            exams,
            priority: priority || 'routine',
            notes,
            status: 'pending'
        });

        // Add to medical record if provided
        if (medicalRecordId) {
            const record = await MedicalRecord.findById(medicalRecordId);
            if (record) {
                record.labOrders.push(labOrder._id);
                await record.save();
            }
        }

        await labOrder.populate(['patient', 'doctor']);

        logger.info(`Lab order created: ${labOrder.orderNumber}`);

        res.status(201).json({
            success: true,
            data: labOrder
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get lab orders
// @route   GET /api/lab/orders
// @access  Private
export const getLabOrders = async (req, res, next) => {
    try {
        const { status, patientId, priority } = req.query;
        let query = {};

        // Role-based filtering
        if (req.user.role === 'patient') {
            const patient = await Patient.findOne({ user: req.user._id });
            query.patient = patient._id;
        } else if (req.user.role === 'doctor') {
            const doctor = await Doctor.findOne({ user: req.user._id });
            if (patientId) {
                query.patient = patientId;
            } else {
                query.doctor = doctor._id;
            }
        } else if (patientId) {
            query.patient = patientId;
        }

        if (status) query.status = status;
        if (priority) query.priority = priority;

        const orders = await LabOrder.find(query)
            .populate('patient', 'patientNumber user')
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'profile' }
            })
            .populate('doctor', 'user specialization')
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'profile' }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single lab order
// @route   GET /api/lab/orders/:id
// @access  Private
export const getLabOrder = async (req, res, next) => {
    try {
        const order = await LabOrder.findById(req.params.id)
            .populate('patient', 'patientNumber user')
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'profile' }
            })
            .populate('doctor', 'user specialization')
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'profile' }
            });

        if (!order) {
            return next(new AppError('Lab order not found', 404));
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Upload lab results
// @route   POST /api/lab/orders/:id/results
// @access  Private (Admin, Lab Technician)
export const uploadLabResults = async (req, res, next) => {
    try {
        const { examIndex, results, attachments } = req.body;

        const order = await LabOrder.findById(req.params.id);

        if (!order) {
            return next(new AppError('Lab order not found', 404));
        }

        // Update specific exam results
        if (examIndex !== undefined && order.exams[examIndex]) {
            order.exams[examIndex].results = results;
            order.exams[examIndex].status = 'completed';

            if (attachments) {
                order.exams[examIndex].results.attachments = attachments;
            }
        }

        // Check if all exams are completed
        const allCompleted = order.exams.every(exam => exam.status === 'completed');
        if (allCompleted) {
            order.status = 'completed';
            order.resultsAvailableAt = Date.now();
        } else {
            order.status = 'in-progress';
        }

        await order.save();

        // Emit notification via Socket.IO
        const io = req.app.get('io');
        if (io && allCompleted) {
            io.to(`user-${order.patient}`).emit('lab-results-ready', {
                orderNumber: order.orderNumber,
                message: 'Your lab results are ready'
            });
        }

        logger.info(`Lab results uploaded for order: ${order.orderNumber}`);

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Notify patient about results
// @route   POST /api/lab/orders/:id/notify
// @access  Private (Admin)
export const notifyPatient = async (req, res, next) => {
    try {
        const order = await LabOrder.findById(req.params.id)
            .populate('patient', 'user');

        if (!order) {
            return next(new AppError('Lab order not found', 404));
        }

        if (order.status !== 'completed') {
            return next(new AppError('Lab results not yet completed', 400));
        }

        order.notificationSent = true;
        await order.save();

        // TODO: Send actual notification via push/SMS/email
        logger.info(`Patient notified about lab results: ${order.orderNumber}`);

        res.status(200).json({
            success: true,
            message: 'Patient notified successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update lab order status
// @route   PUT /api/lab/orders/:id
// @access  Private (Admin, Lab Technician)
export const updateLabOrder = async (req, res, next) => {
    try {
        const order = await LabOrder.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate(['patient', 'doctor']);

        if (!order) {
            return next(new AppError('Lab order not found', 404));
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

export default {
    createLabOrder,
    getLabOrders,
    getLabOrder,
    uploadLabResults,
    notifyPatient,
    updateLabOrder
};
