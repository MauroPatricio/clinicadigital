import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const seed = async () => {
    try {
        console.log('Authenticating...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@clinica.com',
            password: 'admin123'
        });
        const token = loginRes.data.data.accessToken;
        console.log('Logged in. Token obtained.');

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        console.log('Creating Doctor...');
        try {
            const docRes = await axios.post(`${API_URL}/doctors`, {
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@cl.com',
                phone: '555-0101',
                password: 'password123',
                specialization: 'cardiologia',
                licenseNumber: 'DOC12345',
                doctorNumber: 'DOC000001' // Explicitly providing it to satisfy Schema if needed, or ignored
            }, config);
            console.log('Doctor Created:', docRes.data.data._id);
        } catch (err) {
            console.log('Doctor creation failed (likely exists):', err.response?.data?.message || err.message);
        }

        console.log('Creating Patient...');
        try {
            const patRes = await axios.post(`${API_URL}/patients`, {
                firstName: 'Alice',
                lastName: 'Wonder',
                email: 'alice.wonder@cl.com',
                phone: '555-0202',
                password: 'password123',
                dateOfBirth: '1990-01-01',
                gender: 'female',
                address: {
                    street: '123 Wonderland',
                    city: 'Fantasy',
                    state: 'FC',
                    postalCode: '12345'
                },
                bloodType: 'A+',
                insurance: {
                    provider: 'Health',
                    policyNumber: '123'
                },
                patientNumber: 'PAT000001' // Explicitly providing
            }, config);
            console.log('Patient Created:', patRes.data.data._id);
        } catch (err) {
            console.log('Patient creation failed (likely exists):', err.response?.data?.message || err.message);
        }

    } catch (error) {
        console.error('Seeding Error:', error.response?.data?.message || error.message);
    }
};

seed();
