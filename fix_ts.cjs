const fs = require('fs');
const path = 'artifacts/book-bazaar-admin/src/App.tsx';
let c = fs.readFileSync(path, 'utf8');

// Fix FormState
c = c.replace(
  /item\?:Customer\|Book\|Offer;/,
  `item?:Customer|Book|Offer|Purchase;`
);

// Fix save function signature
c = c.replace(
  /const save=\(kind:'customer'\|'book'\|'offer'\|'stock',values:any,original\?:any\)=>\{/,
  `const save=(kind:'customer'|'book'|'offer'|'stock'|'purchase',values:any,original?:any)=>{`
);

// Fix Editor props
c = c.replace(
  /onSave:\(kind:any,values:any,original\?:any\)=>void\}/,
  `onSave:(kind:any,values:any,original?:any)=>void}`
); // wait, it already says kind:any in Editor, so that's fine.

fs.writeFileSync(path, c);
console.log("Fixed TypeScript errors.");
