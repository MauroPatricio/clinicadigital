import Patient from '../models/Patient.js';
import User from '../models/User.js';
import PatientTimeline from '../models/PatientTimeline.js';
import PatientAlert from '../models/PatientAlert.js';
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

// @desc    Get patient timeline
// @route   GET /api/patients/:id/timeline
// @access  Private
export const getPatientTimeline = async (req, res, next) => {
    try {
        const { eventType, startDate, endDate } = req.query;
        const query = { patient: req.params.id };

        if (eventType) query.eventType = eventType;
        if (startDate || endDate) {
            query.eventDate = {};
            if (startDate) query.eventDate.$gte = new Date(startDate);
            if (endDate) query.eventDate.$lte = new Date(endDate);
        }

        const timeline = await PatientTimeline.find(query)
            .populate('relatedDoctor', 'profile')
            .populate('createdBy', 'profile')
            .sort({ eventDate: -1 });

        res.status(200).json({
            success: true,
            count: timeline.length,
            data: timeline
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add timeline event
// @route   POST /api/patients/:id/timeline
// @access  Private
export const addTimelineEvent = async (req, res, next) => {
    try {
        const { eventType, eventDate, title, description, attachments, relatedDoctor, metadata } = req.body;

        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return next(new AppError('Patient not found', 404));
        }

        const timelineEvent = await PatientTimeline.create({
            patient: req.params.id,
            clinic: req.user.currentClinic,
            eventType,
            eventDate,
            title,
            description,
            attachments: attachments || [],
            relatedDoctor,
            metadata: metadata || {},
            createdBy: req.user.id
        });

        await timelineEvent.populate('relatedDoctor createdBy', 'profile');

        logger.info(`Timeline event added for patient ${patient.patientNumber}`);

        res.status(201).json({
            success: true,
            data: timelineEvent
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get patient alerts
// @route   GET /api/patients/:id/alerts
// @access  Private
export const getPatientAlerts = async (req, res, next) => {
    try {
        const { status, priority } = req.query;
        const query = { patient: req.params.id };

        if (status) query.status = status;
        if (priority) query.priority = priority;

        const alerts = await PatientAlert.find(query)
            .populate('createdBy completedBy', 'profile')
            .sort({ dueDate: 1, priority: -1 });

        // Separate by status
        const activeAlerts = alerts.filter(a => a.status === 'pending' || a.status === 'overdue');
        const completedAlerts = alerts.filter(a => a.status === 'completed');
        const dismissedAlerts = alerts.filter(a => a.status === 'dismissed');

        res.status(200).json({
            success: true,
            data: {
                active: activeAlerts,
                completed: completedAlerts,
                dismissed: dismissedAlerts,
                total: alerts.length
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create patient alert
// @route   POST /api/patients/:id/alerts
// @access  Private
export const createPatientAlert = async (req, res, next) => {
    try {
        const { alertType, dueDate, title, description, priority } = req.body;

        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return next(new AppError('Patient not found', 404));
        }

        const alert = await PatientAlert.create({
            patient: req.params.id,
            clinic: req.user.currentClinic,
            alertType,
            dueDate,
            title,
            description,
            priority: priority || 'medium',
            createdBy: req.user.id
        });

        await alert.populate('createdBy', 'profile');

        logger.info(`Alert created for patient ${patient.patientNumber}: ${title}`);

        res.status(201).json({
            success: true,
            data: alert
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update alert status
// @route   PATCH /api/patients/:id/alerts/:alertId
// @access  Private
export const updateAlertStatus = async (req, res, next) => {
    try {
        const { status, notes } = req.body;

        const alert = await PatientAlert.findById(req.params.alertId);
        if (!alert) {
            return next(new AppError('Alert not found', 404));
        }

        if (alert.patient.toString() !== req.params.id) {
            return next(new AppError('Alert does not belong to this patient', 400));
        }

        alert.status = status;
        if (notes) alert.notes = notes;

        if (status === 'completed') {
            alert.completedDate = new Date();
            alert.completedBy = req.user.id;
        }

        await alert.save();
        await alert.populate('createdBy completedBy', 'profile');

        logger.info(`Alert ${alert._id} status updated to ${status}`);

        res.status(200).json({
            success: true,
            data: alert
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
    setRiskClassification,
    getPatientTimeline,
    addTimelineEvent,
    getPatientAlerts,
    createPatientAlert,
    updateAlertStatus
};
