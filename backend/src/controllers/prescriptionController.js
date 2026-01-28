import Prescription from '../models/Prescription.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import MedicalRecord from '../models/MedicalRecord.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';
import QRCode from 'qrcode';

// @desc    Create prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor only)
export const createPrescription = async (req, res, next) => {
    try {
        const { patientId, medicalRecordId, medications, notes, validDays } = req.body;

        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor) {
            return next(new AppError('Doctor profile not found', 404));
        }

        const patient = await Patient.findById(patientId);
        if (!patient) {
            return next(new AppError('Patient not found', 404));
        }

        // Set validity period
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + (validDays || 30));

        const prescription = await Prescription.create({
            patient: patientId,
            doctor: doctor._id,
            medicalRecord: medicalRecordId,
            medications,
            notes,
            validUntil,
            digitalSignature: {
                signed: true,
                signedAt: Date.now()
            }
        });

        // Generate QR code for verification
        const qrData = {
            prescriptionNumber: prescription.prescriptionNumber,
            patientId: patient.patientNumber,
            doctorId: doctor.doctorNumber,
            validUntil: prescription.validUntil
        };

        prescription.qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
        await prescription.save();

        // Add to medical record if provided
        if (medicalRecordId) {
            const record = await MedicalRecord.findById(medicalRecordId);
            if (record) {
                record.prescriptions.push(prescription._id);
                await record.save();
            }
        }

        await prescription.populate(['patient', 'doctor']);

        logger.info(`Prescription created: ${prescription.prescriptionNumber}`);

        res.status(201).json({
            success: true,
            data: prescription
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get prescription
// @route   GET /api/prescriptions/:id
// @access  Private
export const getPrescription = async (req, res, next) => {
    try {
        const prescription = await Prescription.findById(req.params.id)
            .populate('patient', 'patientNumber user')
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'profile' }
            })
            .populate('doctor', 'user specialization licenseNumber')
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'profile' }
            });

        if (!prescription) {
            return next(new AppError('Prescription not found', 404));
        }

        res.status(200).json({
            success: true,
            data: prescription
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Check medication interactions
// @route   GET /api/prescriptions/check-interactions
// @access  Private (Doctor)
export const checkInteractions = async (req, res, next) => {
    try {
        const { medications } = req.query;

        if (!medications || medications.length < 2) {
            return next(new AppError('Provide at least 2 medications', 400));
        }

        // TODO: Integrate with actual drug interaction API (e.g., DrugBank)
        // This is a placeholder
        const interactions = [];

        res.status(200).json({
            success: true,
            data: {
                checked: medications,
                interactions,
                hasInteractions: interactions.length > 0
            }
        });
    } catch (error) {
        next(error);
    }
};

export default {
    createPrescription,
    getPrescription,
    checkInteractions
};
