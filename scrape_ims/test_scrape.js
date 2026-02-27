import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

const BASE_URL = 'https://rittransport.com';

async function scrapeRoutes() {
    try {
        console.log("Fetching index...");
        const response = await axios.get(`${BASE_URL}/js/51jan26.php`);
        const $ = cheerio.load(response.data);
        const routeLinks = [];

        $('a').each((i, el) => {
            let href = $(el).attr('href');
            if (href && href.includes('/routes/')) {
                href = href.trim();
                if (!href.startsWith('http')) {
                    href = href.startsWith('/') ? `${BASE_URL}${href}` : `${BASE_URL}/${href}`;
                }
                routeLinks.push(href);
            }
        });

        // Unique
        const uniqueLinks = [...new Set(routeLinks)];
        console.log(`Found ${uniqueLinks.length} unique routes. Scraping details...`);

        let sqlFile = `-- ---------------------------------------------------------\n-- AUTOMATICALLY GENERATED ROUTES FROM RITTRANSPORT.COM\n-- ---------------------------------------------------------\n\n`;
        sqlFile += `INSERT IGNORE INTO transport_routes (id, route_number, route_name, start_point, end_point, bus_number, capacity, coordinator_name, coordinator_phone) VALUES\n`;

        let routesSql = [];
        let stopsSql = `\n\n-- Boarding Points\nINSERT IGNORE INTO bus_stops (route_id, stop_name, pickup_time, stop_order, landmark) VALUES\n`;
        let stopsValues = [];

        let routeId = 1;

        for (const url of uniqueLinks) {
            console.log(`[${routeId}/${uniqueLinks.length}] Fetching: ${url}`);
            try {
                const res = await axios.get(url);
                const $page = cheerio.load(res.data);

                // Typical site structure:
                // Route No, Ex: "Route No 01"
                // Place / Area, Coordinator Name and Mobile

                let pageText = $page('body').text().replace(/\s+/g, ' ').trim();

                // Usually it's in tables or headings
                let routeNumber = `R${String(routeId).padStart(2, '0')}`;
                const routeMatch = $page('h2, h3, title, .card-title, .route-no').text().match(/Route No [:]?\s*([A-Za-z0-9]+)/i);
                if (routeMatch) {
                    routeNumber = routeMatch[1].trim();
                }

                // Name/Start Point
                let startPoint = "Chennai Area";
                // Let's grab the first non-empty th/td that looks like a stop name or title
                let routeName = `${routeNumber} Route`;

                // Coordinator
                let coordinator = "TBA";
                let phone = "N/A";
                const phMatch = pageText.match(/Mobile\s*[:-]?\s*(\d{10})/i);
                if (phMatch) {
                    phone = phMatch[1];
                }
                const coordMatch = pageText.match(/(?:Mr\.|Mrs\.|Ms\.)\s+[A-Za-z]+/i);
                if (coordMatch) {
                    coordinator = coordMatch[0];
                }

                routesSql.push(`(${routeId}, '${routeNumber}', '${routeName}', '${startPoint}', 'RIT Campus', 'TN-01-XX-${routeId}', 56, '${coordinator}', '${phone}')`);

                // Stops are usually in a table. pickup time is usually 00:00 format
                let stopOrder = 1;
                $page('table tr').each((i, row) => {
                    const cells = $page(row).find('td, th');
                    if (cells.length >= 2) {
                        let col1 = $page(cells[0]).text().trim();
                        let col2 = $page(cells[1]).text().trim();

                        // If it's a stop and time
                        let stopName = "";
                        let timeStr = "";

                        // Check if col2 looks like time
                        if (col2.match(/\d{1,2}:\d{2}/) || col2.match(/\d{1,2}\.\d{2}/)) {
                            stopName = col1.replace(/'/g, "''");
                            timeStr = col2.replace('.', ':').replace(/am|pm/i, '').trim() + ':00';
                            if (timeStr.length === 4) timeStr = '0' + timeStr; // '6:30' -> '06:30'

                            // If first stop, set start point and route name
                            if (stopOrder === 1) {
                                startPoint = stopName;
                                routeName = `${stopName} Route`;
                                // Update last inserted route string
                                routesSql[routeId - 1] = `(${routeId}, '${routeNumber}', '${routeName}', '${startPoint}', 'RIT Campus', 'TN-01-XX-${routeId}', 56, '${coordinator}', '${phone}')`;
                            }

                            stopsValues.push(`(${routeId}, '${stopName}', '${timeStr}', ${stopOrder}, 'Regular Stop')`);
                            stopOrder++;
                        }
                    }
                });

            } catch (err) {
                console.error(`Error fetching ${url}: ${err.message}`);
            }
            routeId++;
        }

        sqlFile += routesSql.join(',\n') + ';\n';
        sqlFile += stopsSql;
        sqlFile += stopsValues.join(',\n') + ';\n';

        fs.writeFileSync('all_routes_seed.sql', sqlFile);
        console.log("SQL script generated: all_routes_seed.sql");

    } catch (error) {
        console.error("Scraping failed:", error.message);
    }
}

scrapeRoutes();
