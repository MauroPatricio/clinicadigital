import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import AppointmentQueue from '../models/AppointmentQueue.js';
import AppointmentReminder from '../models/AppointmentReminder.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';
import { addMinutes, isBefore, isAfter, startOfDay, endOfDay } from 'date-fns';

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req, res, next) => {
    try {
        const { status, date, doctor, patient } = req.query;

        let query = {};

        // Filter by user role
        if (req.user.role === 'doctor') {
            const doctorProfile = await Doctor.findOne({ user: req.user._id });
            query.doctor = doctorProfile._id;
        } else if (req.user.role === 'patient') {
            const patientProfile = await Patient.findOne({ user: req.user._id });
            query.patient = patientProfile._id;
        }

        // Additional filters
        if (status) query.status = status;
        if (doctor) query.doctor = doctor;
        if (patient) query.patient = patient;

        // Date filter
        if (date) {
            const targetDate = new Date(date);
            query.dateTime = {
                $gte: startOfDay(targetDate),
                $lte: endOfDay(targetDate)
            };
        }

        const appointments = await Appointment.find(query)
            .populate('patient', 'user patientNumber')
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'profile' }
            })
            .populate('doctor', 'user specialization')
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'profile' }
            })
            .populate('clinic', 'name address')
            .sort({ dateTime: 1 });

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
export const createAppointment = async (req, res, next) => {
    try {
        const { doctorId, type, specialty, dateTime, reason, clinicId } = req.body;

        let patientId;

        if (req.user.role === 'patient') {
            const patientProfile = await Patient.findOne({ user: req.user._id });
            if (!patientProfile) {
                return next(new AppError('Patient profile not found', 404));
            }
            patientId = patientProfile._id;
        } else {
            // Admin/Staff must provide patientId
            if (!req.body.patientId) {
                return next(new AppError('Please provide patientId', 400));
            }
            patientId = req.body.patientId;
        }

        // Get doctor profile
        const doctorProfile = await Doctor.findById(doctorId);
        if (!doctorProfile) {
            return next(new AppError('Doctor not found', 404));
        }

        // Check if doctor is accepting patients
        if (!doctorProfile.isAcceptingPatients) {
            return next(new AppError('Doctor is not accepting new appointments', 400));
        }

        // Check availability (basic check - should expand with more complex logic)
        const requestedDateTime = new Date(dateTime);
        const existingAppointment = await Appointment.findOne({
            doctor: doctorId,
            dateTime: requestedDateTime,
            status: { $nin: ['cancelled', 'no-show'] }
        });

        if (existingAppointment) {
            return next(new AppError('This time slot is not available', 400));
        }

        // Create appointment
        const appointment = await Appointment.create({
            patient: patientId,
            doctor: doctorId,
            type,
            specialty,
            dateTime: requestedDateTime,
            duration: doctorProfile.consultationDuration,
            reason,
            clinic: clinicId,
            status: 'scheduled'
        });

        // Update patient's next appointment
        // Update patient's next appointment (Find patient by ID now)
        const patient = await Patient.findById(patientId);
        patient.nextAppointment = appointment._id;
        await patient.save();

        // Populate before sending response
        await appointment.populate(['patient', 'doctor', 'clinic']);

        logger.info(`New appointment created: ${appointment.appointmentNumber}`);

        res.status(201).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get doctor availability
// @route   GET /api/appointments/availability
// @access  Public
export const getDoctorAvailability = async (req, res, next) => {
    try {
        const { doctorId, date } = req.query;

        if (!doctorId || !date) {
            return next(new AppError('Please provide doctorId and date', 400));
        }

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return next(new AppError('Doctor not found', 404));
        }

        const targetDate = new Date(date);
        const dayOfWeek = targetDate.getDay();

        // Get doctor's schedule for this day
        const daySchedule = doctor.availability.find(a => a.dayOfWeek === dayOfWeek);

        if (!daySchedule) {
            return res.status(200).json({
                success: true,
                data: {
                    available: false,
                    message: 'Doctor is not available on this day'
                }
            });
        }

        // Get existing appointments for this day
        const existingAppointments = await Appointment.find({
            doctor: doctorId,
            dateTime: {
                $gte: startOfDay(targetDate),
                $lte: endOfDay(targetDate)
            },
            status: { $nin: ['cancelled', 'no-show'] }
        });

        // Generate available time slots
        const slots = [];
        const [startHour, startMinute] = daySchedule.startTime.split(':').map(Number);
        const [endHour, endMinute] = daySchedule.endTime.split(':').map(Number);

        let currentSlot = new Date(targetDate);
        currentSlot.setHours(startHour, startMinute, 0, 0);

        const endTime = new Date(targetDate);
        endTime.setHours(endHour, endMinute, 0, 0);

        while (isBefore(currentSlot, endTime)) {
            const slotTime = new Date(currentSlot);
            const isBooked = existingAppointments.some(apt =>
                apt.dateTime.getTime() === slotTime.getTime()
            );

            slots.push({
                time: slotTime,
                available: !isBooked
            });

            currentSlot = addMinutes(currentSlot, doctor.consultationDuration);
        }

        res.status(200).json({
            success: true,
            data: {
                available: true,
                slots,
                consultationDuration: doctor.consultationDuration
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
export const updateAppointment = async (req, res, next) => {
    try {
        let appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return next(new AppError('Appointment not found', 404));
        }

        // Update appointment
        appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private
export const cancelAppointment = async (req, res, next) => {
    try {
        const { reason } = req.body;

        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return next(new AppError('Appointment not found', 404));
        }

        appointment.status = 'cancelled';
        appointment.cancelReason = reason;
        appointment.cancelledBy = req.user._id;
        appointment.cancelledAt = Date.now();

        await appointment.save();

        logger.info(`Appointment cancelled: ${appointment.appointmentNumber}`);

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Confirm appointment
// @route   POST /api/appointments/:id/confirm
// @access  Private
export const confirmAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return next(new AppError('Appointment not found', 404));
        }

        appointment.status = 'confirmed';
        appointment.confirmedAt = new Date();
        await appointment.save();

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get queue by date
// @route   GET /api/appointments/queue/:date
// @access  Private
export const getQueueByDate = async (req, res, next) => {
    try {
        const { date } = req.params;
        const { doctor, specialty } = req.query;

        const targetDate = new Date(date);
        const query = {
            clinic: req.user.currentClinic,
            date: {
                $gte: startOfDay(targetDate),
                $lte: endOfDay(targetDate)
            }
        };

        if (doctor) query.doctor = doctor;
        if (specialty) query.specialty = specialty;

        const queues = await AppointmentQueue.find(query)
            .populate({
                path: 'queue.appointment',
                populate: [
                    { path: 'patient', populate: { path: 'user', select: 'profile' } },
                    { path: 'doctor', populate: { path: 'user', select: 'profile' } }
                ]
            })
            .populate('doctor', 'profile specialization')
            .sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            data: queues
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update queue positions (drag-and-drop)
// @route   PATCH /api/appointments/queue/:queueId
// @access  Private
export const updateQueuePositions = async (req, res, next) => {
    try {
        const { newOrder } = req.body; // Array of { appointmentId, position }

        const queue = await AppointmentQueue.findById(req.params.queueId);
        if (!queue) {
            return next(new AppError('Queue not found', 404));
        }

        // Update positions
        newOrder.forEach(({ appointmentId, position }) => {
            const queueItem = queue.queue.find(q => q.appointment.toString() === appointmentId);
            if (queueItem) {
                queueItem.position = position;
            }
        });

        // Sort queue by position
        queue.queue.sort((a, b) => a.position - b.position);
        await queue.save();

        logger.info(`Queue positions updated for queue ${queue._id}`);

        res.status(200).json({
            success: true,
            data: queue
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Call next patient in queue
// @route   POST /api/appointments/queue/:queueId/next
// @access  Private
export const callNextPatient = async (req, res, next) => {
    try {
        const queue = await AppointmentQueue.findById(req.params.queueId);
        if (!queue) {
            return next(new AppError('Queue not found', 404));
        }

        const nextPatient = queue.getNextPatient();
        if (!nextPatient) {
            return next(new AppError('No patients waiting in queue', 400));
        }

        // Update status to called
        nextPatient.status = 'called';
        nextPatient.calledAt = new Date();
        await queue.save();

        // Update appointment status
        await Appointment.findByIdAndUpdate(nextPatient.appointment, {
            status: 'in-waiting-room',
            checkedInAt: new Date()
        });

        logger.info(`Next patient called in queue ${queue._id}`);

        res.status(200).json({
            success: true,
            data: nextPatient
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Send appointment confirmation
// @route   POST /api/appointments/:id/send-confirmation
// @access  Private
export const sendConfirmation = async (req, res, next) => {
    try {
        const { method } = req.body; // 'sms', 'whatsapp', 'email'

        const appointment = await Appointment.findById(req.params.id)
            .populate('patient', 'user')
            .populate({ path: 'patient', populate: { path: 'user', select: 'profile phone email' } });

        if (!appointment) {
            return next(new AppError('Appointment not found', 404));
        }

        // Create reminder
        const reminder = await AppointmentReminder.create({
            appointment: appointment._id,
            patient: appointment.patient.user._id,
            clinic: appointment.clinic,
            reminderType: method,
            scheduledFor: new Date(),
            status: 'pending'
        });

        // TODO: Integrate with SMS/WhatsApp/Email service
        // For now, just mark as sent
        await reminder.markAsSent();

        // Update appointment confirmation tracking
        appointment.confirmationSent[method] = {
            sent: true,
            sentAt: new Date()
        };
        await appointment.save();

        logger.info(`Confirmation sent via ${method} for appointment ${appointment.appointmentNumber}`);

        res.status(200).json({
            success: true,
            message: `Confirmation sent via ${method}`,
            data: reminder
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get predicted wait time
// @route   GET /api/appointments/:id/wait-time
// @access  Private
export const getPredictedWaitTime = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return next(new AppError('Appointment not found', 404));
        }

        // Find queue for this appointment
        const queue = await AppointmentQueue.findOne({
            'queue.appointment': appointment._id
        });

        if (!queue) {
            return res.status(200).json({
                success: true,
                data: { waitTime: 0, message: 'Not in queue' }
            });
        }

        const queueItem = queue.queue.find(q => q.appointment.toString() === appointment._id.toString());

        // Calculate estimated wait time based on position and average consultation time
        const patientsAhead = queue.queue.filter(q => q.position < queueItem.position && q.status === 'waiting').length;
        const estimatedWaitMinutes = patientsAhead * queue.averageWaitTime;

        res.status(200).json({
            success: true,
            data: {
                position: queueItem.position,
                patientsAhead,
                estimatedWaitMinutes,
                estimatedTime: addMinutes(new Date(), estimatedWaitMinutes)
            }
        });
    } catch (error) {
        next(error);
    }
};
