import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import bcrypt from 'bcryptjs';

//  @desc    Get all users (Owner only)
// @route   GET /api/users
// @access  Private/Owner
export const getAllUsers = async (req, res, next) => {
    try {
        const {
            role,
            status,
            clinic,
            search,
            page = 1,
            limit = 20
        } = req.query;

        const query = {};

        if (role) query.role = role;
        if (status === 'active') query.isActive = true;
        if (status === 'inactive') query.isActive = false;
        if (clinic) query.clinic = clinic;

        // Search by name or email
        if (search) {
            query.$or = [
                { 'profile.firstName': { $regex: search, $options: 'i' } },
                { 'profile.lastName': { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .populate('clinic', 'name type')
            .select('-password')
            .sort('-createdAt')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Owner
export const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('clinic', 'name type address phone')
            .select('-password');

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private/Owner
export const createUser = async (req, res, next) => {
    try {
        const {
            email,
            password,
            role,
            clinic,
            profile,
            staffRole,
            specialization,
            licenseNumber
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new AppError('User with this email already exists', 400));
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await User.create({
            email,
            password: hashedPassword,
            role,
            clinic,
            profile,
            staffRole,
            specialization,
            licenseNumber,
            isActive: true
        });

        // Remove password from response
        user.password = undefined;

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user
// @route   PATCH /api/users/:id
// @access  Private/Owner
export const updateUser = async (req, res, next) => {
    try {
        const {
            profile,
            role,
            clinic,
            staffRole,
            specialization,
            licenseNumber
        } = req.body;

        const updateData = {};

        if (profile) updateData.profile = profile;
        if (role) updateData.role = role;
        if (clinic) updateData.clinic = clinic;
        if (staffRole) updateData.staffRole = staffRole;
        if (specialization) updateData.specialization = specialization;
        if (licenseNumber) updateData.licenseNumber = licenseNumber;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).select('-password');

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user (soft delete)
// @route   DELETE /api/users/:id
// @access  Private/Owner
export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        ).select('-password');

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'User deactivated successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user status (activate/deactivate)
// @route   PATCH /api/users/:id/status
// @access  Private/Owner
export const updateUserStatus = async (req, res, next) => {
    try {
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return next(new AppError('isActive must be a boolean', 400));
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true }
        ).select('-password');

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        res.status(200).json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reset user password
// @route   PATCH /api/users/:id/password
// @access  Private/Owner
export const resetUserPassword = async (req, res, next) => {
    try {
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return next(new AppError('Password must be at least 6 characters', 400));
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { password: hashedPassword },
            { new: true }
        ).select('-password');

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Password reset successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private/Owner
export const getUserStats = async (req, res, next) => {
    try {
        // Total users by role
        const usersByRole = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 },
                    active: {
                        $sum: { $cond: ['$isActive', 1, 0] }
                    }
                }
            }
        ]);

        // Total users
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });

        // Users by clinic
        const usersByClinic = await User.aggregate([
            { $match: { clinic: { $exists: true, $ne: null } } },
            {
                $group: {
                    _id: '$clinic',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'clinics',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'clinicDetails'
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                total: totalUsers,
                active: activeUsers,
                inactive: totalUsers - activeUsers,
                byRole: usersByRole,
                byClinic: usersByClinic
            }
        });
    } catch (error) {
        next(error);
    }
};
