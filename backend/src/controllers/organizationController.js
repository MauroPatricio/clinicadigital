import Organization from '../models/Organization.js';
import Subscription from '../models/Subscription.js';
import Clinic from '../models/Clinic.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// @desc    Create new organization (Owner registration)
// @route   POST /api/organizations
// @access  Public
export const createOrganization = asyncHandler(async (req, res) => {
    const {
        name,
        ownerEmail,
        ownerPassword,
        ownerFirstName,
        ownerLastName,
        ownerPhone,
        contact,
        businessInfo,
        plan = 'basic'
    } = req.body;

    // Check if owner email already exists
    const existingUser = await User.findOne({ email: ownerEmail.toLowerCase() });
    if (existingUser) {
        res.status(400);
        throw new Error('Email already registered');
    }

    // Create owner user account
    const owner = await User.create({
        email: ownerEmail.toLowerCase(),
        password: ownerPassword,
        roleType: 'owner',
        profile: {
            firstName: ownerFirstName,
            lastName: ownerLastName,
            phone: ownerPhone
        },
        permissions: [
            'manage_clinics',
            'manage_staff',
            'manage_patients',
            'manage_appointments',
            'view_analytics',
            'manage_billing',
            'manage_medical_records',
            'manage_prescriptions',
            'manage_lab_orders',
            'view_reports',
            'manage_rooms',
            'internal_chat',
            'manage_subscriptions'
        ]
    });

    // Create organization
    const organization = await Organization.create({
        name,
        owner: owner._id,
        contact,
        businessInfo
    });

    // Update owner with organization reference
    owner.organization = organization._id;
    await owner.save();

    // Set subscription limits based on plan
    const limits = getPlanLimits(plan);
    organization.limits = limits;
    await organization.save();

    // Create initial subscription
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30-day trial

    await Subscription.create({
        organization: organization._id,
        plan,
        status: 'trial',
        basePrice: getPlanPrice(plan),
        expiryDate,
        limits: limits.maxClinics ? {
            maxClinics: limits.maxClinics,
            maxStaff: limits.maxStaff,
            maxAppointmentsPerMonth: limits.maxAppointmentsPerMonth
        } : undefined,
        features: limits.features,
        trial: {
            isActive: true,
            startDate: new Date(),
            endDate: expiryDate,
            daysRemaining: 30
        }
    });

    res.status(201).json({
        success: true,
        data: {
            organization: {
                id: organization._id,
                name: organization.name,
                code: organization.code,
                subscription: organization.subscription
            },
            owner: {
                id: owner._id,
                email: owner.email,
                name: owner.fullName,
                token: owner.getSignedJwtToken()
            }
        },
        message: 'Organization created successfully with 30-day trial'
    });
});

// @desc    Get organization details
// @route   GET /api/organizations/:id
// @access  Private (Owner only)
export const getOrganization = asyncHandler(async (req, res) => {
    const organization = await Organization.findById(req.params.id)
        .populate('owner', 'email profile');

    if (!organization) {
        res.status(404);
        throw new Error('Organization not found');
    }

    // Verify ownership
    if (req.user.roleType !== 'owner' || organization.owner._id.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Access denied');
    }

    // Get clinics count
    const clinicsCount = await Clinic.countDocuments({ organization: organization._id });
    organization.stats.totalClinics = clinicsCount;

    // Get active subscription
    const subscription = await Subscription.findOne({
        organization: organization._id,
        status: { $in: ['active', 'trial'] }
    }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        data: {
            organization,
            subscription
        }
    });
});

// @desc    Update organization details
// @route   PUT /api/organizations/:id
// @access  Private (Owner only)
export const updateOrganization = asyncHandler(async (req, res) => {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
        res.status(404);
        throw new Error('Organization not found');
    }

    // Verify ownership
    if (req.user.roleType !== 'owner' || organization.owner.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Access denied');
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'contact', 'businessInfo', 'branding'];
    const updates = {};

    allowedUpdates.forEach(field => {
        if (req.body[field]) {
            updates[field] = req.body[field];
        }
    });

    const updatedOrganization = await Organization.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        data: updatedOrganization,
        message: 'Organization updated successfully'
    });
});

// @desc    Get organization statistics
// @route   GET /api/organizations/:id/stats
// @access  Private (Owner only)
export const getOrganizationStats = asyncHandler(async (req, res) => {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
        res.status(404);
        throw new Error('Organization not found');
    }

    // Verify ownership
    if (req.user.roleType !== 'owner' || organization.owner.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Access denied');
    }

    // Get clinics
    const clinics = await Clinic.find({ organization: organization._id });
    const clinicIds = clinics.map(c => c._id);

    // Import models
    const Appointment = (await import('../models/Appointment.js')).default;
    const Patient = (await import('../models/Patient.js')).default;
    const Bill = (await import('../models/Bill.js')).default;

    // Get total staff across all clinics
    const totalStaff = await User.countDocuments({
        clinic: { $in: clinicIds },
        roleType: 'staff'
    });

    // Get total patients
    const totalPatients = await Patient.countDocuments({
        'clinics.clinic': { $in: clinicIds }
    });

    // Get this month's appointments
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const appointmentsThisMonth = await Appointment.countDocuments({
        clinic: { $in: clinicIds },
        createdAt: { $gte: startOfMonth }
    });

    // Get total revenue this month
    const revenueResult = await Bill.aggregate([
        {
            $match: {
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

    const revenue = revenueResult[0] || { total: 0, paid: 0 };

    // Update organization stats cache
    organization.stats = {
        totalClinics: clinics.length,
        totalStaff,
        totalPatients,
        lastUpdated: new Date()
    };
    await organization.save();

    res.status(200).json({
        success: true,
        data: {
            totalClinics: clinics.length,
            totalStaff,
            totalPatients,
            appointmentsThisMonth,
            revenueThisMonth: revenue.total,
            paidRevenueThisMonth: revenue.paid,
            clinics: clinics.map(c => ({
                id: c._id,
                name: c.name,
                status: c.status,
                isActive: c.isActive
            }))
        }
    });
});

// Helper function to get plan limits
function getPlanLimits(plan) {
    const plans = {
        basic: {
            maxClinics: 1,
            maxStaff: 5,
            maxAppointmentsPerMonth: 100,
            features: {
                analytics: false,
                internalChat: false,
                telemedicine: false,
                multiClinic: false
            }
        },
        pro: {
            maxClinics: 5,
            maxStaff: 50,
            maxAppointmentsPerMonth: 1000,
            features: {
                analytics: true,
                internalChat: true,
                telemedicine: true,
                multiClinic: true
            }
        },
        enterprise: {
            maxClinics: 999,
            maxStaff: 9999,
            maxAppointmentsPerMonth: 99999,
            features: {
                analytics: true,
                internalChat: true,
                telemedicine: true,
                multiClinic: true
            }
        }
    };

    return plans[plan] || plans.basic;
}

// Helper function to get plan price
function getPlanPrice(plan) {
    const prices = {
        basic: 8000, // MZN
        pro: 25000,
        enterprise: 75000
    };

    return prices[plan] || prices.basic;
}
