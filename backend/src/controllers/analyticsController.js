import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import Bill from '../models/Bill.js';
import User from '../models/User.js';
import Clinic from '../models/Clinic.js';
import StaffPerformance from '../models/StaffPerformance.js';
import asyncHandler from 'express-async-handler';

// @desc    Get Owner Dashboard Analytics - ANTIGRAVITY ENHANCED
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
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // === COMPREHENSIVE STAFF METRICS ===
    const allStaff = await User.find({
        clinic: { $in: clinicIds },
        roleType: 'staff',
        isActive: true
    });

    const totalStaff = allStaff.length;
    const totalDoctors = allStaff.filter(s => s.staffRole === 'doctor').length;
    const totalTechnicians = allStaff.filter(s => s.staffRole === 'technician').length;
    const totalNurses = allStaff.filter(s => s.staffRole === 'nurse').length;

    // === UNIT TYPE BREAKDOWN ===
    const totalClinics = clinics.filter(c => c.type === 'clinic').length;
    const totalLaboratories = clinics.filter(c => c.type === 'laboratory').length;
    const activeUnits = clinics.filter(c => c.status === 'active').length;

    // === PATIENT METRICS ===
    const uniquePatients = await Patient.distinct('_id', {
        // Patients are linked via appointments to clinics
    });
    const totalPatients = uniquePatients.length;

    // New patients this month vs last month
    const newPatientsThisMonth = await Patient.countDocuments({
        createdAt: { $gte: startOfMonth }
    });
    const newPatientsLastMonth = await Patient.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    // === REVENUE METRICS ===
    const revenueThisMonth = await Bill.aggregate([
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
                'appointmentData.clinic': { $in: clinicIds },
                createdAt: { $gte: startOfMonth }
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

    const revenueLastMonth = await Bill.aggregate([
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
                'appointmentData.clinic': { $in: clinicIds },
                createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$totalAmount' }
            }
        }
    ]);

    const currentRevenue = revenueThisMonth[0] || { total: 0, paid: 0 };
    const lastRevenue = revenueLastMonth[0] || { total: 0 };
    const revenueGrowth = lastRevenue.total > 0
        ? ((currentRevenue.total - lastRevenue.total) / lastRevenue.total * 100).toFixed(1)
        : 0;

    // === APPOINTMENT METRICS ===
    const appointmentsThisMonth = await Appointment.countDocuments({
        clinic: { $in: clinicIds },
        dateTime: { $gte: startOfMonth }
    });

    const appointmentsLastMonth = await Appointment.countDocuments({
        clinic: { $in: clinicIds },
        dateTime: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    const appointmentGrowth = appointmentsLastMonth > 0
        ? ((appointmentsThisMonth - appointmentsLastMonth) / appointmentsLastMonth * 100).toFixed(1)
        : 0;

    // === PERFORMANCE RANKING ===
    const unitPerformance = await Bill.aggregate([
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
                'appointmentData.clinic': { $in: clinicIds },
                createdAt: { $gte: startOfMonth }
            }
        },
        {
            $group: {
                _id: '$appointmentData.clinic',
                revenue: { $sum: '$totalAmount' },
                appointmentCount: { $sum: 1 }
            }
        },
        { $sort: { revenue: -1 } },
        {
            $lookup: {
                from: 'clinics',
                localField: '_id',
                foreignField: '_id',
                as: 'clinicData'
            }
        },
        { $unwind: '$clinicData' }
    ]);

    const topPerformingUnits = unitPerformance.slice(0, 5);
    const bottomPerformingUnits = unitPerformance.slice(-3);

    // === CRITICAL ALERTS ===
    const alerts = [];

    // Check subscription expiry
    const Organization = (await import('../models/Organization.js')).default;
    const org = await Organization.findById(req.user.organization);
    if (org) {
        const daysUntilExpiry = Math.ceil((org.subscription.expiryDate - now) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
            alerts.push({
                type: 'warning',
                severity: 'high',
                message: `Subscrição expira em ${daysUntilExpiry} dias`,
                action: 'Renovar subscrição',
                link: '/subscription'
            });
        } else if (daysUntilExpiry <= 0) {
            alerts.push({
                type: 'danger',
                severity: 'critical',
                message: 'Subscrição expirada',
                action: 'Renovar agora',
                link: '/subscription'
            });
        }
    }

    // Check no-show rate
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

    if (parseFloat(noShowRate) > 20) {
        alerts.push({
            type: 'warning',
            severity: 'medium',
            message: `Taxa de falta elevada: ${noShowRate}%`,
            action: 'Ver detalhes',
            link: '/reports'
        });
    }

    // Best performing clinic
    const bestPerformingClinic = unitPerformance[0] || null;

    // Top staff member
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
                        60000
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
                // Unit breakdown
                totalClinics,
                totalLaboratories,
                totalUnits: clinics.length,
                activeUnits,

                // Staff metrics
                totalStaff,
                totalDoctors,
                totalTechnicians,
                totalNurses,

                // Patient metrics
                totalPatients,
                newPatientsThisMonth,

                // Financial metrics
                totalRevenue: currentRevenue.total,
                paidRevenue: currentRevenue.paid,
                pendingRevenue: currentRevenue.total - currentRevenue.paid,

                // Appointment metrics
                appointmentsThisMonth,
                appointmentVolume: totalAppointments
            },
            growth: {
                revenueGrowth: parseFloat(revenueGrowth),
                appointmentGrowth: parseFloat(appointmentGrowth),
                patientGrowth: newPatientsLastMonth > 0
                    ? ((newPatientsThisMonth - newPatientsLastMonth) / newPatientsLastMonth * 100).toFixed(1)
                    : 0,
                unitsAdded: 0 // Would need to track creation dates
            },
            alerts,
            unitPerformance: {
                topPerforming: topPerformingUnits,
                bottomPerforming: bottomPerformingUnits,
                allUnits: unitPerformance
            },
            subscription: org ? {
                plan: org.subscription.plan,
                status: org.subscription.status,
                expiryDate: org.subscription.expiryDate,
                daysRemaining: Math.ceil((org.subscription.expiryDate - now) / (1000 * 60 * 60 * 24))
            } : null,
            bestPerformingClinic,
            topStaffMember: topStaff[0] || null,
            metrics: {
                avgDurationBySpecialty,
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

// @desc    Get Unit (Clinic/Lab) Specific Dashboard
// @route   GET /api/analytics/unit/:unitId
// @access  Private (Owner, Manager, Staff)
export const getUnitDashboard = asyncHandler(async (req, res) => {
    const { unitId } = req.params;

    // Verify access
    // For now assuming middleware checked org access or direct unit access

    // Avoid circular dependency issues by dynamic import
    const Clinic = (await import('../models/Clinic.js')).default;
    const Appointment = (await import('../models/Appointment.js')).default;
    const User = (await import('../models/User.js')).default;
    const Bill = (await import('../models/Bill.js')).default;

    const unit = await Clinic.findById(unitId);
    if (!unit) {
        res.status(404);
        throw new Error('Unit not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Common Stats
    const totalPatients = await Appointment.distinct('patient', { clinic: unitId }).then(p => p.length);
    const activeStaff = await User.countDocuments({ clinic: unitId, roleType: 'staff', isActive: true });

    // Unit Specific Stats
    let specificStats = {};

    if (unit.type === 'laboratory') {
        // LAB STATS
        const examsToday = await Appointment.countDocuments({
            clinic: unitId,
            dateTime: { $gte: today, $lt: tomorrow },
            // For now, treat all lab appointments as exams
        });

        const pendingResults = await Appointment.countDocuments({
            clinic: unitId,
            status: 'completed',
            // Mocking 'results.status' check by assuming generic 'completed' status isn't enough for lab
            // In real scenario, would check specific result status
        });

        const examsThisMonth = await Appointment.countDocuments({
            clinic: unitId,
            dateTime: { $gte: startOfMonth }
        });

        specificStats = {
            kpi: {
                examsToday,
                pendingResults,
                examsThisMonth,
                avgTurnaroundTime: '24h'
            }
        };

    } else {
        // CLINIC STATS
        const appointmentsToday = await Appointment.countDocuments({
            clinic: unitId,
            dateTime: { $gte: today, $lt: tomorrow }
        });

        const doctorsOnDuty = await User.countDocuments({
            clinic: unitId,
            roleType: 'staff',
            staffRole: 'Médico',
            isActive: true
        });

        const appointmentsThisMonth = await Appointment.countDocuments({
            clinic: unitId,
            dateTime: { $gte: startOfMonth }
        });

        specificStats = {
            kpi: {
                appointmentsToday,
                doctorsOnDuty,
                appointmentsThisMonth,
                avgWaitTime: '15m'
            }
        };
    }

    // Revenue (Common)
    const revenueData = await Bill.aggregate([
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
                'appointmentData.clinic': unit._id,
                createdAt: { $gte: startOfMonth }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$totalAmount' }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: {
            unit: {
                id: unit._id,
                name: unit.name,
                type: unit.type
            },
            common: {
                totalPatients,
                activeStaff,
                revenueThisMonth: revenueData[0]?.total || 0
            },
            ...specificStats
        }
    });
});
