import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Doctor from './models/Doctor.js';
import Patient from './models/Patient.js';

dotenv.config();

const seedData = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Clear existing data (optional, but safer for tests)
        // await User.deleteMany({});
        // await Doctor.deleteMany({});
        // await Patient.deleteMany({});
        // await mongoose.connection.collection('appointments').deleteMany({});

        // Create Doctor
        const doctorEmail = 'jane.smith@clinic.com';
        let doctorUser = await User.findOne({ email: doctorEmail });

        if (!doctorUser) {
            doctorUser = await User.create({
                email: doctorEmail,
                password: 'password123',
                role: 'doctor',
                profile: {
                    firstName: 'Jane',
                    lastName: 'Smith',
                    phone: '555-0101'
                }
            });

            await Doctor.create({
                user: doctorUser._id,
                specialization: 'cardiologia',
                licenseNumber: 'DOC12345',
                availability: [
                    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Monday
                    { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Tuesday
                    { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' }, // Wednesday
                    { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Thursday
                    { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }  // Friday
                ]
            });
            console.log('Doctor created: Jane Smith');
        } else {
            console.log('Doctor already exists');
        }

        // Create Patient
        const patientEmail = 'alice.wonder@test.com';
        let patientUser = await User.findOne({ email: patientEmail });

        if (!patientUser) {
            patientUser = await User.create({
                email: patientEmail,
                password: 'password123',
                role: 'patient',
                profile: {
                    firstName: 'Alice',
                    lastName: 'Wonder',
                    phone: '555-0202',
                    gender: 'female',
                    dateOfBirth: new Date('1990-01-01'),
                    address: {
                        street: '123 Wonderland Ave',
                        city: 'Fantasy City',
                        state: 'FC',
                        postalCode: '12345'
                    }
                }
            });

            await Patient.create({
                user: patientUser._id,
                bloodType: 'A+',
                insurance: {
                    provider: 'HealthCare Inc',
                    policyNumber: 'HC987654321',
                    validUntil: new Date('2030-12-31')
                }
            });
            console.log('Patient created: Alice Wonder');
        } else {
            console.log('Patient already exists');
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedData();
