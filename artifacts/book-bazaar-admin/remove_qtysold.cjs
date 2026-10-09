const fs = require('fs');
const path = 'src/App.tsx';
let c = fs.readFileSync(path, 'utf8');

c = c.replace(/payload\.qtySold=Number\(payload\.qtySold\);/g, '');

fs.writeFileSync(path, c);
console.log("Removed qtySold from submit function");
