import express from 'express';
import { uploadSingle, uploadMultiple, handleFileUpload } from '../middleware/upload.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Single file upload
router.post('/single', uploadSingle, handleFileUpload);

// Multiple files upload
router.post('/multiple', uploadMultiple, handleFileUpload);

export default router;
