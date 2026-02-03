/**
 * Migration Script: Add Type Field to Clinics
 * This script adds the 'type' field to all existing clinics in the database
 * Default value: 'clinic' for all existing entries
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Clinic from './src/models/Clinic.js';

dotenv.config();

const migrateClinicTypes = async () => {
    try {
        console.log('🚀 Starting clinic type migration...');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find all clinics without a type field
        const clinicsWithoutType = await Clinic.find({
            $or: [
                { type: { $exists: false } },
                { type: null }
            ]
        });

        console.log(`📊 Found ${clinicsWithoutType.length} clinics without type field`);

        if (clinicsWithoutType.length === 0) {
            console.log('✅ All clinics already have type field. Nothing to migrate.');
            process.exit(0);
        }

        // Update all clinics without type to default 'clinic'
        const result = await Clinic.updateMany(
            {
                $or: [
                    { type: { $exists: false } },
                    { type: null }
                ]
            },
            {
                $set: { type: 'clinic' }
            }
        );

        console.log(`✅ Migration complete! Updated ${result.modifiedCount} clinics`);
        console.log('');
        console.log('⚠️ NEXT STEPS:');
        console.log('1. Review your clinics and update the ones that are laboratories:');
        console.log('   db.clinics.updateOne({ name: "LabName" }, { $set: { type: "laboratory" } })');
        console.log('');
        console.log('2. Or use the admin panel to update clinic types manually');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrateClinicTypes();
