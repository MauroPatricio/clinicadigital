import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const createAdmin = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        const adminEmail = 'admin@clinica.com';
        const userExists = await User.findOne({ email: adminEmail });

        if (userExists) {
            console.log('Admin already exists. Deleting to recreate.');
            await User.deleteOne({ email: adminEmail });
            // Re-create logic falls through to else block? No, need to structure
        }

        await User.create({
            email: adminEmail,
            password: 'admin123',
            role: 'admin',
            profile: {
                firstName: 'Admin',
                lastName: 'User',
                phone: '555-ADMIN'
            }
        });
        console.log('Admin created fresh.');

        const verifyUser = await User.findOne({ email: adminEmail }).select('+password');
        if (verifyUser) {
            console.log('Verification: Admin found in DB.');
            console.log('Password Hash:', verifyUser.password.substring(0, 10) + '...');
        } else {
            console.log('Verification: Admin NOT found!');
        }
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

createAdmin();
