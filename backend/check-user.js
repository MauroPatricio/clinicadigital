import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

console.log('Script starting...');
dotenv.config();
console.log('Environment loaded.');

const run = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI not found in .env');
        console.log('Connecting to MongoDB...');

        await mongoose.connect(uri);
        console.log('Connected.');

        const email = 'admin@clinica.com';
        let user = await User.findOne({ email });

        if (user) {
            console.log(`User ${email} exists. Resetting password...`);
            user.password = 'admin123';
            await user.save();
            console.log('Password updated to: admin123');
        } else {
            console.log(`User ${email} does not exist. Creating...`);
            user = await User.create({
                email,
                password: 'admin123',
                role: 'admin',
                profile: {
                    firstName: 'Admin',
                    lastName: 'System',
                    phone: '+1234567890',
                    dateOfBirth: new Date(),
                    gender: 'other',
                    address: {
                        street: '123 Clinic St',
                        city: 'Health City',
                        state: 'HC',
                        country: 'Country',
                        postalCode: '10000'
                    }
                }
            });
            console.log('User created successfully.');
        }

    } catch (err) {
        console.error('Error during execution:', err);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
            console.log('Disconnected.');
        }
    }
};

run();
