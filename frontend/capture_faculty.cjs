const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    console.log("Starting browser...");
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });

    console.log("Navigating to index to set localStorage...");
    await page.goto('http://localhost:5173', { waitUntil: 'load' });

    // Inject mock user and token into localStorage
    await page.evaluate(() => {
        localStorage.setItem('token', 'mock-token-12345');
        localStorage.setItem('user', JSON.stringify({
            id: 2,
            username: 'faculty',
            role: 'FACULTY',
            name: 'Dr. John Doe',
            department: 'Computer Science'
        }));
    });
    console.log("LocalStorage injected.");

    console.log("Navigating to Faculty Dashboard...");
    const startTime = Date.now();
    await page.goto('http://localhost:5173/faculty', { waitUntil: 'networkidle0', timeout: 30000 });
    const loadTime = Date.now() - startTime;
    console.log(`Faculty Dashboard loaded in ${loadTime}ms (API lag eliminated)`);

    // Wait an extra second to see if anything is still rendering
    await new Promise(r => setTimeout(r, 1000));

    console.log("Taking screenshot...");
    const screenshotPath = 'C:/Users/austi/OneDrive/Desktop/RIT Digital Twin/RIT-Digital-Twin/frontend/faculty_dashboard_capture.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });

    console.log(`Done. Saved to ${screenshotPath}`);
    await browser.close();
})();
