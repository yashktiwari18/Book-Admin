const fs = require('fs');
const path = 'src/App.tsx';
let c = fs.readFileSync(path, 'utf8');

c = c.replace(
  /const readStore=\(\):Dataset=>\{try\{const value=localStorage\.getItem\('bookbazaar-admin-v1'\);return value\?JSON\.parse\(value\):seed;\}catch\{return seed;\}\};/,
  `const readStore=():Dataset=>{try{const value=localStorage.getItem('bookbazaar-admin-v1');if(!value)return seed;const parsed=JSON.parse(value);return {...seed,...parsed,purchases:parsed.purchases||seed.purchases};}catch{return seed;}};`
);

fs.writeFileSync(path, c);
console.log("Fixed readStore successfully!");
