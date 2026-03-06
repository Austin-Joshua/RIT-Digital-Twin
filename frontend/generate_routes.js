const fs = require('fs');
const javaCode = fs.readFileSync('../backend/src/main/java/com/university/erp/config/DataInitializer.java', 'utf8');

const routes = [];

// Extract basic routes
const basicRoutesMatch = javaCode.match(/String\[\]\[\] basicRoutes = \{\s*([\s\S]*?)\s*\};/);
if (basicRoutesMatch) {
    const basicContent = basicRoutesMatch[1];
    const regex = /\{\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)"\s*\}/g;
    let match;
    while ((match = regex.exec(basicContent)) !== null) {
        routes.push({
            id: routes.length + 1,
            routeNumber: match[1],
            routeName: match[2] + " Route",
            startPoint: match[2],
            endPoint: "RIT Campus",
            busNumber: "TN-RIT-" + match[1],
            capacity: 60,
            currentOccupancy: Math.floor(Math.random() * 20) + 40,
            coordinatorName: "A. Kalesha",
            coordinatorPhone: "6380751700",
            stops: [
                { id: 1, stopName: match[2], pickupTime: match[3], landmark: "Bus Stand" },
                { id: 2, stopName: match[2] + " Junction", pickupTime: "0" + (parseInt(match[3].split(':')[0]) + Math.floor((parseInt(match[3].split(':')[1]) + 15) / 60)) + ":" + ((parseInt(match[3].split(':')[1]) + 15) % 60).toString().padStart(2, '0'), landmark: "Main Road" },
                { id: 3, stopName: "RIT Campus", pickupTime: "07:40", landmark: "College Gate" }
            ]
        });
    }
}

// Extract detailed routes like R01, R02, etc. (we can just manually add them or parse, but manual is easier for 5 routes)
routes.push({
    id: routes.length + 1, routeNumber: "R01", routeName: "Ennore", startPoint: "Ennore", endPoint: "RIT Campus", busNumber: "TN-RIT-R01", capacity: 60, currentOccupancy: 55, coordinatorName: "A. Kalesha", coordinatorPhone: "6380751700",
    stops: [
        { id: 1, stopName: "Ennore", pickupTime: "05:50", landmark: "Railway Station" },
        { id: 2, stopName: "Ernavoor", pickupTime: "05:54", landmark: "Junction" },
        { id: 3, stopName: "Theradi", pickupTime: "06:03", landmark: "Metro" },
        { id: 4, stopName: "Tollgate", pickupTime: "06:18", landmark: "Plaza" },
        { id: 5, stopName: "New Washermenpet", pickupTime: "06:27", landmark: "Police Station" },
        { id: 6, stopName: "Mint", pickupTime: "06:37", landmark: "Clock Tower" },
        { id: 7, stopName: "Basin Bridge", pickupTime: "06:41", landmark: "Bridge" },
        { id: 8, stopName: "RIT Campus", pickupTime: "07:40", landmark: "College Gate" }
    ]
});

routes.push({
    id: routes.length + 1, routeNumber: "R02", routeName: "Triplicane", startPoint: "Triplicane", endPoint: "RIT Campus", busNumber: "TN-RIT-R02", capacity: 60, currentOccupancy: 50, coordinatorName: "N. Sudhakar", coordinatorPhone: "7548862447",
    stops: [
        { id: 1, stopName: "Triplicane", pickupTime: "06:20", landmark: "High School" },
        { id: 2, stopName: "Light House", pickupTime: "06:32", landmark: "Beach" },
        { id: 3, stopName: "Mylapore Tank", pickupTime: "06:37", landmark: "Temple" },
        { id: 4, stopName: "Adyar", pickupTime: "06:50", landmark: "Signal" },
        { id: 5, stopName: "Guindy", pickupTime: "07:08", landmark: "Metro Station" },
        { id: 6, stopName: "RIT Campus", pickupTime: "07:40", landmark: "College Gate" }
    ]
});

routes.push({
    id: routes.length + 1, routeNumber: "R11", routeName: "Chengalpattu", startPoint: "Chengalpattu", endPoint: "RIT Campus", busNumber: "TN-RIT-R11", capacity: 60, currentOccupancy: 52, coordinatorName: "A. Kalesha", coordinatorPhone: "6380751700",
    stops: [
        { id: 1, stopName: "New Bus Stand", pickupTime: "06:00", landmark: "Platform 1" },
        { id: 2, stopName: "Singaperumal Koil", pickupTime: "06:15", landmark: "Temple Junction" },
        { id: 3, stopName: "Maraimalai Nagar", pickupTime: "06:22", landmark: "Ford Gate" },
        { id: 4, stopName: "Guduvanchery", pickupTime: "06:35", landmark: "Bus Stop" },
        { id: 5, stopName: "Vandalur", pickupTime: "06:42", landmark: "Zoo Entrance" },
        { id: 6, stopName: "Tambaram Gate", pickupTime: "06:55", landmark: "Airforce Station" },
        { id: 7, stopName: "RIT Campus", pickupTime: "07:40", landmark: "College Gate" }
    ]
});

routes.push({
    id: routes.length + 1, routeNumber: "R14", routeName: "Thiruvallur", startPoint: "Thiruvallur", endPoint: "RIT Campus", busNumber: "TN-RIT-R14", capacity: 60, currentOccupancy: 58, coordinatorName: "N. Sudhakar", coordinatorPhone: "7548862447",
    stops: [
        { id: 1, stopName: "Thiruvallur", pickupTime: "06:25", landmark: "Bus Stand" },
        { id: 2, stopName: "Collector Office", pickupTime: "06:30", landmark: "Main Gate" },
        { id: 3, stopName: "Putlur", pickupTime: "06:40", landmark: "Railway Station" },
        { id: 4, stopName: "Veppampattu", pickupTime: "06:45", landmark: "Junction" },
        { id: 5, stopName: "Sevvapet", pickupTime: "06:50", landmark: "Temple" },
        { id: 6, stopName: "RIT Campus", pickupTime: "07:40", landmark: "College Gate" }
    ]
});

routes.push({
    id: routes.length + 1, routeNumber: "R22", routeName: "Thiruthani", startPoint: "Thiruthani", endPoint: "RIT Campus", busNumber: "TN-RIT-R22", capacity: 60, currentOccupancy: 45, coordinatorName: "A. Kalesha", coordinatorPhone: "6380751700",
    stops: [
        { id: 1, stopName: "Thiruthani Bypass", pickupTime: "05:55", landmark: "Bypass" },
        { id: 2, stopName: "Nagalamman Nagar", pickupTime: "06:08", landmark: "Entrance" },
        { id: 3, stopName: "Jothi Nagar", pickupTime: "06:12", landmark: "Park" },
        { id: 4, stopName: "New Bus Stand", pickupTime: "06:22", landmark: "Platform" },
        { id: 5, stopName: "Navy Gate", pickupTime: "06:30", landmark: "Gate" },
        { id: 6, stopName: "RIT Campus", pickupTime: "07:40", landmark: "College Gate" }
    ]
});

// Sort routes by routeNumber naturally (e.g., R01, R01A, R02)
routes.sort((a, b) => a.routeNumber.localeCompare(b.routeNumber, undefined, { numeric: true, sensitivity: 'base' }));

fs.writeFileSync('./src/data/transportRoutes.js', `export const transportRoutes = ${JSON.stringify(routes, null, 2)};`);
console.log("Successfully generated src/data/transportRoutes.js with " + routes.length + " routes.");

