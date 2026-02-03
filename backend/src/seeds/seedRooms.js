import mongoose from 'mongoose';
import 'dotenv/config';
import connectDB from '../config/database.js';

// Models
import Room from '../models/Room.js';
import LabOrder from '../models/LabOrder.js';
import Bill from '../models/Bill.js';
import Clinic from '../models/Clinic.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';

const seedRoomsData = async () => {
    try {
        await connectDB();

        console.log('🌱 Starting database seeding...\n');

        // Find first clinic
        const clinic = await Clinic.findOne();

        if (!clinic) {
            console.log('⚠️  No clinic found. Please create a clinic first.');
            return;
        }

        console.log(`✓ Found clinic: ${clinic.name}`);

        // Clear existing rooms
        await Room.deleteMany({ clinic: clinic._id });
        console.log('✓ Cleared existing rooms');

        // Sample rooms
        const rooms = [
            {
                clinic: clinic._id,
                number: '101',
                name: 'Sala 1 - Cardiologia',
                type: 'consultation',
                status: 'available',
                capacity: 1,
                floor: '1º Andar',
                equipment: [
                    { name: 'ECG', quantity: 1, status: 'operational' },
                    { name: 'Estetoscópio', quantity: 2, status: 'operational' },
                    { name: 'Tensiómetro', quantity: 1, status: 'operational' }
                ],
                features: ['wheelchair-accessible', 'sink'],
                isActive: true
            },
            {
                clinic: clinic._id,
                number: '102',
                name: 'Sala 2 - Pediatria',
                type: 'consultation',
                status: 'occupied',
                capacity: 1,
                floor: '1º Andar',
                equipment: [
                    { name: 'Balança pediátrica', quantity: 1, status: 'operational' },
                    { name: 'Estetoscópio', quantity: 1, status: 'operational' }
                ],
                features: ['private-bathroom'],
                isActive: true
            },
            {
                clinic: clinic._id,
                number: '201',
                name: 'Sala 3 - Cirurgia Menor',
                type: 'procedure',
                status: 'available',
                capacity: 2,
                floor: '2º Andar',
                equipment: [
                    { name: 'Mesa cirúrgica', quantity: 1, status: 'operational' },
                    { name: 'Foco cirúrgico', quantity: 1, status: 'operational' },
                    { name: 'Instrumental cirúrgico', quantity: 1, status: 'operational' }
                ],
                features: ['examination-table', 'sink'],
                isActive: true
            },
            {
                clinic: clinic._id,
                number: '103',
                name: 'Sala 4 - Ortopedia',
                type: 'consultation',
                status: 'maintenance',
                capacity: 1,
                floor: '1º Andar',
                equipment: [
                    { name: 'Maca ortopédica', quantity: 1, status: 'maintenance' }
                ],
                notes: 'Manutenção agendada - retorno previsto 14:00',
                isActive: true
            },
            {
                clinic: clinic._id,
                number: 'ER-01',
                name: 'Sala de Emergência',
                type: 'emergency',
                status: 'available',
                capacity: 3,
                floor: 'Térreo',
                equipment: [
                    { name: 'Desfibrilador', quantity: 1, status: 'operational' },
                    { name: 'Monitor cardíaco', quantity: 2, status: 'operational' },
                    { name: 'Ventilador', quantity: 1, status: 'operational' },
                    { name: 'Carrinho de emergência', quantity: 1, status: 'operational' }
                ],
                features: ['wheelchair-accessible', 'oxygen', 'monitoring-equipment', 'sink'],
                isActive: true
            },
            {
                clinic: clinic._id,
                number: '104',
                name: 'Sala 5 - Medicina Geral',
                type: 'consultation',
                status: 'available',
                capacity: 1,
                floor: '1º Andar',
                equipment: [
                    { name: 'Maca', quantity: 1, status: 'operational' },
                    { name: 'Estetoscópio', quantity: 1, status: 'operational' },
                    { name: 'Tensiómetro', quantity: 1, status: 'operational' }
                ],
                features: ['examination-table'],
                isActive: true
            }
        ];

        const createdRooms = await Room.insertMany(rooms);
        console.log(`✓ Created ${createdRooms.length} rooms\n`);

        // Show room stats
        const stats = {
            total: createdRooms.length,
            available: createdRooms.filter(r => r.status === 'available').length,
            occupied: createdRooms.filter(r => r.status === 'occupied').length,
            maintenance: createdRooms.filter(r => r.status === 'maintenance').length
        };

        console.log('📊 Room Statistics:');
        console.log(`   Total: ${stats.total}`);
        console.log(`   Available: ${stats.available}`);
        console.log(`   Occupied: ${stats.occupied}`);
        console.log(`   Maintenance: ${stats.maintenance}`);
        console.log(`   Occupancy Rate: ${Math.round((stats.occupied / stats.total) * 100)}%\n`);

        console.log('✅ Seeding completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedRoomsData();
