
const fs = require('fs');
const content = fs.readFileSync('c:/Users/Administrateur/Downloads/imtihan/imtihan/src/app/admin/page.tsx', 'utf8');

let braces = 0;
let line = 1;
for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') braces++;
    if (content[i] === '}') braces--;
    if (content[i] === '\n') line++;
    
    if (braces < 0) {
        console.log(`Unmatched closing brace at line ${line}`);
        process.exit(1);
    }
}

if (braces > 0) {
    console.log(`Unmatched opening brace(s): ${braces} left open`);
} else {
    console.log('Braces are balanced');
}
