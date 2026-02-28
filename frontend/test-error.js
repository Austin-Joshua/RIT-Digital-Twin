import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Collect console errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('PAGE LOG ERROR:', msg.text());
        }
    });

    page.on('pageerror', err => {
        console.log('PAGE EXCEPTION:', err.toString());
    });

    await page.goto('https://digital-twin-lemon.vercel.app/', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);

    await browser.close();
})();
