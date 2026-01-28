const axios = require('axios');

async function testLogin() {
    try {
        console.log('Testing login...');
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@clinica.com',
            password: 'admin123'
        });

        console.log('Login Status:', response.status);
        if (response.data.success) {
            console.log('SUCCESS: User authenticated!');
            console.log('User Name:', response.data.data.user.profile.firstName);
            console.log('Token received:', !!response.data.data.accessToken);
        } else {
            console.log('FAILED:', response.data);
        }
    } catch (error) {
        console.error('Login Error:', error.response ? error.response.data : error.message);
    }
}

testLogin();
