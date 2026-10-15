import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { LayoutDashboard, Truck, Building2, UsersRound, BookOpen, Tags, Boxes, Search, Plus, Pencil, Trash2, ArrowUpRight, ArrowRight, Menu, X, Bell, TriangleAlert, PackageCheck, Library, Check, Minus, Save, CalendarDays, PlusCircle, Users2, FileOutput, FileText, ArrowDownLeft, RotateCcw, ClipboardList, FilePen, ShoppingBag, Package, Smartphone, Wallet, ChevronDown, FileInput, ArrowUpLeft, RotateCw, ClipboardCheck, RefreshCcw } from 'lucide-react';
import NotFound from '@/pages/not-found';

type Customer = { id:string; name:string; email:string; phone:string; school:string; className:string; status:'Active'|'Pending'|'Inactive'; allowedPublications:string[]; allowedBooks?:string[]; joinedAt:string; amountPaid?:number; amountDue?:number };
type Book = { id:string; title:string; author:string; publication:string; subject:string; className:string; isbn:string; sku:string; price:number; stock:number; lowStockThreshold:number; status:'Active'|'Draft'|'Archived' };
type Offer = { id:string; title:string; bookIds:string[]; discountPercent:number; startDate:string; endDate:string; status:'Active'|'Scheduled'|'Ended' };
type Purchase = { id:string; manufacturer:string; bookId:string; qtyPurchased:number; qtySold:number; amountPaid:number; amountDue:number; status:'Paid'|'Partial'|'Pending'; date:string };
type Dataset = { customers:Customer[]; books:Book[]; offers:Offer[]; purchases:Purchase[] };
type FormState = { kind:'customer'|'book'|'offer'|'stock'|'purchase'|'bill'; item?:Customer|Book|Offer|Purchase; book?:Book } | null;

const DEFAULT_PUBS=['RD Sharma','R.S. Aggarwal','NCERT','Arihant Publications','S. Chand'];
const PUBS_KEY='bookbazaar-pubs-v1';
const readPubs=():string[]=>{try{const v=localStorage.getItem(PUBS_KEY);return v?JSON.parse(v):DEFAULT_PUBS;}catch{return DEFAULT_PUBS;}};
const today='2025-02-14';
const seed:Dataset={
  customers:[
    {id:'BB-1048',name:'Aarav Mehta',email:'aarav.mehta@gmail.com',phone:'+91 98765 23410',school:'The Heritage School',className:'Class 8',status:'Active',allowedPublications:['RD Sharma','NCERT'],joinedAt:'2025-01-28',amountPaid:4500,amountDue:1200},
    {id:'BB-1047',name:'Isha Kapoor',email:'isha.kapoor@gmail.com',phone:'+91 98112 40832',school:'Delhi Public School',className:'Class 10',status:'Active',allowedPublications:['R.S. Aggarwal','Arihant Publications'],joinedAt:'2025-01-26',amountPaid:6200,amountDue:0},
    {id:'BB-1046',name:'Kabir Sethi',email:'kabir.sethi@gmail.com',phone:'+91 98990 11476',school:'Modern School',className:'Class 6',status:'Pending',allowedPublications:['NCERT'],joinedAt:'2025-01-25',amountPaid:0,amountDue:0},
    {id:'BB-1045',name:'Anaya Rao',email:'anaya.rao@gmail.com',phone:'+91 98105 77142',school:'Vasant Valley School',className:'Class 9',status:'Active',allowedPublications:['RD Sharma','S. Chand'],joinedAt:'2025-01-23',amountPaid:3200,amountDue:150},
    {id:'BB-1044',name:'Vihaan Khanna',email:'vihaan.k@gmail.com',phone:'+91 99102 60119',school:'The Shri Ram School',className:'Class 7',status:'Inactive',allowedPublications:['NCERT','Arihant Publications'],joinedAt:'2025-01-20',amountPaid:1800,amountDue:300},
    {id:'BB-1043',name:'Myra Bansal',email:'myra.bansal@gmail.com',phone:'+91 98108 62214',school:'The Heritage School',className:'Class 5',status:'Active',allowedPublications:['R.S. Aggarwal','NCERT'],joinedAt:'2025-01-18',amountPaid:2700,amountDue:0},
  ],
  books:[
    {id:'BK-0284',title:'Mathematics for Class 10',author:'Dr. R. D. Sharma',publication:'RD Sharma',subject:'Mathematics',className:'Class 10',isbn:'978-93-5290-814-2',sku:'RDS-MTH-10',price:685,stock:8,lowStockThreshold:12,status:'Active'},
    {id:'BK-0283',title:'A New Approach to Reasoning',author:'R. S. Aggarwal',publication:'R.S. Aggarwal',subject:'Reasoning',className:'Class 8',isbn:'978-93-5290-510-3',sku:'RSA-REA-08',price:495,stock:34,lowStockThreshold:10,status:'Active'},
    {id:'BK-0282',title:'Science: Textbook for Class 9',author:'NCERT',publication:'NCERT',subject:'Science',className:'Class 9',isbn:'978-81-7450-654-4',sku:'NCR-SCI-09',price:215,stock:3,lowStockThreshold:15,status:'Active'},
    {id:'BK-0281',title:'Mathematics for Class 8',author:'Dr. R. D. Sharma',publication:'RD Sharma',subject:'Mathematics',className:'Class 8',isbn:'978-93-5290-808-1',sku:'RDS-MTH-08',price:625,stock:21,lowStockThreshold:10,status:'Active'},
    {id:'BK-0280',title:'All in One English Language',author:'Arihant Experts',publication:'Arihant Publications',subject:'English',className:'Class 10',isbn:'978-93-5164-330-4',sku:'ARI-ENG-10',price:380,stock:0,lowStockThreshold:8,status:'Draft'},
    {id:'BK-0279',title:'Understanding Physics',author:'D. C. Pandey',publication:'Arihant Publications',subject:'Physics',className:'Class 11',isbn:'978-93-5164-927-6',sku:'ARI-PHY-11',price:545,stock:16,lowStockThreshold:8,status:'Active'},
  ],
  offers:[
    {id:'OF-041',title:'A stronger start in maths',bookIds:['BK-0284','BK-0281'],discountPercent:15,startDate:'2025-02-01',endDate:'2025-02-28',status:'Active'},
    {id:'OF-040',title:'Back to the basics',bookIds:['BK-0282'],discountPercent:10,startDate:'2025-02-10',endDate:'2025-03-10',status:'Active'},
    {id:'OF-039',title:'January reading list',bookIds:['BK-0283'],discountPercent:20,startDate:'2025-01-01',endDate:'2025-01-31',status:'Ended'},
  ],
  purchases:[
    {id:'PO-1001', manufacturer:'Apex Distributors', bookId:'BK-0284', qtyPurchased:50, qtySold:42, amountPaid:20000, amountDue:14250, status:'Partial', date:'2025-01-10'},
    {id:'PO-1002', manufacturer:'Prime Book Wholesalers', bookId:'BK-0282', qtyPurchased:100, qtySold:97, amountPaid:21500, amountDue:0, status:'Paid', date:'2025-01-12'}
  ]
};
const queryClient=new QueryClient();
const money=(n:number)=>`₹${Number(n||0).toLocaleString('en-IN')}`;
const readStore=():Dataset=>{try{const value=localStorage.getItem('bookbazaar-admin-v1');if(!value)return seed;const parsed=JSON.parse(value);return {...seed,...parsed,purchases:parsed.purchases||seed.purchases};}catch{return seed;}};
const idFor=(prefix:string)=>`${prefix}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;

const SALE_SUB = [
  {to:'/sale/invoice',    label:'Sale Invoice',         Icon:FileText,      note:''},
  {to:'/sale/payment-in', label:'Payment-In',            Icon:ArrowDownLeft, note:''},
  {to:'/sale/return',     label:'Sale Return',           Icon:RotateCcw,     note:'Credit Note'},
  {to:'/sale/estimate',   label:'Estimate / Quotation',  Icon:ClipboardList, note:''},
  {to:'/sale/proforma',   label:'Proforma Invoice',      Icon:FilePen,       note:''},
  {to:'/sale/order',      label:'Sale Order',            Icon:ShoppingBag,   note:''},
  {to:'/sale/challan',    label:'Delivery Challan',      Icon:Package,       note:''},
  {to:'/sale/pos',        label:'Mobile POS',            Icon:Smartphone,    note:''},
];
const PURCHASE_SUB = [
  {to:'/purchase/bill',     label:'Purchase Bill',    Icon:FileInput,      note:''},
  {to:'/purchase/payment-out', label:'Payment Out',   Icon:ArrowUpLeft,    note:''},
  {to:'/purchase/return',   label:'Purchase Return',  Icon:RotateCw,       note:''},
  {to:'/purchase/order',    label:'Purchase Order',   Icon:ClipboardCheck, note:''},
];
const RETURN_SUB = [
  {to:'/return/sale',     label:'Sale Return',     Icon:RotateCcw, note:'Credit Note'},
  {to:'/return/purchase', label:'Purchase Return', Icon:RotateCw,  note:''},
];
// ─────────────────────── Sale Invoice Types & Components ─────────────────────
const INVOICE_KEY='bookbazaar-invoices-v1';
type InvoiceItem={id:string;bookId:string;name:string;qty:number;price:number;discountPct:number};
type SaleInvoiceType={id:string;invoiceNo:string;date:string;time:string;customerName:string;billingName:string;phone:string;partyBalance:number;items:InvoiceItem[];discountPct:number;shipping:number;roundOff:boolean;received:number;paymentType:string;paymentRef:string;notes:string;terms:string;status:'Paid'|'Partial'|'Unpaid'};
function calcInvoiceTotal(inv:SaleInvoiceType){const sub=inv.items.reduce((s,i)=>s+i.qty*i.price*(1-i.discountPct/100),0);const aft=sub*(1-inv.discountPct/100)+inv.shipping;return inv.roundOff?Math.round(aft):aft;}
function SaleInvoicePage(c:Context){
  const [invoices,setInvoices]=useState<SaleInvoiceType[]>(()=>{try{const v=localStorage.getItem(INVOICE_KEY);return v?JSON.parse(v):[];}catch{return [];}});
  const [view,setView]=useState<'list'|'form'>('list');
  const [editing,setEditing]=useState<SaleInvoiceType|null>(null);
  useEffect(()=>{localStorage.setItem(INVOICE_KEY,JSON.stringify(invoices));},[invoices]);
  const nowTime=()=>new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true});
  const nextNo=()=>`BB-${String(invoices.length+1).padStart(4,'0')}`;
  const openNew=()=>{setEditing(null);setView('form');};
  const openEdit=(inv:SaleInvoiceType)=>{setEditing(inv);setView('form');};
  const closeForm=()=>{setView('list');setEditing(null);};
  const saveInvoice=(inv:SaleInvoiceType)=>{setInvoices(prev=>editing?prev.map(x=>x.id===inv.id?inv:x):[inv,...prev]);closeForm();};
  const delInvoice=(id:string)=>setInvoices(prev=>prev.filter(x=>x.id!==id));
  if(view==='form')return <InvoiceForm data={c.data} initial={editing} nextNo={nextNo()} nowTime={nowTime()} onSave={saveInvoice} onClose={closeForm} onDelete={editing?()=>{delInvoice(editing.id);closeForm();}:undefined}/>;
  return(
    <main className="page">
      <Heading eyebrow="Sale" title="Sale Invoices" subtitle="Create and manage sale invoices for your customers."><button className="btn primary" onClick={openNew}><Plus/> New Invoice</button></Heading>
      <div className="stat-grid">
        <Stat label="Total Invoices" value={invoices.length} note="All time" Icon={FileText}/>
        <Stat label="Total Billed" value={money(invoices.reduce((s,inv)=>s+calcInvoiceTotal(inv),0))} note="Gross amount" Icon={FileOutput}/>
        <Stat label="Collected" value={money(invoices.reduce((s,inv)=>s+inv.received,0))} note="Payments received" Icon={Check}/>
        <Stat label="Balance Due" value={money(invoices.reduce((s,inv)=>s+Math.max(0,calcInvoiceTotal(inv)-inv.received),0))} note="Outstanding" Icon={TriangleAlert} tint="red"/>
      </div>
      <section className="panel">
        <div className="table-wrap"><table className="data-table">
          <thead><tr><th>Invoice No.</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Received</th><th>Balance</th><th>Status</th><th></th></tr></thead>
          <tbody>{invoices.map(inv=>{const tot=calcInvoiceTotal(inv);const bal=tot-inv.received;const st=inv.received===0?'Unpaid':bal<=0?'Paid':'Partial';return(
            <tr key={inv.id}>
              <td><div className="book-title">{inv.invoiceNo}</div><div className="muted">{inv.time}</div></td>
              <td><div className="book-title">{inv.customerName||'—'}</div><div className="muted">{inv.phone}</div></td>
              <td>{inv.date}</td>
              <td>{inv.items.length} item{inv.items.length!==1?'s':''}</td>
              <td><b>{money(tot)}</b></td>
              <td style={{color:'#3a6647'}}>{money(inv.received)}</td>
              <td style={{color:bal>0?'#a24840':'#3a6647',fontWeight:600}}>{money(Math.max(0,bal))}</td>
              <td><Pill state={st}>{st}</Pill></td>
              <td><div className="row-actions"><button className="icon-button" title="Edit" onClick={()=>openEdit(inv)}><Pencil/></button><button className="icon-button" title="Delete" onClick={()=>delInvoice(inv.id)}><Trash2/></button></div></td>
            </tr>
          );})}</tbody>
        </table>
        {!invoices.length&&<TableEmpty label="No invoices yet" detail="Create your first sale invoice to get started." Icon={FileText} action={<button className="btn primary" onClick={openNew}><Plus/> New Invoice</button>}/>}
        </div>
      </section>
    </main>
  );
}
function InvoiceForm({data,initial,nextNo,nowTime,onSave,onClose,onDelete}:{data:Dataset;initial:SaleInvoiceType|null;nextNo:string;nowTime:string;onSave:(inv:SaleInvoiceType)=>void;onClose:()=>void;onDelete?:()=>void}){
  const blank:Omit<SaleInvoiceType,'id'>={invoiceNo:nextNo,date:today,time:nowTime,customerName:'',billingName:'',phone:'',partyBalance:0,items:[],discountPct:0,shipping:0,roundOff:false,received:0,paymentType:'Cash',paymentRef:'',notes:'',terms:'1) Thank you for doing business with us.\n2) E. & O.E.\n3) Goods once sold will not be taken back.',status:'Unpaid'};
  const [f,setF]=useState<Omit<SaleInvoiceType,'id'>>(initial||blank);
  const set=(k:string,v:any)=>setF(p=>({...p,[k]:v}));
  const [selBook,setSelBook]=useState('');
  const [selQty,setSelQty]=useState(1);
  const [selPrice,setSelPrice]=useState(0);
  const [selDisc,setSelDisc]=useState(0);
  const [termsOpen,setTermsOpen]=useState(false);
  const itemsSub=f.items.reduce((s,i)=>s+i.qty*i.price*(1-i.discountPct/100),0);
  const afterDisc=itemsSub*(1-f.discountPct/100);
  const withShip=afterDisc+f.shipping;
  const total=f.roundOff?Math.round(withShip):withShip;
  const balDue=total-f.received;
  const addItem=()=>{
    const book=data.books.find(b=>b.id===selBook);
    const name=book?.title||(selBook?selBook:'Custom Item');
    const price=selPrice||(book?.price||0);
    if(!name||price<=0)return;
    set('items',[...f.items,{id:idFor('ITM'),bookId:selBook,name,qty:selQty,price,discountPct:selDisc}]);
    setSelBook('');setSelQty(1);setSelPrice(0);setSelDisc(0);
  };
  const remItem=(id:string)=>set('items',f.items.filter(i=>i.id!==id));
  const updItem=(id:string,k:string,v:any)=>set('items',f.items.map(i=>i.id===id?{...i,[k]:v}:i));
  const handleSave=()=>{const st=(f.received===0?'Unpaid':balDue<=0?'Paid':'Partial') as SaleInvoiceType['status'];onSave({...f,id:initial?.id||idFor('INV'),status:st});};
  return(
    <main className="page" style={{maxWidth:700}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <button className="icon-button" onClick={onClose} style={{border:'1px solid #e2ded2',flexShrink:0}}><ArrowRight style={{transform:'rotate(180deg)'}}/></button>
        <h1 style={{fontFamily:'var(--app-font-serif)',fontSize:22,margin:0,color:'#1e3d2c',flex:1}}>{initial?'Edit Invoice':'New Sale Invoice'}</h1>
        {onDelete&&<button className="btn danger" onClick={onDelete}><Trash2/> Delete</button>}
        <button className="btn primary" onClick={handleSave}><Save/> Save</button>
      </div>
      <section className="panel panel-pad" style={{marginBottom:14}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14}}>
          <div className="field"><label>Invoice No.</label><input value={f.invoiceNo} onChange={e=>set('invoiceNo',e.target.value)}/></div>
          <div className="field"><label>Date</label><input type="date" value={f.date} onChange={e=>set('date',e.target.value)}/></div>
          <div className="field"><label>Time</label><input type="time" value={f.time} onChange={e=>set('time',e.target.value)}/></div>
        </div>
      </section>
      <section className="panel panel-pad" style={{marginBottom:14}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <h2 style={{fontFamily:'var(--app-font-serif)',fontSize:16,margin:0,color:'#264333'}}>Customer Details</h2>
          {f.partyBalance>0&&<span style={{fontSize:12,color:'#3a6647',fontWeight:600}}>Party Balance: {money(f.partyBalance)}</span>}
        </div>
        <div className="field" style={{marginBottom:10}}><label>Customer Name *</label><input required value={f.customerName} onChange={e=>{set('customerName',e.target.value);if(!f.billingName||f.billingName===f.customerName)set('billingName',e.target.value);}} placeholder="Customer name"/></div>
        <div className="field" style={{marginBottom:10}}><label>Billing Name (Optional)</label><input value={f.billingName} onChange={e=>set('billingName',e.target.value)} placeholder="Same as customer name"/></div>
        <div className="field"><label>Phone Number</label><input value={f.phone} onChange={e=>set('phone',e.target.value)} placeholder="+91 00000 00000"/></div>
      </section>
      <section className="panel" style={{marginBottom:14}}>
        <div style={{background:'#4a90d9',borderRadius:'12px 12px 0 0',padding:'12px 18px',display:'flex',alignItems:'center',gap:8,color:'#fff',fontWeight:600,fontSize:13}}><BookOpen size={15}/> Billed Items ({f.items.length})</div>
        <div className="panel-pad">
          {f.items.map((item,i)=>(
            <div key={item.id} style={{border:'1px solid #e7e1d4',borderRadius:9,padding:13,marginBottom:10,background:'#fafaf7'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                <span style={{fontSize:11,color:'#91a796',fontWeight:700}}>#{i+1}</span>
                <b style={{fontSize:13,color:'#1e3d2c',flex:1,marginLeft:8}}>{item.name}</b>
                <span style={{fontSize:13,fontWeight:700,color:'#1e3d2c'}}>{money(item.qty*item.price*(1-item.discountPct/100))}</span>
              </div>
              <div style={{fontSize:11,color:'#7d877d',marginBottom:4}}>Item Subtotal: {item.qty} × {money(item.price)} = {money(item.qty*item.price)}</div>
              {item.discountPct>0&&<div style={{fontSize:11,color:'#a9663b',marginBottom:8}}>Discount ({item.discountPct}%): −{money(item.qty*item.price*item.discountPct/100)}</div>}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr auto',gap:8,alignItems:'flex-end',marginTop:8}}>
                <div className="field" style={{marginBottom:0,gap:3}}><label style={{fontSize:9}}>QTY</label><input type="number" min="1" value={item.qty} style={{height:32}} onChange={e=>updItem(item.id,'qty',Number(e.target.value))}/></div>
                <div className="field" style={{marginBottom:0,gap:3}}><label style={{fontSize:9}}>PRICE (₹)</label><input type="number" min="0" value={item.price} style={{height:32}} onChange={e=>updItem(item.id,'price',Number(e.target.value))}/></div>
                <div className="field" style={{marginBottom:0,gap:3}}><label style={{fontSize:9}}>DISC %</label><input type="number" min="0" max="100" value={item.discountPct} style={{height:32}} onChange={e=>updItem(item.id,'discountPct',Number(e.target.value))}/></div>
                <button className="icon-button" style={{border:'1px solid #e4ddd2',marginBottom:1}} onClick={()=>remItem(item.id)}><Trash2/></button>
              </div>
            </div>
          ))}
          <div style={{border:'1.5px dashed #c5c0b4',borderRadius:9,padding:14,background:'#f9f8f3'}}>
            <div style={{fontSize:10,fontWeight:700,color:'#8a9389',letterSpacing:'0.8px',marginBottom:10}}>ADD ITEM</div>
            <div style={{display:'grid',gridTemplateColumns:'2fr 0.7fr 1fr 0.7fr auto',gap:8,alignItems:'flex-end'}}>
              <div className="field" style={{marginBottom:0,gap:3}}><label style={{fontSize:9}}>BOOK</label><select value={selBook} onChange={e=>{setSelBook(e.target.value);const b=data.books.find(b=>b.id===e.target.value);if(b)setSelPrice(b.price);}} style={{height:34}}><option value="">Select book…</option>{data.books.map(b=><option key={b.id} value={b.id}>{b.title}</option>)}</select></div>
              <div className="field" style={{marginBottom:0,gap:3}}><label style={{fontSize:9}}>QTY</label><input type="number" min="1" value={selQty} style={{height:34}} onChange={e=>setSelQty(Number(e.target.value))}/></div>
              <div className="field" style={{marginBottom:0,gap:3}}><label style={{fontSize:9}}>PRICE (₹)</label><input type="number" min="0" value={selPrice} style={{height:34}} onChange={e=>setSelPrice(Number(e.target.value))}/></div>
              <div className="field" style={{marginBottom:0,gap:3}}><label style={{fontSize:9}}>DISC %</label><input type="number" min="0" max="100" value={selDisc} style={{height:34}} onChange={e=>setSelDisc(Number(e.target.value))}/></div>
              <button className="btn primary" style={{height:34,padding:'0 12px'}} onClick={addItem}><Plus size={13}/></button>
            </div>
          </div>
        </div>
      </section>
      <section className="panel panel-pad" style={{marginBottom:14}}>
        <h2 style={{fontFamily:'var(--app-font-serif)',fontSize:16,margin:'0 0 14px',color:'#264333'}}>Discount & Charges</h2>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #eee9df'}}><span style={{fontSize:13,color:'#536157'}}>Item Subtotal</span><span style={{fontSize:13,color:'#536157'}}>{money(itemsSub)}</span></div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #eee9df'}}>
          <span style={{fontSize:13,color:'#536157'}}>Discount</span>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <input type="number" min="0" max="100" value={f.discountPct} onChange={e=>set('discountPct',Number(e.target.value))} style={{width:65,height:32,border:'1px solid #e2ded2',borderRadius:7,padding:'0 8px',fontSize:13}}/>
            <span style={{fontSize:11,color:'#9aa093'}}>%</span>
            <span style={{fontSize:13,color:'#a9663b',minWidth:80,textAlign:'right'}}>−{money(itemsSub*f.discountPct/100)}</span>
          </div>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #eee9df'}}>
          <span style={{fontSize:13,color:'#536157'}}>Shipping (₹)</span>
          <input type="number" min="0" value={f.shipping} onChange={e=>set('shipping',Number(e.target.value))} style={{width:110,height:32,border:'1px solid #e2ded2',borderRadius:7,padding:'0 8px',fontSize:13}}/>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #eee9df'}}>
          <label style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'#536157',cursor:'pointer'}}><input type="checkbox" checked={f.roundOff} onChange={e=>set('roundOff',e.target.checked)} style={{accentColor:'#315a41'}}/>Round Off</label>
          <span style={{fontSize:13,color:'#7d877d'}}>{f.roundOff?`₹ ${(Math.round(withShip)-withShip).toFixed(2)}`:'—'}</span>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 0',borderBottom:'1px solid #eee9df'}}>
          <span style={{fontSize:15,fontWeight:700,color:'#1e3d2c'}}>Total Amount</span>
          <span style={{fontSize:19,fontWeight:700,color:'#1e3d2c'}}>{money(total)}</span>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #eee9df'}}>
          <label style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'#536157',cursor:'pointer'}}><input type="checkbox" checked={f.received>0} onChange={e=>set('received',e.target.checked?total:0)} style={{accentColor:'#315a41'}}/>Received</label>
          <input type="number" min="0" value={f.received} onChange={e=>set('received',Number(e.target.value))} style={{width:130,height:32,border:'1px solid #e2ded2',borderRadius:7,padding:'0 8px',fontSize:13}}/>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0'}}>
          <span style={{fontSize:15,fontWeight:700,color:balDue>0?'#a24840':'#3a6647'}}>Balance Due</span>
          <span style={{fontSize:18,fontWeight:700,color:balDue>0?'#a24840':'#3a6647'}}>{money(Math.max(0,balDue))}</span>
        </div>
      </section>
      <section className="panel panel-pad" style={{marginBottom:14}}>
        <h2 style={{fontFamily:'var(--app-font-serif)',fontSize:16,margin:'0 0 12px',color:'#264333'}}>Payment Details</h2>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          <div className="field"><label>Payment Type</label><select value={f.paymentType} onChange={e=>set('paymentType',e.target.value)}>{['Cash','UPI','Canara Bank','SBI','HDFC Bank','ICICI Bank','Axis Bank','Cheque','Other'].map(p=><option key={p}>{p}</option>)}</select></div>
          <div className="field"><label>Payment Ref No.</label><input value={f.paymentRef} onChange={e=>set('paymentRef',e.target.value)} placeholder="Reference No."/></div>
        </div>
      </section>
      <section className="panel panel-pad" style={{marginBottom:14}}>
        <h2 style={{fontFamily:'var(--app-font-serif)',fontSize:16,margin:'0 0 12px',color:'#4a90d9'}}>Transportation Details</h2>
        <div className="field"><label>Description / Note</label><textarea value={f.notes} onChange={e=>set('notes',e.target.value)} placeholder="Add note…" style={{height:85,resize:'vertical'}}/></div>
      </section>
      <section className="panel" style={{marginBottom:28}}>
        <button type="button" style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 18px',background:'transparent',border:'none',cursor:'pointer',fontFamily:'var(--app-font-serif)',fontSize:15,color:'#264333',fontWeight:600}} onClick={()=>setTermsOpen(o=>!o)}>
          Terms & Conditions <ChevronDown size={15} style={{transition:'transform .22s',transform:termsOpen?'rotate(180deg)':'none'}}/>
        </button>
        {termsOpen&&<div style={{padding:'0 18px 16px',borderTop:'1px solid #e7e1d4'}}><div className="field" style={{paddingTop:14}}><label>Terms</label><textarea value={f.terms} onChange={e=>set('terms',e.target.value)} style={{height:100,resize:'vertical',fontSize:12}}/></div></div>}
      </section>
      <div style={{display:'flex',gap:10,justifyContent:'flex-end',paddingBottom:20}}>
        <button className="btn" onClick={onClose}>Cancel</button>
        {onDelete&&<button className="btn danger" onClick={onDelete}><Trash2/> Delete</button>}
        <button className="btn primary" onClick={handleSave}><Save/> Save Invoice</button>
      </div>
    </main>
  );
}

function ComingSoon({title,sub,Icon}:{title:string;sub:string;Icon:any}){
  return <main className="page"><div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'55vh',textAlign:'center',gap:14}}><div style={{width:60,height:60,borderRadius:18,background:'#e8f0e6',display:'grid',placeItems:'center',color:'#3d6b4a'}}><Icon size={26}/></div><h1 style={{fontFamily:'var(--app-font-serif)',fontSize:'clamp(22px,3vw,30px)',color:'#1e3d2c',margin:0}}>{title}</h1><p style={{fontSize:13,color:'#6d7d6e',maxWidth:380,margin:0,lineHeight:1.6}}>{sub}</p><span style={{fontSize:11,color:'#9aaa99',background:'#f0ede4',padding:'6px 14px',borderRadius:20,fontWeight:600}}>Coming soon</span></div></main>;
}
function AppShell({children}:{children:ReactNode}) {
  const [location]=useLocation(); const [menu,setMenu]=useState(false); const [saleOpen,setSaleOpen]=useState(()=>location.startsWith('/sale'));
  const [purchaseOpen,setPurchaseOpen]=useState(()=>location.startsWith('/purchase'));
  const [returnOpen,setReturnOpen]=useState(()=>location.startsWith('/return'));
  const isSaleActive=location.startsWith('/sale');
  const isPurchaseActive=location.startsWith('/purchase');
  const isReturnActive=location.startsWith('/return');
  const allPages:Record<string,string>={'/':'Overview','/customers':'Customers','/books':'Books','/offers':'Offers','/inventory':'Inventory','/purchases':'Purchases','/parties':'Parties','/expense':'Expense',...Object.fromEntries(SALE_SUB.map(s=>[s.to,s.label])),...Object.fromEntries(PURCHASE_SUB.map(s=>[s.to,s.label])),...Object.fromEntries(RETURN_SUB.map(s=>[s.to,s.label]))};
  const mainNav=[{to:'/',label:'Overview',Icon:LayoutDashboard},{to:'/customers',label:'Customers',Icon:UsersRound},{to:'/parties',label:'Parties',Icon:Users2},{to:'/books',label:'Books',Icon:BookOpen},{to:'/offers',label:'Offers',Icon:Tags},{to:'/inventory',label:'Inventory',Icon:Boxes}];
  const mobileNav=[...mainNav,{to:'/sale/invoice',label:'Sale',Icon:FileOutput},{to:'/expense',label:'Expense',Icon:Wallet}];
  return <div className="app-shell">
    {menu&&<div className="mobile-scrim" onClick={()=>setMenu(false)} />}
    <aside className={`sidebar ${menu?'open':''}`}>
      <div className="brand"><div className="brand-mark">b</div><div><div className="brand-title">book bazaar</div><span className="brand-sub">STAFF WORKSPACE</span></div></div>
      <div className="nav-label">Workspace</div>
      {mainNav.map(({to,label,Icon})=><Link key={to} href={to} className={`nav-link ${location===to?'active':''}`} onClick={()=>setMenu(false)} data-testid={`link-${label.toLowerCase()}`}><Icon/><span>{label}</span></Link>)}
      <div className="nav-group">
        <button className={`nav-group-btn${isSaleActive?' active':''}`} onClick={()=>setSaleOpen(o=>!o)} aria-expanded={saleOpen}>
          <FileOutput className="main-icon"/><span>Sale</span><ChevronDown className={`nav-chevron${saleOpen?' open':''}`}/>
        </button>
        <div className={`nav-sub${saleOpen?' open':''}`}>
          {SALE_SUB.map(({to,label,Icon,note})=><Link key={to} href={to} className={`nav-sub-item${location===to?' active':''}`} onClick={()=>setMenu(false)}><Icon/><div className="nav-sub-label">{label}{note&&<div className="nav-sub-note">{note}</div>}</div></Link>)}
        </div>
      </div>
      <div className="nav-group">
        <button className={`nav-group-btn${isPurchaseActive?' active':''}`} onClick={()=>setPurchaseOpen(o=>!o)} aria-expanded={purchaseOpen}>
          <Truck className="main-icon"/><span>Purchases</span><ChevronDown className={`nav-chevron${purchaseOpen?' open':''}`}/>
        </button>
        <div className={`nav-sub${purchaseOpen?' open':''}`}>
          {PURCHASE_SUB.map(({to,label,Icon,note})=><Link key={to} href={to} className={`nav-sub-item${location===to?' active':''}`} onClick={()=>setMenu(false)}><Icon/><div className="nav-sub-label">{label}{note&&<div className="nav-sub-note">{note}</div>}</div></Link>)}
        </div>
      </div>
      <div className="nav-group">
        <button className={`nav-group-btn${isReturnActive?' active':''}`} onClick={()=>setReturnOpen(o=>!o)} aria-expanded={returnOpen}>
          <RefreshCcw className="main-icon"/><span>Return</span><ChevronDown className={`nav-chevron${returnOpen?' open':''}`}/>
        </button>
        <div className={`nav-sub${returnOpen?' open':''}`}>
          {RETURN_SUB.map(({to,label,Icon,note})=><Link key={to} href={to} className={`nav-sub-item${location===to?' active':''}`} onClick={()=>setMenu(false)}><Icon/><div className="nav-sub-label">{label}{note&&<div className="nav-sub-note">{note}</div>}</div></Link>)}
        </div>
      </div>
      <Link href="/expense" className={`nav-link${location==='/expense'?' active':''}`} onClick={()=>setMenu(false)} data-testid="link-expense"><Wallet/><span>Expense</span></Link>
      <div className="sidebar-bottom">The school bookshop<br/>Every title, in good hands.</div>
    </aside>
    <div className="workspace">
      <header className="topbar"><div className="top-left"><button className="menu-button" onClick={()=>setMenu(!menu)} aria-label="Toggle menu" data-testid="button-menu">{menu?<X/>:<Menu/>}</button><span className="crumb">Book Bazaar&nbsp;/&nbsp;<b>{allPages[location]||'Workspace'}</b></span></div><div className="top-actions"><span className="today">Friday, 14 February</span><Bell size={16}/><div className="avatar">S</div><span>Store team</span></div></header>
      {children}
    </div>
    <nav className="mobile-nav"><div className="mobile-nav-inner">{mobileNav.slice(0,6).map(({to,label,Icon})=><Link key={to} href={to} className={(location===to||(to==='/sale/invoice'&&isSaleActive))?'active':''}><Icon/><span>{label}</span></Link>)}</div></nav>
  </div>;
}

function AppContent(){
  const [data,setData]=useState<Dataset>(readStore); const [form,setForm]=useState<FormState>(null); const [toast,setToast]=useState(''); const [confirm,setConfirm]=useState<{kind:'customer'|'book'|'offer'|'purchase';id:string;name:string}|null>(null);
  const [pubs,setPubs]=useState<string[]>(readPubs);
  const addPub=(name:string)=>{const trimmed=name.trim();if(!trimmed||pubs.includes(trimmed))return;const next=[...pubs,trimmed];setPubs(next);localStorage.setItem(PUBS_KEY,JSON.stringify(next));};
  useEffect(()=>{localStorage.setItem('bookbazaar-admin-v1',JSON.stringify(data));},[data]);
  useEffect(()=>{if(!toast)return undefined;const timer=setTimeout(()=>setToast(''),2800);return()=>clearTimeout(timer);},[toast]);
  const save=(kind:'customer'|'book'|'offer'|'stock'|'purchase',values:Record<string,any>,original?:Customer|Book|Offer)=>{
    if(kind==='customer'){const item={...values,id:original?.id||idFor('BB'),joinedAt:(original as Customer)?.joinedAt||today,amountPaid:Number(values.amountPaid||0),amountDue:Number(values.amountDue||0)} as Customer;setData(d=>({...d,customers:original?d.customers.map(x=>x.id===item.id?item:x):[item,...d.customers]}));setToast(original?'Customer details saved':'Customer account created');}
    if(kind==='book'){const item={...values,id:original?.id||idFor('BK')} as Book;setData(d=>({...d,books:original?d.books.map(x=>x.id===item.id?item:x):[item,...d.books]}));setToast(original?'Book details saved':'Book added to catalog');}
    if(kind==='offer'){const item={...values,id:original?.id||idFor('OF')} as Offer;setData(d=>({...d,offers:original?d.offers.map(x=>x.id===item.id?item:x):[item,...d.offers]}));setToast(original?'Offer updated':'Offer created');}
    if(kind==='stock'){const book=values.book as Book;setData(d=>({...d,books:d.books.map(x=>x.id===book.id?{...x,stock:Math.max(0,Number(x.stock)+Number(values.delta))}:x)}));setToast(`Stock updated for ${book.title}`);}
    if(kind==='purchase'){const item={...values,id:original?.id||idFor('PO')} as Purchase;setData(d=>({...d,purchases:original?d.purchases.map(x=>x.id===item.id?item:x):[item,...d.purchases]}));setToast(original?'Purchase updated':'Purchase recorded');}
    setForm(null);
  };
  const endOffer=(id:string)=>{setData(d=>({...d,offers:d.offers.map(o=>o.id===id?{...o,status:'Ended'}:o)}));setToast('Offer ended');};
  const remove=()=>{if(!confirm)return;const {kind,id}=confirm;setData(d=>({...d,[kind==='customer'?'customers':kind==='book'?'books':kind==='offer'?'offers':'purchases']:d[kind==='customer'?'customers':kind==='book'?'books':kind==='offer'?'offers':'purchases'].filter((x:any)=>x.id!==id)}));setToast(`${kind==='customer'?'Customer':kind==='book'?'Book':kind==='offer'?'Offer':'Purchase'} removed`);setConfirm(null);};
  const edit=(kind:'customer'|'book'|'offer'|'purchase',item?:Customer|Book|Offer|Purchase)=>setForm({kind,item});
  const context={data,setForm,edit,setConfirm,setToast,endOffer,pubs};
  return <AppShell>
    <Switch>
      <Route path="/"><Dashboard {...context}/></Route>
      <Route path="/customers"><Customers {...context}/></Route>
      <Route path="/parties"><ComingSoon title="Parties" sub="Manage your buyers and suppliers in one place." Icon={Users2}/></Route>
      <Route path="/books"><Books {...context}/></Route>
      <Route path="/offers"><Offers {...context}/></Route>
      <Route path="/inventory"><Inventory {...context}/></Route>
      <Route path="/purchases"><Purchases {...context}/></Route>
      <Route path="/sale/invoice"><SaleInvoicePage {...context}/></Route>
      <Route path="/sale/payment-in"><ComingSoon title="Payment-In" sub="Record incoming payments from customers." Icon={ArrowDownLeft}/></Route>
      <Route path="/sale/return"><ComingSoon title="Sale Return" sub="Process credit notes and book returns." Icon={RotateCcw}/></Route>
      <Route path="/sale/estimate"><ComingSoon title="Estimate / Quotation" sub="Send estimates and quotations to customers." Icon={ClipboardList}/></Route>
      <Route path="/sale/proforma"><ComingSoon title="Proforma Invoice" sub="Issue proforma invoices before final billing." Icon={FilePen}/></Route>
      <Route path="/sale/order"><ComingSoon title="Sale Order" sub="Track and manage customer orders." Icon={ShoppingBag}/></Route>
      <Route path="/sale/challan"><ComingSoon title="Delivery Challan" sub="Generate delivery challans for dispatches." Icon={Package}/></Route>
      <Route path="/sale/pos"><ComingSoon title="Mobile POS" sub="Quick point-of-sale billing on the go." Icon={Smartphone}/></Route>
      <Route path="/purchases"><Purchases {...context}/></Route>
      <Route path="/purchase/bill"><ComingSoon title="Purchase Bill" sub="Create and record bills from your suppliers." Icon={FileInput}/></Route>
      <Route path="/purchase/payment-out"><ComingSoon title="Payment Out" sub="Record outgoing payments to suppliers." Icon={ArrowUpLeft}/></Route>
      <Route path="/purchase/return"><ComingSoon title="Purchase Return" sub="Process returns to your suppliers." Icon={RotateCw}/></Route>
      <Route path="/purchase/order"><ComingSoon title="Purchase Order" sub="Manage and track purchase orders." Icon={ClipboardCheck}/></Route>
      <Route path="/return/sale"><ComingSoon title="Sale Return" sub="Process customer returns and credit notes." Icon={RotateCcw}/></Route>
      <Route path="/return/purchase"><ComingSoon title="Purchase Return" sub="Send returns back to your suppliers." Icon={RotateCw}/></Route>
      <Route path="/expense"><ComingSoon title="Expense" sub="Track and categorise your business expenses." Icon={Wallet}/></Route>
      <Route component={NotFound}/>
    </Switch>
    {form&&form.kind!=='bill'&&<Editor form={form} data={data} pubs={pubs} onAddPub={addPub} onClose={()=>setForm(null)} onSave={save}/>}
    {form&&form.kind==='bill'&&<BillingModal data={data} onClose={()=>setForm(null)}/>}
    {confirm&&<div className="modal-backdrop" role="presentation"><div className="modal" role="dialog" aria-modal="true"><div className="modal-head"><div><h2>Remove this {confirm.kind}?</h2><p>This action cannot be undone.</p></div><button className="icon-button" onClick={()=>setConfirm(null)} aria-label="Close"><X/></button></div><div className="modal-body"><p style={{fontSize:13,color:'#536157',lineHeight:1.6}}>You’re about to remove <b>{confirm.name}</b>. It will no longer appear in your workspace.</p></div><div className="modal-foot"><button className="btn" onClick={()=>setConfirm(null)}>Keep it</button><button className="btn danger" onClick={remove}><Trash2/> Remove</button></div></div></div>}
    {toast&&<div className="toast" role="status" data-testid="status-feedback"><Check size={15} style={{verticalAlign:'middle',marginRight:8}}/>{toast}</div>}
  </AppShell>;
}

type Context={data:Dataset;pubs:string[];setForm:(form:FormState)=>void;edit:(kind:'customer'|'book'|'offer'|'purchase',item?:Customer|Book|Offer|Purchase)=>void;setConfirm:(item:{kind:'customer'|'book'|'offer'|'purchase';id:string;name:string}|null)=>void;setToast:(msg:string)=>void;endOffer:(id:string)=>void};
function Heading({eyebrow,title,subtitle,children}:{eyebrow:string;title:string;subtitle:string;children?:ReactNode}){return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p className="subhead">{subtitle}</p></div>{children&&<div className="heading-actions">{children}</div>}</div>}
function Stat({label,value,note,Icon,tint='green'}:{label:string;value:string|number;note:string;Icon:any;tint?:string}){return <div className="panel stat-card"><div className="stat-top"><span>{label}</span><span className={`stat-icon ${tint}`}><Icon/></span></div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></div>}
function Pill({children,state}:{children:ReactNode;state?:string}){const cls=state==='Pending'||state==='Draft'||state==='Scheduled'?'warn':state==='Inactive'||state==='Ended'||state==='Out of stock'?'neutral':state==='Low stock'?'red':'';return <span className={`pill ${cls}`}>{children}</span>}
function TableEmpty({label,detail,Icon=Library,action}:{label:string;detail:string;Icon?:any;action?:ReactNode}){return <div className="empty"><div className="empty-mark"><Icon/></div><h3>{label}</h3><p>{detail}</p>{action}</div>}
function Dashboard(c:Context){
 const low=c.data.books.filter(b=>b.stock<=b.lowStockThreshold); const activeOffers=c.data.offers.filter(o=>o.status==='Active').length;
 const trend=[17,36,25,58,48,77,64,91,72,100,83,95];
 return <main className="page"><Heading eyebrow="Friday, 14 February 2025" title="Good morning, team." subtitle="A clear view of what’s moving through the shop today."><button className="btn" onClick={()=>c.setForm({kind:'customer'})}><Plus/> Add customer</button><button className="btn primary" onClick={()=>c.setForm({kind:'book'})}><Plus/> Add a book</button></Heading>
  <div className="stat-grid"><Stat label="Customer accounts" value={c.data.customers.length.toLocaleString()} note="Across your school community" Icon={UsersRound}/><Stat label="Books in catalog" value={c.data.books.length.toLocaleString()} note={`${c.data.books.filter(b=>b.status==='Active').length} titles currently active`} Icon={BookOpen}/><Stat label="Live offers" value={activeOffers} note="Available to eligible families" Icon={Tags}/><Stat label="Low stock alerts" value={low.length} note={low.length?'A few titles need attention':'All key titles are stocked'} Icon={TriangleAlert}/></div>
  <div className="overview-grid"><section className="panel panel-pad"><div className="section-head"><div><h2>Stock at a glance</h2><p>Available units across the catalog</p></div><Link href="/inventory" className="text-link">View inventory <ArrowUpRight size={13}/></Link></div><div style={{display:'flex',alignItems:'baseline',gap:8}}><strong className="serif" style={{fontSize:33,color:'#254533'}}>{c.data.books.reduce((sum,b)=>sum+b.stock,0)}</strong><span className="muted">total units on hand</span></div><div className="mini-bars">{trend.map((h,i)=><div className="bar-col" key={i}><div className={`bar ${i===9?'active':''}`} style={{height:`${h}%`}}/><span className="bar-label">{['M','T','W','T','F','S','S','M','T','W','T','F'][i]}</span></div>)}</div><div style={{display:'flex',justifyContent:'space-between',marginTop:12,fontSize:10,color:'#92978e'}}><span><span style={{color:'#315d43'}}>●</span> Weekly stock movement</span><span>Last 12 days</span></div></section>
  <section className="panel panel-pad"><div className="section-head"><div><h2>Needs a closer look</h2><p>Titles approaching their reorder point</p></div><Link href="/inventory" className="text-link">All stock <ArrowRight size={13}/></Link></div>{low.length? <div>{low.slice(0,4).map(b=><div key={b.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid #eee9df'}}><div><div className="book-title">{b.title}</div><div className="muted">{b.publication} · {b.className}</div></div><div style={{textAlign:'right'}}><b style={{fontSize:15,color:b.stock===0?'#a24840':'#a9663b'}}>{b.stock}</b><div className="muted">left</div></div></div>)}</div>:<TableEmpty label="Shelves look good" detail="No books have crossed their low-stock threshold." Icon={PackageCheck}/>}</section></div>
  <div className="overview-grid" style={{marginTop:17}}><section className="panel panel-pad"><div className="section-head"><div><h2>Recently added families</h2><p>The latest accounts in your bookshop</p></div><Link href="/customers" className="text-link">Manage customers <ArrowUpRight size={13}/></Link></div><div className="table-wrap"><table className="data-table" style={{minWidth:0}}><thead><tr><th>Customer</th><th>School</th><th>Class</th><th>Access</th></tr></thead><tbody>{c.data.customers.slice(0,4).map(x=><tr key={x.id}><td><div className="book-title">{x.name}</div><div className="muted">{x.email}</div></td><td>{x.school}</td><td>{x.className}</td><td><Pill state={x.status}>{x.status}</Pill></td></tr>)}</tbody></table></div></section>
  <section className="panel panel-pad"><div className="section-head"><div><h2>Shortcuts</h2><p>Common work, one step closer</p></div></div><div className="quick-actions"><button className="quick-action" onClick={()=>c.setForm({kind:'customer'})}><span className="quick-left"><UsersRound/> Create a family account</span><ArrowRight/></button><button className="quick-action" onClick={()=>c.setForm({kind:'offer'})}><span className="quick-left"><Tags/> Set up a book offer</span><ArrowRight/></button><button className="quick-action" onClick={()=>c.setForm({kind:'book'})}><span className="quick-left"><BookOpen/> Add a catalog title</span><ArrowRight/></button></div></section></div>
 </main>
}

function SearchBar({value,onChange,placeholder='Search by name, title, or code…'}:{value:string;onChange:(s:string)=>void;placeholder?:string}){return <div className="search-box"><Search/><input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} data-testid="input-search"/></div>}
function Customers(c:Context){
 const [query,setQuery]=useState('');const [filter,setFilter]=useState('All statuses');
 const rows=useMemo(()=>c.data.customers.filter(x=>`${x.name} ${x.email} ${x.school} ${x.id}`.toLowerCase().includes(query.toLowerCase())&&(filter==='All statuses'||x.status===filter)),[c.data.customers,query,filter]);
 return <main className="page"><Heading eyebrow="People & permissions" title="Customer accounts" subtitle="Give every family the right access to the books they need."><button className="btn primary" onClick={()=>c.setForm({kind:'customer'})} data-testid="button-add-customer"><Plus/> Add customer</button></Heading>
 <div className="stat-grid"><Stat label="Total Dues" value={money(c.data.customers.reduce((a,b)=>a+(b.amountDue||0),0))} note="Outstanding from families" Icon={Building2} tint="red"/><Stat label="Total Collected" value={money(c.data.customers.reduce((a,b)=>a+(b.amountPaid||0),0))} note="Payments received" Icon={Check} tint="green"/><Stat label="Active Families" value={c.data.customers.filter(x=>x.status==='Active').length.toString()} note="Currently enrolled" Icon={UsersRound} tint="neutral"/></div>
 <div className="toolbar"><SearchBar value={query} onChange={setQuery} placeholder="Search customers, schools, email…"/><select className="filter-select" value={filter} onChange={e=>setFilter(e.target.value)} aria-label="Filter customer status" data-testid="select-customer-status"><option>All statuses</option><option>Active</option><option>Pending</option><option>Inactive</option></select><span className="muted" style={{marginLeft:'auto'}}>{rows.length} accounts</span></div>
 <section className="panel"><div className="table-wrap"><table className="data-table"><thead><tr><th>Customer</th><th>School / class</th><th>Publication access</th><th>Payments</th><th>Joined</th><th>Status</th><th></th></tr></thead><tbody>{rows.map(x=><tr key={x.id} data-testid={`row-customer-${x.id}`}><td><div className="book-title">{x.name}</div><div className="muted">{x.email} · {x.phone}</div></td><td>{x.school}<div className="muted">{x.className}</div></td><td><div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{x.allowedPublications.slice(0,2).map(p=><span key={p} className="pill neutral">{p}</span>)}{x.allowedPublications.length>2&&<span className="pill neutral">+{x.allowedPublications.length-2}</span>}</div></td><td><div style={{display:'flex',flexDirection:'column',gap:4}}><span style={{fontSize:11,color:'#465d49',fontWeight:600}}>Paid: {money(x.amountPaid||0)}</span>{(x.amountDue||0)>0&&<span style={{fontSize:11,color:'#a24840',fontWeight:600}}>Due: {money(x.amountDue||0)}</span>}</div></td><td>{new Date(`${x.joinedAt}T00:00:00`).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</td><td><Pill state={x.status}>{x.status}</Pill></td><td><div className="row-actions"><button className="icon-button" aria-label={`Edit ${x.name}`} title="Edit customer" onClick={()=>c.edit('customer',x)} data-testid={`button-edit-customer-${x.id}`}><Pencil/></button><button className="icon-button" aria-label={`Remove ${x.name}`} title="Remove customer" onClick={()=>c.setConfirm({kind:'customer',id:x.id,name:x.name})} data-testid={`button-remove-customer-${x.id}`}><Trash2/></button></div></td></tr>)}</tbody></table>{!rows.length&&<TableEmpty label="No matching accounts" detail={query?'Try another name, email or school.':'Create your first customer account to get started.'} Icon={UsersRound} action={!query&&<button className="btn primary" onClick={()=>c.setForm({kind:'customer'})}><Plus/> Add customer</button>}/>}</div></section></main>
}

function Books(c:Context){
 const [query,setQuery]=useState('');const [pub,setPub]=useState('All publications');const [cls,setCls]=useState('All classes');
 const classes=Array.from(new Set(c.data.books.map(b=>b.className))).sort((a,b)=>Number(a.replace('Class ',''))-Number(b.replace('Class ','')));
 const rows=useMemo(()=>c.data.books.filter(b=>`${b.title} ${b.author} ${b.isbn} ${b.sku}`.toLowerCase().includes(query.toLowerCase())&&(pub==='All publications'||b.publication===pub)&&(cls==='All classes'||b.className===cls)),[c.data.books,query,pub,cls]);
 return <main className="page"><Heading eyebrow="Catalog" title="Books & titles" subtitle="Keep your school catalog accurate, discoverable, and ready to sell."><button className="btn primary" onClick={()=>c.setForm({kind:'book'})} data-testid="button-add-book"><Plus/> Add a book</button></Heading>
 <div className="toolbar"><SearchBar value={query} onChange={setQuery} placeholder="Search titles, authors, ISBN or SKU…"/><select className="filter-select" value={pub} onChange={e=>setPub(e.target.value)} aria-label="Filter publication"><option>All publications</option>{c.pubs.map(p=><option key={p}>{p}</option>)}</select><select className="filter-select" value={cls} onChange={e=>setCls(e.target.value)} aria-label="Filter class"><option>All classes</option>{classes.map(x=><option key={x}>{x}</option>)}</select><span className="muted" style={{marginLeft:'auto'}}>{rows.length} titles</span></div>
 <section className="panel"><div className="table-wrap"><table className="data-table"><thead><tr><th>Book title</th><th>Publication</th><th>Class / subject</th><th>SKU / ISBN</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead><tbody>{rows.map(b=><tr key={b.id} data-testid={`row-book-${b.id}`} className={b.stock<=b.lowStockThreshold?'low-row':''}><td><div className="book-title">{b.title}</div><div className="muted">{b.author}</div></td><td>{b.publication}</td><td>{b.className}<div className="muted">{b.subject}</div></td><td><span style={{fontSize:10}}>{b.sku}</span><div className="muted">{b.isbn}</div></td><td>{money(b.price)}</td><td><b style={{color:b.stock===0?'#a24840':b.stock<=b.lowStockThreshold?'#a9663b':'#465d49'}}>{b.stock}</b><div className="muted">min. {b.lowStockThreshold}</div></td><td><Pill state={b.status}>{b.status}</Pill></td><td><div className="row-actions"><button className="icon-button" title="Edit book" aria-label={`Edit ${b.title}`} onClick={()=>c.edit('book',b)}><Pencil/></button><button className="icon-button" title="Remove book" aria-label={`Remove ${b.title}`} onClick={()=>c.setConfirm({kind:'book',id:b.id,name:b.title})}><Trash2/></button></div></td></tr>)}</tbody></table>{!rows.length&&<TableEmpty label="No titles found" detail="Try changing your search or publication filters." Icon={BookOpen} action={<button className="btn primary" onClick={()=>c.setForm({kind:'book'})}><Plus/> Add a book</button>}/>}</div></section></main>
}

function Offers(c:Context){
 const [query,setQuery]=useState('');const [filter,setFilter]=useState('All offers');
 const rows=c.data.offers.filter(o=>`${o.title} ${o.id}`.toLowerCase().includes(query.toLowerCase())&&(filter==='All offers'||o.status===filter));
 const books=(o:Offer)=>o.bookIds.map(id=>c.data.books.find(b=>b.id===id)?.title).filter(Boolean);
 return <main className="page"><Heading eyebrow="Seasonal savings" title="Offers" subtitle="Make the right books easier to bring home."><button className="btn primary" onClick={()=>c.setForm({kind:'offer'})} data-testid="button-create-offer"><Plus/> Create offer</button></Heading>
 <div className="toolbar"><SearchBar value={query} onChange={setQuery} placeholder="Search offer names…"/><select className="filter-select" value={filter} onChange={e=>setFilter(e.target.value)} aria-label="Filter offer status"><option>All offers</option><option>Active</option><option>Scheduled</option><option>Ended</option></select><span className="muted" style={{marginLeft:'auto'}}>{rows.length} offers</span></div>
 {rows.length?<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,330px),1fr))',gap:14}}>{rows.map((o,i)=><article className="panel panel-pad" key={o.id} data-testid={`card-offer-${o.id}`} style={{position:'relative',overflow:'hidden'}}><div style={{position:'absolute',right:0,top:0,width:104,height:104,borderRadius:'0 0 0 100%',background:['#e8e6d7','#f1e2d2','#e1e9df'][i%3],display:'flex',justifyContent:'flex-end',padding:'15px'}}><Tags size={19} color="#60775e"/></div><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,position:'relative'}}><Pill state={o.status}>{o.status}</Pill><div className="row-actions"><button className="icon-button" title="Edit offer" aria-label={`Edit ${o.title}`} onClick={()=>c.edit('offer',o)}><Pencil/></button>{o.status!=='Ended'&&<button className="icon-button" title="End offer" aria-label={`End ${o.title}`} onClick={()=>c.endOffer(o.id)}><Check/></button>}<button className="icon-button" title="Remove offer" aria-label={`Remove ${o.title}`} onClick={()=>c.setConfirm({kind:'offer',id:o.id,name:o.title})}><Trash2/></button></div></div><div className="eyebrow">{o.id} · {o.bookIds.length} {o.bookIds.length===1?'title':'titles'}</div><h2 className="serif" style={{fontSize:21,color:'#264333',margin:'0 90px 13px 0'}}>{o.title}</h2><div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:15}}><strong className="serif" style={{fontSize:33,color:'#a76850'}}>{o.discountPercent}%</strong><span style={{fontSize:11,color:'#778279'}}>off selected titles</span></div><div style={{fontSize:10,color:'#707c70',lineHeight:1.8,minHeight:37}}>{books(o).join(' · ')||'No active titles selected'}</div><div style={{borderTop:'1px solid #ebe6da',paddingTop:12,marginTop:14,display:'flex',justifyContent:'space-between',fontSize:10,color:'#899087'}}><span><CalendarDays size={12} style={{verticalAlign:'middle',marginRight:5}}/>{o.startDate} — {o.endDate}</span><span>{o.id}</span></div></article>)}</div>:<section className="panel"><TableEmpty label="No offers to show" detail="Create a considered offer and give families a little more reason to explore." Icon={Tags} action={<button className="btn primary" onClick={()=>c.setForm({kind:'offer'})}><Plus/> Create offer</button>}/></section>}</main>
}


function Purchases(c:Context){
  const [query,setQuery]=useState('');const [filter,setFilter]=useState('All purchases');
  const rows=c.data.purchases.filter(p=>p.manufacturer.toLowerCase().includes(query.toLowerCase())&&(filter==='All purchases'||p.status===filter));
  return <main className="page"><Heading eyebrow="Supplier Relations" title="Purchases & Wholesalers" subtitle="Track inventory purchases, sales progress, and payment dues."><button className="btn primary" onClick={()=>c.setForm({kind:'purchase'})}><Plus/> Record purchase</button></Heading>
  <div className="stat-grid"><Stat label="Total Dues" value={money(c.data.purchases.reduce((a,b)=>a+b.amountDue,0))} note="Outstanding payments" Icon={Building2}/><Stat label="Total Paid" value={money(c.data.purchases.reduce((a,b)=>a+b.amountPaid,0))} note="Cleared to wholesalers" Icon={Check}/><Stat label="Total Books Purchased" value={c.data.purchases.reduce((a,b)=>a+b.qtyPurchased,0)} note="Across all orders" Icon={Boxes}/></div>
  <div className="toolbar"><SearchBar value={query} onChange={setQuery} placeholder="Search wholesaler..."/><select className="filter-select" value={filter} onChange={e=>setFilter(e.target.value)}><option>All purchases</option><option>Paid</option><option>Partial</option><option>Pending</option></select></div>
  <section className="panel"><div className="table-wrap"><table className="data-table"><thead><tr><th>Wholesaler Name</th><th>Book / Date</th><th>Books Purchased</th><th>Current Stock</th><th>Amount Paid</th><th>Amount Due</th><th>Status</th><th></th></tr></thead><tbody>{rows.map(p=>{
    const b=c.data.books.find(x=>x.id===p.bookId);
    return <tr key={p.id}><td><b>{p.manufacturer}</b><div className="muted">{p.id}</div></td><td>{b?.title||p.bookId}<div className="muted">{p.date}</div></td><td>{p.qtyPurchased}</td><td><b style={{color:'#a9663b'}}>{b?.stock} left</b></td><td>{money(p.amountPaid)}</td><td><b style={{color:p.amountDue>0?'#a24840':''}}>{money(p.amountDue)}</b></td><td><Pill state={p.status}>{p.status}</Pill></td><td><div className="row-actions"><button className="icon-button" title="Generate Bill" onClick={()=>c.setForm({kind:'bill', item:p})}><Plus/></button><button className="icon-button" onClick={()=>c.setConfirm({kind:'purchase',id:p.id,name:p.id})}><Trash2/></button></div></td></tr>
  })}</tbody></table>{!rows.length&&<TableEmpty label="No purchases found" detail="Record your first wholesaler purchase." Icon={Truck}/>}</div></section></main>
}

function Inventory(c:Context){
 const [query,setQuery]=useState('');const [filter,setFilter]=useState('All stock');
 const rows=c.data.books.filter(b=>`${b.title} ${b.publication} ${b.sku}`.toLowerCase().includes(query.toLowerCase())&&(filter==='All stock'||(filter==='Low stock'&&b.stock>0&&b.stock<=b.lowStockThreshold)||(filter==='Out of stock'&&b.stock===0)||(filter==='Healthy'&&b.stock>b.lowStockThreshold)));
 const low=c.data.books.filter(b=>b.stock<=b.lowStockThreshold).length;
 return <main className="page"><Heading eyebrow="Stockroom" title="Inventory" subtitle="Know what’s on the shelf before a family comes looking."><button className="btn" onClick={()=>{setFilter('Low stock');setQuery('')}}><TriangleAlert/> Review low stock</button></Heading>
 <div className="stat-grid"><Stat label="Total units on hand" value={c.data.books.reduce((a,b)=>a+b.stock,0)} note="Across all catalog titles" Icon={Boxes}/><Stat label="Low stock titles" value={low} note="At or below reorder threshold" Icon={TriangleAlert}/><Stat label="Out of stock" value={c.data.books.filter(b=>b.stock===0).length} note="Needs replenishment" Icon={PackageCheck}/><Stat label="Catalog titles" value={c.data.books.length} note="Tracked in your stockroom" Icon={BookOpen}/></div>
 {low>0&&<div className="notice" style={{marginBottom:16}}><TriangleAlert/> <span><b>{low} titles need attention.</b> Adjust on-hand quantities or use the low-stock filter to plan a restock.</span></div>}
 <div className="toolbar"><SearchBar value={query} onChange={setQuery} placeholder="Search inventory by title or SKU…"/><select className="filter-select" value={filter} onChange={e=>setFilter(e.target.value)} aria-label="Filter stock"><option>All stock</option><option>Low stock</option><option>Out of stock</option><option>Healthy</option></select><span className="muted" style={{marginLeft:'auto'}}>{rows.length} titles</span></div>
 <section className="panel"><div className="table-wrap"><table className="data-table"><thead><tr><th>Title</th><th>Publication</th><th>SKU</th><th>On hand</th><th>Reorder point</th><th>Stock health</th><th>Stock value</th><th></th></tr></thead><tbody>{rows.map(b=><tr key={b.id} className={b.stock<=b.lowStockThreshold?'low-row':''}><td><div className="book-title">{b.title}</div><div className="muted">{b.author}</div></td><td>{b.publication}</td><td>{b.sku}</td><td><b style={{fontSize:14,color:b.stock===0?'#a24840':b.stock<=b.lowStockThreshold?'#a9663b':'#31513d'}}>{b.stock}</b></td><td>{b.lowStockThreshold} units</td><td><Pill state={b.stock===0?'Out of stock':b.stock<=b.lowStockThreshold?'Low stock':'Healthy'}>{b.stock===0?'Out of stock':b.stock<=b.lowStockThreshold?'Low stock':'Healthy'}</Pill></td><td>{money(b.stock*b.price)}</td><td><button className="btn" style={{padding:'7px 10px'}} onClick={()=>c.setForm({kind:'stock',book:b})}><Plus size={13}/> Adjust</button></td></tr>)}</tbody></table>{!rows.length&&<TableEmpty label="Nothing in this view" detail="Try another filter or search term." Icon={Boxes}/>}</div></section></main>
}

function Editor({form,data,pubs,onAddPub,onClose,onSave}:{form:Exclude<FormState,null>;data:Dataset;pubs:string[];onAddPub:(name:string)=>void;onClose:()=>void;onSave:(kind:any,values:any,original?:any)=>void}){
 const kind=form.kind; const editing=!!form.item; const original=form.item as any;
 const [values,setValues]=useState<Record<string,any>>(()=>{
   if(kind==='customer')return original?{...original,allowedPublications:[...original.allowedPublications],allowedBooks:original.allowedBooks?[...original.allowedBooks]:[]}:{name:'',email:'',phone:'',school:'',className:'Class 5',status:'Active',allowedPublications:[],allowedBooks:[]};
   if(kind==='book')return original?{...original}:{title:'',publication:pubs[0]||'RD Sharma',subject:'Mathematics',className:'Class 5',isbn:'',sku:'',price:'',stock:0,lowStockThreshold:10,status:'Active'};
   if(kind==='offer')return original?{...original,bookIds:[...original.bookIds]}:{title:'',bookIds:[],discountPercent:10,startDate:today,endDate:'2025-03-15',status:'Active'};
    if(kind==='purchase')return original?{...original}:{manufacturer:'',bookId:'',qtyPurchased:100,amountPaid:0,amountDue:0,status:'Pending',date:today};
   return {delta:0,book:form.book};
 });
 const [selClass, setSelClass] = useState('');
 const [selPub, setSelPub] = useState('');
 const [selBook, setSelBook] = useState('');
 const [newPubInput, setNewPubInput] = useState('');
 const [showPubInput, setShowPubInput] = useState(false);
 const set=(key:string,value:any)=>setValues(v=>({...v,[key]:value}));
 const submit=(e:FormEvent)=>{e.preventDefault();const payload={...values};if(kind==='book'){payload.price=Number(payload.price);payload.stock=Number(payload.stock);payload.lowStockThreshold=Number(payload.lowStockThreshold);}if(kind==='offer')payload.discountPercent=Number(payload.discountPercent);if(kind==='purchase'){payload.qtyPurchased=Number(payload.qtyPurchased);payload.amountPaid=Number(payload.amountPaid);payload.amountDue=Number(payload.amountDue);}onSave(kind,payload,original);};
 const title=kind==='customer'?(editing?'Edit customer account':'Create customer account'):kind==='book'?(editing?'Edit book details':'Add a book to catalog'):kind==='offer'?(editing?'Edit offer':'Create an offer'):kind==='purchase'?(editing?'Edit purchase':'Record purchase'):'Adjust stock';
 const desc=kind==='customer'?'Account details and publication permissions':kind==='book'?'Catalog information, pricing, and stock threshold':kind==='offer'?'Choose the books and dates for this offer':kind==='purchase'?'Log a wholesaler purchase and payment status':'Record a stock movement';
 return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><form className="modal" onSubmit={submit} role="dialog" aria-modal="true"><div className="modal-head"><div><h2>{title}</h2><p>{desc}</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close"><X/></button></div><div className="modal-body">
  {kind==='customer'&&<div className="form-grid"><div className="field"><label>Full name *</label><input required value={values.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. Aanya Sharma"/></div><div className="field"><label>Email address *</label><input required type="email" value={values.email} onChange={e=>set('email',e.target.value)} placeholder="family@email.com"/></div><div className="field"><label>Phone number *</label><input required value={values.phone} onChange={e=>set('phone',e.target.value)} placeholder="+91 98xxx xxxxx"/></div><div className="field"><label>School *</label><input required value={values.school} onChange={e=>set('school',e.target.value)} placeholder="School name"/></div><div className="field"><label>Amount Paid (₹)</label><input type="number" min="0" value={values.amountPaid ?? ''} onChange={e=>set('amountPaid',e.target.value)}/></div><div className="field"><label>Amount Due (₹)</label><input type="number" min="0" value={values.amountDue ?? ''} onChange={e=>set('amountDue',e.target.value)}/></div><div className="field"><label>Account status</label><select value={values.status} onChange={e=>set('status',e.target.value)}><option>Active</option><option>Pending</option><option>Inactive</option></select></div><div className="field full"><label>Assign specific books</label><div style={{display:'flex',gap:8,marginBottom:8}}><select style={{flex:1}} value={selClass} onChange={e=>{setSelClass(e.target.value);setSelPub('');setSelBook('');}}><option value="">Select Class</option>{Array.from({length:12},(_,i)=>`Class ${i+1}`).map(x=><option key={x}>{x}</option>)}</select><select style={{flex:1}} value={selPub} onChange={e=>{setSelPub(e.target.value);setSelBook('');}} disabled={!selClass}><option value="">Select Publication</option>{Array.from(new Set(data.books.filter(b=>b.className===selClass).map(b=>b.publication))).map(p=><option key={p}>{p}</option>)}</select><select style={{flex:1}} value={selBook} onChange={e=>setSelBook(e.target.value)} disabled={!selPub}><option value="">Select Book</option>{data.books.filter(b=>b.className===selClass&&b.publication===selPub).map(b=><option key={b.id} value={b.id}>{b.title}</option>)}</select><button type="button" className="btn" disabled={!selBook} onClick={()=>{if(!values.allowedBooks?.includes(selBook))set('allowedBooks',[...(values.allowedBooks||[]),selBook]);setSelBook('');}}>Add</button></div><div className="checks">{(values.allowedBooks||[]).map((id:string)=>{const b=data.books.find(x=>x.id===id);return <label className="check-pill" key={id}><input type="checkbox" checked onChange={()=>set('allowedBooks',values.allowedBooks.filter((x:string)=>x!==id))}/>{b?.title||id}</label>})}</div><span className="muted">Families can only purchase these selected titles.</span></div></div>}
  {kind==='book'&&<div className="form-grid"><div className="field full"><label>Book title *</label><input required value={values.title} onChange={e=>set('title',e.target.value)} placeholder="Title as it appears on the cover"/></div><div className="field full"><label>Publication *</label><div style={{display:'flex',gap:8,alignItems:'flex-start'}}><select style={{flex:1}} value={values.publication} onChange={e=>set('publication',e.target.value)}>{pubs.map(p=><option key={p}>{p}</option>)}</select><button type="button" title="Add new publication" style={{flexShrink:0,display:'flex',alignItems:'center',gap:5,padding:'8px 12px',background:'#f0efe6',border:'1px solid #d5cfc3',borderRadius:7,cursor:'pointer',fontSize:12,color:'#3a5241',fontWeight:600,whiteSpace:'nowrap'}} onClick={()=>setShowPubInput(v=>!v)}><PlusCircle size={14}/> Add publication</button></div>{showPubInput&&<div style={{display:'flex',gap:8,marginTop:8,alignItems:'center'}}><input style={{flex:1,fontSize:13,padding:'7px 10px',border:'1px solid #d5cfc3',borderRadius:7,outline:'none'}} placeholder="e.g. Oxford University Press" value={newPubInput} onChange={e=>setNewPubInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();if(newPubInput.trim()){onAddPub(newPubInput.trim());set('publication',newPubInput.trim());setNewPubInput('');setShowPubInput(false);}}}}/><button type="button" style={{padding:'7px 14px',background:'#3a5241',color:'#fff',border:'none',borderRadius:7,cursor:'pointer',fontWeight:600,fontSize:12}} onClick={()=>{if(newPubInput.trim()){onAddPub(newPubInput.trim());set('publication',newPubInput.trim());setNewPubInput('');setShowPubInput(false);}}}>Add</button><button type="button" style={{padding:'7px 12px',background:'transparent',border:'1px solid #d5cfc3',borderRadius:7,cursor:'pointer',fontSize:12,color:'#536157'}} onClick={()=>{setShowPubInput(false);setNewPubInput('');}}>Cancel</button></div>}</div><div className="field"><label>Subject</label><input value={values.subject} onChange={e=>set('subject',e.target.value)} placeholder="Mathematics"/></div><div className="field"><label>Class</label><select value={values.className} onChange={e=>set('className',e.target.value)}>{Array.from({length:12},(_,i)=>`Class ${i+1}`).map(x=><option key={x}>{x}</option>)}</select></div><div className="field"><label>ISBN</label><input value={values.isbn} onChange={e=>set('isbn',e.target.value)} placeholder="978-…"/></div><div className="field"><label>SKU *</label><input required value={values.sku} onChange={e=>set('sku',e.target.value)} placeholder="RDS-MTH-08"/></div><div className="field"><label>Price (₹) *</label><input required type="number" min="0" step="1" value={values.price} onChange={e=>set('price',e.target.value)} placeholder="0"/></div><div className="field"><label>Units in stock</label><input type="number" min="0" value={values.stock} onChange={e=>set('stock',e.target.value)}/></div><div className="field"><label>Low-stock threshold</label><input type="number" min="0" value={values.lowStockThreshold} onChange={e=>set('lowStockThreshold',e.target.value)}/></div><div className="field"><label>Catalog status</label><select value={values.status} onChange={e=>set('status',e.target.value)}><option>Active</option><option>Draft</option><option>Archived</option></select></div></div>}
  {kind==='offer'&&<div className="form-grid"><div className="field full"><label>Offer name *</label><input required value={values.title} onChange={e=>set('title',e.target.value)} placeholder="A stronger start in maths"/></div><div className="field"><label>Discount (%) *</label><input required type="number" min="1" max="90" value={values.discountPercent} onChange={e=>set('discountPercent',e.target.value)}/></div><div className="field"><label>Status</label><select value={values.status} onChange={e=>set('status',e.target.value)}><option>Active</option><option>Scheduled</option><option>Ended</option></select></div><div className="field"><label>Start date</label><input required type="date" value={values.startDate} onChange={e=>set('startDate',e.target.value)}/></div><div className="field"><label>End date</label><input required type="date" min={values.startDate} value={values.endDate} onChange={e=>set('endDate',e.target.value)}/></div><div className="field full"><label>Included books</label><div className="checks">{data.books.map(b=><label className="check-pill" key={b.id}><input type="checkbox" checked={values.bookIds.includes(b.id)} onChange={e=>set('bookIds',e.target.checked?[...values.bookIds,b.id]:values.bookIds.filter((x:string)=>x!==b.id))}/>{b.title}</label>)}</div></div></div>}
  {kind==='purchase'&&<div className="form-grid"><div className="field full"><label>Wholesaler Name *</label><input required value={values.manufacturer} onChange={e=>set('manufacturer',e.target.value)} placeholder="e.g. Apex Distributors"/></div><div className="field full"><label>Book</label><select required value={values.bookId} onChange={e=>set('bookId',e.target.value)}><option value="">Select a catalog book</option>{data.books.map(b=><option key={b.id} value={b.id}>{b.title} ({b.className})</option>)}</select></div><div className="field"><label>Qty Purchased</label><input type="number" required value={values.qtyPurchased} onChange={e=>set('qtyPurchased',e.target.value)}/></div><div className="field"><label>Amount Paid (₹)</label><input type="number" required value={values.amountPaid} onChange={e=>set('amountPaid',e.target.value)}/></div><div className="field"><label>Amount Due (₹)</label><input type="number" required value={values.amountDue} onChange={e=>set('amountDue',e.target.value)}/></div><div className="field"><label>Payment Status</label><select value={values.status} onChange={e=>set('status',e.target.value)}><option>Paid</option><option>Partial</option><option>Pending</option></select></div><div className="field"><label>Date</label><input type="date" required value={values.date} onChange={e=>set('date',e.target.value)}/></div></div>}
   {kind==='stock'&&<div><div style={{background:'#f0efe6',borderRadius:9,padding:14,marginBottom:17}}><div className="book-title">{form.book?.title}</div><div className="muted">{form.book?.publication} · {form.book?.sku} · Currently {form.book?.stock} units</div></div><div className="field"><label>Quantity change</label><input type="number" required value={values.delta} onChange={e=>set('delta',e.target.value)} placeholder="Use a negative number to record a sale or correction"/><span className="muted">Current quantity: {form.book?.stock}. New quantity cannot be below zero.</span></div><div style={{display:'flex',gap:8,marginTop:14}}><button className="btn" type="button" onClick={()=>set('delta',Number(values.delta)-1)}><Minus/> Remove one</button><button className="btn" type="button" onClick={()=>set('delta',Number(values.delta)+1)}><Plus/> Add one</button></div></div>}
 </div><div className="modal-foot"><button className="btn" type="button" onClick={onClose}>Cancel</button><button className="btn primary" type="submit"><Save/> {kind==='stock'?'Save adjustment':editing?'Save changes':kind==='offer'?'Create offer':kind==='purchase'?'Save purchase':kind==='book'?'Add book':'Create account'}</button></div></form></div>
}

function BillingModal({ onClose, data }: { onClose: () => void, data: Dataset }) {
  const [items, setItems] = useState<{bookId:string; qty:number; price:number; discount:number}[]>([]);
  const [selectedBook, setSelectedBook] = useState('');
  const [qty, setQty] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [overallDiscount, setOverallDiscount] = useState(0);

  const addItem = () => {
    if(!selectedBook) return;
    const book = data.books.find(b=>b.id===selectedBook);
    if(book) {
      setItems([...items, { bookId: selectedBook, qty, price: book.price, discount }]);
      setSelectedBook(''); setQty(1); setDiscount(0);
    }
  }
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  }

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty * (1 - item.discount/100)), 0);
  const total = subtotal * (1 - overallDiscount/100);

  const handlePrint = () => {
    window.print();
  }

  return (
    <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div className="modal print-section" style={{maxWidth: 700}} role="dialog" aria-modal="true">
        <div className="modal-head no-print">
          <div><h2>Generate Bill</h2><p>Add items and generate PDF bill for customer.</p></div>
          <button type="button" className="icon-button" onClick={onClose}><X/></button>
        </div>
        <div className="modal-body">
          <div className="form-grid no-print" style={{marginBottom: 20}}>
            <div className="field full">
               <label>Book</label>
               <select value={selectedBook} onChange={e=>setSelectedBook(e.target.value)}>
                 <option value="">Select a book...</option>
                 {data.books.map(b=><option key={b.id} value={b.id}>{b.title} (₹{b.price})</option>)}
               </select>
            </div>
            <div className="field"><label>Quantity</label><input type="number" min="1" value={qty} onChange={e=>setQty(Number(e.target.value))}/></div>
            <div className="field"><label>Item Discount (%)</label><input type="number" min="0" max="100" value={discount} onChange={e=>setDiscount(Number(e.target.value))}/></div>
            <div className="field" style={{display:'flex', alignItems:'flex-end'}}>
               <button className="btn primary" type="button" onClick={addItem}><Plus/> Add Item</button>
            </div>
          </div>
          
          <hr className="no-print" style={{margin:'20px 0', borderColor:'#eee9df'}}/>

          <div className="invoice-view" style={{padding: '0 10px'}}>
             <h2 style={{fontFamily: 'var(--app-font-serif)', color: '#244331', borderBottom: '2px solid #244c38', paddingBottom: 10}}>Book Bazaar - Invoice</h2>
             <div className="table-wrap" style={{ marginTop: 20 }}>
               <table className="data-table" style={{width: '100%', minWidth: 500}}>
                 <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Discount</th><th>Total</th><th className="no-print"></th></tr></thead>
                 <tbody>
                   {items.map((item, i) => {
                     const b = data.books.find(x=>x.id===item.bookId);
                     const rowTotal = item.price * item.qty * (1 - item.discount/100);
                     return <tr key={i}>
                       <td>{b?.title}</td>
                       <td>{item.qty}</td>
                       <td>₹{item.price}</td>
                       <td>{item.discount}%</td>
                       <td>₹{rowTotal.toFixed(2)}</td>
                       <td className="no-print"><div className="row-actions"><button className="icon-button" onClick={()=>removeItem(i)}><Trash2/></button></div></td>
                     </tr>
                   })}
                   {items.length === 0 && <tr className="no-print"><td colSpan={6} style={{textAlign:'center', padding:20}}>No items added yet.</td></tr>}
                 </tbody>
               </table>
             </div>
             <div style={{display:'flex', justifyContent:'flex-end', marginTop: 20}}>
               <div style={{width: 300}}>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom: 10, fontSize: 13}}>
                     <span style={{color: '#526056'}}>Subtotal:</span>
                     <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom: 10, alignItems:'center', fontSize: 13}}>
                     <span style={{color: '#526056'}}>Overall Discount (%):</span>
                     <input className="no-print" type="number" min="0" max="100" style={{width: 60, padding: 4, borderRadius: 4, border: '1px solid #ccc'}} value={overallDiscount} onChange={e=>setOverallDiscount(Number(e.target.value))} />
                     <span className="print-only">{overallDiscount}%</span>
                  </div>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize: 18, fontWeight: 'bold', borderTop: '1px solid #e9e4d9', paddingTop: 12, color: '#223e2e'}}>
                     <span>Total:</span>
                     <span>₹{total.toFixed(2)}</span>
                  </div>
               </div>
             </div>
          </div>
        </div>
        <div className="modal-foot no-print">
          <button className="btn" type="button" onClick={onClose}>Cancel</button>
          <button className="btn primary" type="button" onClick={handlePrint}>Print / Save PDF</button>
        </div>
      </div>
    </div>
  )
}

function RoutedErrorBoundary({children}:{children:ReactNode}){const [location]=useLocation();return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>}
function Router(){return <RoutedErrorBoundary><AppContent/></RoutedErrorBoundary>}
function App(){return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/,'')}><Router/></WouterRouter><Toaster/></TooltipProvider></QueryClientProvider>}
export default App;
