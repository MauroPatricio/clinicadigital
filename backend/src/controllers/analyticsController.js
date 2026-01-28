import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import Bill from '../models/Bill.js';
import User from '../models/User.js';
import Clinic from '../models/Clinic.js';
import StaffPerformance from '../models/StaffPerformance.js';
import asyncHandler from 'express-async-handler';

// @desc    Get Owner Dashboard Analytics
// @route   GET /api/analytics/owner-dashboard
// @access  Private (Owner only)
export const getOwnerDashboard = asyncHandler(async (req, res) => {
    if (req.user.roleType !== 'owner') {
        res.status(403);
        throw new Error('Owner access required');
    }

    const clinics = await Clinic.find({
        organization: req.user.organization,
        isActive: true
    });

    const clinicIds = clinics.map(c => c._id);

    // Date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Total revenue across all clinics
    const revenueData = await Bill.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$totalAmount' },
                paidRevenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0] } }
            }
        }
    ]);
    const revenue = revenueData[0] || { totalRevenue: 0, paidRevenue: 0 };

    // Best performing clinic (by revenue)
    const clinicRevenue = await Bill.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        {
            $lookup: {
                from: 'appointments',
                localField: 'appointment',
                foreignField: '_id',
                as: 'appointmentData'
            }
        },
        { $unwind: '$appointmentData' },
        {
            $group: {
                _id: '$appointmentData.clinic',
                revenue: { $sum: '$totalAmount' }
            }
        },
        { $sort: { revenue: -1 } },
        { $limit: 1 },
        {
            $lookup: {
                from: 'clinics',
                localField: '_id',
                foreignField: '_id',
                as: 'clinic'
            }
        },
        { $unwind: '$clinic' }
    ]);

    // Most productive staff member
    const topStaff = await StaffPerformance.aggregate([
        {
            $match: {
                clinic: { $in: clinicIds },
                period: 'monthly',
                startDate: { $gte: startOfMonth }
            }
        },
        { $sort: { 'score.total': -1 } },
        { $limit: 1 },
        {
            $lookup: {
                from: 'users',
                localField: 'staff',
                foreignField: '_id',
                as: 'staffData'
            }
        },
        { $unwind: '$staffData' }
    ]);

    // Average appointment duration by specialty
    const avgDurationBySpecialty = await Appointment.aggregate([
        {
            $match: {
                clinic: { $in: clinicIds },
                status: 'completed',
                completedAt: { $exists: true },
                startedAt: { $exists: true }
            }
        },
        {
            $project: {
                specialty: 1,
                duration: {
                    $divide: [
                        { $subtract: ['$completedAt', '$startedAt'] },
                        60000 // convert to minutes
                    ]
                }
            }
        },
        {
            $group: {
                _id: '$specialty',
                avgDuration: { $avg: '$duration' },
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } }
    ]);

    // No-show rate
    const appointmentStats = await Appointment.aggregate([
        {
            $match: {
                clinic: { $in: clinicIds },
                dateTime: { $gte: startOfMonth }
            }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    const totalAppointments = appointmentStats.reduce((sum, s) => sum + s.count, 0);
    const noShows = appointmentStats.find(s => s._id === 'no-show')?.count || 0;
    const noShowRate = totalAppointments > 0 ? ((noShows / totalAppointments) * 100).toFixed(2) : 0;

    // Most requested services
    const topServices = await Appointment.aggregate([
        {
            $match: {
                clinic: { $in: clinicIds },
                dateTime: { $gte: startOfMonth }
            }
        },
        {
            $group: {
                _id: '$specialty',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
    ]);

    // Peak hours analysis
    const peakHours = await Appointment.aggregate([
        {
            $match: {
                clinic: { $in: clinicIds },
                dateTime: { $gte: startOfMonth }
            }
        },
        {
            $project: {
                hour: { $hour: '$dateTime' }
            }
        },
        {
            $group: {
                _id: '$hour',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 3 }
    ]);

    res.status(200).json({
        success: true,
        data: {
            overview: {
                totalClinics: clinics.length,
                totalRevenue: revenue.totalRevenue,
                paidRevenue: revenue.paidRevenue,
                pendingRevenue: revenue.totalRevenue - revenue.paidRevenue
            },
            bestPerformingClinic: clinicRevenue[0] || null,
            topStaffMember: topStaff[0] || null,
            metrics: {
                avgDurationBySpecialty: avgDurationBySpecialty,
                noShowRate: parseFloat(noShowRate),
                totalAppointments,
                noShows
            },
            insights: {
                topServices,
                peakHours: peakHours.map(h => ({
                    hour: `${h._id}:00`,
                    appointments: h.count
                }))
            }
        }
    });
});

// @desc    Get Manager Dashboard Analytics
// @route   GET /api/analytics/manager-dashboard
// @access  Private (Manager)
export const getManagerDashboard = asyncHandler(async (req, res) => {
    if (req.user.roleType !== 'manager' && req.user.roleType !== 'owner') {
        res.status(403);
        throw new Error('Manager access required');
    }

    const clinicId = req.user.clinic;
    if (!clinicId) {
        res.status(400);
        throw new Error('No clinic assigned to user');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Today's appointments
    const todayAppointments = await Appointment.find({
        clinic: clinicId,
        dateTime: { $gte: today, $lt: tomorrow }
    }).populate('doctor patient');

    // Staff on duty today
    const staffOnDuty = await User.find({
        clinic: clinicId,
        roleType: 'staff',
        isActive: true,
        'availability.monday.available': true // Simplified - should check actual day
    }).select('profile staffRole specialties');

    // Today's revenue
    const todayRevenue = await Bill.aggregate([
        {
            $match: {
                createdAt: { $gte: today, $lt: tomorrow }
            }
        },
        {
            $lookup: {
                from: 'appointments',
                localField: 'appointment',
                foreignField: '_id',
                as: 'appointmentData'
            }
        },
        { $unwind: '$appointmentData' },
        {
            $match: {
                'appointmentData.clinic': clinicId
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$totalAmount' },
                paid: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0] } }
            }
        }
    ]);

    const revenue = todayRevenue[0] || { total: 0, paid: 0 };

    // Top performing staff this month
    const topStaff = await StaffPerformance.find({
        clinic: clinicId,
        period: 'monthly',
        startDate: { $gte: startOfMonth }
    })
        .sort({ 'score.total': -1 })
        .limit(5)
        .populate('staff', 'profile.firstName profile.lastName staffRole');

    // Room availability
    const Room = (await import('../models/Room.js')).default;
    const rooms = await Room.find({ clinic: clinicId });
    const availableRooms = rooms.filter(r => r.status === 'available').length;

    res.status(200).json({
        success: true,
        data: {
            today: {
                appointments: todayAppointments.length,
                appointmentsList: todayAppointments,
                revenue: revenue.total,
                paidRevenue: revenue.paid,
                staffOnDuty: staffOnDuty.length,
                availableRooms
            },
            staff: {
                topPerformers: topStaff,
                total: await User.countDocuments({ clinic: clinicId, roleType: 'staff' })
            }
        }
    });
});

// @desc    Get Staff Dashboard Analytics
// @route   GET /api/analytics/staff-dashboard
// @access  Private (Staff)
export const getStaffDashboard = asyncHandler(async (req, res) => {
    if (req.user.roleType !== 'staff') {
        res.status(403);
        throw new Error('Staff access required');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Today's appointments for this staff member
    const todayAppointments = await Appointment.find({
        doctor: req.user._id,
        dateTime: { $gte: today, $lt: tomorrow }
    })
        .populate('patient', 'profile contact')
        .sort({ dateTime: 1 });

    // Personal performance this month
    const performance = await StaffPerformance.findOne({
        staff: req.user._id,
        period: 'monthly',
        startDate: { $gte: startOfMonth }
    });

    // Total appointments this month
    const monthAppointments = await Appointment.countDocuments({
        doctor: req.user._id,
        dateTime: { $gte: startOfMonth }
    });

    res.status(200).json({
        success: true,
        data: {
            today: {
                appointments: todayAppointments,
                count: todayAppointments.length
            },
            thisMonth: {
                totalAppointments: monthAppointments,
                performance: performance || null
            }
        }
    });
});

// @desc    Get comprehensive clinic analytics
// @route   GET /api/analytics/clinic/:clinicId
// @access  Private (Owner, Manager)
export const getClinicAnalytics = asyncHandler(async (req, res) => {
    const { clinicId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify access
    if (req.user.roleType === 'manager' || req.user.roleType === 'staff') {
        if (req.user.clinic.toString() !== clinicId) {
            res.status(403);
            throw new Error('Access denied to this clinic');
        }
    }

    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    // Appointments over time
    const appointmentsTrend = await Appointment.aggregate([
        {
            $match: {
                clinic: clinicId,
                dateTime: { $gte: start, $lte: end }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$dateTime' } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Revenue by service type
    const revenueByService = await Appointment.aggregate([
        {
            $match: {
                clinic: clinicId,
                dateTime: { $gte: start, $lte: end }
            }
        },
        {
            $lookup: {
                from: 'bills',
                localField: '_id',
                foreignField: 'appointment',
                as: 'bill'
            }
        },
        { $unwind: { path: '$bill', preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: '$specialty',
                revenue: { $sum: '$bill.totalAmount' },
                count: { $sum: 1 }
            }
        },
        { $sort: { revenue: -1 } }
    ]);

    res.status(200).json({
        success: true,
        period: { startDate: start, endDate: end },
        data: {
            appointmentsTrend,
            revenueByService
        }
    });
});

// @desc    Get staff performance report
// @route   GET /api/analytics/staff-performance/:clinicId
// @access  Private (Owner, Manager)
export const getStaffPerformanceReport = asyncHandler(async (req, res) => {
    const { clinicId } = req.params;
    const { period = 'monthly' } = req.query;

    // Verify access
    if (req.user.roleType === 'manager' || req.user.roleType === 'staff') {
        if (req.user.clinic.toString() !== clinicId) {
            res.status(403);
            throw new Error('Access denied to this clinic');
        }
    }

    const now = new Date();
    let startDate;

    switch (period) {
        case 'weekly':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
        case 'monthly':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'quarterly':
            startDate = new Date(now.setMonth(now.getMonth() - 3));
            break;
        default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const performanceData = await StaffPerformance.find({
        clinic: clinicId,
        period,
        startDate: { $gte: startDate }
    })
        .populate('staff', 'profile.firstName profile.lastName staffRole')
        .sort({ 'score.total': -1 });

    res.status(200).json({
        success: true,
        period: { startDate, endDate: new Date() },
        data: performanceData
    });
});
