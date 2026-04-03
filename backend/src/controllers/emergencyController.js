import EmergencyRequest from '../models/EmergencyRequest.js';
import Patient from '../models/Patient.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';
import socketService from '../services/socketService.js';

// @desc    Submit emergency request
// @route   POST /api/emergency
// @access  Private (Patient/User)
export const submitEmergency = async (req, res, next) => {
    try {
        const { type, location, vitalSignsAtRequest, description, clinicId } = req.body;

        const patientProfile = await Patient.findOne({ user: req.user._id });
        if (!patientProfile) {
            return next(new AppError('No patient profile found for this user', 404));
        }

        const emergency = await EmergencyRequest.create({
            patient: patientProfile._id,
            clinic: clinicId || req.user.currentClinic,
            type,
            location,
            vitalSignsAtRequest,
            description,
            status: 'pending'
        });

        // 🚨 Broadcast Emergency via SocketService (Clinic Scoped)
        if (emergency.clinic) {
            socketService.emitToClinic(emergency.clinic, 'emergency:alert', {
                id: emergency._id,
                patientName: `${req.user.profile.firstName} ${req.user.profile.lastName}`,
                type: emergency.type,
                location: emergency.location,
                timestamp: emergency.createdAt
            });
        }

        logger.warn(`EMERGENCY ALERT: ${emergency.type} requested by ${req.user.email}`);

        res.status(201).json({
            success: true,
            data: emergency
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all emergency requests (for Dashboard)
// @route   GET /api/emergency
// @access  Private (Admin/Staff)
export const getEmergencyRequests = async (req, res, next) => {
    try {
        const query = { clinic: req.user.currentClinic };
        if (req.query.status) query.status = req.query.status;

        const requests = await EmergencyRequest.find(query)
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'profile phone' }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update emergency status (Dispatching ambulance, etc)
// @route   PUT /api/emergency/:id
// @access  Private (Admin/Staff)
export const updateEmergencyStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, assignedAmbulance } = req.body;

        const emergency = await EmergencyRequest.findByIdAndUpdate(
            id,
            { status, assignedAmbulance, dispatchedAt: status === 'dispatched' ? new Date() : undefined },
            { new: true, runValidators: true }
        );

        if (!emergency) {
            return next(new AppError('Emergency request not found', 404));
        }

        // Notify patient of status update
        await emergency.populate({ path: 'patient', populate: { path: 'user' } });
        
        if (emergency.patient?.user?._id) {
            socketService.emitToUser(emergency.patient.user._id, 'emergency:status_update', {
                requestId: emergency._id,
                status: emergency.status,
                assignedAmbulance: emergency.assignedAmbulance
            });
        }

        res.status(200).json({
            success: true,
            data: emergency
        });
    } catch (error) {
        next(error);
    }
};
