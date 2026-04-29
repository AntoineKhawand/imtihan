
const fs = require('fs');
const content = fs.readFileSync('c:/Users/Administrateur/Downloads/imtihan/imtihan/src/app/admin/page.tsx', 'utf8');

function check(open, close, name) {
    let balance = 0;
    let line = 1;
    for (let i = 0; i < content.length; i++) {
        if (content[i] === open) balance++;
        if (content[i] === close) balance--;
        if (content[i] === '\n') line++;
        
        if (balance < 0) {
            console.log(`Unmatched closing ${name} at line ${line}`);
            return false;
        }
    }
    if (balance > 0) {
        console.log(`Unmatched opening ${name}: ${balance} left open`);
        return false;
    }
    console.log(`${name} are balanced`);
    return true;
}

check('{', '}', 'braces');
check('(', ')', 'parentheses');
check('[', ']', 'brackets');
check('`', '`', 'backticks');
