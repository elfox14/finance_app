async function test() {
    try {
        console.log('Testing route registration...');
        const res = await fetch('http://localhost:10000/api/expenses').catch(err => {
            return { status: 500, statusText: err.message };
        });
        
        console.log('GET /api/expenses status:', res.status);
        if (res.status === 401) {
            console.log('✅ Route exists (protected)');
        } else if (res.status === 404) {
            console.log('❌ Route NOT found (404)');
        } else {
            console.log('Response status:', res.status);
        }

        const postRes = await fetch('http://localhost:10000/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: 100 })
        }).catch(err => {
            return { status: 500, statusText: err.message };
        });
        console.log('POST /api/expenses status:', postRes.status);

    } catch (err) {
        console.error('Test failed:', err.message);
    }
}

test();
