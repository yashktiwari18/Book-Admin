const fs = require('fs');
const path = 'artifacts/book-bazaar-admin/src/App.tsx';
let c = fs.readFileSync(path, 'utf8');

c = c.replace(/const save=\(kind:'customer'\|'book'\|'offer'\|'stock'/g, "const save=(kind:'customer'|'book'|'offer'|'stock'|'purchase'");
c = c.replace(/item\?:Customer\|Book\|Offer\)=>void;/g, "item?:Customer|Book|Offer|Purchase)=>void;");

fs.writeFileSync(path, c);
console.log("Fixed more TS errors.");
