async function test() {
    try {
        const res = await fetch('http://localhost:3000/api/send-welcome-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'mankanivansh273@gmail.com',
                name: 'Test User',
                role: 'wholesaler'
            }),
        });
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

test();
