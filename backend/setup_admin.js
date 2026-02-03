import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Organization from './src/models/Organization.js';

dotenv.config();

const setupAdminWithOrganization = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        const adminEmail = 'admin@clinica.com';

        // Delete existing admin if exists
        const userExists = await User.findOne({ email: adminEmail });
        if (userExists) {
            console.log('Admin exists. Deleting to recreate...');
            // Also delete the organization if it exists
            if (userExists.organization) {
                await Organization.deleteOne({ _id: userExists.organization });
                console.log('Associated organization deleted.');
            }
            await User.deleteOne({ email: adminEmail });
        }

        // Step 1: Create Admin User FIRST (without organization)
        console.log('\n👤 Creating Admin User...');
        const adminUser = await User.create({
            email: adminEmail,
            password: 'admin123',
            role: 'admin', // Legacy role
            roleType: 'owner', // NEW ROLE TYPE - THIS IS KEY!
            profile: {
                firstName: 'Admin',
                lastName: 'User',
                phone: '+258 84 000 0000'
            },
            // ONLY USE VALID ENUM VALUES FROM THE SCHEMA
            permissions: [
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
            ],
            isActive: true
        });

        console.log('✅ Admin user created:', adminUser.email);
        console.log('   User ID:', adminUser._id);
        console.log('   Role Type:', adminUser.roleType);

        // Step 2: Create Organization with admin as owner
        console.log('\n📋 Creating Demo Organization...');
        const organization = await Organization.create({
            name: 'Demo Clinic Organization',
            owner: adminUser._id, // Set the admin as owner
            subscription: {
                plan: 'enterprise', // Valid enum: 'basic', 'pro', 'enterprise'
                status: 'active',
                startDate: new Date(),
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
                billingCycle: 'annual',
                price: 0,
                currency: 'MZN'
            },
            limits: {
                maxClinics: 999,
                maxStaff: 999,
                maxAppointmentsPerMonth: 99999,
                features: {
                    analytics: true,
                    internalChat: true,
                    telemedicine: true,
                    multiClinic: true
                }
            },
            contact: {
                email: 'contato@democlinic.com',
                phone: '+258 84 000 0000',
                address: {
                    street: 'Avenida Julius Nyerere',
                    city: 'Maputo',
                    state: 'Maputo',
                    country: 'Mozambique',
                    postalCode: '1100'
                }
            },
            isActive: true
        });

        console.log('✅ Organization created:', organization.name);
        console.log('   Organization ID:', organization._id);
        console.log('   Organization Code:', organization.code);

        // Step 3: Update admin user with organization reference
        console.log('\n🔗 Linking Admin to Organization...');
        adminUser.organization = organization._id;
        await adminUser.save();

        console.log('✅ Admin linked to organization');

        // Verify
        console.log('\n🔍 Verification...');
        const verifyUser = await User.findOne({ email: adminEmail })
            .select('+password')
            .populate('organization');

        if (verifyUser && verifyUser.organization) {
            console.log('\n✅ User verified in database:');
            console.log('   Email:', verifyUser.email);
            console.log('   Role:', verifyUser.role);
            console.log('   Role Type:', verifyUser.roleType);
            console.log('   Organization ID:', verifyUser.organization._id);
            console.log('   Organization Name:', verifyUser.organization.name);
            console.log('   Organization Code:', verifyUser.organization.code);
            console.log('   Subscription Status:', verifyUser.organization.subscription.status);
            console.log('   Subscription Plan:', verifyUser.organization.subscription.plan);
            console.log('   Subscription Expiry:', new Date(verifyUser.organization.subscription.expiryDate).toLocaleDateString());

            // Check if subscription is active
            if (verifyUser.organization.isSubscriptionActive()) {
                console.log('   ✅ Subscription is ACTIVE');
            } else {
                console.log('   ❌ Subscription is NOT active');
            }
        }

        console.log('\n');
        console.log('='.repeat(60));
        console.log('✨ SETUP COMPLETE! ✨');
        console.log('='.repeat(60));
        console.log('\n📝 Login Credentials:');
        console.log('   Email:    admin@clinica.com');
        console.log('   Password: admin123');
        console.log('\n🚀 Next Steps:');
        console.log('   1. Go to: http://localhost:3000');
        console.log('   2. Login with credentials above');
        console.log('   3. You can now create clinics!');
        console.log('   4. Start E2E testing!');
        console.log('\n');

        process.exit(0);
    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
        if (error.errors) {
            console.error('\nValidation Errors:');
            Object.keys(error.errors).forEach(key => {
                console.error(`  - ${key}: ${error.errors[key].message}`);
            });
        }
        console.error(error);
        process.exit(1);
    }
};

setupAdminWithOrganization();
