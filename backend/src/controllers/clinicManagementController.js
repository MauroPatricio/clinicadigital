import Clinic from '../models/Clinic.js';
import Organization from '../models/Organization.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// @desc    Create new clinic
// @route   POST /api/clinics
// @access  Private (Owner only)
export const createClinic = asyncHandler(async (req, res) => {
    const {
        name,
        address,
        coordinates,
        contact,
        operatingHours,
        specialties,
        facilities,
        branding,
        settings,
        managerId
    } = req.body;

    // Verify user is owner
    if (req.user.roleType !== 'owner') {
        res.status(403);
        throw new Error('Only organization owners can create clinics');
    }

    // Get or create organization
    let organization = await Organization.findById(req.user.organization);
    if (!organization && req.user.roleType === 'owner') {
        // Create a default organization for the owner if it doesn't exist
        organization = await Organization.create({
            name: `${name} Organization`,
            owner: req.user._id,
            subscription: {
                expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
                status: 'trial',
                plan: 'basic'
            }
        });

        // Update user reference
        const currentUser = await User.findById(req.user._id);
        currentUser.organization = organization._id;
        await currentUser.save();

        // Refresh req.user for consistency (though it's usually local to request)
        req.user.organization = organization._id;
    }

    if (!organization) {
        res.status(404);
        throw new Error('Organization not found');
    }

    // Auto-increase limit for existing trial organizations (Dev/Test Fix)
    if (organization.limits.maxClinics < 10) {
        organization.limits.maxClinics = 10;
        await organization.save();
    }

    // Check if within subscription limits
    if (organization.limits && !organization.canAddClinic()) {
        res.status(403);
        throw new Error(`Cannot create more clinics. Current plan limit: ${organization.limits.maxClinics}. Please upgrade your subscription.`);
    }

    // If manager specified, verify they exist and are available
    let manager = null;
    if (managerId) {
        manager = await User.findById(managerId);
        if (!manager) {
            res.status(404);
            throw new Error('Manager not found');
        }
        if (manager.roleType !== 'manager' && manager.roleType !== 'staff') {
            res.status(400);
            throw new Error('Selected user must be a manager or staff member');
        }
        if (manager.clinic) {
            res.status(400);
            throw new Error('Manager is already assigned to another clinic');
        }
    }

    try {
        // Create clinic
        const clinic = await Clinic.create({
            organization: organization._id,
            manager: managerId || null,
            name,
            address,
            coordinates,
            contact,
            operatingHours: operatingHours || [],
            specialties: specialties || [],
            facilities: facilities || [],
            branding: branding || {},
            settings: settings || {},
            status: 'active',
            isActive: true
        });

        // If manager assigned, update their clinic reference
        if (manager) {
            manager.clinic = clinic._id;
            if (manager.roleType === 'staff') {
                manager.roleType = 'manager';
            }
            await manager.save();
        }

        // Update organization stats
        organization.stats.totalClinics += 1;
        organization.stats.lastUpdated = new Date();
        await organization.save();

        res.status(201).json({
            success: true,
            data: clinic,
            message: 'Clinic created successfully'
        });
    } catch (error) {
        console.error('Error creating clinic:', error);
        console.error('Validation Errors:', JSON.stringify(error.errors || {}, null, 2));
        console.error('Request Body:', JSON.stringify(req.body, null, 2));

        res.status(400);
        throw error;
    }
});

// @desc    Get all clinics for organization
// @route   GET /api/clinics
// @access  Private (Owner, Manager, Staff)
export const getClinics = asyncHandler(async (req, res) => {
    let query = {};

    if (req.user.roleType === 'owner') {
        // Owners see all clinics in their organization
        query.organization = req.user.organization;
    } else if (req.user.roleType === 'manager' || req.user.roleType === 'staff') {
        // Managers and staff see only their assigned clinic
        query._id = req.user.clinic;
    } else {
        res.status(403);
        throw new Error('Access denied');
    }

    const clinics = await Clinic.find(query)
        .populate('manager', 'profile.firstName profile.lastName email')
        .populate('organization', 'name code');

    res.status(200).json({
        success: true,
        count: clinics.length,
        data: clinics
    });
});

// @desc    Get single clinic
// @route   GET /api/clinics/:id
// @access  Private
export const getClinic = asyncHandler(async (req, res) => {
    const clinic = await Clinic.findById(req.params.id)
        .populate('manager', 'profile.firstName profile.lastName email staffRole')
        .populate('organization', 'name code subscription');

    if (!clinic) {
        res.status(404);
        throw new Error('Clinic not found');
    }

    // Verify access
    if (req.user.roleType === 'owner') {
        // Owner can access any clinic in their organization
        if (clinic.organization._id.toString() !== req.user.organization.toString()) {
            res.status(403);
            throw new Error('Access denied to this clinic');
        }
    } else if (req.user.roleType === 'manager' || req.user.roleType === 'staff') {
        // Manager/Staff can only access their assigned clinic
        if (clinic._id.toString() !== req.user.clinic.toString()) {
            res.status(403);
            throw new Error('Access denied to this clinic');
        }
    }

    // Get additional stats
    const Appointment = (await import('../models/Appointment.js')).default;
    const staff = await User.countDocuments({ clinic: clinic._id, roleType: 'staff' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await Appointment.countDocuments({
        clinic: clinic._id,
        dateTime: { $gte: today, $lt: tomorrow }
    });

    res.status(200).json({
        success: true,
        data: {
            ...clinic.toObject(),
            stats: {
                totalStaff: staff,
                todayAppointments
            }
        }
    });
});

// @desc    Update clinic
// @route   PUT /api/clinics/:id
// @access  Private (Owner or Manager)
export const updateClinic = asyncHandler(async (req, res) => {
    const clinic = await Clinic.findById(req.params.id);

    if (!clinic) {
        res.status(404);
        throw new Error('Clinic not found');
    }

    // Verify access
    if (req.user.roleType === 'owner') {
        if (clinic.organization.toString() !== req.user.organization.toString()) {
            res.status(403);
            throw new Error('Access denied');
        }
    } else if (req.user.roleType === 'manager') {
        if (clinic._id.toString() !== req.user.clinic.toString()) {
            res.status(403);
            throw new Error('Access denied');
        }
    } else {
        res.status(403);
        throw new Error('Only owners and managers can update clinics');
    }

    // Fields that can be updated
    const allowedUpdates = [
        'name',
        'address',
        'coordinates',
        'contact',
        'operatingHours',
        'specialties',
        'facilities',
        'branding',
        'settings',
        'status',
        'isActive'
    ];

    // Owners can also update manager
    if (req.user.roleType === 'owner' && req.body.managerId) {
        const newManager = await User.findById(req.body.managerId);
        if (!newManager) {
            res.status(404);
            throw new Error('Manager not found');
        }

        // Remove old manager assignment
        if (clinic.manager) {
            const oldManager = await User.findById(clinic.manager);
            if (oldManager) {
                oldManager.clinic = null;
                await oldManager.save();
            }
        }

        // Assign new manager
        newManager.clinic = clinic._id;
        if (newManager.roleType === 'staff') {
            newManager.roleType = 'manager';
        }
        await newManager.save();
        clinic.manager = newManager._id;
    }

    // Update other fields
    allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
            clinic[field] = req.body[field];
        }
    });

    await clinic.save();

    res.status(200).json({
        success: true,
        data: clinic,
        message: 'Clinic updated successfully'
    });
});

// @desc    Delete/Deactivate clinic
// @route   DELETE /api/clinics/:id
// @access  Private (Owner only)
export const deleteClinic = asyncHandler(async (req, res) => {
    const clinic = await Clinic.findById(req.params.id);

    if (!clinic) {
        res.status(404);
        throw new Error('Clinic not found');
    }

    // Only owners can delete clinics
    if (req.user.roleType !== 'owner') {
        res.status(403);
        throw new Error('Only organization owners can delete clinics');
    }

    // Verify ownership
    if (clinic.organization.toString() !== req.user.organization.toString()) {
        res.status(403);
        throw new Error('Access denied');
    }

    // Soft delete - deactivate instead of removing
    clinic.status = 'inactive';
    clinic.isActive = false;
    await clinic.save();

    // Unassign manager and staff
    await User.updateMany(
        { clinic: clinic._id },
        { $unset: { clinic: 1 } }
    );

    // Update organization stats
    const organization = await Organization.findById(clinic.organization);
    if (organization) {
        organization.stats.totalClinics = await Clinic.countDocuments({
            organization: organization._id,
            isActive: true
        });
        organization.stats.lastUpdated = new Date();
        await organization.save();
    }

    res.status(200).json({
        success: true,
        data: {},
        message: 'Clinic deactivated successfully'
    });
});

// @desc    Compare clinics performance
// @route   GET /api/clinics/compare
// @access  Private (Owner only)
export const compareClinics = asyncHandler(async (req, res) => {
    if (req.user.roleType !== 'owner') {
        res.status(403);
        throw new Error('Only owners can compare clinics');
    }

    const clinics = await Clinic.find({
        organization: req.user.organization,
        isActive: true
    });

    const Appointment = (await import('../models/Appointment.js')).default;
    const Bill = (await import('../models/Bill.js')).default;

    // Get date range from query or default to this month
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    const comparison = await Promise.all(
        clinics.map(async (clinic) => {
            // Appointments
            const appointments = await Appointment.countDocuments({
                clinic: clinic._id,
                dateTime: { $gte: startDate, $lte: endDate }
            });

            const completedAppointments = await Appointment.countDocuments({
                clinic: clinic._id,
                status: 'completed',
                dateTime: { $gte: startDate, $lte: endDate }
            });

            // Revenue
            const revenueData = await Bill.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate, $lte: endDate }
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

            const revenue = revenueData[0] || { total: 0, paid: 0 };

            // Staff count
            const staff = await User.countDocuments({
                clinic: clinic._id,
                roleType: 'staff'
            });

            return {
                clinicId: clinic._id,
                clinicName: clinic.name,
                totalAppointments: appointments,
                completedAppointments,
                completionRate: appointments > 0 ? ((completedAppointments / appointments) * 100).toFixed(2) : 0,
                totalRevenue: revenue.total,
                paidRevenue: revenue.paid,
                staffCount: staff,
                revenuePerStaff: staff > 0 ? (revenue.total / staff).toFixed(2) : 0
            };
        })
    );

    // Sort by revenue
    comparison.sort((a, b) => b.totalRevenue - a.totalRevenue);

    res.status(200).json({
        success: true,
        period: {
            startDate,
            endDate
        },
        data: comparison
    });
});
