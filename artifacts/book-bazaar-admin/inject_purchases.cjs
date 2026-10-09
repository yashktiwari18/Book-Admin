const fs = require('fs');
const path = 'src/App.tsx';
let c = fs.readFileSync(path, 'utf8');

// 1. Add Truck icon
c = c.replace(/LayoutDashboard, /, 'LayoutDashboard, Truck, Building2, ');

// 2. Add Purchase type
if (!c.includes('type Purchase')) {
  c = c.replace(
    /type Offer = \{.*?\};/,
    `$&
type Purchase = { id:string; manufacturer:string; bookId:string; qtyPurchased:number; qtySold:number; amountPaid:number; amountDue:number; status:'Paid'|'Partial'|'Pending'; date:string };`
  );
}

// 3. Update Dataset
c = c.replace(
  /type Dataset = \{ customers:Customer\[\]; books:Book\[\]; offers:Offer\[\] \};/,
  `type Dataset = { customers:Customer[]; books:Book[]; offers:Offer[]; purchases:Purchase[] };`
);

// 4. Update seed data
if (!c.includes('purchases:[')) {
  c = c.replace(
    /offers:\[(.*?)\]\s*\n\};/s,
    `offers:[$1],
  purchases:[
    {id:'PO-1001', manufacturer:'R.S Publication', bookId:'BK-0284', qtyPurchased:50, qtySold:42, amountPaid:20000, amountDue:14250, status:'Partial', date:'2025-01-10'},
    {id:'PO-1002', manufacturer:'NCERT', bookId:'BK-0282', qtyPurchased:100, qtySold:97, amountPaid:21500, amountDue:0, status:'Paid', date:'2025-01-12'}
  ]
};`
  );
}

// 5. Add nav link
c = c.replace(
  /\{to:'\/inventory',label:'Inventory',Icon:Boxes\}/,
  `$&, {to:'/purchases',label:'Purchases',Icon:Truck}`
);

// 6. Update FormState
c = c.replace(
  /type FormState = \{ kind:'customer'\|'book'\|'offer'\|'stock'/g,
  `type FormState = { kind:'customer'|'book'|'offer'|'stock'|'purchase'`
);

// 7. Update save function
c = c.replace(
  /if\(kind==='stock'\)\{.*?\}/,
  `$&
    if(kind==='purchase'){const item={...values,id:original?.id||idFor('PO')} as Purchase;setData(d=>({...d,purchases:original?d.purchases.map(x=>x.id===item.id?item:x):[item,...d.purchases]}));setToast(original?'Purchase updated':'Purchase recorded');}`
);

// 8. Update remove function
c = c.replace(
  /kind==='book'\?'books':'offers'\]/g,
  `kind==='book'?'books':kind==='offer'?'offers':'purchases']`
);
c = c.replace(
  /kind==='book'\?'Book':'Offer'\}/g,
  `kind==='book'?'Book':kind==='offer'?'Offer':'Purchase'}`
);

// 9. Add Route
c = c.replace(
  /<Route path="\/inventory"><Inventory \{\.\.\.context\}\/><\/Route>/,
  `$&
      <Route path="/purchases"><Purchases {...context}/></Route>`
);

// 10. Add setConfirm types
c = c.replace(
  /setConfirm=useState<\{kind:'customer'\|'book'\|'offer';id:string;name:string\}\|null>\(null\);/,
  `setConfirm=useState<{kind:'customer'|'book'|'offer'|'purchase';id:string;name:string}|null>(null);`
);
c = c.replace(
  /setConfirm:\(item:\{kind:'customer'\|'book'\|'offer';id:string;name:string\}\|null\)=>void;/,
  `setConfirm:(item:{kind:'customer'|'book'|'offer'|'purchase';id:string;name:string}|null)=>void;`
);

// 11. Add edit types
c = c.replace(
  /edit:\(kind:'customer'\|'book'\|'offer'/g,
  `edit:(kind:'customer'|'book'|'offer'|'purchase'`
);
c = c.replace(
  /kind:'customer'\|'book'\|'offer';/g,
  `kind:'customer'|'book'|'offer'|'purchase';`
);

// 12. Add the Purchases component
if (!c.includes('function Purchases(c:Context)')) {
  const componentStr = `
function Purchases(c:Context){
  const [query,setQuery]=useState('');const [filter,setFilter]=useState('All purchases');
  const rows=c.data.purchases.filter(p=>p.manufacturer.toLowerCase().includes(query.toLowerCase())&&(filter==='All purchases'||p.status===filter));
  return <main className="page"><Heading eyebrow="Supplier Relations" title="Purchases & Manufacturers" subtitle="Track inventory purchases, sales progress, and payment dues."><button className="btn primary" onClick={()=>c.setForm({kind:'purchase'})}><Plus/> Record purchase</button></Heading>
  <div className="stat-grid"><Stat label="Total Dues" value={money(c.data.purchases.reduce((a,b)=>a+b.amountDue,0))} note="Outstanding payments" Icon={Building2}/><Stat label="Total Paid" value={money(c.data.purchases.reduce((a,b)=>a+b.amountPaid,0))} note="Cleared to manufacturers" Icon={Check}/><Stat label="Total Books Purchased" value={c.data.purchases.reduce((a,b)=>a+b.qtyPurchased,0)} note="Across all orders" Icon={Boxes}/></div>
  <div className="toolbar"><SearchBar value={query} onChange={setQuery} placeholder="Search manufacturer..."/><select className="filter-select" value={filter} onChange={e=>setFilter(e.target.value)}><option>All purchases</option><option>Paid</option><option>Partial</option><option>Pending</option></select></div>
  <section className="panel"><div className="table-wrap"><table className="data-table"><thead><tr><th>Manufacturer</th><th>Book / Date</th><th>Books Purchased</th><th>Stock Left / Sold</th><th>Amount Paid</th><th>Amount Due</th><th>Status</th><th></th></tr></thead><tbody>{rows.map(p=>{
    const b=c.data.books.find(x=>x.id===p.bookId);
    return <tr key={p.id}><td><b>{p.manufacturer}</b><div className="muted">{p.id}</div></td><td>{b?.title||p.bookId}<div className="muted">{p.date}</div></td><td>{p.qtyPurchased}</td><td><b style={{color:'#a9663b'}}>{b?.stock} left</b><div className="muted">{p.qtySold} sold</div></td><td>{money(p.amountPaid)}</td><td><b style={{color:p.amountDue>0?'#a24840':''}}>{money(p.amountDue)}</b></td><td><Pill state={p.status}>{p.status}</Pill></td><td><div className="row-actions"><button className="icon-button" onClick={()=>c.edit('purchase',p)}><Pencil/></button><button className="icon-button" onClick={()=>c.setConfirm({kind:'purchase',id:p.id,name:p.id})}><Trash2/></button></div></td></tr>
  })}</tbody></table>{!rows.length&&<TableEmpty label="No purchases found" detail="Record your first manufacturer purchase." Icon={Truck}/>}</div></section></main>
}
`;
  c = c.replace(/function Inventory\(c:Context\)\{/, componentStr + '\n$&');
}

// 13. Update Editor initialization
c = c.replace(
  /if\(kind==='offer'\)return original\?\{\.\.\.original,bookIds:\[\.\.\.original\.bookIds\]\}:\{title:'',bookIds:\[\],discountPercent:10,startDate:today,endDate:'2025-03-15',status:'Active'\};/,
  `$&
    if(kind==='purchase')return original?{...original}:{manufacturer:'',bookId:'',qtyPurchased:100,qtySold:0,amountPaid:0,amountDue:0,status:'Pending',date:today};`
);

// 14. Update Editor save parsing
c = c.replace(
  /if\(kind==='offer'\)payload\.discountPercent=Number\(payload\.discountPercent\);/,
  `$&if(kind==='purchase'){payload.qtyPurchased=Number(payload.qtyPurchased);payload.qtySold=Number(payload.qtySold);payload.amountPaid=Number(payload.amountPaid);payload.amountDue=Number(payload.amountDue);}`
);

// 15. Update Editor titles
c = c.replace(
  /kind==='offer'\?\(editing\?'Edit offer':'Create an offer'\):'Adjust stock';/,
  `kind==='offer'?(editing?'Edit offer':'Create an offer'):kind==='purchase'?(editing?'Edit purchase':'Record purchase'):'Adjust stock';`
);
c = c.replace(
  /kind==='offer'\?'Choose the books and dates for this offer':'Record a stock movement';/,
  `kind==='offer'?'Choose the books and dates for this offer':kind==='purchase'?'Log a manufacturer purchase and payment status':'Record a stock movement';`
);
c = c.replace(
  /kind==='offer'\?'Create offer':kind==='book'\?'Add book':'Create account'\}/,
  `kind==='offer'?'Create offer':kind==='purchase'?'Save purchase':kind==='book'?'Add book':'Create account'}`
);

// 16. Add Editor form fields
if (!c.includes("kind==='purchase'&&<div")) {
  c = c.replace(
    /\{kind==='stock'&&<div/,
    `{kind==='purchase'&&<div className="form-grid"><div className="field full"><label>Manufacturer *</label><input required value={values.manufacturer} onChange={e=>set('manufacturer',e.target.value)} placeholder="e.g. RD Sharma Publications"/></div><div className="field full"><label>Book</label><select required value={values.bookId} onChange={e=>set('bookId',e.target.value)}><option value="">Select a catalog book</option>{data.books.map(b=><option key={b.id} value={b.id}>{b.title} ({b.className})</option>)}</select></div><div className="field"><label>Qty Purchased</label><input type="number" required value={values.qtyPurchased} onChange={e=>set('qtyPurchased',e.target.value)}/></div><div className="field"><label>Qty Sold (Tracker)</label><input type="number" required value={values.qtySold} onChange={e=>set('qtySold',e.target.value)}/></div><div className="field"><label>Amount Paid (₹)</label><input type="number" required value={values.amountPaid} onChange={e=>set('amountPaid',e.target.value)}/></div><div className="field"><label>Amount Due (₹)</label><input type="number" required value={values.amountDue} onChange={e=>set('amountDue',e.target.value)}/></div><div className="field"><label>Payment Status</label><select value={values.status} onChange={e=>set('status',e.target.value)}><option>Paid</option><option>Partial</option><option>Pending</option></select></div><div className="field"><label>Date</label><input type="date" required value={values.date} onChange={e=>set('date',e.target.value)}/></div></div>}\n   $&`
  );
}

fs.writeFileSync(path, c);
console.log("Injected Purchases successfully!");
