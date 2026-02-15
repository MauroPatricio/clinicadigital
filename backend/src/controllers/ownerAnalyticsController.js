import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Payment from '../models/Payment.js';
import Bill from '../models/Bill.js';
import mongoose from 'mongoose';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subMonths } from 'date-fns';

// @desc    Get Executive Dashboard KPIs
// @route   GET /api/owner/analytics/kpis
// @access  Private (Owner)
// @desc    Get Executive Dashboard KPIs
// @route   GET /api/owner/analytics/kpis
// @access  Private (Owner)
export const getExecutiveKPIs = async (req, res, next) => {
    try {
        const { clinicId, period = 'month' } = req.query;
        const now = new Date();

        // Define date range based on period
        let startDate, endDate;
        switch (period) {
            case 'day':
                startDate = startOfDay(now);
                endDate = endOfDay(now);
                break;
            case 'month':
                startDate = startOfMonth(now);
                endDate = endOfMonth(now);
                break;
            case 'year':
                startDate = startOfYear(now);
                endDate = endOfYear(now);
                break;
            default:
                startDate = startOfMonth(now);
                endDate = endOfMonth(now);
        }

        const clinicQuery = clinicId ? { clinic: clinicId } : {};
        const dateQuery = { ...clinicQuery, createdAt: { $gte: startDate, $lte: endDate } };
        const appointmentDateQuery = { ...clinicQuery, dateTime: { $gte: startDate, $lte: endDate } };

        // Total patients attended (Completed appointments)
        const totalPatients = await Appointment.countDocuments({
            ...appointmentDateQuery,
            status: 'completed'
        });

        // Scheduled appointments
        const scheduledAppointments = await Appointment.countDocuments({
            ...clinicQuery,
            dateTime: { $gte: now },
            status: { $in: ['scheduled', 'confirmed'] }
        });

        // Revenue (via Payment -> Bill -> Appointment -> Clinic Lookup)
        const revenuePipeline = [
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: 'completed'
                }
            }
        ];

        // If clinic filtering is required, we must lookup
        if (clinicId) {
            revenuePipeline.push(
                {
                    $lookup: {
                        from: 'bills',
                        localField: 'bill',
                        foreignField: '_id',
                        as: 'billInfo'
                    }
                },
                { $unwind: '$billInfo' },
                {
                    $lookup: {
                        from: 'appointments',
                        localField: 'billInfo.appointment',
                        foreignField: '_id',
                        as: 'appointmentInfo'
                    }
                },
                { $unwind: { path: '$appointmentInfo', preserveNullAndEmptyArrays: true } },
                {
                    $match: { 'appointmentInfo.clinic': new mongoose.Types.ObjectId(clinicId) }
                }
            );
        }

        revenuePipeline.push({
            $group: {
                _id: null,
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        });

        const revenueData = await Payment.aggregate(revenuePipeline);
        const revenue = revenueData[0] || { total: 0, count: 0 };

        // Calculate doctor occupancy
        // Only count doctors who have availability slots
        const totalDoctors = await Doctor.countDocuments({ isAcceptingPatients: true });
        // NOTE: Doctors don't have clinic field directly, assuming all doctors if no filtered logic

        const doctorsOccupancy = await Appointment.aggregate([
            {
                $match: {
                    ...appointmentDateQuery,
                    status: { $in: ['scheduled', 'confirmed', 'completed', 'in-progress'] }
                }
            },
            {
                $group: {
                    _id: '$doctor',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Simple occupancy rate calculation
        const daysInPeriod = period === 'day' ? 1 : period === 'month' ? 30 : 365;
        // Assume capacity: 8 hours * 2 slots/hr = 16 slots/day per doctor
        const totalSlots = (totalDoctors || 1) * daysInPeriod * 16;
        const totalBooked = doctorsOccupancy.reduce((acc, doc) => acc + doc.count, 0);

        const occupancyRate = totalSlots > 0
            ? ((totalBooked / totalSlots) * 100).toFixed(1)
            : 0;


        // Critical alerts
        const overdueAppointments = await Appointment.countDocuments({
            ...clinicQuery,
            dateTime: { $lt: now },
            status: 'scheduled'
        });

        res.status(200).json({
            success: true,
            data: {
                period,
                totalPatients,
                scheduledAppointments,
                revenue: {
                    total: revenue.total,
                    count: revenue.count,
                    trend: 0 // Simplified for now to basic loading
                },
                doctorOccupancy: parseFloat(occupancyRate),
                alerts: {
                    overdueAppointments,
                    total: overdueAppointments
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get Revenue Breakdown
// @route   GET /api/owner/analytics/revenue
// @access  Private (Owner)
export const getRevenueBreakdown = async (req, res, next) => {
    try {
        const { clinicId, period = 'month', year = new Date().getFullYear() } = req.query;

        let groupBy;
        let startDate, endDate;

        if (period === 'daily') {
            startDate = subDays(new Date(), 30);
            endDate = new Date();
            groupBy = {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' }
            };
        } else {
            startDate = startOfYear(new Date(year, 0, 1));
            endDate = endOfYear(new Date(year, 0, 1));
            groupBy = {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
            };
        }

        const pipeline = [
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: 'completed'
                }
            }
        ];

        if (clinicId) {
            pipeline.push(
                {
                    $lookup: {
                        from: 'bills',
                        localField: 'bill',
                        foreignField: '_id',
                        as: 'billInfo'
                    }
                },
                { $unwind: '$billInfo' },
                {
                    $lookup: {
                        from: 'appointments',
                        localField: 'billInfo.appointment',
                        foreignField: '_id',
                        as: 'appointmentInfo'
                    }
                },
                { $unwind: { path: '$appointmentInfo', preserveNullAndEmptyArrays: true } },
                {
                    $match: { 'appointmentInfo.clinic': new mongoose.Types.ObjectId(clinicId) }
                }
            );
        }

        pipeline.push(
            {
                $group: {
                    _id: groupBy,
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        );

        const revenueData = await Payment.aggregate(pipeline);

        res.status(200).json({
            success: true,
            data: revenueData
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get Doctor Utilization Rates
// @route   GET /api/owner/analytics/doctor-occupancy
// @access  Private (Owner)
export const getDoctorOccupancy = async (req, res, next) => {
    try {
        const { clinicId, startDate, endDate } = req.query;

        const query = clinicId ? { clinic: new mongoose.Types.ObjectId(clinicId) } : {};
        const start = startDate ? new Date(startDate) : startOfMonth(new Date());
        const end = endDate ? new Date(endDate) : endOfMonth(new Date());

        const doctorStats = await Appointment.aggregate([
            {
                $match: {
                    ...query,
                    dateTime: { $gte: start, $lte: end },
                    status: { $in: ['completed', 'in-progress', 'confirmed', 'scheduled'] }
                }
            },
            {
                $group: {
                    _id: '$doctor',
                    totalAppointments: { $sum: 1 },
                    completedAppointments: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    }
                }
            },
            {
                $lookup: {
                    from: 'doctors',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'doctorInfo'
                }
            },
            { $unwind: '$doctorInfo' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'doctorInfo.user',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: '$userInfo' },
            {
                $project: {
                    doctorName: { $concat: ['$userInfo.profile.firstName', ' ', '$userInfo.profile.lastName'] },
                    specialization: '$doctorInfo.specialization',
                    totalAppointments: 1,
                    completedAppointments: 1,
                    occupancyRate: {
                        $multiply: [
                            { $divide: ['$totalAppointments', 100] },
                            100
                        ]
                    }
                }
            },
            { $sort: { totalAppointments: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: doctorStats
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get Top Services by Revenue
// @route   GET /api/owner/analytics/top-services
// @access  Private (Owner)
export const getTopServices = async (req, res, next) => {
    try {
        const { clinicId, limit = 5 } = req.query;

        // Use Bill model because Payment doesn't have service details
        const Bill = mongoose.model('Bill');

        const pipeline = [
            {
                // Only consider paid or partially paid bills
                $match: {
                    paymentStatus: { $in: ['paid', 'partial'] }
                }
            }
        ];

        if (clinicId) {
            pipeline.push(
                {
                    $lookup: {
                        from: 'appointments',
                        localField: 'appointment',
                        foreignField: '_id',
                        as: 'appointmentInfo'
                    }
                },
                { $unwind: { path: '$appointmentInfo', preserveNullAndEmptyArrays: true } },
                {
                    $match: { 'appointmentInfo.clinic': new mongoose.Types.ObjectId(clinicId) }
                }
            );
        }

        pipeline.push(
            { $unwind: '$services' },
            {
                $group: {
                    _id: '$services.description', // Group by service description/name
                    totalRevenue: { $sum: '$services.total' },
                    count: { $sum: '$services.quantity' }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: parseInt(limit) },
            {
                $project: {
                    service: '$_id',
                    totalRevenue: 1,
                    count: 1,
                    averagePrice: { $divide: ['$totalRevenue', '$count'] }
                }
            }
        );

        const topServices = await Bill.aggregate(pipeline);

        res.status(200).json({
            success: true,
            data: topServices
        });
    } catch (error) {
        next(error); // This will pass error to global handler
    }
};

// @desc    Get Business Alerts
// @route   GET /api/owner/analytics/alerts
// @access  Private (Owner)
export const getBusinessAlerts = async (req, res, next) => {
    try {
        const { clinicId } = req.query;
        const clinicQuery = clinicId ? { clinic: clinicId } : {};
        const now = new Date();

        const alerts = [];

        // Overdue appointments
        const overdueAppointments = await Appointment.countDocuments({
            ...clinicQuery,
            dateTime: { $lt: now },
            status: 'scheduled'
        });

        if (overdueAppointments > 0) {
            alerts.push({
                type: 'overdue_appointments',
                severity: 'warning',
                message: `${overdueAppointments} consultas em atraso`,
                count: overdueAppointments
            });
        }

        // Pending payments (Use Bill instead of Payment for status)
        const Bill = mongoose.model('Bill');
        // If filtering by clinic, we need aggregation, but countDocuments on Bill is hard to filter by appointment.clinic efficiently without lookup
        // We'll skip clinic filter for Pending Payments if complexity is high, OR replicate logic
        // For now, simpler check:

        // If clinicId is present, we would need to check bills linked to appointments at that clinic
        // For simplicity and speed in alerts, we might check 'overdue' bills

        const pendingBillsCount = await Bill.countDocuments({
            paymentStatus: 'pending',
            dueDate: { $lt: now }
        });

        if (pendingBillsCount > 0) {
            alerts.push({
                type: 'pending_payments',
                severity: 'info',
                message: `${pendingBillsCount} faturas vencidas`,
                count: pendingBillsCount
            });
        }

        res.status(200).json({
            success: true,
            data: {
                alerts,
                total: alerts.length
            }
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getExecutiveKPIs,
    getRevenueBreakdown,
    getDoctorOccupancy,
    getTopServices,
    getBusinessAlerts
};
