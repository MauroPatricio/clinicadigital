import fetch from 'node-fetch';

async function testLogin() {
    try {
        console.log('Testing login...');
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@clinica.com',
                password: 'admin123'
            })
        });

        const data = await response.json();

        console.log('Login Status:', response.status);
        if (data.success) {
            console.log('SUCCESS: User authenticated!');
            console.log('User Name:', data.data.user.profile.firstName);
            console.log('Token received:', !!data.data.accessToken);
        } else {
            console.log('FAILED:', data);
        }
    } catch (error) {
        console.error('Login Error:', error.message);
    }
}

testLogin();
