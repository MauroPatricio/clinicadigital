import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api';
let testResults = [];

async function runTest(testId, testName, testFn) {
    try {
        console.log(`\n🔍 ${testId}: ${testName}`);
        await testFn();
        console.log(`✅ PASSED`);
        testResults.push({ id: testId, name: testName, status: 'PASSED' });
    } catch (error) {
        console.log(`❌ FAILED: ${error.message}`);
        testResults.push({ id: testId, name: testName, status: 'FAILED', error: error.message });
    }
}

async function getAuthToken() {
    const res = await axios.post(`${API_URL}/auth/login`, {
        email: 'admin@clinica.com',
        password: 'admin123'
    });
    return res.data.data.accessToken;
}

async function runAllTests() {
    console.log('═══════════════════════════════════════════');
    console.log('   CLÍNICA DIGITAL - AUTOMATED TESTS');
    console.log('═══════════════════════════════════════════\n');

    // ===== AUTHENTICATION TESTS =====
    console.log('\n📋 1. AUTHENTICATION TESTS');

    await runTest('1.1', 'Login with valid credentials', async () => {
        const res = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@clinica.com',
            password: 'admin123'
        });
        if (!res.data.data.accessToken) throw new Error('No token received');
    });

    await runTest('1.2', 'Login with invalid password', async () => {
        try {
            await axios.post(`${API_URL}/auth/login`, {
                email: 'admin@clinica.com',
                password: 'wrong_password'
            });
            throw new Error('Should have failed');
        } catch (err) {
            if (err.response?.status !== 401) throw err;
        }
    });

    await runTest('1.3', 'Login with invalid email', async () => {
        try {
            await axios.post(`${API_URL}/auth/login`, {
                email: 'invalid@test.com',
                password: 'admin123'
            });
            throw new Error('Should have failed');
        } catch (err) {
            if (err.response?.status !== 401) throw err;
        }
    });

    // ===== USER MANAGEMENT TESTS =====
    console.log('\n📋 2. USER MANAGEMENT TESTS');
    const token = await getAuthToken();
    const config = { headers: { Authorization: `Bearer ${token}` } };

    await runTest('2.1', 'Get all doctors', async () => {
        const res = await axios.get(`${API_URL}/doctors`, config);
        if (!Array.isArray(res.data.data)) throw new Error('Invalid response format');
        console.log(`   Found ${res.data.count} doctors`);
    });

    await runTest('2.2', 'Get all patients', async () => {
        const res = await axios.get(`${API_URL}/patients`, config);
        if (!Array.isArray(res.data.data)) throw new Error('Invalid response format');
        console.log(`   Found ${res.data.count} patients`);
    });

    // ===== APPOINTMENT TESTS =====
    console.log('\n📋 3. APPOINTMENT TESTS');

    await runTest('3.1', 'Get all appointments', async () => {
        const res = await axios.get(`${API_URL}/appointments`, config);
        if (!Array.isArray(res.data.data)) throw new Error('Invalid response format');
        console.log(`   Found ${res.data.count} appointments`);
    });

    await runTest('3.2', 'Create new appointment', async () => {
        // Get test data
        const patientsRes = await axios.get(`${API_URL}/patients`, config);
        const doctorsRes = await axios.get(`${API_URL}/doctors`, config);

        if (patientsRes.data.data.length === 0) throw new Error('No patients available');
        if (doctorsRes.data.data.length === 0) throw new Error('No doctors available');

        const patient = patientsRes.data.data[0];
        const doctor = doctorsRes.data.data[0];

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointmentData = {
            patientId: patient._id,
            doctorId: doctor._id,
            date: tomorrow.toISOString().split('T')[0],
            time: '14:00',
            type: 'presencial',
            reason: 'Automated Test Appointment - ' + new Date().toISOString()
        };

        const res = await axios.post(`${API_URL}/appointments`, appointmentData, config);
        if (!res.data.data._id) throw new Error('No appointment ID returned');
        console.log(`   Created appointment: ${res.data.data._id}`);
    });

    // ===== SUMMARY =====
    console.log('\n═══════════════════════════════════════════');
    console.log('   TEST RESULTS SUMMARY');
    console.log('═══════════════════════════════════════════\n');

    const passed = testResults.filter(t => t.status === 'PASSED').length;
    const failed = testResults.filter(t => t.status === 'FAILED').length;

    console.log(`✅ PASSED: ${passed}`);
    console.log(`❌ FAILED: ${failed}`);
    console.log(`📊 TOTAL:  ${testResults.length}\n`);

    if (failed > 0) {
        console.log('\nFailed Tests:');
        testResults.filter(t => t.status === 'FAILED').forEach(t => {
            console.log(`  - ${t.id}: ${t.name}`);
            console.log(`    Error: ${t.error}`);
        });
    }

    process.exit(failed > 0 ? 1 : 0);
}

runAllTests();
