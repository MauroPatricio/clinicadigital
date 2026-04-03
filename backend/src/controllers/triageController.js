import Triage from '../models/Triage.js';
import Appointment from '../models/Appointment.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

// @desc    Submit triage report
// @route   POST /api/triage
// @access  Private (Nurse, Doctor, Staff)
export const submitTriage = async (req, res, next) => {
    try {
        const {
            patient,
            appointment,
            symptoms,
            vitalSigns,
            urgencyLevel,
            colorCode,
            notes
        } = req.body;

        const triage = await Triage.create({
            patient,
            appointment,
            symptoms,
            vitalSigns,
            urgencyLevel,
            colorCode,
            notes,
            triagedBy: req.user._id,
            clinic: req.user.currentClinic
        });

        // If triage is linked to an appointment, update appointment priority
        if (appointment) {
            const mappedPriority = mapUrgencyToPriority(urgencyLevel);
            await Appointment.findByIdAndUpdate(appointment, {
                priority: mappedPriority
            });
        }

        logger.info(`Triage report submitted: ${triage.triageNumber}`);

        res.status(201).json({
            success: true,
            data: triage
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get triage reports with filtering
// @route   GET /api/triage
// @access  Private
export const getTriageReports = async (req, res, next) => {
    try {
        const { patient, appointment, urgencyLevel, colorCode } = req.query;
        let query = { clinic: req.user.currentClinic };

        if (patient) query.patient = patient;
        if (appointment) query.appointment = appointment;
        if (urgencyLevel) query.urgencyLevel = urgencyLevel;
        if (colorCode) query.colorCode = colorCode;

        const reports = await Triage.find(query)
            .populate('patient', 'patientNumber user')
            .populate('triagedBy', 'profile')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reports.length,
            data: reports
        });
    } catch (error) {
        next(error);
    }
};

// Helper to map clinical urgency to appointment priority
const mapUrgencyToPriority = (urgency) => {
    if (['emergency', 'immediate'].includes(urgency)) return 'emergency';
    if (urgency === 'urgent') return 'urgent';
    return 'normal';
};
