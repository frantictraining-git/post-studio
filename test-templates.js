import fs from 'fs';
const content = fs.readFileSync('./src/hooks/useStudio.js', 'utf-8');
const match = content.match(/id:\s*'t(1[1-4])'/g);
console.log("Matches:", match);
