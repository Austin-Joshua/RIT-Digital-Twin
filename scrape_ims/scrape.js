import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    console.log("Navigating to login page...");
    await page.goto('https://ims.ritchennai.edu.in/login', { waitUntil: 'networkidle2' });

    console.log("Typing credentials...");
    // Based on common forms, it's usually name="username" / "email" / "password"
    // Let's type using generic selectors. We will try input[type="text"] or input[name="username"]
    const inputs = await page.$$('input');
    for (let input of inputs) {
        const type = await input.evaluate(el => el.type);
        const name = await input.evaluate(el => el.name);

        if (type === 'text' || name.toLowerCase().includes('user') || name.toLowerCase().includes('email')) {
            await input.type('2117240020044');
        } else if (type === 'password' || name.toLowerCase().includes('pass')) {
            await input.type('9344208046');
        }
    }

    console.log("Clicking login...");
    const buttons = await page.$$('button, input[type="submit"]');
    for (let btn of buttons) {
        const text = await btn.evaluate(el => el.innerText || el.value);
        if (text && text.toLowerCase().includes('log')) {
            await btn.click();
            break;
        }
    }

    console.log("Waiting for navigation...");
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(e => console.log('Navigation timeout, continuing anyway'));

    console.log("Extracting menu items...");
    // Assuming a sidebar exists with links, we'll just extract all text from anchor tags or lists inside likely sidebar containers.
    const menuItems = await page.evaluate(() => {
        const items = [];
        const links = document.querySelectorAll('a, .menu-item, .nav-link, li');
        links.forEach(l => {
            const text = l.innerText.trim();
            if (text && text.length > 2 && text.length < 50) {
                items.push(text);
            }
        });
        return Array.from(new Set(items)); // unique
    });

    console.log("Menu Items Found:");
    console.log(menuItems);

    await page.screenshot({ path: 'ims_dashboard.png', fullPage: true });
    fs.writeFileSync('ims_menu.json', JSON.stringify(menuItems, null, 2));

    await browser.close();
})();
