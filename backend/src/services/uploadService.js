import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import streamifier from 'streamifier';
import { AppError } from '../middleware/errorHandler.js';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Use memory storage so we can stream to Cloudinary
const storage = multer.memoryStorage();

// File filter for validation
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
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
        cb(new AppError('Invalid file type', 400), false);
    }
};

// Multer upload middleware
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    }
});

/**
 * Upload buffer to Cloudinary using stream
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Cloudinary folder
 * @returns {Promise<{url: string, publicId: string}>}
 */
export const uploadToCloudinary = (buffer, folder = 'clinicadigital-uploads') => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'auto'
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id
                    });
                }
            }
        );

        streamifier.createReadStream(buffer).pipe(stream);
    });
};

/**
 * Upload image to Cloudinary
 * @param {File} file - Multer file object with buffer
 * @returns {Promise<{url: string, publicId: string}>}
 */
export const uploadImage = async (file) => {
    try {
        if (!file || !file.buffer) {
            throw new Error('No file provided');
        }

        return await uploadToCloudinary(file.buffer);
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload image');
    }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<void>}
 */
export const deleteImage = async (publicId) => {
    try {
        if (!publicId) {
            return;
        }

        await cloudinary.uploader.destroy(publicId);
        console.log(`Image deleted: ${publicId}`);
    } catch (error) {
        console.error('Error deleting image:', error);
    }
};

export default {
    upload,
    uploadImage,
    uploadToCloudinary,
    deleteImage,
    cloudinary
};
