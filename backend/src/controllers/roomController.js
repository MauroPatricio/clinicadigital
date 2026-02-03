import Room from '../models/Room.js';
import Appointment from '../models/Appointment.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

// @desc    Get all rooms for a clinic
// @route   GET /api/rooms
// @access  Private
export const getRooms = async (req, res, next) => {
    try {
        const { status, type } = req.query;
        const clinicId = req.user.currentClinic || req.query.clinicId;

        if (!clinicId) {
            return next(new AppError('Clinic ID is required', 400));
        }

        let query = { clinic: clinicId, isActive: true };

        if (status) query.status = status;
        if (type) query.type = type;

        const rooms = await Room.find(query)
            .populate('assignedTo', 'profile')
            .populate('currentAppointment')
            .sort({ number: 1 });

        // Calculate occupancy stats
        const totalRooms = rooms.length;
        const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
        const availableRooms = rooms.filter(r => r.status === 'available').length;
        const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;
        const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

        res.status(200).json({
            success: true,
            count: totalRooms,
            stats: {
                total: totalRooms,
                available: availableRooms,
                occupied: occupiedRooms,
                maintenance: maintenanceRooms,
                occupancyRate
            },
            data: rooms
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Private
export const getRoom = async (req, res, next) => {
    try {
        const room = await Room.findById(req.params.id)
            .populate('assignedTo', 'profile')
            .populate({
                path: 'currentAppointment',
                populate: [
                    { path: 'patient', select: 'user patientNumber', populate: { path: 'user', select: 'profile' } },
                    { path: 'doctor', select: 'user specialization', populate: { path: 'user', select: 'profile' } }
                ]
            });

        if (!room) {
            return next(new AppError('Room not found', 404));
        }

        res.status(200).json({
            success: true,
            data: room
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create room
// @route   POST /api/rooms
// @access  Private (Admin, Manager)
export const createRoom = async (req, res, next) => {
    try {
        const clinicId = req.user.currentClinic || req.body.clinicId;

        if (!clinicId) {
            return next(new AppError('Clinic ID is required', 400));
        }

        const roomData = {
            ...req.body,
            clinic: clinicId
        };

        const room = await Room.create(roomData);

        logger.info(`Room created: ${room.number} at clinic ${clinicId}`);

        res.status(201).json({
            success: true,
            data: room
        });
    } catch (error) {
        if (error.code === 11000) {
            return next(new AppError('Room number already exists in this clinic', 400));
        }
        next(error);
    }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private (Admin, Manager)
export const updateRoom = async (req, res, next) => {
    try {
        const room = await Room.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!room) {
            return next(new AppError('Room not found', 404));
        }

        logger.info(`Room updated: ${room.number}`);

        res.status(200).json({
            success: true,
            data: room
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete room (soft delete)
// @route   DELETE /api/rooms/:id
// @access  Private (Admin)
export const deleteRoom = async (req, res, next) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return next(new AppError('Room not found', 404));
        }

        if (room.status === 'occupied') {
            return next(new AppError('Cannot delete an occupied room', 400));
        }

        room.isActive = false;
        await room.save();

        logger.info(`Room soft deleted: ${room.number}`);

        res.status(200).json({
            success: true,
            message: 'Room deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Occupy room
// @route   POST /api/rooms/:id/occupy
// @access  Private
export const occupyRoom = async (req, res, next) => {
    try {
        const { appointmentId, staffId } = req.body;
        const room = await Room.findById(req.params.id);

        if (!room) {
            return next(new AppError('Room not found', 404));
        }

        if (room.status !== 'available') {
            return next(new AppError('Room is not available', 400));
        }

        await room.occupy(appointmentId, staffId);

        // Update appointment with room info
        if (appointmentId) {
            await Appointment.findByIdAndUpdate(appointmentId, {
                room: room._id,
                status: 'in-progress'
            });
        }

        logger.info(`Room ${room.number} occupied`);

        res.status(200).json({
            success: true,
            data: room
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Free room
// @route   POST /api/rooms/:id/free
// @access  Private
export const freeRoom = async (req, res, next) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return next(new AppError('Room not found', 404));
        }

        // Update appointment if exists
        if (room.currentAppointment) {
            await Appointment.findByIdAndUpdate(room.currentAppointment, {
                status: 'completed'
            });
        }

        await room.free();

        logger.info(`Room ${room.number} freed`);

        res.status(200).json({
            success: true,
            data: room
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get room occupancy stats
// @route   GET /api/rooms/stats/occupancy
// @access  Private (Admin, Manager)
export const getRoomOccupancyStats = async (req, res, next) => {
    try {
        const clinicId = req.user.currentClinic || req.query.clinicId;

        if (!clinicId) {
            return next(new AppError('Clinic ID is required', 400));
        }

        const rooms = await Room.find({ clinic: clinicId, isActive: true });

        const stats = {
            total: rooms.length,
            available: rooms.filter(r => r.status === 'available').length,
            occupied: rooms.filter(r => r.status === 'occupied').length,
            maintenance: rooms.filter(r => r.status === 'maintenance').length,
            reserved: rooms.filter(r => r.status === 'reserved').length,
            cleaning: rooms.filter(r => r.status === 'cleaning').length
        };

        stats.occupancyRate = stats.total > 0
            ? Math.round((stats.occupied / stats.total) * 100)
            : 0;

        // Group by type
        const byType = rooms.reduce((acc, room) => {
            if (!acc[room.type]) {
                acc[room.type] = { total: 0, available: 0, occupied: 0 };
            }
            acc[room.type].total++;
            if (room.status === 'available') acc[room.type].available++;
            if (room.status === 'occupied') acc[room.type].occupied++;
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            data: {
                summary: stats,
                byType
            }
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getRooms,
    getRoom,
    createRoom,
    updateRoom,
    deleteRoom,
    occupyRoom,
    freeRoom,
    getRoomOccupancyStats
};
