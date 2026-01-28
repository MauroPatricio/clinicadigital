import AgoraAccessToken from 'agora-access-token';
const { RtcTokenBuilder, RtcRole } = AgoraAccessToken;
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';
import crypto from 'crypto';

const appId = process.env.AGORA_APP_ID;
const appCertificate = process.env.AGORA_APP_CERTIFICATE;

// @desc    Create video call room
// @route   POST /api/telemedicine/room
// @access  Private
export const createVideoRoom = async (req, res, next) => {
    try {
        const { appointmentId } = req.body;

        const appointment = await Appointment.findById(appointmentId)
            .populate('patient')
            .populate('doctor');

        if (!appointment) {
            return next(new AppError('Appointment not found', 404));
        }

        // Verify appointment is of type 'online'
        if (appointment.type !== 'online') {
            return next(new AppError('This is not an online appointment', 400));
        }

        // Check authorization
        const isDoctor = req.user.role === 'doctor';
        const isPatient = req.user.role === 'patient';

        if (isDoctor) {
            const doctor = await Doctor.findOne({ user: req.user._id });
            if (appointment.doctor._id.toString() !== doctor._id.toString()) {
                return next(new AppError('Not authorized', 403));
            }
        } else if (isPatient) {
            const patient = await Patient.findOne({ user: req.user._id });
            if (appointment.patient._id.toString() !== patient._id.toString()) {
                return next(new AppError('Not authorized', 403));
            }
        }

        // Generate unique room ID if not exists
        if (!appointment.room.roomId) {
            appointment.room.roomId = crypto.randomBytes(16).toString('hex');
        }

        // Update appointment status
        if (appointment.status === 'confirmed') {
            appointment.status = 'in-waiting-room';
        }

        await appointment.save();

        logger.info(`Video room created for appointment: ${appointment.appointmentNumber}`);

        res.status(200).json({
            success: true,
            data: {
                roomId: appointment.room.roomId,
                appointmentId: appointment._id,
                appointmentNumber: appointment.appointmentNumber
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get Agora RTC token
// @route   GET /api/telemedicine/token
// @access  Private
export const getAgoraToken = async (req, res, next) => {
    try {
        const { appointmentId } = req.query;

        if (!appId || !appCertificate) {
            return next(new AppError('Agora credentials not configured', 500));
        }

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return next(new AppError('Appointment not found', 404));
        }

        if (!appointment.room.roomId) {
            return next(new AppError('Video room not created yet', 400));
        }

        // Check authorization
        const isDoctor = req.user.role === 'doctor';
        const isPatient = req.user.role === 'patient';

        if (isDoctor) {
            const doctor = await Doctor.findOne({ user: req.user._id });
            if (appointment.doctor.toString() !== doctor._id.toString()) {
                return next(new AppError('Not authorized', 403));
            }
        } else if (isPatient) {
            const patient = await Patient.findOne({ user: req.user._id });
            if (appointment.patient.toString() !== patient._id.toString()) {
                return next(new AppError('Not authorized', 403));
            }
        }

        // Generate Agora token
        const channelName = appointment.room.roomId;
        const uid = 0; // 0 means any user can join
        const role = isDoctor ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
        const expirationTimeInSeconds = 3600; // 1 hour
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

        const token = RtcTokenBuilder.buildTokenWithUid(
            appId,
            appCertificate,
            channelName,
            uid,
            role,
            privilegeExpiredTs
        );

        // Save token to appointment
        appointment.room.agoraToken = token;

        // Update appointment status if doctor joins
        if (isDoctor && appointment.status === 'in-waiting-room') {
            appointment.status = 'in-progress';
            appointment.startedAt = Date.now();
        }

        await appointment.save();

        logger.info(`Agora token generated for appointment: ${appointment.appointmentNumber}`);

        res.status(200).json({
            success: true,
            data: {
                token,
                appId,
                channelName,
                uid,
                expiresIn: expirationTimeInSeconds
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Start/stop call recording
// @route   POST /api/telemedicine/:appointmentId/recording
// @access  Private (Doctor only)
export const manageRecording = async (req, res, next) => {
    try {
        const { action, recordingUrl } = req.body; // action: 'start' or 'stop'

        const appointment = await Appointment.findById(req.params.appointmentId);

        if (!appointment) {
            return next(new AppError('Appointment not found', 404));
        }

        // Verify doctor
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (appointment.doctor.toString() !== doctor._id.toString()) {
            return next(new AppError('Not authorized', 403));
        }

        if (action === 'stop' && recordingUrl) {
            appointment.room.recordingUrl = recordingUrl;
            await appointment.save();

            logger.info(`Call recording saved for appointment: ${appointment.appointmentNumber}`);
        }

        res.status(200).json({
            success: true,
            message: `Recording ${action === 'start' ? 'started' : 'stopped'}`
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Share documents during call
// @route   POST /api/telemedicine/:appointmentId/documents
// @access  Private
export const shareDocument = async (req, res, next) => {
    try {
        const { documentUrl, documentType, fileName } = req.body;

        const appointment = await Appointment.findById(req.params.appointmentId);

        if (!appointment) {
            return next(new AppError('Appointment not found', 404));
        }

        // TODO: Store shared documents
        // This could be added to the appointment or medical record

        res.status(200).json({
            success: true,
            message: 'Document shared successfully',
            data: {
                documentUrl,
                documentType,
                fileName,
                sharedAt: new Date()
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    End video consultation
// @route   POST /api/telemedicine/:appointmentId/end
// @access  Private (Doctor)
export const endConsultation = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.appointmentId);

        if (!appointment) {
            return next(new AppError('Appointment not found', 404));
        }

        // Verify doctor
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (appointment.doctor.toString() !== doctor._id.toString()) {
            return next(new AppError('Not authorized', 403));
        }

        appointment.status = 'completed';
        appointment.completedAt = Date.now();
        await appointment.save();

        logger.info(`Video consultation ended: ${appointment.appointmentNumber}`);

        res.status(200).json({
            success: true,
            message: 'Consultation ended',
            data: appointment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get active consultations
// @route   GET /api/telemedicine/active
// @access  Private (Doctor, Admin)
export const getActiveConsultations = async (req, res, next) => {
    try {
        let query = {
            type: 'online',
            status: { $in: ['in-waiting-room', 'in-progress'] }
        };

        // Filter by doctor if doctor role
        if (req.user.role === 'doctor') {
            const doctor = await Doctor.findOne({ user: req.user._id });
            query.doctor = doctor._id;
        }

        const consultations = await Appointment.find(query)
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
            .sort({ dateTime: 1 });

        res.status(200).json({
            success: true,
            count: consultations.length,
            data: consultations
        });
    } catch (error) {
        next(error);
    }
};
