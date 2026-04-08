const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/student/StudentDashboard.jsx', 'utf8');

const lines = content.split('\n');
let stack = [];
let log = [];

lines.forEach((line, index) => {
    let p = 0;
    while (p < line.length) {
        const nextOpen = line.indexOf('<div', p);
        const nextClose = line.indexOf('</div', p);
        
        if (nextOpen !== -1 && (nextClose === -1 || nextOpen < nextClose)) {
            if (line[nextOpen + 4] === ' ' || line[nextOpen + 4] === '>') {
                stack.push({ type: 'div', line: index + 1 });
                log.push(`${index + 1}: OPEN div`);
            }
            p = nextOpen + 4;
        } else if (nextClose !== -1) {
            if (stack.length > 0) {
              stack.pop();
              log.push(`${index + 1}: CLOSE div`);
            } else {
              log.push(`${index + 1}: ERROR extra CLOSE div`);
            }
            p = nextClose + 5;
        } else {
            break;
        }
    }
});

console.log(log.join('\n'));
console.log('Unclosed at end:', stack);
