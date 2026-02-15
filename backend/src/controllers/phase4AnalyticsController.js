import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import Bill from '../models/Bill.js';
import User from '../models/User.js';
import Clinic from '../models/Clinic.js';
import StaffPerformance from '../models/StaffPerformance.js';
import Revenue from '../models/Revenue.js';
import asyncHandler from 'express-async-handler';

// ==================== PHASE 4: ADVANCED ANALYTICS ====================

// @desc    Get Patient Flow Analytics
// @route   GET /api/owner/analytics/patient-flow
// @access  Private/Owner
export const getPatientFlow = asyncHandler(async (req, res) => {
    const { clinic } = req.query;
    const filters = clinic ? { clinic } : {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Real-time status distribution
    const statusDistribution = await Appointment.aggregate([
        {
            $match: {
                dateTime: { $gte: today, $lt: tomorrow },
                ...filters
            }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    // Average wait times (mock - in real system would calculate from timestamps)
    const avgWaitTime = {
        consultation: 15,
        exam: 20,
        procedure: 30
    };

    // Peak hours
    const peakHours = await Appointment.aggregate([
        {
            $match: {
                dateTime: { $gte: today, $lt: tomorrow },
                ...filters
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
        { $sort: { count: -1 } }
    ]);

    res.status(200).json({
        success: true,
        data: {
            statusDistribution,
            avgWaitTime,
            peakHours: peakHours.slice(0, 5),
            totalToday: statusDistribution.reduce((sum, s) => sum + s.count, 0)
        }
    });
});

// @desc    Get Doctor Productivity Metrics
// @route   GET /api/owner/analytics/doctor-productivity
// @access  Private/Owner
export const getDoctorProductivity = asyncHandler(async (req, res) => {
    const { startDate, endDate, clinic } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    const filters = clinic ? { clinic } : {};

    const productivity = await Appointment.aggregate([
        {
            $match: {
                dateTime: { $gte: start, $lte: end },
                status: { $in: ['completed', 'in-progress'] },
                ...filters
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
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'doctorInfo'
            }
        },
        { $unwind: '$doctorInfo' },
        {
            $lookup: {
                from: 'bills',
                localField: '_id',
                foreignField: 'doctor',
                as: 'bills'
            }
        },
        {
            $project: {
                doctorName: {
                    $concat: [
                        '$doctorInfo.profile.firstName',
                        ' ',
                        '$doctorInfo.profile.lastName'
                    ]
                },
                totalAppointments: 1,
                completedAppointments: 1,
                utilizationRate: {
                    $multiply: [
                        { $divide: ['$completedAppointments', '$totalAppointments'] },
                        100
                    ]
                },
                revenueGenerated: { $sum: '$bills.totalAmount' }
            }
        },
        { $sort: { totalAppointments: -1 } }
    ]);

    res.status(200).json({
        success: true,
        data: productivity
    });
});

// @desc    Get Retention & Return Rate
// @route   GET /api/owner/analytics/retention
// @access  Private/Owner
export const getRetentionMetrics = asyncHandler(async (req, res) => {
    const { startDate, endDate, clinic } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 3));
    const end = endDate ? new Date(endDate) : new Date();

    const filters = clinic ? { clinic } : {};

    // Get all patients who had appointments
    const patientAppointments = await Appointment.aggregate([
        {
            $match: {
                dateTime: { $gte: start, $lte: end },
                ...filters
            }
        },
        {
            $group: {
                _id: '$patient',
                appointmentCount: { $sum: 1 },
                firstVisit: { $min: '$dateTime' },
                lastVisit: { $max: '$dateTime' }
            }
        }
    ]);

    const totalPatients = patientAppointments.length;
    const returningPatients = patientAppointments.filter(p => p.appointmentCount > 1).length;
    const newPatients = patientAppointments.filter(p => p.appointmentCount === 1).length;

    const retentionRate = totalPatients > 0 ? ((returningPatients / totalPatients) * 100).toFixed(2) : 0;
    const churnRate = (100 - retentionRate).toFixed(2);
    const avgVisitsPerPatient = totalPatients > 0
        ? (patientAppointments.reduce((sum, p) => sum + p.appointmentCount, 0) / totalPatients).toFixed(2)
        : 0;

    res.status(200).json({
        success: true,
        data: {
            retentionRate: parseFloat(retentionRate),
            churnRate: parseFloat(churnRate),
            totalPatients,
            returningPatients,
            newPatients,
            avgVisitsPerPatient: parseFloat(avgVisitsPerPatient)
        }
    });
});

// @desc    Get Revenue by Specialty
// @route   GET /api/owner/analytics/revenue-by-specialty
// @access  Private/Owner
export const getRevenueBySpecialty = asyncHandler(async (req, res) => {
    const { startDate, endDate, clinic } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    const filters = clinic ? { clinic } : {};

    const revenueBySpecialty = await Appointment.aggregate([
        {
            $match: {
                dateTime: { $gte: start, $lte: end },
                ...filters
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
                appointmentCount: { $sum: 1 },
                paidRevenue: {
                    $sum: {
                        $cond: [
                            { $eq: ['$bill.paymentStatus', 'paid'] },
                            '$bill.totalAmount',
                            0
                        ]
                    }
                }
            }
        },
        {
            $project: {
                specialty: '$_id',
                revenue: 1,
                appointmentCount: 1,
                paidRevenue: 1,
                avgRevenuePerAppointment: {
                    $cond: [
                        { $gt: ['$appointmentCount', 0] },
                        { $divide: ['$revenue', '$appointmentCount'] },
                        0
                    ]
                }
            }
        },
        { $sort: { revenue: -1 } }
    ]);

    res.status(200).json({
        success: true,
        data: revenueBySpecialty
    });
});

// @desc    Get Growth Trends
// @route   GET /api/owner/analytics/growth-trends
// @access  Private/Owner
export const getGrowthTrends = asyncHandler(async (req, res) => {
    const { clinic } = req.query;
    const filters = clinic ? { clinic } : {};

    const now = new Date();
    const last6Months = new Date(now.setMonth(now.getMonth() - 6));

    // Monthly revenue trend
    const revenueTrend = await Revenue.aggregate([
        {
            $match: {
                date: { $gte: last6Months },
                ...filters
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$date' },
                    month: { $month: '$date' }
                },
                revenue: { $sum: '$amount' }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Calculate growth rates
    const growthRates = revenueTrend.map((item, index) => {
        if (index === 0) return { ...item, growthRate: 0 };
        const previousRevenue = revenueTrend[index - 1].revenue;
        const growthRate = previousRevenue > 0
            ? ((item.revenue - previousRevenue) / previousRevenue * 100).toFixed(2)
            : 0;
        return { ...item, growthRate: parseFloat(growthRate) };
    });

    // Patient volume trend
    const patientTrend = await Appointment.aggregate([
        {
            $match: {
                dateTime: { $gte: last6Months },
                ...filters
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$dateTime' },
                    month: { $month: '$dateTime' }
                },
                appointments: { $sum: 1 },
                uniquePatients: { $addToSet: '$patient' }
            }
        },
        {
            $project: {
                _id: 1,
                appointments: 1,
                uniquePatients: { $size: '$uniquePatients' }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
        success: true,
        data: {
            revenueTrend: growthRates,
            patientTrend
        }
    });
});

// @desc    Get Operational Efficiency Metrics
// @route   GET /api/owner/analytics/operational-efficiency
// @access  Private/Owner
export const getOperationalEfficiency = asyncHandler(async (req, res) => {
    const { clinic } = req.query;
    const filters = clinic ? { clinic } : {};

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    // Resource utilization
    const totalStaff = await User.countDocuments({
        roleType: 'staff',
        isActive: true,
        ...filters
    });

    const totalAppointments = await Appointment.countDocuments({
        dateTime: { $gte: startOfMonth },
        ...filters
    });

    const completedAppointments = await Appointment.countDocuments({
        dateTime: { $gte: startOfMonth },
        status: 'completed',
        ...filters
    });

    const completionRate = totalAppointments > 0
        ? ((completedAppointments / totalAppointments) * 100).toFixed(2)
        : 0;

    // Cost per patient (revenue / patient count as proxy)
    const totalRevenue = await Revenue.getTotalRevenue(
        startOfMonth,
        new Date(),
        filters
    );

    const uniquePatients = await Appointment.distinct('patient', {
        dateTime: { $gte: startOfMonth },
        ...filters
    });

    const costPerPatient = uniquePatients.length > 0
        ? (totalRevenue.total / uniquePatients.length).toFixed(2)
        : 0;

    res.status(200).json({
        success: true,
        data: {
            resourceUtilization: {
                totalStaff,
                appointmentsPerStaff: totalStaff > 0 ? (totalAppointments / totalStaff).toFixed(2) : 0
            },
            completionRate: parseFloat(completionRate),
            avgServiceTime: '25 min', // Mock - would calculate from actual timestamps
            costPerPatient: parseFloat(costPerPatient),
            efficiencyScore: parseFloat(completionRate) // Simplified
        }
    });
});

// @desc    Get Financial KPIs
// @route   GET /api/owner/analytics/financial-kpis
// @access  Private/Owner
export const getFinancialKPIs = asyncHandler(async (req, res) => {
    const { clinic } = req.query;
    const filters = clinic ? { clinic } : {};

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    // Revenue metrics
    const revenue = await Revenue.getTotalRevenue(startOfMonth, new Date(), filters);

    // Patient count
    const uniquePatients = await Appointment.distinct('patient', {
        dateTime: { $gte: startOfMonth },
        ...filters
    });

    const revenuePerPatient = uniquePatients.length > 0
        ? (revenue.total / uniquePatients.length).toFixed(2)
        : 0;

    // Average transaction value
    const avgTransactionValue = revenue.count > 0
        ? (revenue.total / revenue.count).toFixed(2)
        : 0;

    // Payment collection rate
    const bills = await Bill.aggregate([
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
                'appointmentData.dateTime': { $gte: startOfMonth },
                ...('clinic' in filters ? { 'appointmentData.clinic': filters.clinic } : {})
            }
        },
        {
            $group: {
                _id: null,
                totalBilled: { $sum: '$totalAmount' },
                totalPaid: {
                    $sum: {
                        $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0]
                    }
                }
            }
        }
    ]);

    const billData = bills[0] || { totalBilled: 0, totalPaid: 0 };
    const collectionRate = billData.totalBilled > 0
        ? ((billData.totalPaid / billData.totalBilled) * 100).toFixed(2)
        : 0;

    res.status(200).json({
        success: true,
        data: {
            revenuePerPatient: parseFloat(revenuePerPatient),
            avgTransactionValue: parseFloat(avgTransactionValue),
            collectionRate: parseFloat(collectionRate),
            outstandingReceivables: billData.totalBilled - billData.totalPaid,
            totalRevenue: revenue.total
        }
    });
});

// @desc    Get Predictive Analytics
// @route   GET /api/owner/analytics/predictions
// @access  Private/Owner
export const getPredictions = asyncHandler(async (req, res) => {
    const { clinic } = req.query;
    const filters = clinic ? { clinic } : {};

    // Get last 3 months average for predictions
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const historicalData = await Appointment.aggregate([
        {
            $match: {
                dateTime: { $gte: threeMonthsAgo },
                ...filters
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$dateTime' },
                    month: { $month: '$dateTime' }
                },
                appointments: { $sum: 1 }
            }
        }
    ]);

    const avgMonthlyAppointments = historicalData.length > 0
        ? historicalData.reduce((sum, m) => sum + m.appointments, 0) / historicalData.length
        : 0;

    // Simple prediction (in real system, would use ML)
    const predictedAppointments = Math.round(avgMonthlyAppointments * 1.1); // 10% growth assumption

    // Revenue forecast
    const historicalRevenue = await Revenue.aggregate([
        {
            $match: {
                date: { $gte: threeMonthsAgo },
                ...filters
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$date' },
                    month: { $month: '$date' }
                },
                revenue: { $sum: '$amount' }
            }
        }
    ]);

    const avgMonthlyRevenue = historicalRevenue.length > 0
        ? historicalRevenue.reduce((sum, m) => sum + m.revenue, 0) / historicalRevenue.length
        : 0;

    const predictedRevenue = Math.round(avgMonthlyRevenue * 1.15); // 15% growth assumption

    // Risk alerts
    const alerts = [];

    const noShowRate = await Appointment.aggregate([
        {
            $match: {
                dateTime: { $gte: threeMonthsAgo },
                ...filters
            }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    const total = noShowRate.reduce((sum, s) => sum + s.count, 0);
    const noShows = noShowRate.find(s => s._id === 'no-show')?.count || 0;
    const rate = total > 0 ? (noShows / total * 100).toFixed(2) : 0;

    if (parseFloat(rate) > 15) {
        alerts.push({
            type: 'high_no_show_rate',
            severity: 'medium',
            message: `Alta taxa de faltas: ${rate}%`,
            recommendation: 'Implementar sistema de lembretes automáticos'
        });
    }

    res.status(200).json({
        success: true,
        data: {
            predictions: {
                next30Days: {
                    expectedAppointments: predictedAppointments,
                    expectedRevenue: predictedRevenue
                },
                resourceNeeds: {
                    suggestedStaff: Math.ceil(predictedAppointments / 100), // 1 staff per 100 appointments
                    suggestedRooms: Math.ceil(predictedAppointments / 150)
                }
            },
            alerts
        }
    });
});
