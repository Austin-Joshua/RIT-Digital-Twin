const https = require('https');

function ping() {
    https.get('https://rit-digital-twin.onrender.com/actuator/health', (res) => {
        console.log(`Status Code: ${res.statusCode}`);
        if (res.statusCode === 200) {
            console.log("Backend is LIVE!");
            process.exit(0);
        } else {
            console.log("Still booting...");
            setTimeout(ping, 5000);
        }
    }).on('error', (e) => {
        console.log(`Error: ${e.message}`);
        setTimeout(ping, 5000);
    });
}

console.log("Polling Render backend...");
ping();
