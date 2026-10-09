const fs = require('fs');
const path = 'src/App.tsx';
let c = fs.readFileSync(path, 'utf8');

c = c.replace(/Purchases & Manufacturers/g, "Purchases & Wholesalers");
c = c.replace(/Cleared to manufacturers/g, "Cleared to wholesalers");
c = c.replace(/Search manufacturer\.\.\./g, "Search wholesaler...");
c = c.replace(/<th>Manufacturer<\/th>/g, "<th>Wholesaler Name</th>");
c = c.replace(/Record your first manufacturer purchase\./g, "Record your first wholesaler purchase.");
c = c.replace(/Log a manufacturer purchase/g, "Log a wholesaler purchase");
c = c.replace(/<label>Manufacturer \*/g, "<label>Wholesaler Name *");
c = c.replace(/e\.g\. RD Sharma Publications/g, "e.g. Apex Distributors");

// Update seed data just in case
c = c.replace(/manufacturer:'RD Sharma'/g, "manufacturer:'Apex Distributors'");
c = c.replace(/manufacturer:'NCERT'/g, "manufacturer:'Prime Book Wholesalers'");

fs.writeFileSync(path, c);
console.log("Updated to wholesaler terminology successfully!");
