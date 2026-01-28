import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false
    },
    // Hierarchical role system
    roleType: {
        type: String,
        enum: ['owner', 'manager', 'staff', 'patient'],
        default: 'patient',
        required: true
    },
    // Specific staff role (when roleType is 'staff')
    staffRole: {
        type: String,
        enum: ['doctor', 'nurse', 'receptionist', 'technician', 'pharmacist', 'administrator'],
        required: function () {
            return this.roleType === 'staff';
        }
    },
    // Organization reference (for owners)
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    // Clinic reference (for managers and staff)
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic'
    },
    // Granular permissions array
    permissions: [{
        type: String,
        enum: [
            'manage_clinics',
            'manage_staff',
            'manage_patients',
            'manage_appointments',
            'view_analytics',
            'manage_billing',
            'manage_medical_records',
            'manage_prescriptions',
            'manage_lab_orders',
            'view_reports',
            'manage_rooms',
            'internal_chat',
            'manage_subscriptions'
        ]
    }],
    // Medical staff specific fields
    specialties: [String],
    licenseNumber: String,
    availability: {
        monday: { start: String, end: String, available: { type: Boolean, default: true } },
        tuesday: { start: String, end: String, available: { type: Boolean, default: true } },
        wednesday: { start: String, end: String, available: { type: Boolean, default: true } },
        thursday: { start: String, end: String, available: { type: Boolean, default: true } },
        friday: { start: String, end: String, available: { type: Boolean, default: true } },
        saturday: { start: String, end: String, available: { type: Boolean, default: false } },
        sunday: { start: String, end: String, available: { type: Boolean, default: false } }
    },
    // Legacy role field (for backward compatibility)
    role: {
        type: String,
        enum: ['admin', 'doctor', 'nurse', 'receptionist', 'patient'],
        default: 'patient'
    },
    profile: {
        firstName: {
            type: String,
            required: [true, 'Please provide a first name']
        },
        lastName: {
            type: String,
            required: [true, 'Please provide a last name']
        },
        phone: {
            type: String,
            required: [true, 'Please provide a phone number']
        },
        avatar: String,
        dateOfBirth: Date,
        gender: {
            type: String,
            enum: ['male', 'female', 'other']
        },
        address: {
            street: String,
            city: String,
            state: String,
            country: String,
            postalCode: String
        }
    },
    biometricEnabled: {
        type: Boolean,
        default: false
    },
    fcmTokens: [String], // For push notifications
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: Date,
    refreshToken: String
}, {
    timestamps: true
});

// Encrypt password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT access token
userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign(
        {
            id: this._id,
            roleType: this.roleType,
            staffRole: this.staffRole,
            clinic: this.clinic,
            organization: this.organization,
            // Legacy support
            role: this.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// Generate JWT refresh token
userSchema.methods.getRefreshToken = function () {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE }
    );
};

// Virtual for full name
userSchema.virtual('fullName').get(function () {
    return `${this.profile.firstName} ${this.profile.lastName}`;
});

export default mongoose.model('User', userSchema);
