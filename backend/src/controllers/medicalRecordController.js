import MedicalRecord from '../models/MedicalRecord.js';
import Prescription from '../models/Prescription.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

// @desc    Get all medical records
// @route   GET /api/medical-records
// @access  Private
export const getMedicalRecords = async (req, res, next) => {
    try {
        const { patientId } = req.query;
        let query = {};

        // Role-based filtering
        if (req.user.role === 'patient') {
            const patient = await Patient.findOne({ user: req.user._id });
            query.patient = patient._id;
        } else if (req.user.role === 'doctor') {
            const doctor = await Doctor.findOne({ user: req.user._id });
            if (patientId) {
                query.patient = patientId;
            } else {
                query.doctor = doctor._id;
            }
        } else if (patientId) {
            query.patient = patientId;
        }

        const records = await MedicalRecord.find(query)
            .populate('patient', 'patientNumber user')
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'profile' }
            })
            .populate('doctor', 'user specialization')
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'profile' }
            })
            .populate('appointment')
            .populate('prescriptions')
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: records.length,
            data: records
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single medical record
// @route   GET /api/medical-records/:id
// @access  Private
export const getMedicalRecord = async (req, res, next) => {
    try {
        const record = await MedicalRecord.findById(req.params.id)
            .populate('patient', 'patientNumber user medicalHistory bloodType')
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'profile' }
            })
            .populate('doctor', 'user specialization licenseNumber')
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'profile' }
            })
            .populate('appointment')
            .populate('prescriptions')
            .populate('labOrders')
            .select('+notes'); // Include private notes for authorized users

        if (!record) {
            return next(new AppError('Medical record not found', 404));
        }

        // Authorization check
        if (req.user.role === 'patient') {
            const patient = await Patient.findOne({ user: req.user._id });
            if (record.patient._id.toString() !== patient._id.toString()) {
                return next(new AppError('Not authorized to access this record', 403));
            }
        }

        res.status(200).json({
            success: true,
            data: record
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create medical record
// @route   POST /api/medical-records
// @access  Private (Doctor only)
export const createMedicalRecord = async (req, res, next) => {
    try {
        const {
            patientId,
            appointmentId,
            chiefComplaint,
            presentIllnessHistory,
            vitalSigns,
            physicalExamination,
            diagnosis,
            treatment,
            notes,
            followUp
        } = req.body;

        // Get doctor profile
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor) {
            return next(new AppError('Doctor profile not found', 404));
        }

        // Verify patient exists
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return next(new AppError('Patient not found', 404));
        }

        // Verify appointment if provided
        if (appointmentId) {
            const appointment = await Appointment.findById(appointmentId);
            if (!appointment) {
                return next(new AppError('Appointment not found', 404));
            }

            // Update appointment status to completed
            appointment.status = 'completed';
            appointment.completedAt = Date.now();
            await appointment.save();
        }

        // Create medical record
        const record = await MedicalRecord.create({
            patient: patientId,
            doctor: doctor._id,
            appointment: appointmentId,
            chiefComplaint,
            presentIllnessHistory,
            vitalSigns,
            physicalExamination,
            diagnosis,
            treatment,
            notes,
            followUp
        });

        // Update doctor stats
        doctor.stats.totalConsultations += 1;
        await doctor.save();

        // Populate before sending
        await record.populate(['patient', 'doctor', 'appointment']);

        logger.info(`Medical record created: ${record.recordNumber}`);

        res.status(201).json({
            success: true,
            data: record
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update medical record
// @route   PUT /api/medical-records/:id
// @access  Private (Doctor only - own records)
export const updateMedicalRecord = async (req, res, next) => {
    try {
        let record = await MedicalRecord.findById(req.params.id);

        if (!record) {
            return next(new AppError('Medical record not found', 404));
        }

        // Check ownership
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (record.doctor.toString() !== doctor._id.toString()) {
            return next(new AppError('Not authorized to update this record', 403));
        }

        record = await MedicalRecord.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate(['patient', 'doctor', 'appointment', 'prescriptions']);

        res.status(200).json({
            success: true,
            data: record
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add attachment to medical record
// @route   POST /api/medical-records/:id/attachments
// @access  Private (Doctor)
export const addAttachment = async (req, res, next) => {
    try {
        const { type, url, filename, description } = req.body;

        const record = await MedicalRecord.findById(req.params.id);

        if (!record) {
            return next(new AppError('Medical record not found', 404));
        }

        record.attachments.push({
            type,
            url,
            filename,
            description,
            uploadedAt: Date.now()
        });

        await record.save();

        res.status(200).json({
            success: true,
            data: record
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get patient medical history
// @route   GET /api/medical-records/patient/:patientId/history
// @access  Private (Doctor, Admin)
export const getPatientHistory = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.patientId)
            .populate('user', 'profile');

        if (!patient) {
            return next(new AppError('Patient not found', 404));
        }

        const records = await MedicalRecord.find({ patient: patient._id })
            .populate('doctor', 'user specialization')
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'profile' }
            })
            .populate('prescriptions')
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            data: {
                patient,
                medicalHistory: patient.medicalHistory,
                records,
                totalConsultations: records.length
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete medical record
// @route   DELETE /api/medical-records/:id
// @access  Private (Admin only)
export const deleteMedicalRecord = async (req, res, next) => {
    try {
        const record = await MedicalRecord.findById(req.params.id);

        if (!record) {
            return next(new AppError('Medical record not found', 404));
        }

        await record.deleteOne();

        logger.warn(`Medical record deleted: ${record.recordNumber} by ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: 'Medical record deleted'
        });
    } catch (error) {
        next(error);
    }
};
