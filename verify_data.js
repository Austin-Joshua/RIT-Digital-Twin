const fs = require('fs');
const path = require('path');

const seederPath = path.join(__dirname, 'backend', 'src', 'main', 'java', 'com', 'university', 'erp', 'config', 'StudentDataSeeder.java');

function verifySeeder() {
    console.log("--- Verifying StudentDataSeeder for ranges 001-062 and 119-177 ---");
    const content = fs.readFileSync(seederPath, 'utf8');
    
    // Check CSE A range
    let missingCse = [];
    for (let i = 1; i <= 62; i++) {
        const regNo = "2117240020" + String(i).padStart(3, '0');
        if (!content.includes(regNo)) {
            missingCse.push(regNo);
        }
    }
    
    if (missingCse.length === 0) {
        console.log("✅ CSE Range (001-062) is complete.");
    } else {
        console.log("❌ Missing CSE numbers: " + missingCse.join(", "));
    }
    
    // Check CSBS range
    let missingCsbs = [];
    for (let i = 119; i <= 177; i++) {
        const regNo = "2117240080" + String(i).padStart(3, '0');
        if (!content.includes(regNo)) {
            missingCsbs.push(regNo);
        }
    }
    
    if (missingCsbs.length === 0) {
        console.log("✅ CSBS Range (119-177) is complete.");
    } else {
        console.log("❌ Missing CSBS numbers: " + missingCsbs.join(", "));
    }
    
    // Check specific reg no 
    if (content.includes('"2117240020045", "AVINESHWARAN", "A", true')) {
        console.log("✅ 2117240020045 is mapped to AVINESHWARAN A and set as Hosteller.");
    } else {
        console.log("❌ 2117240020045 mapping incorrect or missing.");
    }
}

verifySeeder();
