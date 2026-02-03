import express from 'express';
import {
    getRooms,
    getRoom,
    createRoom,
    updateRoom,
    deleteRoom,
    occupyRoom,
    freeRoom,
    getRoomOccupancyStats
} from '../controllers/roomController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Stats route (must be before /:id)
router.get('/stats/occupancy', authorize('admin', 'manager', 'owner'), getRoomOccupancyStats);

// Main CRUD routes
router.route('/')
    .get(getRooms)
    .post(authorize('admin', 'manager', 'owner'), createRoom);

router.route('/:id')
    .get(getRoom)
    .put(authorize('admin', 'manager', 'owner'), updateRoom)
    .delete(authorize('admin', 'owner'), deleteRoom);

// Room status actions
router.post('/:id/occupy', authorize('admin', 'manager', 'staff', 'owner'), occupyRoom);
router.post('/:id/free', authorize('admin', 'manager', 'staff', 'owner'), freeRoom);

export default router;
