import { upload, uploadToCloudinary } from '../services/uploadService.js';
import { AppError } from '../middleware/errorHandler.js';

// Middleware for single file upload
export const uploadSingle = upload.single('file');

// Middleware for multiple files
export const uploadMultiple = upload.array('files', 5);

// Controller for handling file uploads
export const handleFileUpload = async (req, res, next) => {
    try {
        if (!req.file && !req.files) {
            return next(new AppError('No file uploaded', 400));
        }

        const files = req.files || [req.file];

        // Upload each file to Cloudinary
        const uploadPromises = files.map(file => uploadToCloudinary(file.buffer));
        const uploadedFiles = await Promise.all(uploadPromises);

        // Map to expected format
        const response = uploadedFiles.map((result, index) => ({
            filename: result.publicId,
            originalName: files[index].originalname,
            mimeType: files[index].mimetype,
            size: files[index].size,
            url: result.url,
            path: result.url,
            publicId: result.publicId
        }));

        res.status(200).json({
            success: true,
            count: response.length,
            data: response
        });
    } catch (error) {
        console.error('Upload error:', error);
        next(error);
    }
};

export default {
    uploadSingle,
    uploadMultiple,
    handleFileUpload
};
