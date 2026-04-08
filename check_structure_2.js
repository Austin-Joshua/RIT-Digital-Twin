const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/student/StudentDashboard.jsx', 'utf8');

const divOpen = (content.match(/<div/g) || []).length;
const divClose = (content.match(/<\/div>/g) || []).length;
console.log(`\nDiv tags: <div (${divOpen}), </div> (${divClose})`);

const curlyOpen = (content.match(/\{/g) || []).length;
const curlyClose = (content.match(/\}/g) || []).length;
console.log(`Curly braces: { (${curlyOpen}), } (${curlyClose})`);

const parenOpen = (content.match(/\(/g) || []).length;
const parenClose = (content.match(/\)/g) || []).length;
console.log(`Parentheses: ( (${parenOpen}), ) (${parenClose})`);

const linkOpen = (content.match(/<Link/g) || []).length;
const linkClose = (content.match(/<\/Link>/g) || []).length;
console.log(`Link tags: <Link (${linkOpen}), </Link> (${linkClose})`);
