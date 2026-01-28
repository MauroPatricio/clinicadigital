import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

dotenv.config();

const fixHash = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash('admin123', salt);

        // Update directly, bypassing pre('save')
        await User.updateOne(
            { email: 'admin@clinica.com' },
            { $set: { password: hash, role: 'admin' } } // Ensure role is admin
        );

        console.log('Admin password manually updated to hash of "admin123".');

        // Verify
        const user = await User.findOne({ email: 'admin@clinica.com' }).select('+password');
        const match = await bcrypt.compare('admin123', user.password);
        console.log('Verification: Does "admin123" match new hash?', match);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

fixHash();
