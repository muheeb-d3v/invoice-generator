// Native fetch used

// Actually Node 18+ has global fetch.

const API_URL = 'http://localhost:3001/api/auth/signup';

async function testSignup() {
    const email = `test_debug_${Date.now()}@example.com`;
    const password = 'password123';

    console.log('Attempting signup with:', email);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);

        const text = await response.text();
        console.log('Raw Response Body:', text);

        try {
            const json = JSON.parse(text);
            console.log('Parsed JSON:', json);
        } catch (e) {
            console.log('Response is not JSON');
        }

    } catch (error) {
        console.error('Network/Fetch Error:', error);
    }
}

testSignup();
