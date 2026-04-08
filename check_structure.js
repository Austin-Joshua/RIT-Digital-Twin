const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/student/StudentDashboard.jsx', 'utf8');

let curly = 0;
let paren = 0;
let tags = [];

const tagRegex = /<(??![\/?!])([a-zA-Z0-9]+)|<\/([a-zA-Z0-9]+)>/g;
let match;

for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') curly++;
    if (content[i] === '}') curly--;
    if (content[i] === '(') paren++;
    if (content[i] === ')') paren--;
}

console.log(`Curly braces: ${curly}`);
console.log(`Parentheses: ${paren}`);

// Simple tag balancer (ignores self-closing for simplicity, but we can check divs)
const divOpen = (content.match(/<div/g) || []).length;
const divClose = (content.match(/<\/div>/g) || []).length;
console.log(`Divs: Open ${divOpen}, Close ${divClose}`);
