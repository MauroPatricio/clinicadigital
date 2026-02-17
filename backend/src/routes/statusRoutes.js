import express from 'express';
import { getStatusPage, getStatusData } from '../controllers/statusController.js';

const router = express.Router();

/**
 * @route   GET /status
 * @desc    Get API status page (HTML)
 * @access  Public
 */
router.get('/', getStatusPage);

/**
 * @route   GET /api/status
 * @desc    Get API status data (JSON)
 * @access  Public
 */
router.get('/api/status', getStatusData);

export default router;
