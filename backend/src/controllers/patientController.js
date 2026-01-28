import Patient from '../models/Patient.js';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private (Admin, Doctor, Nurse)
export const getPatients = async (req, res, next) => {
    try {
        const { search, riskLevel } = req.query;
        let query = {};

        if (riskLevel) {
            query.riskClassification = riskLevel;
        }

        let patients = await Patient.find(query)
            .populate('user', 'profile email phone isActive')
            .populate('nextAppointment')
            .sort({ createdAt: -1 });

        // Search filter
        if (search) {
            patients = patients.filter(p =>
                p.patientNumber.includes(search) ||
                p.user.profile.firstName.toLowerCase().includes(search.toLowerCase()) ||
                p.user.profile.lastName.toLowerCase().includes(search.toLowerCase()) ||
                p.user.email.toLowerCase().includes(search.toLowerCase())
            );
        }

        res.status(200).json({
            success: true,
            count: patients.length,
            data: patients
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private (Admin, Doctor, Nurse, Receptionist)
export const createPatient = async (req, res, next) => {
    try {
        const {
            firstName, lastName, email, phone, password,
            dateOfBirth, gender, address,
            bloodType, insurance
        } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return next(new AppError('Email already registered', 400));
        }

        const user = await User.create({
            email,
            password,
            role: 'patient',
            profile: {
                firstName,
                lastName,
                phone,
                dateOfBirth,
                gender,
                address
            }
        });

        const patient = await Patient.create({
            user: user._id,
            bloodType,
            insurance: insurance || {}
        });

        res.status(201).json({
            success: true,
            data: patient
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
export const getPatient = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.id)
            .populate('user', 'profile email phone isActive lastLogin')
            .populate('nextAppointment');

        if (!patient) {
            return next(new AppError('Patient not found', 404));
        }

        res.status(200).json({
            success: true,
            data: patient
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
export const updatePatient = async (req, res, next) => {
    try {
        const { medicalHistory, bloodType, emergencyContact, insurance, riskClassification } = req.body;

        let patient = await Patient.findById(req.params.id);

        if (!patient) {
            return next(new AppError('Patient not found', 404));
        }

        // Update fields
        if (medicalHistory) patient.medicalHistory = medicalHistory;
        if (bloodType) patient.bloodType = bloodType;
        if (emergencyContact) patient.emergencyContact = emergencyContact;
        if (insurance) patient.insurance = insurance;
        if (riskClassification) patient.riskClassification = riskClassification;

        await patient.save();

        await patient.populate('user nextAppointment');

        logger.info(`Patient updated: ${patient.patientNumber}`);

        res.status(200).json({
            success: true,
            data: patient
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Set patient risk classification (triage)
// @route   POST /api/patients/:id/triage
// @access  Private (Doctor, Nurse)
export const setRiskClassification = async (req, res, next) => {
    try {
        const { riskLevel } = req.body;

        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            return next(new AppError('Patient not found', 404));
        }

        patient.riskClassification = riskLevel;
        await patient.save();

        logger.info(`Risk classification updated for patient ${patient.patientNumber}: ${riskLevel}`);

        res.status(200).json({
            success: true,
            data: patient
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getPatients,
    getPatient,
    createPatient,
    updatePatient,
    setRiskClassification
};
