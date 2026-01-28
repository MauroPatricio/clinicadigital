import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

// Models
import Organization from './models/Organization.js';
import User from './models/User.js';
import Clinic from './models/Clinic.js';
import Room from './models/Room.js';
import Patient from './models/Patient.js';
import Appointment from './models/Appointment.js';
import Subscription from './models/Subscription.js';
import StaffPerformance from './models/StaffPerformance.js';
import InsuranceProvider from './models/InsuranceProvider.js';

dotenv.config();

const seedDatabase = async () => {
    try {
        await connectDB();

        console.log('🗑️  Clearing existing data...');
        await Organization.deleteMany({});
        await User.deleteMany({});
        await Clinic.deleteMany({});
        await Room.deleteMany({});
        await Patient.deleteMany({});
        await Appointment.deleteMany({});
        await Subscription.deleteMany({});
        await StaffPerformance.deleteMany({});
        await InsuranceProvider.deleteMany({});

        console.log('✅ Cleared all collections');

        // ============================================
        // 1. CREATE ORGANIZATION & OWNER
        // ============================================
        console.log('\n👑 Creating Organization & Owner...');

        const hashedPassword = await bcrypt.hash('admin123', 12);

        const owner = await User.create({
            email: 'owner@clinica.mz',
            password: hashedPassword,
            roleType: 'owner',
            role: 'admin', // Legacy
            profile: {
                firstName: 'Carlos',
                lastName: 'Moyana',
                phone: '+258 84 123 4567',
                gender: 'male'
            },
            permissions: [
                'manage_clinics', 'manage_staff', 'manage_patients', 'manage_appointments',
                'view_analytics', 'manage_billing', 'manage_medical_records',
                'manage_prescriptions', 'manage_lab_orders', 'view_reports',
                'manage_rooms', 'internal_chat', 'manage_subscriptions'
            ],
            isActive: true
        });

        const organization = await Organization.create({
            name: 'Rede Clínicas Moçambique',
            owner: owner._id,
            contact: {
                email: 'geral@clinicamz.co.mz',
                phone: '+258 21 123 456',
                address: {
                    street: 'Avenida Julius Nyerere, 1234',
                    city: 'Maputo',
                    state: 'Maputo',
                    country: 'Mozambique',
                    postalCode: '1100'
                }
            },
            businessInfo: {
                taxId: 'MZ123456789',
                registrationNumber: 'REG-2024-001'
            },
            branding: {
                logo: '/logos/clinica-logo.png',
                primaryColor: '#0066CC',
                secondaryColor: '#00CC99'
            }
        });

        owner.organization = organization._id;
        await owner.save();

        // Create Pro subscription
        await Subscription.create({
            organization: organization._id,
            plan: 'pro',
            status: 'active',
            basePrice: 25000,
            currency: 'MZN',
            billingCycle: 'monthly',
            startDate: new Date(),
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            limits: {
                maxClinics: 5,
                maxStaff: 50,
                maxAppointmentsPerMonth: 1000
            },
            features: {
                multiClinic: true,
                analytics: true,
                internalChat: true,
                telemedicine: true,
                advancedReports: true,
                customBranding: true
            }
        });

        console.log(`✅ Owner: ${owner.email} (password: admin123)`);
        console.log(`✅ Organization: ${organization.name}`);

        // ============================================
        // 2. CREATE CLINICS
        // ============================================
        console.log('\n🏥 Creating Clinics...');

        const clinicsData = [
            {
                name: 'Clínica Central - Maputo',
                address: {
                    street: 'Avenida 24 de Julho, 567',
                    city: 'Maputo',
                    state: 'Maputo',
                    country: 'Mozambique',
                    postalCode: '1100'
                },
                coordinates: { latitude: -25.9655, longitude: 32.5832 },
                contact: { phone: '+258 21 300 100', email: 'maputo@clinicamz.co.mz' },
                specialties: ['Clínica Geral', 'Pediatria', 'Cardiologia', 'Dermatologia'],
                facilities: ['laboratory', 'pharmacy', 'radiology']
            },
            {
                name: 'Clínica Matola',
                address: {
                    street: 'Rua da Matola, 123',
                    city: 'Matola',
                    state: 'Maputo',
                    country: 'Mozambique',
                    postalCode: '1200'
                },
                coordinates: { latitude: -25.9623, longitude: 32.4589 },
                contact: { phone: '+258 21 300 200', email: 'matola@clinicamz.co.mz' },
                specialties: ['Clínica Geral', 'Pediatria', 'Ginecologia'],
                facilities: ['laboratory', 'pharmacy']
            },
            {
                name: 'Clínica Beira',
                address: {
                    street: 'Avenida Samora Machel, 890',
                    city: 'Beira',
                    state: 'Sofala',
                    country: 'Mozambique',
                    postalCode: '2100'
                },
                coordinates: { latitude: -19.8436, longitude: 34.8389 },
                contact: { phone: '+258 23 300 300', email: 'beira@clinicamz.co.mz' },
                specialties: ['Clínica Geral', 'Ortopedia', 'Medicina Interna'],
                facilities: ['emergency', 'laboratory', 'pharmacy']
            }
        ];

        const clinics = [];
        for (const clinicData of clinicsData) {
            const clinic = await Clinic.create({
                organization: organization._id,
                ...clinicData,
                branding: {
                    primaryColor: organization.branding.primaryColor,
                    secondaryColor: organization.branding.secondaryColor,
                    theme: 'light'
                },
                settings: {
                    language: 'pt',
                    timezone: 'Africa/Maputo',
                    appointmentDuration: 30,
                    minIntervalBetweenAppointments: 15,
                    maxAppointmentsPerDay: 20,
                    allowOnlineBooking: true
                },
                status: 'active',
                isActive: true
            });

            clinics.push(clinic);
            console.log(`✅ Clinic: ${clinic.name} (${clinic.code})`);

            // Create rooms for this clinic
            const roomsData = [
                { number: '101', name: 'Consultório 1', type: 'consultation', floor: '1' },
                { number: '102', name: 'Consultório 2', type: 'consultation', floor: '1' },
                { number: '103', name: 'Consultório 3', type: 'consultation', floor: '1' },
                { number: '201', name: 'Sala de Procedimentos', type: 'procedure', floor: '2' },
                { number: '202', name: 'Sala de Emergência', type: 'emergency', floor: '2' }
            ];

            for (const roomData of roomsData) {
                await Room.create({
                    clinic: clinic._id,
                    ...roomData,
                    capacity: 1,
                    status: 'available',
                    equipment: [
                        { name: 'Mesa de exame', quantity: 1, status: 'operational' },
                        { name: 'Esfigmomanômetro', quantity: 1, status: 'operational' }
                    ],
                    features: ['examination-table', 'sink'],
                    isActive: true
                });
            }
        }

        // ============================================
        // 3. CREATE MANAGERS & STAFF
        // ============================================
        console.log('\n👨‍⚕️ Creating Managers & Staff...');

        const staffMembers = [];

        for (let i = 0; i < clinics.length; i++) {
            const clinic = clinics[i];

            // Create Manager for each clinic
            const manager = await User.create({
                email: `manager${i + 1}@clinicamz.co.mz`,
                password: hashedPassword,
                roleType: 'manager',
                role: 'admin', // Legacy
                clinic: clinic._id,
                profile: {
                    firstName: ['Ana', 'Pedro', 'Maria'][i],
                    lastName: ['Santos', 'Silva', 'Costa'][i],
                    phone: `+258 84 200 ${100 + i}`,
                    gender: ['female', 'male', 'female'][i]
                },
                permissions: [
                    'manage_staff', 'manage_patients', 'manage_appointments',
                    'view_analytics', 'manage_billing', 'manage_rooms', 'internal_chat'
                ],
                isActive: true
            });

            clinic.manager = manager._id;
            await clinic.save();
            console.log(`  ✅ Manager: ${manager.email} → ${clinic.name}`);

            // Create Staff (Doctors, Nurses, Receptionists) for each clinic
            const staffData = [
                { firstName: 'Dr. João', lastName: 'Mateus', staffRole: 'doctor', specialty: 'Clínica Geral', email: `doctor1.clinic${i + 1}@clinicamz.co.mz` },
                { firstName: 'Dra. Sofia', lastName: 'Armando', staffRole: 'doctor', specialty: 'Pediatria', email: `doctor2.clinic${i + 1}@clinicamz.co.mz` },
                { firstName: 'Enf. Beatriz', lastName: 'Nunes', staffRole: 'nurse', specialty: null, email: `nurse1.clinic${i + 1}@clinicamz.co.mz` },
                { firstName: 'Recep. Lucas', lastName: 'Fernandes', staffRole: 'receptionist', specialty: null, email: `reception.clinic${i + 1}@clinicamz.co.mz` }
            ];

            for (const data of staffData) {
                const staff = await User.create({
                    email: data.email,
                    password: hashedPassword,
                    roleType: 'staff',
                    staffRole: data.staffRole,
                    role: data.staffRole === 'doctor' ? 'doctor' : data.staffRole === 'nurse' ? 'nurse' : 'receptionist', // Legacy
                    clinic: clinic._id,
                    profile: {
                        firstName: data.firstName,
                        lastName: data.lastName,
                        phone: `+258 84 ${300 + staffMembers.length}`,
                        gender: data.firstName.includes('Dra.') || data.firstName.includes('Beatriz') ? 'female' : 'male'
                    },
                    specialties: data.specialty ? [data.specialty] : [],
                    licenseNumber: data.staffRole === 'doctor' ? `MED-${10000 + staffMembers.length}` : null,
                    permissions: [
                        'manage_patients', 'manage_appointments', 'manage_medical_records',
                        'manage_prescriptions', 'manage_lab_orders'
                    ],
                    availability: {
                        monday: { start: '08:00', end: '17:00', available: true },
                        tuesday: { start: '08:00', end: '17:00', available: true },
                        wednesday: { start: '08:00', end: '17:00', available: true },
                        thursday: { start: '08:00', end: '17:00', available: true },
                        friday: { start: '08:00', end: '17:00', available: true },
                        saturday: { start: '08:00', end: '12:00', available: true },
                        sunday: { available: false }
                    },
                    isActive: true
                });

                staffMembers.push(staff);
                console.log(`    ✅ ${data.staffRole}: ${data.email}`);
            }
        }

        // ============================================
        // 4. CREATE INSURANCE PROVIDERS
        // ============================================
        console.log('\n💳 Creating Insurance Providers...');

        const insuranceProviders = await InsuranceProvider.create([
            {
                name: 'EMOSE - Empresa Moçambicana de Seguros',
                type: 'private',
                contact: {
                    email: 'info@emose.co.mz',
                    phone: '+258 21 400 100',
                    address: { city: 'Maputo', country: 'Mozambique' }
                },
                coverage: {
                    consultations: { covered: true, coveragePercentage: 100, copay: 0 },
                    medications: { covered: true, coveragePercentage: 80 },
                    labTests: { covered: true, coveragePercentage: 90 }
                },
                contract: { status: 'active', startDate: new Date('2024-01-01') },
                isActive: true
            },
            {
                name: 'MCS - Mozambique Companhia de Seguros',
                type: 'private',
                contact: {
                    email: 'contacto@mcs.co.mz',
                    phone: '+258 21 400 200',
                    address: { city: 'Maputo', country: 'Mozambique' }
                },
                coverage: {
                    consultations: { covered: true, coveragePercentage: 90, copay: 50 },
                    medications: { covered: true, coveragePercentage: 70 },
                    labTests: { covered: true, coveragePercentage: 80 }
                },
                contract: { status: 'active', startDate: new Date('2024-01-01') },
                isActive: true
            }
        ]);

        console.log(`✅ Created ${insuranceProviders.length} insurance providers`);

        // ============================================
        // 5. CREATE PATIENTS
        // ============================================
        console.log('\n👥 Creating Patients...');

        const patients = [];
        const patientNames = [
            { first: 'Alberto', last: 'Machado', gender: 'male' },
            { first: 'Carla', last: 'Neves', gender: 'female' },
            { first: 'Daniel', last: 'Souza', gender: 'male' },
            { first: 'Elisa', last: 'Ferreira', gender: 'female' },
            { first: 'Fernando', last: 'Costa', gender: 'male' },
            { first: 'Gabriela', last: 'Lima', gender: 'female' },
            { first: 'Hugo', last: 'Pereira', gender: 'male' },
            { first: 'Isabel', last: 'Martins', gender: 'female' },
            { first: 'Jorge', last: 'Alves', gender: 'male' },
            { first: 'Lara', last: 'Rodrigues', gender: 'female' }
        ];

        for (let i = 0; i < patientNames.length; i++) {
            const { first, last, gender } = patientNames[i];
            const patient = await Patient.create({
                profile: {
                    firstName: first,
                    lastName: last,
                    dateOfBirth: new Date(1980 + i, i % 12, (i + 1) * 2),
                    gender,
                    avatar: null
                },
                contact: {
                    phone: `+258 84 ${400 + i}00`,
                    email: `${first.toLowerCase()}.${last.toLowerCase()}@email.mz`,
                    address: {
                        street: `Rua ${i + 1}`,
                        city: i % 3 === 0 ? 'Maputo' : i % 3 === 1 ? 'Matola' : 'Beira',
                        country: 'Mozambique'
                    }
                },
                emergencyContact: {
                    name: `Emergência ${first}`,
                    relationship: 'Familiar',
                    phone: `+258 84 ${500 + i}00`
                },
                clinics: [
                    {
                        clinic: clinics[i % 3]._id,
                        firstVisit: new Date(2024, 0, 1 + i),
                        lastVisit: new Date(),
                        totalVisits: 2 + i
                    }
                ],
                insurance: {
                    provider: insuranceProviders[i % 2].name,
                    policyNumber: `POL-${100000 + i}`
                },
                isActive: true
            });

            patients.push(patient);
        }

        console.log(`✅ Created ${patients.length} patients`);

        // ============================================
        // 6. CREATE APPOINTMENTS
        // ============================================
        console.log('\n📅 Creating Appointments...');

        const doctors = staffMembers.filter(s => s.staffRole === 'doctor');
        const appointmentCount = 30;

        for (let i = 0; i < appointmentCount; i++) {
            const doctor = doctors[i % doctors.length];
            const patient = patients[i % patients.length];
            const clinic = clinics.find(c => c._id.equals(doctor.clinic));
            const rooms = await Room.find({ clinic: clinic._id });

            const daysAgo = Math.floor(i / 3); // Spread over last 10 days
            const appointmentDate = new Date();
            appointmentDate.setDate(appointmentDate.getDate() - daysAgo);
            appointmentDate.setHours(9 + (i % 8), 0, 0, 0);

            const statuses = ['scheduled', 'confirmed', 'completed', 'completed', 'completed', 'no-show'];
            const status = statuses[i % statuses.length];

            const appointment = await Appointment.create({
                clinic: clinic._id,
                room: rooms[i % rooms.length]?._id,
                patient: patient._id,
                doctor: doctor._id,
                priority: i % 10 === 0 ? 'urgent' : 'normal',
                type: 'presencial',
                specialty: doctor.specialties[0] || 'Clínica Geral',
                dateTime: appointmentDate,
                duration: 30,
                status,
                reason: ['Consulta de rotina', 'Dor de cabeça', 'Febre', 'Controlo'][i % 4],
                notes: 'Consulta agendada via sistema',
                confirmedAt: status !== 'scheduled' ? new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000) : null,
                checkedInAt: status === 'completed' ? new Date(appointmentDate.getTime() - 10 * 60 * 1000) : null,
                startedAt: status === 'completed' ? appointmentDate : null,
                completedAt: status === 'completed' ? new Date(appointmentDate.getTime() + 30 * 60 * 1000) : null
            });
        }

        console.log(`✅ Created ${appointmentCount} appointments`);

        // ============================================
        // SUMMARY
        // ============================================
        console.log('\n' + '='.repeat(50));
        console.log('✅ DATABASE SEEDED SUCCESSFULLY!');
        console.log('='.repeat(50));
        console.log('\n📊 Summary:');
        console.log(`  - 1 Organization: ${organization.name}`);
        console.log(`  - 1 Owner: owner@clinica.mz (password: admin123)`);
        console.log(`  - ${clinics.length} Clinics`);
        console.log(`  - ${clinics.length} Managers (manager1@clinicamz.co.mz, etc.)`);
        console.log(`  - ${staffMembers.length} Staff members (doctors, nurses, receptionists)`);
        console.log(`  - ${patients.length} Patients`);
        console.log(`  - ${appointmentCount} Appointments`);
        console.log(`  - ${insuranceProviders.length} Insurance Providers`);
        console.log(`  - 15 Rooms (5 per clinic)`);
        console.log('\n🔑 Login Credentials (all passwords: admin123):');
        console.log('  - Owner: owner@clinica.mz');
        console.log('  - Manager 1: manager1@clinicamz.co.mz');
        console.log('  - Manager 2: manager2@clinicamz.co.mz');
        console.log('  - Manager 3: manager3@clinicamz.co.mz');
        console.log('  - Doctor (Clinic 1): doctor1.clinic1@clinicamz.co.mz');
        console.log('\n🚀 Start the server with: npm run dev');
        console.log('='.repeat(50) + '\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
