import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
    try {
        const { email, password, role, profile, specialization, licenseNumber } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new AppError('Email already registered', 400));
        }

        // Create user
        const user = await User.create({
            email,
            password,
            role: role || 'patient',
            profile
        });

        // Create role-specific profile
        if (user.role === 'patient') {
            await Patient.create({ user: user._id });
        } else if (user.role === 'doctor') {
            if (!specialization || !licenseNumber) {
                return next(new AppError('Doctors must provide specialization and license number', 400));
            }
            await Doctor.create({
                user: user._id,
                specialization,
                licenseNumber
            });
        }

        // Generate tokens
        const accessToken = user.getSignedJwtToken();
        const refreshToken = user.getRefreshToken();

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save();

        logger.info(`New user registered: ${user.email} (${user.role})`);

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    profile: user.profile
                },
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return next(new AppError('Please provide email and password', 400));
        }

        // Check for user (include password)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return next(new AppError('Invalid credentials', 401));
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return next(new AppError('Invalid credentials', 401));
        }

        // Check if user is active
        if (!user.isActive) {
            return next(new AppError('Account is deactivated', 403));
        }

        // Generate tokens
        const accessToken = user.getSignedJwtToken();
        const refreshToken = user.getRefreshToken();

        // Save refresh token and update last login
        user.refreshToken = refreshToken;
        user.lastLogin = Date.now();
        await user.save({ validateBeforeSave: false });

        logger.info(`User logged in: ${user.email}`);

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    profile: user.profile
                },
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return next(new AppError('Please provide refresh token', 400));
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Find user
        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== refreshToken) {
            return next(new AppError('Invalid refresh token', 401));
        }

        // Generate new access token
        const accessToken = user.getSignedJwtToken();

        res.status(200).json({
            success: true,
            data: {
                accessToken
            }
        });
    } catch (error) {
        next(new AppError('Invalid refresh token', 401));
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
    try {
        // Clear refresh token
        req.user.refreshToken = undefined;
        await req.user.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
    try {
        let user = await User.findById(req.user._id);

        // Get role-specific data
        let roleData = null;
        if (user.role === 'patient') {
            roleData = await Patient.findOne({ user: user._id });
        } else if (user.role === 'doctor') {
            roleData = await Doctor.findOne({ user: user._id });
        }

        res.status(200).json({
            success: true,
            data: {
                user,
                roleData
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Setup biometric authentication
// @route   POST /api/auth/biometric-setup
// @access  Private
export const setupBiometric = async (req, res, next) => {
    try {
        const { enabled } = req.body;

        req.user.biometricEnabled = enabled;
        await req.user.save({ validateBeforeSave: false });

        logger.info(`Biometric ${enabled ? 'enabled' : 'disabled'} for user: ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: `Biometric authentication ${enabled ? 'enabled' : 'disabled'}`
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Register FCM token for push notifications
// @route   POST /api/auth/register-device
// @access  Private
export const registerDevice = async (req, res, next) => {
    try {
        const { fcmToken } = req.body;

        if (!fcmToken) {
            return next(new AppError('Please provide FCM token', 400));
        }

        // Add token if not already present
        if (!req.user.fcmTokens.includes(fcmToken)) {
            req.user.fcmTokens.push(fcmToken);
            await req.user.save({ validateBeforeSave: false });
        }

        res.status(200).json({
            success: true,
            message: 'Device registered successfully'
        });
    } catch (error) {
        next(error);
    }
};
