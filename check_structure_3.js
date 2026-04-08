const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/student/StudentDashboard.jsx', 'utf8');

const divOpenings = [];
const divClosings = [];

const lines = content.split('\n');
lines.forEach((line, index) => {
    let m;
    const reOpen = /<div(?=[\s>])/g;
    while ((m = reOpen.exec(line)) !== null) {
        divOpenings.push(index + 1);
    }
    const reClose = /<\/div>/g;
    while ((m = reClose.exec(line)) !== null) {
        divClosings.push(index + 1);
    }
});

console.log(`Openings: ${divOpenings.length}, Closings: ${divClosings.length}`);

// Let's pair them up assuming sequential properly nested tags for divs (simple stack)
let stack = [];
let unpaired = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let openMatches = [...line.matchAll(/<div(?=[\s>])/g)];
    let closeMatches = [...line.matchAll(/<\/div>/g)];

    // Extremely naive. Real parsing needs to match order in the line.
    const tokens = [];
    let p = 0;
    while (p < line.length) {
        const o = line.indexOf('<div', p);
        const c = line.indexOf('</div', p);
        if (o !== -1 && (c === -1 || o < c)) {
            // Need to make sure it's actually `<div ` or `<div>`
            if (line[o+4] === ' ' || line[o+4] === '>' || line[o+4] === '\n') {
                tokens.push({ type: 'open', pos: o });
            }
            p = o + 4;
        } else if (c !== -1) {
            tokens.push({ type: 'close', pos: c });
            p = c + 5;
        } else {
            break;
        }
    }

    tokens.forEach(t => {
        if (t.type === 'open') {
            stack.push(i + 1);
        } else {
            if (stack.length > 0) {
                stack.pop();
            } else {
                unpaired.push(`Unexpected closing at line ${i + 1}`);
            }
        }
    });
}

console.log('Unclosed div tags opened at lines:', stack);
console.log('Unpaired errors:', unpaired);
