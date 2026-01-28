import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
export const getDoctors = async (req, res, next) => {
    try {
        const { specialization, isAccepting } = req.query;
        let query = {};

        if (specialization) {
            query.specialization = specialization;
        }

        if (isAccepting !== undefined) {
            query.isAcceptingPatients = isAccepting === 'true';
        }

        const doctors = await Doctor.find(query)
            .populate('user', 'profile email isActive')
            .sort({ 'rating.average': -1 });

        res.status(200).json({
            success: true,
            count: doctors.length,
            data: doctors
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new doctor
// @route   POST /api/doctors
// @access  Private (Admin)
export const createDoctor = async (req, res, next) => {
    try {
        const { firstName, lastName, email, phone, password, specialization, licenseNumber } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return next(new AppError('Email already registered', 400));
        }

        // Create User
        const user = await User.create({
            email,
            password,
            role: 'doctor',
            profile: {
                firstName,
                lastName,
                phone
            }
        });

        // Create Doctor Profile
        const doctor = await Doctor.create({
            user: user._id,
            specialization,
            licenseNumber,
            availability: [] // Initialize empty
        });

        res.status(201).json({
            success: true,
            data: doctor
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
export const getDoctor = async (req, res, next) => {
    try {
        const doctor = await Doctor.findById(req.params.id)
            .populate('user', 'profile email isActive');

        if (!doctor) {
            return next(new AppError('Doctor not found', 404));
        }

        res.status(200).json({
            success: true,
            data: doctor
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/:id
// @access  Private (Doctor - own profile, Admin)
export const updateDoctor = async (req, res, next) => {
    try {
        let doctor = await Doctor.findById(req.params.id);

        if (!doctor) {
            return next(new AppError('Doctor not found', 404));
        }

        // Authorization check
        if (req.user.role === 'doctor') {
            const userDoctor = await Doctor.findOne({ user: req.user._id });
            if (doctor._id.toString() !== userDoctor._id.toString()) {
                return next(new AppError('Not authorized', 403));
            }
        }

        doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('user');

        res.status(200).json({
            success: true,
            data: doctor
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get doctor statistics
// @route   GET /api/doctors/:id/stats
// @access  Private (Doctor - own stats, Admin)
export const getDoctorStats = async (req, res, next) => {
    try {
        const doctor = await Doctor.findById(req.params.id);

        if (!doctor) {
            return next(new AppError('Doctor not found', 404));
        }

        res.status(200).json({
            success: true,
            data: {
                totalConsultations: doctor.stats.totalConsultations,
                totalPatients: doctor.stats.totalPatients,
                completionRate: doctor.stats.completionRate,
                rating: doctor.rating
            }
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getDoctors,
    getDoctor,
    createDoctor,
    updateDoctor,
    getDoctorStats
};
