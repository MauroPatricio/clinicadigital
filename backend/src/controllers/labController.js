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

// @desc    Get lab requests for owner (all clinics or specific clinic)
// @route   GET /api/owner/laboratory/requests
// @access  Private (Owner)
export const getLabRequestsForOwner = async (req, res, next) => {
    try {
        const { clinic, status, priority, search, page = 1, limit = 20 } = req.query;

        let query = {};

        // Filter by clinic if provided, otherwise get all clinics in organization
        if (clinic) {
            query.clinic = clinic;
        }

        if (status) query.status = status;
        if (priority) query.priority = priority;

        // Search by patient name or order number
        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            LabOrder.find(query)
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
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            LabOrder.countDocuments(query)
        ]);

        // Get stats for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = await LabOrder.aggregate([
            {
                $facet: {
                    todayCount: [
                        { $match: { createdAt: { $gte: today } } },
                        { $count: 'count' }
                    ],
                    pendingCount: [
                        { $match: { status: 'pending' } },
                        { $count: 'count' }
                    ],
                    urgentCount: [
                        { $match: { priority: 'urgent', status: { $ne: 'completed' } } },
                        { $count: 'count' }
                    ]
                }
            }
        ]);

        res.status(200).json({
            success: true,
            count: orders.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            stats: {
                today: stats[0].todayCount[0]?.count || 0,
                pending: stats[0].pendingCount[0]?.count || 0,
                urgent: stats[0].urgentCount[0]?.count || 0
            },
            data: orders
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get lab results for owner (completed orders)
// @route   GET /api/owner/laboratory/results
// @access  Private (Owner)
export const getLabResultsForOwner = async (req, res, next) => {
    try {
        const { clinic, startDate, endDate, examType, search, page = 1, limit = 20 } = req.query;

        let query = { status: 'completed' };

        if (clinic) query.clinic = clinic;

        // Date range filter
        if (startDate || endDate) {
            query.resultsAvailableAt = {};
            if (startDate) query.resultsAvailableAt.$gte = new Date(startDate);
            if (endDate) query.resultsAvailableAt.$lte = new Date(endDate);
        }

        // Search by patient name or order number
        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            LabOrder.find(query)
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
                .sort({ resultsAvailableAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            LabOrder.countDocuments(query)
        ]);

        // Calculate average turnaround time (in hours)
        const turnaroundStats = await LabOrder.aggregate([
            { $match: { status: 'completed', resultsAvailableAt: { $exists: true } } },
            {
                $project: {
                    turnaroundTime: {
                        $divide: [
                            { $subtract: ['$resultsAvailableAt', '$createdAt'] },
                            3600000 // Convert to hours
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    avgTurnaround: { $avg: '$turnaroundTime' },
                    minTurnaround: { $min: '$turnaroundTime' },
                    maxTurnaround: { $max: '$turnaroundTime' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            count: orders.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            stats: {
                avgTurnaround: turnaroundStats[0]?.avgTurnaround?.toFixed(1) || 0,
                minTurnaround: turnaroundStats[0]?.minTurnaround?.toFixed(1) || 0,
                maxTurnaround: turnaroundStats[0]?.maxTurnaround?.toFixed(1) || 0
            },
            data: orders
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get lab history with analytics for owner
// @route   GET /api/owner/laboratory/history
// @access  Private (Owner)
export const getLabHistoryForOwner = async (req, res, next) => {
    try {
        const { clinic, startDate, endDate, status, priority, page = 1, limit = 50 } = req.query;

        let query = {};

        if (clinic) query.clinic = clinic;
        if (status) query.status = status;
        if (priority) query.priority = priority;

        // Date range filter (default to last 30 days if not specified)
        const dateQuery = {};
        if (startDate || endDate) {
            if (startDate) dateQuery.$gte = new Date(startDate);
            if (endDate) dateQuery.$lte = new Date(endDate);
        } else {
            // Default to last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            dateQuery.$gte = thirtyDaysAgo;
        }
        query.createdAt = dateQuery;

        const skip = (page - 1) * limit;

        const [orders, total, analytics] = await Promise.all([
            LabOrder.find(query)
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
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            LabOrder.countDocuments(query),
            LabOrder.aggregate([
                { $match: query },
                {
                    $facet: {
                        statusDistribution: [
                            { $group: { _id: '$status', count: { $sum: 1 } } }
                        ],
                        priorityDistribution: [
                            { $group: { _id: '$priority', count: { $sum: 1 } } }
                        ],
                        topExams: [
                            { $unwind: '$exams' },
                            { $group: { _id: '$exams.name', count: { $sum: 1 } } },
                            { $sort: { count: -1 } },
                            { $limit: 10 }
                        ],
                        monthlyTrend: [
                            {
                                $group: {
                                    _id: {
                                        year: { $year: '$createdAt' },
                                        month: { $month: '$createdAt' }
                                    },
                                    count: { $sum: 1 }
                                }
                            },
                            { $sort: { '_id.year': 1, '_id.month': 1 } }
                        ]
                    }
                }
            ])
        ]);

        res.status(200).json({
            success: true,
            count: orders.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            analytics: analytics[0],
            data: orders
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
    updateLabOrder,
    getLabRequestsForOwner,
    getLabResultsForOwner,
    getLabHistoryForOwner
};
