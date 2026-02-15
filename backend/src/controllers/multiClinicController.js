import asyncHandler from 'express-async-handler';
import Clinic from '../models/Clinic.js';
import Appointment from '../models/Appointment.js';
import Revenue from '../models/Revenue.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';

// @desc    Get Consolidated Dashboard Stats (All Clinics)
// @route   GET /api/owner/multi-clinic/dashboard
// @access  Private/Owner
export const getConsolidatedStats = asyncHandler(async (req, res) => {
    // 1. Total Clinics
    const totalClinics = await Clinic.countDocuments({ status: 'active' });

    // 2. Financial Aggregation (Current Month)
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const revenueStats = await Revenue.aggregate([
        {
            $match: {
                date: { $gte: startOfMonth, $lte: endOfMonth }
            }
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        }
    ]);

    // 3. Appointments Aggregation (Today)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const appointmentStats = await Appointment.aggregate([
        {
            $match: {
                date: { $gte: startOfMonth, $lte: endOfMonth } // Month stats
            }
        },
        {
            $group: {
                _id: null,
                totalAppointments: { $sum: 1 },
                completed: {
                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                }
            }
        }
    ]);

    // Today's appointments across all clinics
    const todayAppointments = await Appointment.countDocuments({
        date: { $gte: startOfDay, $lte: endOfDay }
    });

    // 4. Total Patients
    const totalPatients = await Patient.countDocuments({});

    res.status(200).json({
        success: true,
        data: {
            totalClinics,
            financial: {
                totalRevenue: revenueStats[0]?.totalRevenue || 0,
                transactionCount: revenueStats[0]?.count || 0
            },
            operational: {
                totalAppointmentsMonth: appointmentStats[0]?.totalAppointments || 0,
                completionRate: appointmentStats[0]?.totalAppointments > 0
                    ? Math.round((appointmentStats[0].completed / appointmentStats[0].totalAppointments) * 100)
                    : 0,
                todayAppointments
            },
            patients: {
                totalActive: totalPatients
            }
        }
    });
});

// @desc    Get Clinic Comparison Data
// @route   GET /api/owner/multi-clinic/compare
// @access  Private/Owner
export const getClinicComparison = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    // Get all active clinics
    const clinics = await Clinic.find({ status: 'active' }).select('name _id');

    const comparisonData = [];

    for (const clinic of clinics) {
        // Revenue
        const rev = await Revenue.aggregate([
            {
                $match: {
                    clinic: clinic._id,
                    date: { $gte: start, $lte: end }
                }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Appointments
        const appt = await Appointment.aggregate([
            {
                $match: {
                    clinic: clinic._id,
                    date: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
                }
            }
        ]);

        // Staff Count
        const staffCount = await User.countDocuments({
            clinic: clinic._id,
            isActive: true,
            roleType: { $in: ['staff', 'manager'] }
        });

        const totalRevenue = rev[0]?.total || 0;
        const totalAppointments = appt[0]?.total || 0;
        const completedAppointments = appt[0]?.completed || 0;
        const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments * 100).toFixed(1) : 0;
        const revenuePerStaff = staffCount > 0 ? (totalRevenue / staffCount).toFixed(2) : 0;

        comparisonData.push({
            clinicId: clinic._id,
            clinicName: clinic.name,
            totalRevenue,
            paidRevenue: totalRevenue, // Mock paid distinction if Revenue model doesn't support status yet
            totalAppointments,
            completedAppointments,
            completionRate,
            staffCount,
            revenuePerStaff
        });
    }

    // Sort by Revenue Desc
    comparisonData.sort((a, b) => b.totalRevenue - a.totalRevenue);

    res.status(200).json({
        success: true,
        data: comparisonData
    });
});
