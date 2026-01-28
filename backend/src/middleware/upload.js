import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { AppError } from '../middleware/errorHandler.js';

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Store in uploads directory
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'audio/mpeg',
        'audio/wav',
        'video/mp4'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError('Invalid file type. Only images, PDFs, documents, audio, and video are allowed', 400), false);
    }
};

// Create multer instance
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    }
});

// Middleware for single file upload
export const uploadSingle = upload.single('file');

// Middleware for multiple files
export const uploadMultiple = upload.array('files', 5);

// Controller for handling file uploads
export const handleFileUpload = (req, res, next) => {
    try {
        if (!req.file && !req.files) {
            return next(new AppError('No file uploaded', 400));
        }

        const files = req.files || [req.file];
        const uploadedFiles = files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            url: `/uploads/${file.filename}`
        }));

        res.status(200).json({
            success: true,
            count: uploadedFiles.length,
            data: uploadedFiles
        });
    } catch (error) {
        next(error);
    }
};

export default {
    uploadSingle,
    uploadMultiple,
    handleFileUpload
};
