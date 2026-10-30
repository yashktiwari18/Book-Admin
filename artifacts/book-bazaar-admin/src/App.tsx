import { type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { LayoutDashboard, Truck, Building2, UsersRound, BookOpen, Tags, Boxes, Search, Plus, Pencil, Trash2, ArrowUpRight, ArrowRight, Menu, X, Bell, TriangleAlert, PackageCheck, Library, Check, Minus, Save, CalendarDays, PlusCircle, Users2, FileOutput, FileText, ArrowDownLeft, RotateCcw, ClipboardList, FilePen, ShoppingBag, Package, Smartphone, Wallet, ChevronDown, FileInput, ArrowUpLeft, RotateCw, ClipboardCheck, RefreshCcw, Download, Share2, Eye, Printer, ChevronLeft } from 'lucide-react';
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
// ─────────────────────── Number to Words ─────────────────────────────────────
function numberToWords(n: number): string {
  if (n === 0) return 'Zero';
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  function below1000(num: number): string {
    if (num === 0) return '';
    if (num < 20) return ones[num] + ' ';
    if (num < 100) return tens[Math.floor(num/10)] + (num%10 ? ' ' + ones[num%10] : '') + ' ';
    return ones[Math.floor(num/100)] + ' Hundred ' + below1000(num%100);
  }
  const absN = Math.round(Math.abs(n));
  let result = '';
  if (absN >= 10000000) { result += below1000(Math.floor(absN/10000000)) + 'Crore '; }
  if (absN >= 100000) { result += below1000(Math.floor((absN%10000000)/100000)) + 'Lakh '; }
  if (absN >= 1000) { result += below1000(Math.floor((absN%100000)/1000)) + 'Thousand '; }
  result += below1000(absN%1000);
  return result.trim() + ' Rupees Only';
}

// ─────────────────────── Digital Invoice Component ───────────────────────────
const STORE_NAME = 'Book Bazaar';
const STORE_TAGLINE = 'Every title, in good hands.';

function DigitalInvoice({ inv, onClose, onEdit }: { inv: SaleInvoiceType; onClose: () => void; onEdit: () => void }) {
  const [showPreview, setShowPreview] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const total = calcInvoiceTotal(inv);
  const balDue = Math.max(0, total - inv.received);
  const amtWords = numberToWords(total);

  const handlePrint = () => {
    // Temporarily show preview to allow printing the invoice content
    const printContent = invoiceRef.current;
    if (!printContent) return;
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) { window.print(); return; }
    win.document.write(`
      <html><head><title>Invoice ${inv.invoiceNo}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #fff; color: #1a1a1a; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        @media print { @page { margin: 0; size: A4; } body { padding: 0; } }
      </style></head><body>
      ${printContent.outerHTML}
      <script>window.onload=()=>{ window.print(); setTimeout(()=>window.close(),800); }<\/script>
      </body></html>
    `);
    win.document.close();
  };

  const handleShare = async () => {
    const text = `Invoice ${inv.invoiceNo}\nCustomer: ${inv.customerName}\nDate: ${inv.date}\nTotal: ${money(total)}\nBalance Due: ${money(balDue)}\n\nThank you for your business!\n— ${STORE_NAME}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Invoice ${inv.invoiceNo} – ${STORE_NAME}`, text });
        return;
      } catch {}
    }
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
      alert('Invoice details copied to clipboard!');
    } catch {
      alert(text);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f2f0e8', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e7e2d6', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid #e2ded2', borderRadius: 8, cursor: 'pointer', padding: '6px 8px', display: 'flex', alignItems: 'center', color: '#536157' }}>
            <ChevronLeft size={18} />
          </button>
          <div>
            <div style={{ fontFamily: 'var(--app-font-serif)', fontSize: 18, fontWeight: 700, color: '#1e3d2c' }}>Invoice {inv.invoiceNo}</div>
            <div style={{ fontSize: 11, color: '#8a9389', marginTop: 1 }}>{inv.customerName} · {inv.date}</div>
          </div>
        </div>
        <button onClick={onEdit} className="btn" style={{ fontSize: 12 }}>
          <Pencil size={14} /> Edit
        </button>
      </div>

      {/* Invoice Paper */}
      <div style={{ flex: 1, padding: '24px 20px 100px', display: 'flex', justifyContent: 'center' }}>
        <div ref={invoiceRef} id="digital-invoice-print" style={{ width: '100%', maxWidth: 680, background: '#fff', borderRadius: 14, border: '1px solid #e7e2d4', boxShadow: '0 4px 24px rgba(30,61,44,0.10)', overflow: 'hidden' }}>
          {/* Invoice Header */}
          <div style={{ background: 'linear-gradient(135deg, #1e3d2c 0%, #2a5240 100%)', color: '#fff', padding: '24px 28px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: 'var(--app-font-serif)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>{STORE_NAME}</div>
                <div style={{ fontSize: 11, opacity: 0.75, letterSpacing: '0.5px' }}>{STORE_TAGLINE}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '6px 14px', display: 'inline-block' }}>
                  <div style={{ fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.8, marginBottom: 2 }}>Tax Invoice</div>
                  <div style={{ fontFamily: 'var(--app-font-serif)', fontSize: 17, fontWeight: 700 }}>{inv.invoiceNo}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To + Invoice Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, borderBottom: '1px solid #eee9df' }}>
            <div style={{ padding: '18px 24px', borderRight: '1px solid #eee9df' }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.2px', color: '#a9663b', textTransform: 'uppercase', marginBottom: 8 }}>Bill To</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1e3d2c', marginBottom: 3 }}>{inv.billingName || inv.customerName || '—'}</div>
              {inv.phone && <div style={{ fontSize: 12, color: '#536157' }}>Contact: {inv.phone}</div>}
              {inv.partyBalance > 0 && <div style={{ fontSize: 11, color: '#a9663b', marginTop: 4 }}>Previous Balance: {money(inv.partyBalance)}</div>}
            </div>
            <div style={{ padding: '18px 24px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.2px', color: '#a9663b', textTransform: 'uppercase', marginBottom: 8 }}>Invoice Details</div>
              <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    ['Invoice No.', inv.invoiceNo],
                    ['Date', inv.date],
                    ['Time', inv.time],
                    ['Payment Mode', inv.paymentType],
                    inv.paymentRef ? ['Ref No.', inv.paymentRef] : null,
                  ].filter((r): r is string[] => r !== null).map(([label, val], i) => (
                    <tr key={i}>
                      <td style={{ color: '#8a9389', paddingBottom: 4, paddingRight: 12, whiteSpace: 'nowrap' }}>{label}</td>
                      <td style={{ color: '#2b4435', fontWeight: 600, paddingBottom: 4 }}>{val as string}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ padding: '0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f4f1e8' }}>
                  <th style={{ padding: '10px 18px', fontSize: 9, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#8a9187', textAlign: 'left', borderBottom: '1px solid #e9e4d9' }}>#</th>
                  <th style={{ padding: '10px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#8a9187', textAlign: 'left', borderBottom: '1px solid #e9e4d9' }}>Book Name</th>
                  <th style={{ padding: '10px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#8a9187', textAlign: 'center', borderBottom: '1px solid #e9e4d9' }}>Qty</th>
                  <th style={{ padding: '10px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#8a9187', textAlign: 'right', borderBottom: '1px solid #e9e4d9' }}>Price</th>
                  <th style={{ padding: '10px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#8a9187', textAlign: 'center', borderBottom: '1px solid #e9e4d9' }}>Disc %</th>
                  <th style={{ padding: '10px 18px 10px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#8a9187', textAlign: 'right', borderBottom: '1px solid #e9e4d9' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {inv.items.map((item, i) => {
                  const amt = item.qty * item.price * (1 - item.discountPct / 100);
                  return (
                    <tr key={item.id} style={{ background: i % 2 === 0 ? '#fff' : '#faf9f4' }}>
                      <td style={{ padding: '11px 18px', fontSize: 12, color: '#8a9389', borderBottom: '1px solid #f0ebe0' }}>{i + 1}</td>
                      <td style={{ padding: '11px 12px', borderBottom: '1px solid #f0ebe0' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e3d2c' }}>{item.name}</div>
                        {item.bookId && <div style={{ fontSize: 10, color: '#8a9389', marginTop: 2 }}>ID: {item.bookId}</div>}
                      </td>
                      <td style={{ padding: '11px 12px', fontSize: 12, color: '#536157', textAlign: 'center', borderBottom: '1px solid #f0ebe0' }}>{item.qty}</td>
                      <td style={{ padding: '11px 12px', fontSize: 12, color: '#536157', textAlign: 'right', borderBottom: '1px solid #f0ebe0' }}>{money(item.price)}</td>
                      <td style={{ padding: '11px 12px', fontSize: 12, color: item.discountPct > 0 ? '#a9663b' : '#8a9389', textAlign: 'center', borderBottom: '1px solid #f0ebe0' }}>{item.discountPct > 0 ? `${item.discountPct}%` : '—'}</td>
                      <td style={{ padding: '11px 18px 11px 12px', fontSize: 13, fontWeight: 700, color: '#1e3d2c', textAlign: 'right', borderBottom: '1px solid #f0ebe0' }}>{money(amt)}</td>
                    </tr>
                  );
                })}
                {inv.items.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#8a9389', fontSize: 12 }}>No items</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals + Amount in Words */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 0, borderTop: '2px solid #e9e4d9' }}>
            {/* Amount in words + notes */}
            <div style={{ padding: '18px 24px', borderRight: '1px solid #eee9df' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#8a9389', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>Invoice Amount in Words</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#2b4435', fontStyle: 'italic', marginBottom: 14 }}>{amtWords}</div>
              {inv.notes && (
                <>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#8a9389', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>Note</div>
                  <div style={{ fontSize: 11, color: '#536157', whiteSpace: 'pre-line' }}>{inv.notes}</div>
                </>
              )}
            </div>
            {/* Totals */}
            <div style={{ padding: '18px 24px', minWidth: 220 }}>
              {(() => {
                const itemsSub = inv.items.reduce((s, i) => s + i.qty * i.price * (1 - i.discountPct / 100), 0);
                const discAmt = itemsSub * inv.discountPct / 100;
                const rows: [string, string, string?][] = [];
                rows.push(['Subtotal', money(itemsSub)]);
                if (inv.discountPct > 0) rows.push(['Discount (' + inv.discountPct + '%)', '−' + money(discAmt), 'red']);
                if (inv.shipping > 0) rows.push(['Shipping', money(inv.shipping)]);
                if (inv.roundOff) rows.push(['Round Off', `₹ ${(Math.round(itemsSub * (1 - inv.discountPct / 100) + inv.shipping) - (itemsSub * (1 - inv.discountPct / 100) + inv.shipping)).toFixed(2)}`]);
                return rows.map(([label, val, tint], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 24, fontSize: 12, color: tint === 'red' ? '#a24840' : '#536157', paddingBottom: 8, marginBottom: 8, borderBottom: '1px dashed #eee9df' }}>
                    <span>{label}</span><span style={{ fontWeight: 500 }}>{val}</span>
                  </div>
                ));
              })()}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, fontSize: 16, fontWeight: 800, color: '#1e3d2c', paddingBottom: 8, marginBottom: 8, borderBottom: '2px solid #1e3d2c' }}>
                <span>Total</span><span>{money(total)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, fontSize: 12, color: '#3a6647', paddingBottom: 6 }}>
                <span>Received</span><span style={{ fontWeight: 600 }}>{money(inv.received)}</span>
              </div>
              {inv.paymentType && (
                <div style={{ fontSize: 10, color: '#8a9389', marginBottom: 6 }}>via {inv.paymentType}{inv.paymentRef ? ` · ${inv.paymentRef}` : ''}</div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, fontSize: 14, fontWeight: 700, color: balDue > 0 ? '#a24840' : '#3a6647', paddingTop: 6, borderTop: '1px solid #eee9df' }}>
                <span>Balance Due</span><span>{money(balDue)}</span>
              </div>
            </div>
          </div>

          {/* Terms */}
          {inv.terms && (
            <div style={{ padding: '14px 24px', borderTop: '1px solid #eee9df', background: '#faf9f4' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#8a9389', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>Terms & Conditions</div>
              <div style={{ fontSize: 10, color: '#8a9389', whiteSpace: 'pre-line', lineHeight: 1.7 }}>{inv.terms}</div>
            </div>
          )}

          {/* Footer */}
          <div style={{ background: 'linear-gradient(135deg, #1e3d2c 0%, #2a5240 100%)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'var(--app-font-serif)', fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{STORE_NAME}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{STORE_TAGLINE}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', marginBottom: 4 }}>Authorised Signatory</div>
              <div style={{ width: 90, borderTop: '1px solid rgba(255,255,255,0.4)', paddingTop: 4, fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Signature</div>
            </div>
          </div>

          {/* Acknowledgement strip */}
          <div style={{ background: '#f4f1e6', borderTop: '1px dashed #d9d3c0', padding: '12px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#8a9389', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>Acknowledgement</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#2b4435' }}>{STORE_NAME}</div>
              <div style={{ fontSize: 11, color: '#536157', marginTop: 2 }}>Invoice To: {inv.customerName}</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 11, color: '#536157' }}>
              <div>Invoice No.: <b style={{ color: '#2b4435' }}>{inv.invoiceNo}</b></div>
              <div style={{ marginTop: 2 }}>Date: <b style={{ color: '#2b4435' }}>{inv.date}</b></div>
              <div style={{ marginTop: 2 }}>Amount: <b style={{ color: '#2b4435' }}>{money(total)}</b></div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30, background: '#fff', borderTop: '1px solid #e7e2d6', padding: '14px 20px', display: 'flex', gap: 10, justifyContent: 'center', boxShadow: '0 -4px 18px rgba(30,61,44,0.10)' }}>
        <button
          onClick={() => setShowPreview(true)}
          className="btn"
          style={{ flex: 1, maxWidth: 180, fontSize: 13, padding: '11px 16px', gap: 8 }}
        >
          <Eye size={16} /> Preview
        </button>
        <button
          onClick={handlePrint}
          className="btn primary"
          style={{ flex: 1, maxWidth: 180, fontSize: 13, padding: '11px 16px', gap: 8 }}
        >
          <Download size={16} /> Save PDF
        </button>
        <button
          onClick={handleShare}
          className="btn"
          style={{ flex: 1, maxWidth: 180, fontSize: 13, padding: '11px 16px', gap: 8, background: '#2a5240', color: '#fff', border: '1px solid #2a5240' }}
        >
          <Share2 size={16} /> Share
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <InvoicePreviewModal inv={inv} onClose={() => setShowPreview(false)} onPrint={handlePrint} onShare={handleShare} />
      )}
    </div>
  );
}

// ─────────────────────── Invoice Preview Modal ───────────────────────────────
function InvoicePreviewModal({ inv, onClose, onPrint, onShare }: { inv: SaleInvoiceType; onClose: () => void; onPrint: () => void; onShare: () => void }) {
  const total = calcInvoiceTotal(inv);
  const balDue = Math.max(0, total - inv.received);
  const amtWords = numberToWords(total);
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(10,26,18,0.80)', display: 'flex', flexDirection: 'column', animation: 'fade .16s ease' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal header */}
      <div style={{ background: '#1e3d2c', color: '#fff', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--app-font-serif)', fontSize: 16, fontWeight: 700 }}>Invoice Preview · {inv.invoiceNo}</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={onPrint} style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 7, padding: '7px 14px', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Printer size={14} /> Print / Save PDF
          </button>
          <button onClick={onShare} style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 7, padding: '7px 14px', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Share2 size={14} /> Share
          </button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', padding: 4 }}>
            <X size={20} />
          </button>
        </div>
      </div>
      {/* Scrollable preview area */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 20px 32px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 680, background: '#fff', borderRadius: 12, border: '1px solid #e7e2d4', boxShadow: '0 8px 40px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
          {/* Same invoice layout as DigitalInvoice for preview */}
          <div style={{ background: 'linear-gradient(135deg, #1e3d2c 0%, #2a5240 100%)', color: '#fff', padding: '24px 28px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: 'var(--app-font-serif)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>{STORE_NAME}</div>
                <div style={{ fontSize: 11, opacity: 0.75, letterSpacing: '0.5px' }}>{STORE_TAGLINE}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '6px 14px', display: 'inline-block' }}>
                  <div style={{ fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.8, marginBottom: 2 }}>Tax Invoice</div>
                  <div style={{ fontFamily: 'var(--app-font-serif)', fontSize: 17, fontWeight: 700 }}>{inv.invoiceNo}</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #eee9df' }}>
            <div style={{ padding: '18px 24px', borderRight: '1px solid #eee9df' }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.2px', color: '#a9663b', textTransform: 'uppercase', marginBottom: 8 }}>Bill To</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1e3d2c', marginBottom: 3 }}>{inv.billingName || inv.customerName || '—'}</div>
              {inv.phone && <div style={{ fontSize: 12, color: '#536157' }}>Contact: {inv.phone}</div>}
            </div>
            <div style={{ padding: '18px 24px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.2px', color: '#a9663b', textTransform: 'uppercase', marginBottom: 8 }}>Invoice Details</div>
              <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                <tbody>
                  {[['Invoice No.', inv.invoiceNo], ['Date', inv.date], ['Time', inv.time], ['Payment Mode', inv.paymentType]].map(([l, v], i) => (
                    <tr key={i}><td style={{ color: '#8a9389', paddingBottom: 4, paddingRight: 12 }}>{l}</td><td style={{ color: '#2b4435', fontWeight: 600, paddingBottom: 4 }}>{v}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f4f1e8' }}>
                {['#', 'Book Name', 'Qty', 'Price', 'Disc %', 'Amount'].map((h, i) => (
                  <th key={i} style={{ padding: '10px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#8a9187', textAlign: i === 0 ? 'left' : i === 5 ? 'right' : i === 1 ? 'left' : 'center', borderBottom: '1px solid #e9e4d9', paddingLeft: i === 0 ? 18 : 12, paddingRight: i === 5 ? 18 : 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inv.items.map((item, i) => {
                const amt = item.qty * item.price * (1 - item.discountPct / 100);
                return (
                  <tr key={item.id} style={{ background: i % 2 === 0 ? '#fff' : '#faf9f4' }}>
                    <td style={{ padding: '11px 18px', fontSize: 12, color: '#8a9389', borderBottom: '1px solid #f0ebe0' }}>{i + 1}</td>
                    <td style={{ padding: '11px 12px', borderBottom: '1px solid #f0ebe0' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e3d2c' }}>{item.name}</div>
                    </td>
                    <td style={{ padding: '11px 12px', fontSize: 12, textAlign: 'center', borderBottom: '1px solid #f0ebe0', color: '#536157' }}>{item.qty}</td>
                    <td style={{ padding: '11px 12px', fontSize: 12, textAlign: 'right', borderBottom: '1px solid #f0ebe0', color: '#536157' }}>{money(item.price)}</td>
                    <td style={{ padding: '11px 12px', fontSize: 12, textAlign: 'center', borderBottom: '1px solid #f0ebe0', color: item.discountPct > 0 ? '#a9663b' : '#8a9389' }}>{item.discountPct > 0 ? `${item.discountPct}%` : '—'}</td>
                    <td style={{ padding: '11px 18px 11px 12px', fontSize: 13, fontWeight: 700, color: '#1e3d2c', textAlign: 'right', borderBottom: '1px solid #f0ebe0' }}>{money(amt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', borderTop: '2px solid #e9e4d9' }}>
            <div style={{ padding: '18px 24px', borderRight: '1px solid #eee9df' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#8a9389', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>Amount in Words</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#2b4435', fontStyle: 'italic' }}>{amtWords}</div>
            </div>
            <div style={{ padding: '18px 24px', minWidth: 220 }}>
              {(() => {
                const itemsSub = inv.items.reduce((s, i) => s + i.qty * i.price * (1 - i.discountPct / 100), 0);
                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#536157', paddingBottom: 6 }}><span>Subtotal</span><span>{money(itemsSub)}</span></div>
                    {inv.discountPct > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#a9663b', paddingBottom: 6 }}><span>Discount ({inv.discountPct}%)</span><span>−{money(itemsSub * inv.discountPct / 100)}</span></div>}
                    {inv.shipping > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#536157', paddingBottom: 6 }}><span>Shipping</span><span>{money(inv.shipping)}</span></div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: '#1e3d2c', paddingBottom: 8, borderBottom: '2px solid #1e3d2c', marginBottom: 8, marginTop: 4 }}><span>Total</span><span>{money(total)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#3a6647', paddingBottom: 4 }}><span>Received</span><span style={{ fontWeight: 600 }}>{money(inv.received)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: balDue > 0 ? '#a24840' : '#3a6647', paddingTop: 6, borderTop: '1px solid #eee9df' }}><span>Balance Due</span><span>{money(balDue)}</span></div>
                  </>
                );
              })()}
            </div>
          </div>
          {inv.terms && (
            <div style={{ padding: '14px 24px', borderTop: '1px solid #eee9df', background: '#faf9f4' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#8a9389', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>Terms & Conditions</div>
              <div style={{ fontSize: 10, color: '#8a9389', whiteSpace: 'pre-line', lineHeight: 1.7 }}>{inv.terms}</div>
            </div>
          )}
          <div style={{ background: 'linear-gradient(135deg, #1e3d2c 0%, #2a5240 100%)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'var(--app-font-serif)', fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{STORE_NAME}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{STORE_TAGLINE}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', marginBottom: 4 }}>Authorised Signatory</div>
              <div style={{ width: 90, borderTop: '1px solid rgba(255,255,255,0.4)', paddingTop: 4, fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Signature</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────── Sale Invoice Types & Components ─────────────────────
const INVOICE_KEY='bookbazaar-invoices-v1';
type InvoiceItem={id:string;bookId:string;name:string;qty:number;price:number;discountPct:number};
type SaleInvoiceType={id:string;invoiceNo:string;date:string;time:string;customerName:string;billingName:string;phone:string;partyBalance:number;items:InvoiceItem[];discountPct:number;shipping:number;roundOff:boolean;received:number;paymentType:string;paymentRef:string;notes:string;terms:string;status:'Paid'|'Partial'|'Unpaid'};
function calcInvoiceTotal(inv:SaleInvoiceType){const sub=inv.items.reduce((s,i)=>s+i.qty*i.price*(1-i.discountPct/100),0);const aft=sub*(1-inv.discountPct/100)+inv.shipping;return inv.roundOff?Math.round(aft):aft;}
function SaleInvoicePage(c:Context){
  const [invoices,setInvoices]=useState<SaleInvoiceType[]>(()=>{try{const v=localStorage.getItem(INVOICE_KEY);return v?JSON.parse(v):[];}catch{return [];}});
  const [view,setView]=useState<'list'|'form'|'digital-invoice'>('list');
  const [editing,setEditing]=useState<SaleInvoiceType|null>(null);
  const [activeInvoice,setActiveInvoice]=useState<SaleInvoiceType|null>(null);
  useEffect(()=>{localStorage.setItem(INVOICE_KEY,JSON.stringify(invoices));},[invoices]);
  const nowTime=()=>new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true});
  const nextNo=()=>`BB-${String(invoices.length+1).padStart(4,'0')}`;
  const openNew=()=>{setEditing(null);setView('form');};
  const openEdit=(inv:SaleInvoiceType)=>{setEditing(inv);setView('form');};
  const closeForm=()=>{setView('list');setEditing(null);};
  const saveInvoice=(inv:SaleInvoiceType)=>{
    setInvoices(prev=>editing?prev.map(x=>x.id===inv.id?inv:x):[inv,...prev]);
    setActiveInvoice(inv);
    setEditing(null);
    setView('digital-invoice');
  };
  const delInvoice=(id:string)=>setInvoices(prev=>prev.filter(x=>x.id!==id));
  if(view==='digital-invoice'&&activeInvoice)return <DigitalInvoice inv={activeInvoice} onClose={()=>setView('list')} onEdit={()=>{setEditing(activeInvoice);setView('form');}}/>;
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
              <td><div className="row-actions"><button className="icon-button" title="View Invoice" onClick={()=>{setActiveInvoice(inv);setView('digital-invoice');}}><Eye size={14}/></button><button className="icon-button" title="Edit" onClick={()=>openEdit(inv)}><Pencil/></button><button className="icon-button" title="Delete" onClick={()=>delInvoice(inv.id)}><Trash2/></button></div></td>
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

// ─────────────────────── Payment-In Types & Components ───────────────────────
const PAYMENT_IN_KEY='bookbazaar-payment-in-v1';
type PaymentIn={id:string;receiptNo:string;date:string;time:string;customerName:string;billingName:string;phone:string;partyBalance:number;discountAmount:number;received:number;totalAmount:number;paymentType:string;paymentRef:string;notes:string};
function PaymentInPage(c:Context){
  const [records,setRecords]=useState<PaymentIn[]>(()=>{try{const v=localStorage.getItem(PAYMENT_IN_KEY);return v?JSON.parse(v):[];}catch{return [];}});
  const [view,setView]=useState<'list'|'form'>('list');
  const [editing,setEditing]=useState<PaymentIn|null>(null);
  useEffect(()=>{localStorage.setItem(PAYMENT_IN_KEY,JSON.stringify(records));},[records]);
  const nowTime=()=>new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true});
  const nextNo=()=>`${records.length+1}`;
  const openNew=()=>{setEditing(null);setView('form');};
  const openNew2=()=>{setEditing(null);setView('form');};
  const openEdit=(r:PaymentIn)=>{setEditing(r);setView('form');};
  const closeForm=()=>{setView('list');setEditing(null);};
  const save=(r:PaymentIn,andNew?:boolean)=>{setRecords(prev=>editing?prev.map(x=>x.id===r.id?r:x):[r,...prev]);if(andNew){setEditing(null);}else{closeForm();}};
  const del=(id:string)=>setRecords(prev=>prev.filter(x=>x.id!==id));
  if(view==='form')return <PaymentInForm initial={editing} nextNo={nextNo()} nowTime={nowTime()} onSave={save} onClose={closeForm} onDelete={editing?()=>{del(editing.id);closeForm();}:undefined}/>;
  const totalReceived=records.reduce((s,r)=>s+r.received,0);
  const totalDiscount=records.reduce((s,r)=>s+r.discountAmount,0);
  const totalBalance=records.reduce((s,r)=>s+Math.max(0,r.totalAmount-r.received),0);
  // Empty state
  if(!records.length) return (
    <main className="page">
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'70vh',textAlign:'center',gap:14}}>
        <div style={{width:64,height:64,borderRadius:18,background:'#e8f0e6',display:'grid',placeItems:'center',color:'#3d6b4a',marginBottom:4}}>
          <ArrowDownLeft size={28}/>
        </div>
        <h1 style={{fontFamily:'var(--app-font-serif)',fontSize:'clamp(22px,3vw,28px)',color:'#1e3d2c',margin:0}}>Add your first Payment In</h1>
        <p style={{fontSize:13,color:'#6d7d6e',maxWidth:360,margin:0,lineHeight:1.6}}>Record payment received from parties and easily link them to your current invoices.</p>
        <button className="btn primary" onClick={openNew} style={{marginTop:8,display:'flex',alignItems:'center',gap:7,fontSize:14}}>
          <Plus size={15}/> Take Payment
        </button>
      </div>
    </main>
  );
  return(
    <main className="page">
      <Heading eyebrow="Sale" title="Payment-In" subtitle="Record and manage incoming payments from customers.">
        <button className="btn primary" onClick={openNew} style={{display:'flex',alignItems:'center',gap:7}}>
          <Plus size={15}/> Take Payment
        </button>
      </Heading>
      <div className="stat-grid">
        <Stat label="Total Receipts" value={records.length} note="All time" Icon={ArrowDownLeft}/>
        <Stat label="Total Received" value={money(totalReceived)} note="Gross payments in" Icon={Check}/>
        <Stat label="Discount Given" value={money(totalDiscount)} note="Total discounts applied" Icon={FileText}/>
        <Stat label="Balance Pending" value={money(totalBalance)} note="Outstanding" Icon={TriangleAlert} tint="red"/>
      </div>
      <section className="panel">
        <div className="table-wrap"><table className="data-table">
          <thead><tr><th>Receipt No.</th><th>Customer</th><th>Date</th><th>Received</th><th>Total Amount</th><th>Balance</th><th>Payment Type</th><th></th></tr></thead>
          <tbody>{records.map(r=>{const bal=Math.max(0,r.totalAmount-r.received);return(
            <tr key={r.id}>
              <td><div className="book-title">#{r.receiptNo}</div><div className="muted">{r.time}</div></td>
              <td><div className="book-title">{r.customerName||'—'}</div><div className="muted">{r.phone}</div></td>
              <td>{r.date}</td>
              <td style={{color:'#3a6647',fontWeight:600}}>{money(r.received)}</td>
              <td style={{fontWeight:600}}>{r.totalAmount>0?money(r.totalAmount):'—'}</td>
              <td style={{color:bal>0?'#a24840':'#3a6647',fontWeight:600}}>{money(bal)}</td>
              <td><span className="pill neutral">{r.paymentType}</span></td>
              <td><div className="row-actions"><button className="icon-button" title="Edit" onClick={()=>openEdit(r)}><Pencil/></button><button className="icon-button" title="Delete" onClick={()=>del(r.id)}><Trash2/></button></div></td>
            </tr>
          );})}
          </tbody>
        </table>
        </div>
      </section>
    </main>
  );
}
function PaymentInForm({initial,nextNo,nowTime,onSave,onClose,onDelete}:{initial:PaymentIn|null;nextNo:string;nowTime:string;onSave:(r:PaymentIn,andNew?:boolean)=>void;onClose:()=>void;onDelete?:()=>void}){
  const todayStr=new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric'});
  const blank:Omit<PaymentIn,'id'>={receiptNo:nextNo,date:today,time:nowTime,customerName:'',billingName:'',phone:'',partyBalance:0,discountAmount:0,received:0,totalAmount:0,paymentType:'Cash',paymentRef:'',notes:''};
  const [f,setF]=useState<Omit<PaymentIn,'id'>>(initial||blank);
  const [validationMsg,setValidationMsg]=useState('');
  const set=(k:string,v:any)=>setF(p=>({...p,[k]:v}));
  // validation toast auto-hide
  useEffect(()=>{if(!validationMsg)return;const t=setTimeout(()=>setValidationMsg(''),2800);return()=>clearTimeout(t);},[validationMsg]);
  const handleSave=(andNew=false)=>{
    if(!f.totalAmount||f.totalAmount<=0){setValidationMsg("Total amount can't be empty");return;}
    const rec:PaymentIn={...f,id:initial?.id||idFor('PMT')};
    onSave(rec,andNew);
    if(andNew) setF({...blank,receiptNo:String(Number(f.receiptNo)+1)});
  };
  // format date for display like reference image
  const displayDate=f.date?new Date(f.date).toLocaleDateString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric'}):todayStr;
  return(
    <main style={{minHeight:'100vh',background:'#f5f5f5',display:'flex',flexDirection:'column',maxWidth:520,margin:'0 auto',position:'relative',paddingBottom:80}}>
      {/* Header bar */}
      <div style={{background:'#fff',borderBottom:'1px solid #e8e8e8',padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',padding:4,display:'flex',alignItems:'center',color:'#333'}}><ArrowRight style={{transform:'rotate(180deg)'}} size={22}/></button>
          <h1 style={{fontSize:18,fontWeight:700,color:'#1a1a1a',margin:0}}>Payment-In</h1>
        </div>
        {onDelete&&<button onClick={onDelete} style={{background:'none',border:'none',cursor:'pointer',color:'#e53935',fontSize:13,fontWeight:600,display:'flex',alignItems:'center',gap:4}}><Trash2 size={15}/></button>}
      </div>

      {/* Receipt No + Date row */}
      <div style={{background:'#fff',borderBottom:'1px solid #eee',padding:'12px 16px',display:'grid',gridTemplateColumns:'1fr 1px 1fr',gap:0}}>
        <div style={{paddingRight:16}}>
          <div style={{fontSize:11,color:'#999',marginBottom:3}}>Receipt No.</div>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <input
              value={f.receiptNo}
              onChange={e=>set('receiptNo',e.target.value)}
              style={{border:'none',background:'transparent',fontSize:15,fontWeight:600,color:'#1a1a1a',width:'60px',outline:'none',padding:0}}
            />
            <ChevronDown size={14} style={{color:'#999'}}/>
          </div>
        </div>
        <div style={{background:'#e0e0e0',width:1,margin:'4px 0'}}/>
        <div style={{paddingLeft:16}}>
          <div style={{fontSize:11,color:'#999',marginBottom:3}}>Date</div>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <input
              type="date"
              value={f.date}
              onChange={e=>set('date',e.target.value)}
              style={{border:'none',background:'transparent',fontSize:14,fontWeight:500,color:'#1a1a1a',outline:'none',padding:0,width:130}}
            />
            <ChevronDown size={14} style={{color:'#999'}}/>
          </div>
        </div>
      </div>

      {/* Customer Name */}
      <div style={{background:'#fff',marginTop:8,padding:'4px 16px 4px'}}>
        <div style={{position:'relative',border:'2px solid #1976d2',borderRadius:6,padding:'16px 12px 8px'}}>
          <label style={{position:'absolute',top:-10,left:10,background:'#fff',padding:'0 4px',fontSize:12,color:'#1976d2',fontWeight:500}}>Customer Name *</label>
          <input
            value={f.customerName}
            onChange={e=>{set('customerName',e.target.value);if(!f.billingName||f.billingName===f.customerName)set('billingName',e.target.value);}}
            placeholder=""
            style={{border:'none',background:'transparent',fontSize:15,color:'#1a1a1a',width:'100%',outline:'none',padding:0}}
          />
        </div>
      </div>

      {/* Phone Number */}
      <div style={{background:'#fff',marginTop:10,padding:'4px 16px 12px'}}>
        <div style={{border:'1px solid #ccc',borderRadius:6,padding:'14px 12px'}}>
          <input
            value={f.phone}
            onChange={e=>set('phone',e.target.value)}
            placeholder="Phone Number"
            style={{border:'none',background:'transparent',fontSize:15,color:'#1a1a1a',width:'100%',outline:'none',padding:0}}
          />
        </div>
      </div>

      {/* Received + Total Amount */}
      <div style={{background:'#fff',marginTop:8,padding:'0 16px'}}>
        {/* Received row */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 0',borderBottom:'1px dashed #e0e0e0'}}>
          <span style={{fontSize:15,fontWeight:500,color:'#1a1a1a'}}>Received</span>
          <div style={{display:'flex',alignItems:'center',gap:4}}>
            <span style={{fontSize:15,color:'#1a1a1a'}}>₹</span>
            <div style={{borderBottom:'1px dashed #aaa',minWidth:140,paddingBottom:2}}>
              <input
                type="number"
                min="0"
                value={f.received||''}
                onChange={e=>set('received',Number(e.target.value))}
                placeholder=""
                style={{border:'none',background:'transparent',fontSize:15,color:'#1a1a1a',width:'100%',outline:'none',padding:0,textAlign:'right'}}
              />
            </div>
          </div>
        </div>
        {/* Total Amount row */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 0'}}>
          <span style={{fontSize:15,fontWeight:600,color:'#3a6647'}}>Total Amount</span>
          <div style={{display:'flex',alignItems:'center',gap:4}}>
            <span style={{fontSize:15,color:'#3a6647'}}>₹</span>
            <div style={{borderBottom:'1px solid #ccc',minWidth:140,paddingBottom:2}}>
              <input
                type="number"
                min="0"
                value={f.totalAmount||''}
                onChange={e=>set('totalAmount',Number(e.target.value))}
                placeholder=""
                style={{border:'none',background:'transparent',fontSize:15,fontWeight:600,color:'#3a6647',width:'100%',outline:'none',padding:0,textAlign:'right'}}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div style={{background:'#fff',marginTop:8,padding:'12px 16px'}}>
        <div style={{fontSize:12,color:'#666',marginBottom:8,fontWeight:600,letterSpacing:'0.5px'}}>PAYMENT METHOD</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div>
            <label style={{fontSize:12,color:'#888',display:'block',marginBottom:4}}>Payment Type</label>
            <select value={f.paymentType} onChange={e=>set('paymentType',e.target.value)} style={{width:'100%',border:'1px solid #ddd',borderRadius:6,padding:'8px 10px',fontSize:14,background:'#fafafa',color:'#1a1a1a',outline:'none'}}>
              {['Cash','UPI','Canara Bank','SBI','HDFC Bank','ICICI Bank','Axis Bank','Cheque','Other'].map(p=><option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={{fontSize:12,color:'#888',display:'block',marginBottom:4}}>Reference No.</label>
            <input value={f.paymentRef} onChange={e=>set('paymentRef',e.target.value)} placeholder="Ref No." style={{width:'100%',border:'1px solid #ddd',borderRadius:6,padding:'8px 10px',fontSize:14,background:'#fafafa',color:'#1a1a1a',outline:'none',boxSizing:'border-box'}}/>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div style={{background:'#fff',marginTop:8,padding:'12px 16px'}}>
        <label style={{fontSize:12,color:'#888',display:'block',marginBottom:6}}>Notes (Optional)</label>
        <textarea value={f.notes} onChange={e=>set('notes',e.target.value)} placeholder="Add a note…" style={{width:'100%',border:'1px solid #ddd',borderRadius:6,padding:'10px',fontSize:14,background:'#fafafa',resize:'vertical',height:72,outline:'none',boxSizing:'border-box'}}/>
      </div>

      {/* Validation Toast */}
      {validationMsg&&(
        <div style={{position:'fixed',bottom:90,left:'50%',transform:'translateX(-50%)',background:'rgba(40,40,40,0.92)',color:'#fff',borderRadius:28,padding:'12px 20px',display:'flex',alignItems:'center',gap:10,fontSize:14,fontWeight:500,zIndex:999,boxShadow:'0 4px 20px rgba(0,0,0,0.25)',whiteSpace:'nowrap'}}>
          <span style={{width:22,height:22,background:'#e53935',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,flexShrink:0}}>!</span>
          {validationMsg}
        </div>
      )}

      {/* Bottom Action Bar */}
      <div style={{position:'sticky',bottom:0,background:'#fff',borderTop:'1px solid #e8e8e8',display:'grid',gridTemplateColumns:'1fr 1fr auto',zIndex:10,marginTop:'auto'}}>
        <button
          onClick={()=>handleSave(true)}
          style={{padding:'16px 0',background:'#fff',border:'none',borderRight:'1px solid #e8e8e8',fontSize:14,fontWeight:600,color:'#555',cursor:'pointer',transition:'background .15s'}}
          onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='#f5f5f5'}
          onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='#fff'}
        >Save &amp; New</button>
        <button
          onClick={()=>handleSave(false)}
          style={{padding:'16px 0',background:'#1565c0',border:'none',fontSize:14,fontWeight:700,color:'#fff',cursor:'pointer',transition:'background .15s'}}
          onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='#0d47a1'}
          onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='#1565c0'}
        >Save</button>
        <button
          style={{padding:'16px 18px',background:'#fff',border:'none',borderLeft:'1px solid #e8e8e8',fontSize:20,color:'#555',cursor:'pointer',lineHeight:1}}
          title="More options"
        >⋮</button>
      </div>
    </main>
  );
}

// ─────────────────────────── Sale Return (Credit Note) ───────────────────────────
const SALE_RETURN_KEY='bookbazaar-sale-return-v1';
type SaleReturnItem={id:string;bookId:string;name:string;qty:number;price:number};
type SaleReturn={id:string;returnNo:string;date:string;time:string;customerName:string;phone:string;invoiceDate:string;invoiceNo:string;items:SaleReturnItem[];totalAmount:number;notes:string};
function SaleReturnPage(c:Context){
  const [records,setRecords]=useState<SaleReturn[]>(()=>{try{const v=localStorage.getItem(SALE_RETURN_KEY);return v?JSON.parse(v):[];}catch{return [];}});
  const [view,setView]=useState<'list'|'form'>('list');
  const [editing,setEditing]=useState<SaleReturn|null>(null);
  const [dateRange,setDateRange]=useState({from:today.slice(0,8)+'01',to:today});
  useEffect(()=>{localStorage.setItem(SALE_RETURN_KEY,JSON.stringify(records));},[records]);
  const nowTime=()=>new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true});
  const nextNo=()=>`${records.length+1}`;
  const openNew=()=>{setEditing(null);setView('form');};
  const openEdit=(r:SaleReturn)=>{setEditing(r);setView('form');};
  const closeForm=()=>{setView('list');setEditing(null);};
  const save=(r:SaleReturn,andNew?:boolean)=>{setRecords(prev=>editing?prev.map(x=>x.id===r.id?r:x):[r,...prev]);if(andNew)setEditing(null);else closeForm();};
  const del=(id:string)=>setRecords(prev=>prev.filter(x=>x.id!==id));
  if(view==='form')return <SaleReturnForm data={c.data} initial={editing} nextNo={nextNo()} nowTime={nowTime()} onSave={save} onClose={closeForm} onDelete={editing?()=>{del(editing.id);closeForm();}:undefined}/>;
  const filtered=records.filter(r=>r.date>=dateRange.from&&r.date<=dateRange.to);
  const filterBar=(
    <div style={{background:'#fff',borderBottom:'1px solid #e8e8e8',padding:'10px 20px',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
      <select style={{border:'1px solid #ddd',borderRadius:6,padding:'6px 12px',fontSize:13,color:'#333',background:'#fafafa',outline:'none',cursor:'pointer'}}>
        <option>This Month</option><option>Last Month</option><option>This Quarter</option><option>Custom</option>
      </select>
      <div style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'#444'}}>
        <CalendarDays size={16} style={{color:'#1976d2'}}/>
        <input type="date" value={dateRange.from} onChange={e=>setDateRange(p=>({...p,from:e.target.value}))} style={{border:'none',background:'transparent',fontSize:13,color:'#333',outline:'none',cursor:'pointer'}}/>
        <span style={{fontWeight:600,color:'#666'}}>TO</span>
        <input type="date" value={dateRange.to} onChange={e=>setDateRange(p=>({...p,to:e.target.value}))} style={{border:'none',background:'transparent',fontSize:13,color:'#333',outline:'none',cursor:'pointer'}}/>
      </div>
    </div>
  );
  if(!records.length) return (
    <main className="page">
      {filterBar}
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'60vh',textAlign:'center',gap:14,background:'#eef4fb'}}>
        <svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="18" width="62" height="76" rx="6" fill="#dce8f5" transform="rotate(-6 20 18)"/>
          <line x1="32" y1="40" x2="68" y2="37" stroke="#b8d0ea" strokeWidth="3" strokeLinecap="round"/>
          <line x1="32" y1="50" x2="72" y2="47" stroke="#b8d0ea" strokeWidth="3" strokeLinecap="round"/>
          <line x1="32" y1="60" x2="60" y2="57" stroke="#b8d0ea" strokeWidth="3" strokeLinecap="round"/>
          <rect x="24" y="22" width="62" height="76" rx="6" fill="#f0f6ff" stroke="#c8ddf0" strokeWidth="1"/>
          <line x1="36" y1="40" x2="74" y2="40" stroke="#b8d0ea" strokeWidth="3" strokeLinecap="round"/>
          <line x1="36" y1="51" x2="74" y2="51" stroke="#b8d0ea" strokeWidth="3" strokeLinecap="round"/>
          <line x1="36" y1="62" x2="60" y2="62" stroke="#b8d0ea" strokeWidth="3" strokeLinecap="round"/>
          <rect x="55" y="84" width="22" height="6" rx="3" fill="#1976d2"/>
        </svg>
        <h2 style={{fontFamily:'var(--app-font-serif)',fontSize:20,fontWeight:700,color:'#1a1a1a',margin:0}}>No Data Available</h2>
        <p style={{fontSize:13,color:'#6d7d6e',maxWidth:320,margin:0,lineHeight:1.6}}>No sale returns recorded yet. Click below to create a credit note.</p>
        <button className="btn primary" onClick={openNew} style={{marginTop:8,display:'flex',alignItems:'center',gap:7,fontSize:14}}>
          <Plus size={15}/> Add Sale Return
        </button>
      </div>
    </main>
  );
  return (
    <main className="page">
      {filterBar}
      <div style={{padding:'14px 20px 0',display:'flex',justifyContent:'flex-end'}}>
        <button className="btn primary" onClick={openNew} style={{display:'flex',alignItems:'center',gap:7}}><Plus size={14}/> Add Sale Return</button>
      </div>
      <div className="stat-grid" style={{marginTop:14}}>
        <Stat label="Total Returns" value={filtered.length} note="In selected period" Icon={RotateCcw}/>
        <Stat label="Total Amount" value={money(filtered.reduce((s,r)=>s+r.totalAmount,0))} note="Credit issued" Icon={FileText} tint="red"/>
      </div>
      <section className="panel">
        <div className="table-wrap"><table className="data-table">
          <thead><tr><th>Return No.</th><th>Customer</th><th>Date</th><th>Invoice No.</th><th>Items</th><th>Total Amount</th><th></th></tr></thead>
          <tbody>{filtered.map(r=>(
            <tr key={r.id}>
              <td><div className="book-title">#{r.returnNo}</div><div className="muted">{r.time}</div></td>
              <td><div className="book-title">{r.customerName||'—'}</div><div className="muted">{r.phone}</div></td>
              <td>{r.date}</td>
              <td>{r.invoiceNo||'—'}</td>
              <td>{r.items.length} item{r.items.length!==1?'s':''}</td>
              <td style={{color:'#a24840',fontWeight:600}}>{money(r.totalAmount)}</td>
              <td><div className="row-actions"><button className="icon-button" title="Edit" onClick={()=>openEdit(r)}><Pencil/></button><button className="icon-button" title="Delete" onClick={()=>del(r.id)}><Trash2/></button></div></td>
            </tr>
          ))}</tbody>
        </table></div>
      </section>
    </main>
  );
}
function SaleReturnForm({data,initial,nextNo,nowTime,onSave,onClose,onDelete}:{data:Dataset;initial:SaleReturn|null;nextNo:string;nowTime:string;onSave:(r:SaleReturn,andNew?:boolean)=>void;onClose:()=>void;onDelete?:()=>void}){
  const blank:Omit<SaleReturn,'id'>={returnNo:nextNo,date:today,time:nowTime,customerName:'',phone:'',invoiceDate:'',invoiceNo:'',items:[],totalAmount:0,notes:''};
  const [f,setF]=useState<Omit<SaleReturn,'id'>>(initial||blank);
  const [showItems,setShowItems]=useState(false);
  const [selBook,setSelBook]=useState('');
  const [selQty,setSelQty]=useState(1);
  const [validationMsg,setValidationMsg]=useState('');
  const set=(k:string,v:any)=>setF(p=>({...p,[k]:v}));
  useEffect(()=>{if(!validationMsg)return;const t=setTimeout(()=>setValidationMsg(''),2800);return()=>clearTimeout(t);},[validationMsg]);
  const addItem=()=>{const book=data.books.find(b=>b.id===selBook);if(!book)return;const newItem={id:idFor('RTI'),bookId:book.id,name:book.title,qty:selQty,price:book.price};setF(p=>({...p,items:[...p.items,newItem],totalAmount:p.totalAmount+selQty*book.price}));setSelBook('');setSelQty(1);setShowItems(false);};
  const removeItem=(id:string)=>{const item=f.items.find(i=>i.id===id);setF(p=>({...p,items:p.items.filter(i=>i.id!==id),totalAmount:Math.max(0,p.totalAmount-(item?item.qty*item.price:0))}));};
  const handleSave=(andNew=false)=>{if(!f.totalAmount||f.totalAmount<=0){setValidationMsg("Total amount can't be empty");return;}const rec:SaleReturn={...f,id:initial?.id||idFor('RTN')};onSave(rec,andNew);if(andNew)setF({...blank,returnNo:String(Number(f.returnNo)+1)});};
  return(
    <main style={{minHeight:'100vh',background:'#f5f5f5',display:'flex',flexDirection:'column',maxWidth:520,margin:'0 auto',position:'relative',paddingBottom:80}}>
      <div style={{background:'#fff',borderBottom:'1px solid #e8e8e8',padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',padding:4,display:'flex',alignItems:'center',color:'#333'}}><ArrowRight style={{transform:'rotate(180deg)'}} size={22}/></button>
          <h1 style={{fontSize:18,fontWeight:700,color:'#1a1a1a',margin:0}}>Credit Note</h1>
        </div>
        {onDelete&&<button onClick={onDelete} style={{background:'none',border:'none',cursor:'pointer',color:'#e53935',display:'flex',alignItems:'center',gap:4}}><Trash2 size={15}/></button>}
      </div>
      <div style={{background:'#fff',borderBottom:'1px solid #eee',padding:'12px 16px',display:'grid',gridTemplateColumns:'1fr 1px 1fr',gap:0}}>
        <div style={{paddingRight:16}}>
          <div style={{fontSize:11,color:'#999',marginBottom:3}}>Return No.</div>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <input value={f.returnNo} onChange={e=>set('returnNo',e.target.value)} style={{border:'none',background:'transparent',fontSize:15,fontWeight:600,color:'#1a1a1a',width:'60px',outline:'none',padding:0}}/>
            <ChevronDown size={14} style={{color:'#999'}}/>
          </div>
        </div>
        <div style={{background:'#e0e0e0',width:1,margin:'4px 0'}}/>
        <div style={{paddingLeft:16}}>
          <div style={{fontSize:11,color:'#999',marginBottom:3}}>Date</div>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <input type="date" value={f.date} onChange={e=>set('date',e.target.value)} style={{border:'none',background:'transparent',fontSize:14,fontWeight:500,color:'#1a1a1a',outline:'none',padding:0,width:130}}/>
            <ChevronDown size={14} style={{color:'#999'}}/>
          </div>
        </div>
      </div>
      <div style={{background:'#fff',marginTop:8,padding:'4px 16px 4px'}}>
        <div style={{position:'relative',border:'2px solid #1976d2',borderRadius:6,padding:'16px 12px 8px'}}>
          <label style={{position:'absolute',top:-10,left:10,background:'#fff',padding:'0 4px',fontSize:12,color:'#1976d2',fontWeight:500}}>Customer Name *</label>
          <input value={f.customerName} onChange={e=>set('customerName',e.target.value)} style={{border:'none',background:'transparent',fontSize:15,color:'#1a1a1a',width:'100%',outline:'none',padding:0}}/>
        </div>
      </div>
      <div style={{background:'#fff',marginTop:10,padding:'4px 16px 12px'}}>
        <div style={{border:'1px solid #ccc',borderRadius:6,padding:'14px 12px'}}>
          <input value={f.phone} onChange={e=>set('phone',e.target.value)} placeholder="Phone Number" style={{border:'none',background:'transparent',fontSize:15,color:'#1a1a1a',width:'100%',outline:'none',padding:0}}/>
        </div>
      </div>
      <div style={{background:'#fff',marginTop:8,padding:'12px 16px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div style={{border:'1px solid #ccc',borderRadius:6,padding:'12px'}}>
          <div style={{fontSize:11,color:'#aaa',marginBottom:4}}>Invoice Date</div>
          <input type="date" value={f.invoiceDate} onChange={e=>set('invoiceDate',e.target.value)} style={{border:'none',background:'transparent',fontSize:13,color:'#333',outline:'none',padding:0,width:'100%'}}/>
        </div>
        <div style={{border:'1px solid #ccc',borderRadius:6,padding:'12px'}}>
          <div style={{fontSize:11,color:'#aaa',marginBottom:4}}>Inv No.</div>
          <input value={f.invoiceNo} onChange={e=>set('invoiceNo',e.target.value)} style={{border:'none',background:'transparent',fontSize:13,color:'#333',width:'100%',outline:'none',padding:0}}/>
        </div>
      </div>
      <div style={{background:'#fff',marginTop:8,padding:'0 16px 8px'}}>
        <button onClick={()=>setShowItems(v=>!v)} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'14px',border:'1px solid #1976d2',borderRadius:6,background:'#fff',color:'#1976d2',fontSize:14,fontWeight:600,cursor:'pointer'}}>
          <span style={{width:22,height:22,borderRadius:'50%',background:'#1976d2',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:900,lineHeight:'1'}}>+</span>
          Add Items <span style={{fontWeight:400,color:'#999'}}>(Optional)</span>
        </button>
        {showItems&&(
          <div style={{marginTop:10,border:'1px solid #e0e0e0',borderRadius:6,padding:'12px'}}>
            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr auto',gap:8,alignItems:'flex-end',marginBottom:8}}>
              <div><div style={{fontSize:11,color:'#888',marginBottom:4}}>Book</div>
                <select value={selBook} onChange={e=>setSelBook(e.target.value)} style={{width:'100%',border:'1px solid #ddd',borderRadius:5,padding:'8px',fontSize:13,outline:'none'}}>
                  <option value="">Select book…</option>{data.books.map(b=><option key={b.id} value={b.id}>{b.title}</option>)}
                </select>
              </div>
              <div><div style={{fontSize:11,color:'#888',marginBottom:4}}>Qty</div>
                <input type="number" min="1" value={selQty} onChange={e=>setSelQty(Number(e.target.value))} style={{width:'100%',border:'1px solid #ddd',borderRadius:5,padding:'8px',fontSize:13,outline:'none'}}/>
              </div>
              <button onClick={addItem} className="btn primary" style={{padding:'8px 12px',height:36}}><Plus size={13}/></button>
            </div>
            {f.items.map(item=>(
              <div key={item.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderTop:'1px solid #f0f0f0'}}>
                <div><div style={{fontSize:13,fontWeight:600,color:'#1a1a1a'}}>{item.name}</div><div style={{fontSize:11,color:'#888'}}>{item.qty} × {money(item.price)}</div></div>
                <div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontWeight:600,color:'#a24840'}}>{money(item.qty*item.price)}</span><button onClick={()=>removeItem(item.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#ccc',display:'flex'}}><Trash2 size={14}/></button></div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{background:'#fff',marginTop:8,padding:'0 16px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'18px 0'}}>
          <span style={{fontSize:15,fontWeight:700,color:'#1a1a1a'}}>Total Amount</span>
          <div style={{display:'flex',alignItems:'center',gap:4}}>
            <span style={{fontSize:15,color:'#1a1a1a'}}>₹</span>
            <div style={{borderBottom:'1px dashed #aaa',minWidth:140,paddingBottom:2}}>
              <input type="number" min="0" value={f.totalAmount||''} onChange={e=>set('totalAmount',Number(e.target.value))} style={{border:'none',background:'transparent',fontSize:15,fontWeight:600,color:'#1a1a1a',width:'100%',outline:'none',padding:0,textAlign:'right'}}/>
            </div>
          </div>
        </div>
      </div>
      <div style={{background:'#fff',marginTop:8,padding:'12px 16px'}}>
        <label style={{fontSize:12,color:'#888',display:'block',marginBottom:6}}>Notes (Optional)</label>
        <textarea value={f.notes} onChange={e=>set('notes',e.target.value)} placeholder="Add a note…" style={{width:'100%',border:'1px solid #ddd',borderRadius:6,padding:'10px',fontSize:14,background:'#fafafa',resize:'vertical',height:72,outline:'none',boxSizing:'border-box'}}/>
      </div>
      {validationMsg&&(
        <div style={{position:'fixed',bottom:90,left:'50%',transform:'translateX(-50%)',background:'rgba(40,40,40,0.92)',color:'#fff',borderRadius:28,padding:'12px 20px',display:'flex',alignItems:'center',gap:10,fontSize:14,fontWeight:500,zIndex:999,boxShadow:'0 4px 20px rgba(0,0,0,0.25)',whiteSpace:'nowrap'}}>
          <span style={{width:22,height:22,background:'#e53935',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,flexShrink:0}}>!</span>
          {validationMsg}
        </div>
      )}
      <div style={{position:'sticky',bottom:0,background:'#fff',borderTop:'1px solid #e8e8e8',display:'grid',gridTemplateColumns:'1fr 1fr auto',zIndex:10,marginTop:'auto'}}>
        <button onClick={()=>handleSave(true)} style={{padding:'16px 0',background:'#fff',border:'none',borderRight:'1px solid #e8e8e8',fontSize:14,fontWeight:600,color:'#555',cursor:'pointer'}} onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='#f5f5f5'} onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='#fff'}>Save &amp; New</button>
        <button onClick={()=>handleSave(false)} style={{padding:'16px 0',background:'#1565c0',border:'none',fontSize:14,fontWeight:700,color:'#fff',cursor:'pointer'}} onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='#0d47a1'} onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='#1565c0'}>Save</button>
        <button style={{padding:'16px 18px',background:'#fff',border:'none',borderLeft:'1px solid #e8e8e8',fontSize:20,color:'#555',cursor:'pointer',lineHeight:1}} title="More options">⋮</button>
      </div>
    </main>
  );
}

// ─────────────────────────── Estimate / Quotation ───────────────────────────
const ESTIMATE_KEY='bookbazaar-estimate-v1';
type EstimateItem={id:string;bookId:string;name:string;qty:number;price:number;discount:number};
type Estimate={id:string;estimateNo:string;date:string;expiryDate:string;time:string;customerName:string;phone:string;items:EstimateItem[];subTotal:number;discountAmt:number;totalAmount:number;notes:string;status:'Draft'|'Sent'|'Accepted'|'Expired'};
function EstimatePage(c:Context){
  const [records,setRecords]=useState<Estimate[]>(()=>{try{const v=localStorage.getItem(ESTIMATE_KEY);return v?JSON.parse(v):[];}catch{return [];}});
  const [view,setView]=useState<'list'|'form'>('list');
  const [editing,setEditing]=useState<Estimate|null>(null);
  const [dateRange,setDateRange]=useState({from:today.slice(0,8)+'01',to:today});
  useEffect(()=>{localStorage.setItem(ESTIMATE_KEY,JSON.stringify(records));},[records]);
  const nowTime=()=>new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true});
  const nextNo=()=>`EST-${String(records.length+1).padStart(3,'0')}`;
  const openNew=()=>{setEditing(null);setView('form');};
  const openEdit=(r:Estimate)=>{setEditing(r);setView('form');};
  const closeForm=()=>{setView('list');setEditing(null);};
  const save=(r:Estimate,andNew?:boolean)=>{setRecords(prev=>editing?prev.map(x=>x.id===r.id?r:x):[r,...prev]);if(andNew)setEditing(null);else closeForm();};
  const del=(id:string)=>setRecords(prev=>prev.filter(x=>x.id!==id));
  if(view==='form')return <EstimateForm data={c.data} initial={editing} nextNo={nextNo()} nowTime={nowTime()} onSave={save} onClose={closeForm} onDelete={editing?()=>{del(editing.id);closeForm();}:undefined}/>;
  const filtered=records.filter(r=>r.date>=dateRange.from&&r.date<=dateRange.to);
  const filterBar=(
    <div style={{background:'#fff',borderBottom:'1px solid #e8e8e8',padding:'10px 20px',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
      <select style={{border:'1px solid #ddd',borderRadius:6,padding:'6px 12px',fontSize:13,color:'#333',background:'#fafafa',outline:'none',cursor:'pointer'}}>
        <option>This Month</option><option>Last Month</option><option>This Quarter</option><option>Custom</option>
      </select>
      <div style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'#444'}}>
        <CalendarDays size={16} style={{color:'#1976d2'}}/>
        <input type="date" value={dateRange.from} onChange={e=>setDateRange(p=>({...p,from:e.target.value}))} style={{border:'none',background:'transparent',fontSize:13,color:'#333',outline:'none',cursor:'pointer'}}/>
        <span style={{fontWeight:600,color:'#666'}}>TO</span>
        <input type="date" value={dateRange.to} onChange={e=>setDateRange(p=>({...p,to:e.target.value}))} style={{border:'none',background:'transparent',fontSize:13,color:'#333',outline:'none',cursor:'pointer'}}/>
      </div>
    </div>
  );
  if(!records.length) return (
    <main className="page">
      {filterBar}
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'60vh',textAlign:'center',gap:14,background:'#eef4fb'}}>
        <svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="18" y="20" width="64" height="78" rx="7" fill="#e3eefa" transform="rotate(-5 18 20)"/>
          <rect x="26" y="16" width="64" height="78" rx="7" fill="#f4f8ff" stroke="#c5d9f0" strokeWidth="1"/>
          <line x1="38" y1="36" x2="76" y2="36" stroke="#c5d9f0" strokeWidth="3" strokeLinecap="round"/>
          <line x1="38" y1="47" x2="76" y2="47" stroke="#c5d9f0" strokeWidth="3" strokeLinecap="round"/>
          <line x1="38" y1="58" x2="62" y2="58" stroke="#c5d9f0" strokeWidth="3" strokeLinecap="round"/>
          <line x1="38" y1="69" x2="70" y2="69" stroke="#e0b040" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="78" cy="78" r="14" fill="#1976d2"/>
          <line x1="78" y1="73" x2="78" y2="83" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="73" y1="78" x2="83" y2="78" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        <h2 style={{fontFamily:'var(--app-font-serif)',fontSize:20,fontWeight:700,color:'#1a1a1a',margin:0}}>No Estimates Yet</h2>
        <p style={{fontSize:13,color:'#6d7d6e',maxWidth:320,margin:0,lineHeight:1.6}}>Create estimates and quotations to share with your customers before finalising a sale.</p>
        <button className="btn primary" onClick={openNew} style={{marginTop:8,display:'flex',alignItems:'center',gap:7,fontSize:14}}>
          <Plus size={15}/> Add Estimate
        </button>
      </div>
    </main>
  );
  const statusColor=(s:string)=>s==='Accepted'?'#2e7d32':s==='Sent'?'#1565c0':s==='Expired'?'#a24840':'#888';
  return (
    <main className="page">
      {filterBar}
      <div style={{padding:'14px 20px 0',display:'flex',justifyContent:'flex-end'}}>
        <button className="btn primary" onClick={openNew} style={{display:'flex',alignItems:'center',gap:7}}><Plus size={14}/> Add Estimate</button>
      </div>
      <div className="stat-grid" style={{marginTop:14}}>
        <Stat label="Total Estimates" value={filtered.length} note="In selected period" Icon={ClipboardList}/>
        <Stat label="Total Value" value={money(filtered.reduce((s,r)=>s+r.totalAmount,0))} note="Quoted amount" Icon={FileText}/>
        <Stat label="Accepted" value={filtered.filter(r=>r.status==='Accepted').length} note="Converted to sale" Icon={Check} tint="green"/>
      </div>
      <section className="panel">
        <div className="table-wrap"><table className="data-table">
          <thead><tr><th>Estimate No.</th><th>Customer</th><th>Date</th><th>Expiry</th><th>Items</th><th>Total</th><th>Status</th><th></th></tr></thead>
          <tbody>{filtered.map(r=>(
            <tr key={r.id}>
              <td><div className="book-title">{r.estimateNo}</div><div className="muted">{r.time}</div></td>
              <td><div className="book-title">{r.customerName||'—'}</div><div className="muted">{r.phone}</div></td>
              <td>{r.date}</td>
              <td>{r.expiryDate||'—'}</td>
              <td>{r.items.length} item{r.items.length!==1?'s':''}</td>
              <td style={{fontWeight:600}}>{money(r.totalAmount)}</td>
              <td><span style={{fontSize:12,fontWeight:600,color:statusColor(r.status)}}>{r.status}</span></td>
              <td><div className="row-actions"><button className="icon-button" title="Edit" onClick={()=>openEdit(r)}><Pencil/></button><button className="icon-button" title="Delete" onClick={()=>del(r.id)}><Trash2/></button></div></td>
            </tr>
          ))}</tbody>
        </table></div>
      </section>
    </main>
  );
}
function EstimateForm({data,initial,nextNo,nowTime,onSave,onClose,onDelete}:{data:Dataset;initial:Estimate|null;nextNo:string;nowTime:string;onSave:(r:Estimate,andNew?:boolean)=>void;onClose:()=>void;onDelete?:()=>void}){
  const blank:Omit<Estimate,'id'>={estimateNo:nextNo,date:today,expiryDate:'',time:nowTime,customerName:'',phone:'',items:[],subTotal:0,discountAmt:0,totalAmount:0,notes:'',status:'Draft'};
  const [f,setF]=useState<Omit<Estimate,'id'>>(initial||blank);
  const [showItems,setShowItems]=useState(false);
  const [selBook,setSelBook]=useState('');
  const [selQty,setSelQty]=useState(1);
  const [selDisc,setSelDisc]=useState(0);
  const [validationMsg,setValidationMsg]=useState('');
  const set=(k:string,v:any)=>setF(p=>({...p,[k]:v}));
  useEffect(()=>{if(!validationMsg)return;const t=setTimeout(()=>setValidationMsg(''),2800);return()=>clearTimeout(t);},[validationMsg]);
  const recalc=(items:EstimateItem[])=>{const sub=items.reduce((s,i)=>s+i.qty*i.price,0);const disc=items.reduce((s,i)=>s+i.qty*i.price*(i.discount/100),0);return{subTotal:sub,discountAmt:disc,totalAmount:sub-disc};};
  const addItem=()=>{const book=data.books.find(b=>b.id===selBook);if(!book)return;const newItem={id:idFor('EI'),bookId:book.id,name:book.title,qty:selQty,price:book.price,discount:selDisc};const items=[...f.items,newItem];setF(p=>({...p,items,...recalc(items)}));setSelBook('');setSelQty(1);setSelDisc(0);setShowItems(false);};
  const removeItem=(id:string)=>{const items=f.items.filter(i=>i.id!==id);setF(p=>({...p,items,...recalc(items)}));};
  const handleSave=(andNew=false)=>{if(!f.customerName.trim()){setValidationMsg('Customer name is required');return;}if(!f.items.length&&!f.totalAmount){setValidationMsg("Add at least one item or enter a total");return;}const rec:Estimate={...f,id:initial?.id||idFor('EST')};onSave(rec,andNew);if(andNew)setF({...blank,estimateNo:`EST-${String(Number(f.estimateNo.replace('EST-',''))+1).padStart(3,'0')}`});};
  return(
    <main style={{minHeight:'100vh',background:'#f5f5f5',display:'flex',flexDirection:'column',maxWidth:520,margin:'0 auto',position:'relative',paddingBottom:80}}>
      {/* Header */}
      <div style={{background:'#fff',borderBottom:'1px solid #e8e8e8',padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',padding:4,display:'flex',alignItems:'center',color:'#333'}}><ArrowRight style={{transform:'rotate(180deg)'}} size={22}/></button>
          <h1 style={{fontSize:18,fontWeight:700,color:'#1a1a1a',margin:0}}>Estimate / Quotation</h1>
        </div>
        {onDelete&&<button onClick={onDelete} style={{background:'none',border:'none',cursor:'pointer',color:'#e53935',display:'flex'}}><Trash2 size={15}/></button>}
      </div>
      {/* Estimate No + Date */}
      <div style={{background:'#fff',borderBottom:'1px solid #eee',padding:'12px 16px',display:'grid',gridTemplateColumns:'1fr 1px 1fr',gap:0}}>
        <div style={{paddingRight:16}}>
          <div style={{fontSize:11,color:'#999',marginBottom:3}}>Estimate No.</div>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <input value={f.estimateNo} onChange={e=>set('estimateNo',e.target.value)} style={{border:'none',background:'transparent',fontSize:15,fontWeight:600,color:'#1a1a1a',width:'90px',outline:'none',padding:0}}/>
            <ChevronDown size={14} style={{color:'#999'}}/>
          </div>
        </div>
        <div style={{background:'#e0e0e0',width:1,margin:'4px 0'}}/>
        <div style={{paddingLeft:16}}>
          <div style={{fontSize:11,color:'#999',marginBottom:3}}>Date</div>
          <input type="date" value={f.date} onChange={e=>set('date',e.target.value)} style={{border:'none',background:'transparent',fontSize:14,fontWeight:500,color:'#1a1a1a',outline:'none',padding:0,width:130}}/>
        </div>
      </div>
      {/* Customer Name */}
      <div style={{background:'#fff',marginTop:8,padding:'4px 16px 4px'}}>
        <div style={{position:'relative',border:'2px solid #1976d2',borderRadius:6,padding:'16px 12px 8px'}}>
          <label style={{position:'absolute',top:-10,left:10,background:'#fff',padding:'0 4px',fontSize:12,color:'#1976d2',fontWeight:500}}>Customer Name *</label>
          <input value={f.customerName} onChange={e=>set('customerName',e.target.value)} style={{border:'none',background:'transparent',fontSize:15,color:'#1a1a1a',width:'100%',outline:'none',padding:0}}/>
        </div>
      </div>
      {/* Phone */}
      <div style={{background:'#fff',marginTop:10,padding:'4px 16px 12px'}}>
        <div style={{border:'1px solid #ccc',borderRadius:6,padding:'14px 12px'}}>
          <input value={f.phone} onChange={e=>set('phone',e.target.value)} placeholder="Phone Number" style={{border:'none',background:'transparent',fontSize:15,color:'#1a1a1a',width:'100%',outline:'none',padding:0}}/>
        </div>
      </div>
      {/* Expiry + Status */}
      <div style={{background:'#fff',marginTop:8,padding:'12px 16px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div style={{border:'1px solid #ccc',borderRadius:6,padding:'12px'}}>
          <div style={{fontSize:11,color:'#aaa',marginBottom:4}}>Expiry Date</div>
          <input type="date" value={f.expiryDate} onChange={e=>set('expiryDate',e.target.value)} style={{border:'none',background:'transparent',fontSize:13,color:'#333',outline:'none',padding:0,width:'100%'}}/>
        </div>
        <div style={{border:'1px solid #ccc',borderRadius:6,padding:'12px'}}>
          <div style={{fontSize:11,color:'#aaa',marginBottom:4}}>Status</div>
          <select value={f.status} onChange={e=>set('status',e.target.value as Estimate['status'])} style={{border:'none',background:'transparent',fontSize:13,color:'#333',width:'100%',outline:'none',padding:0}}>
            <option>Draft</option><option>Sent</option><option>Accepted</option><option>Expired</option>
          </select>
        </div>
      </div>
      {/* Add Items */}
      <div style={{background:'#fff',marginTop:8,padding:'0 16px 8px'}}>
        <button onClick={()=>setShowItems(v=>!v)} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'14px',border:'1px solid #1976d2',borderRadius:6,background:'#fff',color:'#1976d2',fontSize:14,fontWeight:600,cursor:'pointer'}}>
          <span style={{width:22,height:22,borderRadius:'50%',background:'#1976d2',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:900,lineHeight:'1'}}>+</span>
          Add Items <span style={{fontWeight:400,color:'#999'}}>(Optional)</span>
        </button>
        {showItems&&(
          <div style={{marginTop:10,border:'1px solid #e0e0e0',borderRadius:6,padding:'12px'}}>
            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr auto',gap:8,alignItems:'flex-end',marginBottom:8}}>
              <div><div style={{fontSize:11,color:'#888',marginBottom:4}}>Book</div>
                <select value={selBook} onChange={e=>setSelBook(e.target.value)} style={{width:'100%',border:'1px solid #ddd',borderRadius:5,padding:'7px',fontSize:13,outline:'none'}}>
                  <option value="">Select…</option>{data.books.map(b=><option key={b.id} value={b.id}>{b.title}</option>)}
                </select>
              </div>
              <div><div style={{fontSize:11,color:'#888',marginBottom:4}}>Qty</div>
                <input type="number" min="1" value={selQty} onChange={e=>setSelQty(Number(e.target.value))} style={{width:'100%',border:'1px solid #ddd',borderRadius:5,padding:'7px',fontSize:13,outline:'none'}}/>
              </div>
              <div><div style={{fontSize:11,color:'#888',marginBottom:4}}>Disc %</div>
                <input type="number" min="0" max="100" value={selDisc} onChange={e=>setSelDisc(Number(e.target.value))} style={{width:'100%',border:'1px solid #ddd',borderRadius:5,padding:'7px',fontSize:13,outline:'none'}}/>
              </div>
              <button onClick={addItem} className="btn primary" style={{padding:'7px 10px',height:34,alignSelf:'flex-end'}}><Plus size={13}/></button>
            </div>
            {f.items.map(item=>(
              <div key={item.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderTop:'1px solid #f0f0f0'}}>
                <div><div style={{fontSize:13,fontWeight:600,color:'#1a1a1a'}}>{item.name}</div><div style={{fontSize:11,color:'#888'}}>{item.qty} × {money(item.price)}{item.discount>0?` − ${item.discount}%`:''}</div></div>
                <div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontWeight:600}}>{money(item.qty*item.price*(1-item.discount/100))}</span><button onClick={()=>removeItem(item.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#ccc',display:'flex'}}><Trash2 size={14}/></button></div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Totals */}
      <div style={{background:'#fff',marginTop:8,padding:'0 16px'}}>
        {f.items.length>0&&<>
          <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px dashed #eee',fontSize:14,color:'#555'}}>
            <span>Sub Total</span><span>{money(f.subTotal)}</span>
          </div>
          {f.discountAmt>0&&<div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px dashed #eee',fontSize:14,color:'#a24840'}}>
            <span>Discount</span><span>− {money(f.discountAmt)}</span>
          </div>}
        </>}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 0'}}>
          <span style={{fontSize:15,fontWeight:700,color:'#1a1a1a'}}>Total Amount</span>
          <div style={{display:'flex',alignItems:'center',gap:4}}>
            <span style={{fontSize:15,color:'#1a1a1a'}}>₹</span>
            <div style={{borderBottom:'1px dashed #aaa',minWidth:140,paddingBottom:2}}>
              <input type="number" min="0" value={f.totalAmount||''} onChange={e=>set('totalAmount',Number(e.target.value))} style={{border:'none',background:'transparent',fontSize:15,fontWeight:600,color:'#1a1a1a',width:'100%',outline:'none',padding:0,textAlign:'right'}}/>
            </div>
          </div>
        </div>
      </div>
      {/* Notes */}
      <div style={{background:'#fff',marginTop:8,padding:'12px 16px'}}>
        <label style={{fontSize:12,color:'#888',display:'block',marginBottom:6}}>Notes (Optional)</label>
        <textarea value={f.notes} onChange={e=>set('notes',e.target.value)} placeholder="Add terms, conditions or a note…" style={{width:'100%',border:'1px solid #ddd',borderRadius:6,padding:'10px',fontSize:14,background:'#fafafa',resize:'vertical',height:72,outline:'none',boxSizing:'border-box'}}/>
      </div>
      {validationMsg&&(
        <div style={{position:'fixed',bottom:90,left:'50%',transform:'translateX(-50%)',background:'rgba(40,40,40,0.92)',color:'#fff',borderRadius:28,padding:'12px 20px',display:'flex',alignItems:'center',gap:10,fontSize:14,fontWeight:500,zIndex:999,boxShadow:'0 4px 20px rgba(0,0,0,0.25)',whiteSpace:'nowrap'}}>
          <span style={{width:22,height:22,background:'#e53935',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,flexShrink:0}}>!</span>
          {validationMsg}
        </div>
      )}
      <div style={{position:'sticky',bottom:0,background:'#fff',borderTop:'1px solid #e8e8e8',display:'grid',gridTemplateColumns:'1fr 1fr auto',zIndex:10,marginTop:'auto'}}>
        <button onClick={()=>handleSave(true)} style={{padding:'16px 0',background:'#fff',border:'none',borderRight:'1px solid #e8e8e8',fontSize:14,fontWeight:600,color:'#555',cursor:'pointer'}} onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='#f5f5f5'} onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='#fff'}>Save &amp; New</button>
        <button onClick={()=>handleSave(false)} style={{padding:'16px 0',background:'#1565c0',border:'none',fontSize:14,fontWeight:700,color:'#fff',cursor:'pointer'}} onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='#0d47a1'} onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='#1565c0'}>Save</button>
        <button style={{padding:'16px 18px',background:'#fff',border:'none',borderLeft:'1px solid #e8e8e8',fontSize:20,color:'#555',cursor:'pointer',lineHeight:1}} title="More options">⋮</button>
      </div>
    </main>
  );
}

// ─────────────────────────── Delivery Challan ───────────────────────────
const CHALLAN_KEY='bookbazaar-challan-v1';
type ChallanItem={id:string;bookId:string;name:string;qty:number;price:number};
type DeliveryChallan={id:string;challanNo:string;date:string;time:string;customerName:string;phone:string;deliveryAddress:string;vehicleNo:string;items:ChallanItem[];totalAmount:number;notes:string;status:'Draft'|'Dispatched'|'Delivered'};
function DeliveryChallanPage(c:Context){
  const [records,setRecords]=useState<DeliveryChallan[]>(()=>{try{const v=localStorage.getItem(CHALLAN_KEY);return v?JSON.parse(v):[];}catch{return [];}});
  const [view,setView]=useState<'list'|'form'>('list');
  const [editing,setEditing]=useState<DeliveryChallan|null>(null);
  const [dateRange,setDateRange]=useState({from:today.slice(0,8)+'01',to:today});
  useEffect(()=>{localStorage.setItem(CHALLAN_KEY,JSON.stringify(records));},[records]);
  const nowTime=()=>new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true});
  const nextNo=()=>`DC-${String(records.length+1).padStart(3,'0')}`;
  const openNew=()=>{setEditing(null);setView('form');};
  const openEdit=(r:DeliveryChallan)=>{setEditing(r);setView('form');};
  const closeForm=()=>{setView('list');setEditing(null);};
  const save=(r:DeliveryChallan,andNew?:boolean)=>{setRecords(prev=>editing?prev.map(x=>x.id===r.id?r:x):[r,...prev]);if(andNew)setEditing(null);else closeForm();};
  const del=(id:string)=>setRecords(prev=>prev.filter(x=>x.id!==id));
  if(view==='form')return <DeliveryChallanForm data={c.data} initial={editing} nextNo={nextNo()} nowTime={nowTime()} onSave={save} onClose={closeForm} onDelete={editing?()=>{del(editing.id);closeForm();}:undefined}/>;
  const filtered=records.filter(r=>r.date>=dateRange.from&&r.date<=dateRange.to);
  const filterBar=(
    <div style={{background:'#fff',borderBottom:'1px solid #e8e8e8',padding:'10px 20px',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
      <select style={{border:'1px solid #ddd',borderRadius:6,padding:'6px 12px',fontSize:13,color:'#333',background:'#fafafa',outline:'none',cursor:'pointer'}}>
        <option>This Month</option><option>Last Month</option><option>This Quarter</option><option>Custom</option>
      </select>
      <div style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'#444'}}>
        <CalendarDays size={16} style={{color:'#1976d2'}}/>
        <input type="date" value={dateRange.from} onChange={e=>setDateRange(p=>({...p,from:e.target.value}))} style={{border:'none',background:'transparent',fontSize:13,color:'#333',outline:'none',cursor:'pointer'}}/>
        <span style={{fontWeight:600,color:'#666'}}>TO</span>
        <input type="date" value={dateRange.to} onChange={e=>setDateRange(p=>({...p,to:e.target.value}))} style={{border:'none',background:'transparent',fontSize:13,color:'#333',outline:'none',cursor:'pointer'}}/>
      </div>
    </div>
  );
  if(!records.length) return (
    <main className="page">
      {filterBar}
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'60vh',textAlign:'center',gap:14,background:'#eef4fb'}}>
        <svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="55" width="90" height="42" rx="6" fill="#dce8f5"/>
          <rect x="10" y="55" width="90" height="42" rx="6" stroke="#b8d0ea" strokeWidth="1.5"/>
          <rect x="22" y="38" width="66" height="22" rx="4" fill="#f0f6ff" stroke="#c8ddf0" strokeWidth="1.2"/>
          <rect x="34" y="24" width="42" height="18" rx="4" fill="#e3eefa" stroke="#b8d0ea" strokeWidth="1.2"/>
          <circle cx="30" cy="97" r="7" fill="#1976d2"/>
          <circle cx="80" cy="97" r="7" fill="#1976d2"/>
          <line x1="22" y1="68" x2="60" y2="68" stroke="#b8d0ea" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="22" y1="77" x2="50" y2="77" stroke="#b8d0ea" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        <h2 style={{fontFamily:'var(--app-font-serif)',fontSize:20,fontWeight:700,color:'#1a1a1a',margin:0}}>No Challans Yet</h2>
        <p style={{fontSize:13,color:'#6d7d6e',maxWidth:320,margin:0,lineHeight:1.6}}>Generate delivery challans for book dispatches. Track deliveries from dispatch to delivery.</p>
        <button className="btn primary" onClick={openNew} style={{marginTop:8,display:'flex',alignItems:'center',gap:7,fontSize:14}}>
          <Plus size={15}/> Add Delivery Challan
        </button>
      </div>
    </main>
  );
  const statusColor=(s:string)=>s==='Delivered'?'#2e7d32':s==='Dispatched'?'#1565c0':'#888';
  return (
    <main className="page">
      {filterBar}
      <div style={{padding:'14px 20px 0',display:'flex',justifyContent:'flex-end'}}>
        <button className="btn primary" onClick={openNew} style={{display:'flex',alignItems:'center',gap:7}}><Plus size={14}/> Add Delivery Challan</button>
      </div>
      <div className="stat-grid" style={{marginTop:14}}>
        <Stat label="Total Challans" value={filtered.length} note="In selected period" Icon={Package}/>
        <Stat label="Dispatched" value={filtered.filter(r=>r.status==='Dispatched').length} note="In transit" Icon={ArrowRight}/>
        <Stat label="Delivered" value={filtered.filter(r=>r.status==='Delivered').length} note="Completed" Icon={Check} tint="green"/>
      </div>
      <section className="panel">
        <div className="table-wrap"><table className="data-table">
          <thead><tr><th>Challan No.</th><th>Customer</th><th>Date</th><th>Address</th><th>Items</th><th>Amount</th><th>Status</th><th></th></tr></thead>
          <tbody>{filtered.map(r=>(
            <tr key={r.id}>
              <td><div className="book-title">{r.challanNo}</div><div className="muted">{r.time}</div></td>
              <td><div className="book-title">{r.customerName||'—'}</div><div className="muted">{r.phone}</div></td>
              <td>{r.date}</td>
              <td style={{maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.deliveryAddress||'—'}</td>
              <td>{r.items.length} item{r.items.length!==1?'s':''}</td>
              <td style={{fontWeight:600}}>{money(r.totalAmount)}</td>
              <td><span style={{fontSize:12,fontWeight:600,color:statusColor(r.status)}}>{r.status}</span></td>
              <td><div className="row-actions"><button className="icon-button" title="Edit" onClick={()=>openEdit(r)}><Pencil/></button><button className="icon-button" title="Delete" onClick={()=>del(r.id)}><Trash2/></button></div></td>
            </tr>
          ))}</tbody>
        </table></div>
      </section>
    </main>
  );
}
function DeliveryChallanForm({data,initial,nextNo,nowTime,onSave,onClose,onDelete}:{data:Dataset;initial:DeliveryChallan|null;nextNo:string;nowTime:string;onSave:(r:DeliveryChallan,andNew?:boolean)=>void;onClose:()=>void;onDelete?:()=>void}){
  const blank:Omit<DeliveryChallan,'id'>={challanNo:nextNo,date:today,time:nowTime,customerName:'',phone:'',deliveryAddress:'',vehicleNo:'',items:[],totalAmount:0,notes:'',status:'Draft'};
  const [f,setF]=useState<Omit<DeliveryChallan,'id'>>(initial||blank);
  const [showItems,setShowItems]=useState(false);
  const [selBook,setSelBook]=useState('');
  const [selQty,setSelQty]=useState(1);
  const [validationMsg,setValidationMsg]=useState('');
  const set=(k:string,v:any)=>setF(p=>({...p,[k]:v}));
  useEffect(()=>{if(!validationMsg)return;const t=setTimeout(()=>setValidationMsg(''),2800);return()=>clearTimeout(t);},[validationMsg]);
  const addItem=()=>{const book=data.books.find(b=>b.id===selBook);if(!book)return;const newItem={id:idFor('CI'),bookId:book.id,name:book.title,qty:selQty,price:book.price};setF(p=>({...p,items:[...p.items,newItem],totalAmount:p.totalAmount+selQty*book.price}));setSelBook('');setSelQty(1);setShowItems(false);};
  const removeItem=(id:string)=>{const item=f.items.find(i=>i.id===id);setF(p=>({...p,items:p.items.filter(i=>i.id!==id),totalAmount:Math.max(0,p.totalAmount-(item?item.qty*item.price:0))}));};
  const handleSave=(andNew=false)=>{if(!f.customerName.trim()){setValidationMsg('Customer name is required');return;}const rec:DeliveryChallan={...f,id:initial?.id||idFor('DC')};onSave(rec,andNew);if(andNew)setF({...blank,challanNo:`DC-${String(Number(f.challanNo.replace('DC-',''))+1).padStart(3,'0')}`});};
  return(
    <main style={{minHeight:'100vh',background:'#f5f5f5',display:'flex',flexDirection:'column',maxWidth:520,margin:'0 auto',position:'relative',paddingBottom:80}}>
      {/* Header */}
      <div style={{background:'#fff',borderBottom:'1px solid #e8e8e8',padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',padding:4,display:'flex',alignItems:'center',color:'#333'}}><ArrowRight style={{transform:'rotate(180deg)'}} size={22}/></button>
          <h1 style={{fontSize:18,fontWeight:700,color:'#1a1a1a',margin:0}}>Delivery Challan</h1>
        </div>
        {onDelete&&<button onClick={onDelete} style={{background:'none',border:'none',cursor:'pointer',color:'#e53935',display:'flex'}}><Trash2 size={15}/></button>}
      </div>
      {/* Challan No + Date */}
      <div style={{background:'#fff',borderBottom:'1px solid #eee',padding:'12px 16px',display:'grid',gridTemplateColumns:'1fr 1px 1fr',gap:0}}>
        <div style={{paddingRight:16}}>
          <div style={{fontSize:11,color:'#999',marginBottom:3}}>Challan No.</div>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <input value={f.challanNo} onChange={e=>set('challanNo',e.target.value)} style={{border:'none',background:'transparent',fontSize:15,fontWeight:600,color:'#1a1a1a',width:'90px',outline:'none',padding:0}}/>
            <ChevronDown size={14} style={{color:'#999'}}/>
          </div>
        </div>
        <div style={{background:'#e0e0e0',width:1,margin:'4px 0'}}/>
        <div style={{paddingLeft:16}}>
          <div style={{fontSize:11,color:'#999',marginBottom:3}}>Date</div>
          <input type="date" value={f.date} onChange={e=>set('date',e.target.value)} style={{border:'none',background:'transparent',fontSize:14,fontWeight:500,color:'#1a1a1a',outline:'none',padding:0,width:130}}/>
        </div>
      </div>
      {/* Customer Name */}
      <div style={{background:'#fff',marginTop:8,padding:'4px 16px 4px'}}>
        <div style={{position:'relative',border:'2px solid #1976d2',borderRadius:6,padding:'16px 12px 8px'}}>
          <label style={{position:'absolute',top:-10,left:10,background:'#fff',padding:'0 4px',fontSize:12,color:'#1976d2',fontWeight:500}}>Customer Name *</label>
          <input value={f.customerName} onChange={e=>set('customerName',e.target.value)} style={{border:'none',background:'transparent',fontSize:15,color:'#1a1a1a',width:'100%',outline:'none',padding:0}}/>
        </div>
      </div>
      {/* Phone */}
      <div style={{background:'#fff',marginTop:10,padding:'4px 16px 10px'}}>
        <div style={{border:'1px solid #ccc',borderRadius:6,padding:'14px 12px'}}>
          <input value={f.phone} onChange={e=>set('phone',e.target.value)} placeholder="Phone Number" style={{border:'none',background:'transparent',fontSize:15,color:'#1a1a1a',width:'100%',outline:'none',padding:0}}/>
        </div>
      </div>
      {/* Delivery Address */}
      <div style={{background:'#fff',marginTop:8,padding:'12px 16px'}}>
        <label style={{fontSize:12,color:'#888',display:'block',marginBottom:6}}>Delivery Address</label>
        <textarea value={f.deliveryAddress} onChange={e=>set('deliveryAddress',e.target.value)} placeholder="Enter delivery address…" style={{width:'100%',border:'1px solid #ddd',borderRadius:6,padding:'10px',fontSize:14,background:'#fafafa',resize:'vertical',height:64,outline:'none',boxSizing:'border-box'}}/>
      </div>
      {/* Vehicle No + Status */}
      <div style={{background:'#fff',marginTop:8,padding:'12px 16px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div style={{border:'1px solid #ccc',borderRadius:6,padding:'12px'}}>
          <div style={{fontSize:11,color:'#aaa',marginBottom:4}}>Vehicle No. (Optional)</div>
          <input value={f.vehicleNo} onChange={e=>set('vehicleNo',e.target.value)} placeholder="e.g. MH12AB1234" style={{border:'none',background:'transparent',fontSize:13,color:'#333',width:'100%',outline:'none',padding:0}}/>
        </div>
        <div style={{border:'1px solid #ccc',borderRadius:6,padding:'12px'}}>
          <div style={{fontSize:11,color:'#aaa',marginBottom:4}}>Status</div>
          <select value={f.status} onChange={e=>set('status',e.target.value as DeliveryChallan['status'])} style={{border:'none',background:'transparent',fontSize:13,color:'#333',width:'100%',outline:'none',padding:0}}>
            <option>Draft</option><option>Dispatched</option><option>Delivered</option>
          </select>
        </div>
      </div>
      {/* Add Items */}
      <div style={{background:'#fff',marginTop:8,padding:'0 16px 8px'}}>
        <button onClick={()=>setShowItems(v=>!v)} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'14px',border:'1px solid #1976d2',borderRadius:6,background:'#fff',color:'#1976d2',fontSize:14,fontWeight:600,cursor:'pointer'}}>
          <span style={{width:22,height:22,borderRadius:'50%',background:'#1976d2',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:900,lineHeight:'1'}}>+</span>
          Add Items <span style={{fontWeight:400,color:'#999'}}>(Optional)</span>
        </button>
        {showItems&&(
          <div style={{marginTop:10,border:'1px solid #e0e0e0',borderRadius:6,padding:'12px'}}>
            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr auto',gap:8,alignItems:'flex-end',marginBottom:8}}>
              <div><div style={{fontSize:11,color:'#888',marginBottom:4}}>Book</div>
                <select value={selBook} onChange={e=>setSelBook(e.target.value)} style={{width:'100%',border:'1px solid #ddd',borderRadius:5,padding:'8px',fontSize:13,outline:'none'}}>
                  <option value="">Select book…</option>{data.books.map(b=><option key={b.id} value={b.id}>{b.title}</option>)}
                </select>
              </div>
              <div><div style={{fontSize:11,color:'#888',marginBottom:4}}>Qty</div>
                <input type="number" min="1" value={selQty} onChange={e=>setSelQty(Number(e.target.value))} style={{width:'100%',border:'1px solid #ddd',borderRadius:5,padding:'8px',fontSize:13,outline:'none'}}/>
              </div>
              <button onClick={addItem} className="btn primary" style={{padding:'8px 12px',height:36}}><Plus size={13}/></button>
            </div>
            {f.items.map(item=>(
              <div key={item.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderTop:'1px solid #f0f0f0'}}>
                <div><div style={{fontSize:13,fontWeight:600,color:'#1a1a1a'}}>{item.name}</div><div style={{fontSize:11,color:'#888'}}>{item.qty} × {money(item.price)}</div></div>
                <div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontWeight:600}}>{money(item.qty*item.price)}</span><button onClick={()=>removeItem(item.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#ccc',display:'flex'}}><Trash2 size={14}/></button></div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Total Amount */}
      <div style={{background:'#fff',marginTop:8,padding:'0 16px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'18px 0'}}>
          <span style={{fontSize:15,fontWeight:700,color:'#1a1a1a'}}>Total Amount</span>
          <div style={{display:'flex',alignItems:'center',gap:4}}>
            <span style={{fontSize:15,color:'#1a1a1a'}}>₹</span>
            <div style={{borderBottom:'1px dashed #aaa',minWidth:140,paddingBottom:2}}>
              <input type="number" min="0" value={f.totalAmount||''} onChange={e=>set('totalAmount',Number(e.target.value))} style={{border:'none',background:'transparent',fontSize:15,fontWeight:600,color:'#1a1a1a',width:'100%',outline:'none',padding:0,textAlign:'right'}}/>
            </div>
          </div>
        </div>
      </div>
      {/* Notes */}
      <div style={{background:'#fff',marginTop:8,padding:'12px 16px'}}>
        <label style={{fontSize:12,color:'#888',display:'block',marginBottom:6}}>Notes (Optional)</label>
        <textarea value={f.notes} onChange={e=>set('notes',e.target.value)} placeholder="Add a note…" style={{width:'100%',border:'1px solid #ddd',borderRadius:6,padding:'10px',fontSize:14,background:'#fafafa',resize:'vertical',height:72,outline:'none',boxSizing:'border-box'}}/>
      </div>
      {validationMsg&&(
        <div style={{position:'fixed',bottom:90,left:'50%',transform:'translateX(-50%)',background:'rgba(40,40,40,0.92)',color:'#fff',borderRadius:28,padding:'12px 20px',display:'flex',alignItems:'center',gap:10,fontSize:14,fontWeight:500,zIndex:999,boxShadow:'0 4px 20px rgba(0,0,0,0.25)',whiteSpace:'nowrap'}}>
          <span style={{width:22,height:22,background:'#e53935',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,flexShrink:0}}>!</span>
          {validationMsg}
        </div>
      )}
      <div style={{position:'sticky',bottom:0,background:'#fff',borderTop:'1px solid #e8e8e8',display:'grid',gridTemplateColumns:'1fr 1fr auto',zIndex:10,marginTop:'auto'}}>
        <button onClick={()=>handleSave(true)} style={{padding:'16px 0',background:'#fff',border:'none',borderRight:'1px solid #e8e8e8',fontSize:14,fontWeight:600,color:'#555',cursor:'pointer'}} onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='#f5f5f5'} onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='#fff'}>Save &amp; New</button>
        <button onClick={()=>handleSave(false)} style={{padding:'16px 0',background:'#1565c0',border:'none',fontSize:14,fontWeight:700,color:'#fff',cursor:'pointer'}} onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='#0d47a1'} onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='#1565c0'}>Save</button>
        <button style={{padding:'16px 18px',background:'#fff',border:'none',borderLeft:'1px solid #e8e8e8',fontSize:20,color:'#555',cursor:'pointer',lineHeight:1}} title="More options">⋮</button>
      </div>
    </main>
  );
}

// ─────────────────────────── Sale Order ───────────────────────────
const SALE_ORDER_KEY='bookbazaar-sale-order-v1';
type SaleOrderItem={id:string;bookId:string;name:string;qty:number;price:number;discount:number};
type SaleOrder={id:string;orderNo:string;date:string;deliveryDate:string;time:string;customerName:string;phone:string;address:string;items:SaleOrderItem[];subTotal:number;discountAmt:number;totalAmount:number;notes:string;status:'Draft'|'Confirmed'|'Packed'|'Dispatched'|'Delivered'|'Cancelled'};
function SaleOrderPage(c:Context){
  const [records,setRecords]=useState<SaleOrder[]>(()=>{try{const v=localStorage.getItem(SALE_ORDER_KEY);return v?JSON.parse(v):[];}catch{return [];}});
  const [view,setView]=useState<'list'|'form'>('list');
  const [editing,setEditing]=useState<SaleOrder|null>(null);
  const [dateRange,setDateRange]=useState({from:today.slice(0,8)+'01',to:today});
  const [statusFilter,setStatusFilter]=useState('All');
  useEffect(()=>{localStorage.setItem(SALE_ORDER_KEY,JSON.stringify(records));},[records]);
  const nowTime=()=>new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true});
  const nextNo=()=>`SO-${String(records.length+1).padStart(3,'0')}`;
  const openNew=()=>{setEditing(null);setView('form');};
  const openEdit=(r:SaleOrder)=>{setEditing(r);setView('form');};
  const closeForm=()=>{setView('list');setEditing(null);};
  const save=(r:SaleOrder,andNew?:boolean)=>{setRecords(prev=>editing?prev.map(x=>x.id===r.id?r:x):[r,...prev]);if(andNew)setEditing(null);else closeForm();};
  const del=(id:string)=>setRecords(prev=>prev.filter(x=>x.id!==id));
  if(view==='form')return <SaleOrderForm data={c.data} initial={editing} nextNo={nextNo()} nowTime={nowTime()} onSave={save} onClose={closeForm} onDelete={editing?()=>{del(editing.id);closeForm();}:undefined}/>;
  const filtered=records.filter(r=>r.date>=dateRange.from&&r.date<=dateRange.to&&(statusFilter==='All'||r.status===statusFilter));
  const statusColors:Record<string,string>={Draft:'#888',Confirmed:'#1565c0',Packed:'#7b1fa2',Dispatched:'#e65100',Delivered:'#2e7d32',Cancelled:'#a24840'};
  const filterBar=(
    <div style={{background:'#fff',borderBottom:'1px solid #e8e8e8',padding:'10px 20px',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
      <select style={{border:'1px solid #ddd',borderRadius:6,padding:'6px 12px',fontSize:13,color:'#333',background:'#fafafa',outline:'none',cursor:'pointer'}}>
        <option>This Month</option><option>Last Month</option><option>This Quarter</option><option>Custom</option>
      </select>
      <div style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'#444'}}>
        <CalendarDays size={16} style={{color:'#1976d2'}}/>
        <input type="date" value={dateRange.from} onChange={e=>setDateRange(p=>({...p,from:e.target.value}))} style={{border:'none',background:'transparent',fontSize:13,color:'#333',outline:'none',cursor:'pointer'}}/>
        <span style={{fontWeight:600,color:'#666'}}>TO</span>
        <input type="date" value={dateRange.to} onChange={e=>setDateRange(p=>({...p,to:e.target.value}))} style={{border:'none',background:'transparent',fontSize:13,color:'#333',outline:'none',cursor:'pointer'}}/>
      </div>
      <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{border:'1px solid #ddd',borderRadius:6,padding:'6px 12px',fontSize:13,color:'#333',background:'#fafafa',outline:'none',cursor:'pointer',marginLeft:'auto'}}>
        {['All','Draft','Confirmed','Packed','Dispatched','Delivered','Cancelled'].map(s=><option key={s}>{s}</option>)}
      </select>
    </div>
  );
  if(!records.length) return (
    <main className="page">
      {filterBar}
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'60vh',textAlign:'center',gap:14,background:'#eef4fb'}}>
        <svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="18" y="20" width="74" height="72" rx="8" fill="#dce8f5"/>
          <rect x="18" y="20" width="74" height="72" rx="8" stroke="#b8d0ea" strokeWidth="1.5"/>
          <rect x="30" y="34" width="50" height="8" rx="3" fill="#f0f6ff"/>
          <rect x="30" y="48" width="38" height="6" rx="3" fill="#e3eefa"/>
          <rect x="30" y="60" width="44" height="6" rx="3" fill="#e3eefa"/>
          <rect x="30" y="72" width="28" height="6" rx="3" fill="#e3eefa"/>
          <circle cx="82" cy="82" r="16" fill="#1976d2"/>
          <path d="M75 82 L80 87 L89 77" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h2 style={{fontFamily:'var(--app-font-serif)',fontSize:20,fontWeight:700,color:'#1a1a1a',margin:0}}>No Sale Orders Yet</h2>
        <p style={{fontSize:13,color:'#6d7d6e',maxWidth:320,margin:0,lineHeight:1.6}}>Track and manage customer orders from confirmation to delivery — all in one place.</p>
        <button className="btn primary" onClick={openNew} style={{marginTop:8,display:'flex',alignItems:'center',gap:7,fontSize:14}}>
          <Plus size={15}/> Add Sale Order
        </button>
      </div>
    </main>
  );
  const totalValue=filtered.reduce((s,r)=>s+r.totalAmount,0);
  return (
    <main className="page">
      {filterBar}
      <div style={{padding:'14px 20px 0',display:'flex',justifyContent:'flex-end'}}>
        <button className="btn primary" onClick={openNew} style={{display:'flex',alignItems:'center',gap:7}}><Plus size={14}/> Add Sale Order</button>
      </div>
      <div className="stat-grid" style={{marginTop:14}}>
        <Stat label="Total Orders" value={filtered.length} note="In selected period" Icon={ShoppingBag}/>
        <Stat label="Order Value" value={money(totalValue)} note="Total billed" Icon={FileText}/>
        <Stat label="Confirmed" value={filtered.filter(r=>r.status==='Confirmed').length} note="Awaiting fulfilment" Icon={Check}/>
        <Stat label="Delivered" value={filtered.filter(r=>r.status==='Delivered').length} note="Completed" Icon={Check} tint="green"/>
      </div>
      <section className="panel">
        <div className="table-wrap"><table className="data-table">
          <thead><tr><th>Order No.</th><th>Customer</th><th>Order Date</th><th>Delivery Date</th><th>Items</th><th>Total</th><th>Status</th><th></th></tr></thead>
          <tbody>{filtered.map(r=>(
            <tr key={r.id}>
              <td><div className="book-title">{r.orderNo}</div><div className="muted">{r.time}</div></td>
              <td><div className="book-title">{r.customerName||'—'}</div><div className="muted">{r.phone}</div></td>
              <td>{r.date}</td>
              <td>{r.deliveryDate||'—'}</td>
              <td>{r.items.length} item{r.items.length!==1?'s':''}</td>
              <td style={{fontWeight:600}}>{money(r.totalAmount)}</td>
              <td><span style={{fontSize:12,fontWeight:600,padding:'3px 8px',borderRadius:12,background:`${statusColors[r.status]}18`,color:statusColors[r.status]}}>{r.status}</span></td>
              <td><div className="row-actions"><button className="icon-button" title="Edit" onClick={()=>openEdit(r)}><Pencil/></button><button className="icon-button" title="Delete" onClick={()=>del(r.id)}><Trash2/></button></div></td>
            </tr>
          ))}</tbody>
        </table></div>
      </section>
    </main>
  );
}
function SaleOrderForm({data,initial,nextNo,nowTime,onSave,onClose,onDelete}:{data:Dataset;initial:SaleOrder|null;nextNo:string;nowTime:string;onSave:(r:SaleOrder,andNew?:boolean)=>void;onClose:()=>void;onDelete?:()=>void}){
  const blank:Omit<SaleOrder,'id'>={orderNo:nextNo,date:today,deliveryDate:'',time:nowTime,customerName:'',phone:'',address:'',items:[],subTotal:0,discountAmt:0,totalAmount:0,notes:'',status:'Draft'};
  const [f,setF]=useState<Omit<SaleOrder,'id'>>(initial||blank);
  const [showItems,setShowItems]=useState(false);
  const [selBook,setSelBook]=useState('');
  const [selQty,setSelQty]=useState(1);
  const [selDisc,setSelDisc]=useState(0);
  const [validationMsg,setValidationMsg]=useState('');
  const set=(k:string,v:any)=>setF(p=>({...p,[k]:v}));
  useEffect(()=>{if(!validationMsg)return;const t=setTimeout(()=>setValidationMsg(''),2800);return()=>clearTimeout(t);},[validationMsg]);
  const recalc=(items:SaleOrderItem[])=>{const sub=items.reduce((s,i)=>s+i.qty*i.price,0);const disc=items.reduce((s,i)=>s+i.qty*i.price*(i.discount/100),0);return{subTotal:sub,discountAmt:disc,totalAmount:sub-disc};};
  const addItem=()=>{const book=data.books.find(b=>b.id===selBook);if(!book)return;const newItem={id:idFor('SOI'),bookId:book.id,name:book.title,qty:selQty,price:book.price,discount:selDisc};const items=[...f.items,newItem];setF(p=>({...p,items,...recalc(items)}));setSelBook('');setSelQty(1);setSelDisc(0);setShowItems(false);};
  const removeItem=(id:string)=>{const items=f.items.filter(i=>i.id!==id);setF(p=>({...p,items,...recalc(items)}));};
  const handleSave=(andNew=false)=>{if(!f.customerName.trim()){setValidationMsg('Customer name is required');return;}if(!f.items.length&&!f.totalAmount){setValidationMsg('Add at least one item or enter a total');return;}const rec:SaleOrder={...f,id:initial?.id||idFor('SO')};onSave(rec,andNew);if(andNew)setF({...blank,orderNo:`SO-${String(Number(f.orderNo.replace('SO-',''))+1).padStart(3,'0')}`});};
  const STATUS_OPTS=['Draft','Confirmed','Packed','Dispatched','Delivered','Cancelled'] as const;
  const statusColor=(s:string)=>({Draft:'#888',Confirmed:'#1565c0',Packed:'#7b1fa2',Dispatched:'#e65100',Delivered:'#2e7d32',Cancelled:'#a24840'} as Record<string,string>)[s]||'#888';
  return(
    <main style={{minHeight:'100vh',background:'#f5f5f5',display:'flex',flexDirection:'column',maxWidth:520,margin:'0 auto',position:'relative',paddingBottom:80}}>
      {/* Header */}
      <div style={{background:'#fff',borderBottom:'1px solid #e8e8e8',padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',padding:4,display:'flex',alignItems:'center',color:'#333'}}><ArrowRight style={{transform:'rotate(180deg)'}} size={22}/></button>
          <h1 style={{fontSize:18,fontWeight:700,color:'#1a1a1a',margin:0}}>Sale Order</h1>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:12,fontWeight:600,padding:'4px 10px',borderRadius:20,background:`${statusColor(f.status)}18`,color:statusColor(f.status)}}>{f.status}</span>
          {onDelete&&<button onClick={onDelete} style={{background:'none',border:'none',cursor:'pointer',color:'#e53935',display:'flex'}}><Trash2 size={15}/></button>}
        </div>
      </div>
      {/* Order No + Date */}
      <div style={{background:'#fff',borderBottom:'1px solid #eee',padding:'12px 16px',display:'grid',gridTemplateColumns:'1fr 1px 1fr',gap:0}}>
        <div style={{paddingRight:16}}>
          <div style={{fontSize:11,color:'#999',marginBottom:3}}>Order No.</div>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <input value={f.orderNo} onChange={e=>set('orderNo',e.target.value)} style={{border:'none',background:'transparent',fontSize:15,fontWeight:600,color:'#1a1a1a',width:'90px',outline:'none',padding:0}}/>
            <ChevronDown size={14} style={{color:'#999'}}/>
          </div>
        </div>
        <div style={{background:'#e0e0e0',width:1,margin:'4px 0'}}/>
        <div style={{paddingLeft:16}}>
          <div style={{fontSize:11,color:'#999',marginBottom:3}}>Order Date</div>
          <input type="date" value={f.date} onChange={e=>set('date',e.target.value)} style={{border:'none',background:'transparent',fontSize:14,fontWeight:500,color:'#1a1a1a',outline:'none',padding:0,width:130}}/>
        </div>
      </div>
      {/* Customer Name */}
      <div style={{background:'#fff',marginTop:8,padding:'4px 16px 4px'}}>
        <div style={{position:'relative',border:'2px solid #1976d2',borderRadius:6,padding:'16px 12px 8px'}}>
          <label style={{position:'absolute',top:-10,left:10,background:'#fff',padding:'0 4px',fontSize:12,color:'#1976d2',fontWeight:500}}>Customer Name *</label>
          <input value={f.customerName} onChange={e=>set('customerName',e.target.value)} style={{border:'none',background:'transparent',fontSize:15,color:'#1a1a1a',width:'100%',outline:'none',padding:0}}/>
        </div>
      </div>
      {/* Phone */}
      <div style={{background:'#fff',marginTop:10,padding:'4px 16px 10px'}}>
        <div style={{border:'1px solid #ccc',borderRadius:6,padding:'14px 12px'}}>
          <input value={f.phone} onChange={e=>set('phone',e.target.value)} placeholder="Phone Number" style={{border:'none',background:'transparent',fontSize:15,color:'#1a1a1a',width:'100%',outline:'none',padding:0}}/>
        </div>
      </div>
      {/* Delivery Date + Status */}
      <div style={{background:'#fff',marginTop:8,padding:'12px 16px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div style={{border:'1px solid #ccc',borderRadius:6,padding:'12px'}}>
          <div style={{fontSize:11,color:'#aaa',marginBottom:4}}>Delivery Date</div>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <input type="date" value={f.deliveryDate} onChange={e=>set('deliveryDate',e.target.value)} style={{border:'none',background:'transparent',fontSize:13,color:'#333',outline:'none',padding:0,flex:1}}/>
            <CalendarDays size={13} style={{color:'#aaa',flexShrink:0}}/>
          </div>
        </div>
        <div style={{border:'1px solid #ccc',borderRadius:6,padding:'12px'}}>
          <div style={{fontSize:11,color:'#aaa',marginBottom:4}}>Status</div>
          <select value={f.status} onChange={e=>set('status',e.target.value as SaleOrder['status'])} style={{border:'none',background:'transparent',fontSize:13,color:statusColor(f.status),fontWeight:600,width:'100%',outline:'none',padding:0}}>
            {STATUS_OPTS.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      {/* Delivery Address */}
      <div style={{background:'#fff',marginTop:8,padding:'12px 16px'}}>
        <label style={{fontSize:12,color:'#888',display:'block',marginBottom:6}}>Delivery Address (Optional)</label>
        <textarea value={f.address} onChange={e=>set('address',e.target.value)} placeholder="Enter delivery address…" style={{width:'100%',border:'1px solid #ddd',borderRadius:6,padding:'10px',fontSize:14,background:'#fafafa',resize:'vertical',height:56,outline:'none',boxSizing:'border-box'}}/>
      </div>
      {/* Add Items */}
      <div style={{background:'#fff',marginTop:8,padding:'0 16px 8px'}}>
        <button onClick={()=>setShowItems(v=>!v)} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'14px',border:'1px solid #1976d2',borderRadius:6,background:'#fff',color:'#1976d2',fontSize:14,fontWeight:600,cursor:'pointer'}}>
          <span style={{width:22,height:22,borderRadius:'50%',background:'#1976d2',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:900,lineHeight:'1'}}>+</span>
          Add Items <span style={{fontWeight:400,color:'#999'}}>(Optional)</span>
        </button>
        {showItems&&(
          <div style={{marginTop:10,border:'1px solid #e0e0e0',borderRadius:6,padding:'12px'}}>
            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr auto',gap:8,alignItems:'flex-end',marginBottom:8}}>
              <div><div style={{fontSize:11,color:'#888',marginBottom:4}}>Book</div>
                <select value={selBook} onChange={e=>setSelBook(e.target.value)} style={{width:'100%',border:'1px solid #ddd',borderRadius:5,padding:'7px',fontSize:13,outline:'none'}}>
                  <option value="">Select…</option>{data.books.map(b=><option key={b.id} value={b.id}>{b.title}</option>)}
                </select>
              </div>
              <div><div style={{fontSize:11,color:'#888',marginBottom:4}}>Qty</div>
                <input type="number" min="1" value={selQty} onChange={e=>setSelQty(Number(e.target.value))} style={{width:'100%',border:'1px solid #ddd',borderRadius:5,padding:'7px',fontSize:13,outline:'none'}}/>
              </div>
              <div><div style={{fontSize:11,color:'#888',marginBottom:4}}>Disc %</div>
                <input type="number" min="0" max="100" value={selDisc} onChange={e=>setSelDisc(Number(e.target.value))} style={{width:'100%',border:'1px solid #ddd',borderRadius:5,padding:'7px',fontSize:13,outline:'none'}}/>
              </div>
              <button onClick={addItem} className="btn primary" style={{padding:'7px 10px',height:34,alignSelf:'flex-end'}}><Plus size={13}/></button>
            </div>
            {f.items.map(item=>(
              <div key={item.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderTop:'1px solid #f0f0f0'}}>
                <div><div style={{fontSize:13,fontWeight:600,color:'#1a1a1a'}}>{item.name}</div><div style={{fontSize:11,color:'#888'}}>{item.qty} × {money(item.price)}{item.discount>0?` − ${item.discount}%`:''}</div></div>
                <div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontWeight:600}}>{money(item.qty*item.price*(1-item.discount/100))}</span><button onClick={()=>removeItem(item.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#ccc',display:'flex'}}><Trash2 size={14}/></button></div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Totals */}
      <div style={{background:'#fff',marginTop:8,padding:'0 16px'}}>
        {f.items.length>0&&<>
          <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px dashed #eee',fontSize:14,color:'#555'}}>
            <span>Sub Total</span><span>{money(f.subTotal)}</span>
          </div>
          {f.discountAmt>0&&<div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px dashed #eee',fontSize:14,color:'#a24840'}}>
            <span>Discount</span><span>− {money(f.discountAmt)}</span>
          </div>}
        </>}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 0'}}>
          <span style={{fontSize:15,fontWeight:700,color:'#1a1a1a'}}>Total Amount</span>
          <div style={{display:'flex',alignItems:'center',gap:4}}>
            <span style={{fontSize:15,color:'#1a1a1a'}}>₹</span>
            <div style={{borderBottom:'1px dashed #aaa',minWidth:140,paddingBottom:2}}>
              <input type="number" min="0" value={f.totalAmount||''} onChange={e=>set('totalAmount',Number(e.target.value))} style={{border:'none',background:'transparent',fontSize:15,fontWeight:600,color:'#1a1a1a',width:'100%',outline:'none',padding:0,textAlign:'right'}}/>
            </div>
          </div>
        </div>
      </div>
      {/* Notes */}
      <div style={{background:'#fff',marginTop:8,padding:'12px 16px'}}>
        <label style={{fontSize:12,color:'#888',display:'block',marginBottom:6}}>Notes (Optional)</label>
        <textarea value={f.notes} onChange={e=>set('notes',e.target.value)} placeholder="Add order notes or special instructions…" style={{width:'100%',border:'1px solid #ddd',borderRadius:6,padding:'10px',fontSize:14,background:'#fafafa',resize:'vertical',height:72,outline:'none',boxSizing:'border-box'}}/>
      </div>
      {validationMsg&&(
        <div style={{position:'fixed',bottom:90,left:'50%',transform:'translateX(-50%)',background:'rgba(40,40,40,0.92)',color:'#fff',borderRadius:28,padding:'12px 20px',display:'flex',alignItems:'center',gap:10,fontSize:14,fontWeight:500,zIndex:999,boxShadow:'0 4px 20px rgba(0,0,0,0.25)',whiteSpace:'nowrap'}}>
          <span style={{width:22,height:22,background:'#e53935',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,flexShrink:0}}>!</span>
          {validationMsg}
        </div>
      )}
      <div style={{position:'sticky',bottom:0,background:'#fff',borderTop:'1px solid #e8e8e8',display:'grid',gridTemplateColumns:'1fr 1fr auto',zIndex:10,marginTop:'auto'}}>
        <button onClick={()=>handleSave(true)} style={{padding:'16px 0',background:'#fff',border:'none',borderRight:'1px solid #e8e8e8',fontSize:14,fontWeight:600,color:'#555',cursor:'pointer'}} onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='#f5f5f5'} onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='#fff'}>Save &amp; New</button>
        <button onClick={()=>handleSave(false)} style={{padding:'16px 0',background:'#1565c0',border:'none',fontSize:14,fontWeight:700,color:'#fff',cursor:'pointer'}} onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='#0d47a1'} onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='#1565c0'}>Save</button>
        <button style={{padding:'16px 18px',background:'#fff',border:'none',borderLeft:'1px solid #e8e8e8',fontSize:20,color:'#555',cursor:'pointer',lineHeight:1}} title="More options">⋮</button>
      </div>
    </main>
  );
}

// ─────────────────────────── Proforma Invoice ───────────────────────────
const PROFORMA_KEY='bookbazaar-proforma-v1';
type ProformaItem={id:string;bookId:string;name:string;qty:number;price:number;discount:number};
type ProformaInvoice={id:string;refNo:string;date:string;time:string;customerName:string;billingName:string;items:ProformaItem[];subTotal:number;discountAmt:number;totalAmount:number;notes:string;status:'Draft'|'Sent'|'Converted'|'Cancelled'};
function ProformaInvoicePage(c:Context){
  const [records,setRecords]=useState<ProformaInvoice[]>(()=>{try{const v=localStorage.getItem(PROFORMA_KEY);return v?JSON.parse(v):[];}catch{return [];}});
  const [view,setView]=useState<'list'|'form'>('list');
  const [editing,setEditing]=useState<ProformaInvoice|null>(null);
  const [dateRange,setDateRange]=useState({from:today.slice(0,8)+'01',to:today});
  useEffect(()=>{localStorage.setItem(PROFORMA_KEY,JSON.stringify(records));},[records]);
  const nowTime=()=>new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true});
  const nextRefNo=()=>`JMD/...${records.length+1}`;
  const openNew=()=>{setEditing(null);setView('form');};
  const openEdit=(r:ProformaInvoice)=>{setEditing(r);setView('form');};
  const closeForm=()=>{setView('list');setEditing(null);};
  const save=(r:ProformaInvoice,andNew?:boolean)=>{setRecords(prev=>editing?prev.map(x=>x.id===r.id?r:x):[r,...prev]);if(andNew)setEditing(null);else closeForm();};
  const del=(id:string)=>setRecords(prev=>prev.filter(x=>x.id!==id));
  if(view==='form')return <ProformaInvoiceForm data={c.data} initial={editing} nextRefNo={nextRefNo()} nowTime={nowTime()} onSave={save} onClose={closeForm} onDelete={editing?()=>{del(editing.id);closeForm();}:undefined}/>;
  const filtered=records.filter(r=>r.date>=dateRange.from&&r.date<=dateRange.to);
  const statusColor=(s:string)=>s==='Converted'?'#2e7d32':s==='Sent'?'#1565c0':s==='Cancelled'?'#a24840':'#888';
  const filterBar=(
    <div style={{background:'#fff',borderBottom:'1px solid #e8e8e8',padding:'10px 20px',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
      <select style={{border:'1px solid #ddd',borderRadius:6,padding:'6px 12px',fontSize:13,color:'#333',background:'#fafafa',outline:'none',cursor:'pointer'}}>
        <option>This Month</option><option>Last Month</option><option>This Quarter</option><option>Custom</option>
      </select>
      <div style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'#444'}}>
        <CalendarDays size={16} style={{color:'#1976d2'}}/>
        <input type="date" value={dateRange.from} onChange={e=>setDateRange(p=>({...p,from:e.target.value}))} style={{border:'none',background:'transparent',fontSize:13,color:'#333',outline:'none',cursor:'pointer'}}/>
        <span style={{fontWeight:600,color:'#666'}}>TO</span>
        <input type="date" value={dateRange.to} onChange={e=>setDateRange(p=>({...p,to:e.target.value}))} style={{border:'none',background:'transparent',fontSize:13,color:'#333',outline:'none',cursor:'pointer'}}/>
      </div>
    </div>
  );
  if(!records.length) return (
    <main className="page">
      {filterBar}
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'60vh',textAlign:'center',gap:14,background:'#eef4fb'}}>
        <svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="14" width="70" height="86" rx="7" fill="#dce8f5"/>
          <rect x="20" y="14" width="70" height="86" rx="7" stroke="#b8d0ea" strokeWidth="1.5"/>
          <rect x="32" y="30" width="46" height="7" rx="3" fill="#1976d2" opacity="0.3"/>
          <rect x="32" y="44" width="36" height="5" rx="2.5" fill="#e3eefa"/>
          <rect x="32" y="55" width="42" height="5" rx="2.5" fill="#e3eefa"/>
          <rect x="32" y="66" width="30" height="5" rx="2.5" fill="#e3eefa"/>
          <rect x="32" y="80" width="46" height="7" rx="3" fill="#1976d2" opacity="0.15"/>
          <rect x="74" y="78" width="20" height="8" rx="4" fill="#1976d2"/>
          <line x1="79" y1="82" x2="89" y2="82" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
          <line x1="84" y1="78.5" x2="84" y2="85.5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <h2 style={{fontFamily:'var(--app-font-serif)',fontSize:20,fontWeight:700,color:'#1a1a1a',margin:0}}>No Proforma Invoices Yet</h2>
        <p style={{fontSize:13,color:'#6d7d6e',maxWidth:320,margin:0,lineHeight:1.6}}>Issue proforma invoices to customers before finalising billing. Easy to convert to a sale invoice.</p>
        <button className="btn primary" onClick={openNew} style={{marginTop:8,display:'flex',alignItems:'center',gap:7,fontSize:14}}>
          <Plus size={15}/> Add Proforma Invoice
        </button>
      </div>
    </main>
  );
  return (
    <main className="page">
      {filterBar}
      <div style={{padding:'14px 20px 0',display:'flex',justifyContent:'flex-end'}}>
        <button className="btn primary" onClick={openNew} style={{display:'flex',alignItems:'center',gap:7}}><Plus size={14}/> Add Proforma Invoice</button>
      </div>
      <div className="stat-grid" style={{marginTop:14}}>
        <Stat label="Total Proforma" value={filtered.length} note="In selected period" Icon={FilePen}/>
        <Stat label="Total Value" value={money(filtered.reduce((s,r)=>s+r.totalAmount,0))} note="Quoted amount" Icon={FileText}/>
        <Stat label="Sent" value={filtered.filter(r=>r.status==='Sent').length} note="Awaiting response" Icon={ArrowRight}/>
        <Stat label="Converted" value={filtered.filter(r=>r.status==='Converted').length} note="To sale invoice" Icon={Check} tint="green"/>
      </div>
      <section className="panel">
        <div className="table-wrap"><table className="data-table">
          <thead><tr><th>Ref No.</th><th>Customer</th><th>Billing Name</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th></th></tr></thead>
          <tbody>{filtered.map(r=>(
            <tr key={r.id}>
              <td><div className="book-title">{r.refNo}</div><div className="muted">{r.time}</div></td>
              <td><div className="book-title">{r.customerName||'—'}</div></td>
              <td>{r.billingName||'—'}</td>
              <td>{r.date}</td>
              <td>{r.items.length} item{r.items.length!==1?'s':''}</td>
              <td style={{fontWeight:600}}>{money(r.totalAmount)}</td>
              <td><span style={{fontSize:12,fontWeight:600,padding:'3px 8px',borderRadius:12,background:`${statusColor(r.status)}18`,color:statusColor(r.status)}}>{r.status}</span></td>
              <td><div className="row-actions"><button className="icon-button" title="Edit" onClick={()=>openEdit(r)}><Pencil/></button><button className="icon-button" title="Delete" onClick={()=>del(r.id)}><Trash2/></button></div></td>
            </tr>
          ))}</tbody>
        </table></div>
      </section>
    </main>
  );
}
function ProformaInvoiceForm({data,initial,nextRefNo,nowTime,onSave,onClose,onDelete}:{data:Dataset;initial:ProformaInvoice|null;nextRefNo:string;nowTime:string;onSave:(r:ProformaInvoice,andNew?:boolean)=>void;onClose:()=>void;onDelete?:()=>void}){
  const blank:Omit<ProformaInvoice,'id'>={refNo:nextRefNo,date:today,time:nowTime,customerName:'',billingName:'',items:[],subTotal:0,discountAmt:0,totalAmount:0,notes:'',status:'Draft'};
  const [f,setF]=useState<Omit<ProformaInvoice,'id'>>(initial||blank);
  const [showItems,setShowItems]=useState(false);
  const [selBook,setSelBook]=useState('');
  const [selQty,setSelQty]=useState(1);
  const [selDisc,setSelDisc]=useState(0);
  const [validationMsg,setValidationMsg]=useState('');
  const set=(k:string,v:any)=>setF(p=>({...p,[k]:v}));
  useEffect(()=>{if(!validationMsg)return;const t=setTimeout(()=>setValidationMsg(''),2800);return()=>clearTimeout(t);},[validationMsg]);
  const recalc=(items:ProformaItem[])=>{const sub=items.reduce((s,i)=>s+i.qty*i.price,0);const disc=items.reduce((s,i)=>s+i.qty*i.price*(i.discount/100),0);return{subTotal:sub,discountAmt:disc,totalAmount:sub-disc};};
  const addItem=()=>{const book=data.books.find(b=>b.id===selBook);if(!book)return;const newItem={id:idFor('PI'),bookId:book.id,name:book.title,qty:selQty,price:book.price,discount:selDisc};const items=[...f.items,newItem];setF(p=>({...p,items,...recalc(items)}));setSelBook('');setSelQty(1);setSelDisc(0);setShowItems(false);};
  const removeItem=(id:string)=>{const items=f.items.filter(i=>i.id!==id);setF(p=>({...p,items,...recalc(items)}));};
  const handleSave=(andNew=false)=>{if(!f.customerName.trim()){setValidationMsg('Customer name is required');return;}const rec:ProformaInvoice={...f,id:initial?.id||idFor('PF')};onSave(rec,andNew);if(andNew){const num=Number(f.refNo.replace('JMD/...','')||'0')+1;setF({...blank,refNo:`JMD/...${num}`,time:f.time});}};
  const fmtDate=(d:string)=>{if(!d)return '';const[y,m,day]=d.split('-');return `${day}/${m}/${y}`;};
  return(
    <main style={{minHeight:'100vh',background:'#f0f0f0',display:'flex',flexDirection:'column',maxWidth:520,margin:'0 auto',position:'relative',paddingBottom:80}}>
      {/* Header */}
      <div style={{background:'#fff',borderBottom:'1px solid #e8e8e8',padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',padding:4,display:'flex',alignItems:'center',color:'#333'}}><ArrowRight style={{transform:'rotate(180deg)'}} size={22}/></button>
          <h1 style={{fontSize:18,fontWeight:700,color:'#1a1a1a',margin:0}}>Proforma Invoice</h1>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {onDelete&&<button onClick={onDelete} style={{background:'none',border:'none',cursor:'pointer',color:'#e53935',display:'flex'}}><Trash2 size={15}/></button>}
        </div>
      </div>
      {/* 3-col: Ref No | Date | Time */}
      <div style={{background:'#fff',borderBottom:'1px solid #eee',padding:'12px 0',display:'grid',gridTemplateColumns:'1fr 1px 1fr 1px 1fr'}}>
        <div style={{padding:'0 14px'}}>
          <div style={{fontSize:11,color:'#aaa',marginBottom:4}}>Ref No.</div>
          <div style={{display:'flex',alignItems:'center',gap:4}}>
            <input value={f.refNo} onChange={e=>set('refNo',e.target.value)} style={{border:'none',background:'transparent',fontSize:13,fontWeight:600,color:'#1a1a1a',width:'100%',outline:'none',padding:0}}/>
            <ChevronDown size={13} style={{color:'#aaa',flexShrink:0}}/>
          </div>
        </div>
        <div style={{background:'#e8e8e8',width:1,margin:'2px 0'}}/>
        <div style={{padding:'0 14px'}}>
          <div style={{fontSize:11,color:'#aaa',marginBottom:4}}>Date</div>
          <div style={{display:'flex',alignItems:'center',gap:4}}>
            <input type="date" value={f.date} onChange={e=>set('date',e.target.value)} style={{border:'none',background:'transparent',fontSize:13,fontWeight:500,color:'#1a1a1a',outline:'none',padding:0,width:'100%'}}/>
            <ChevronDown size={13} style={{color:'#aaa',flexShrink:0}}/>
          </div>
        </div>
        <div style={{background:'#e8e8e8',width:1,margin:'2px 0'}}/>
        <div style={{padding:'0 14px'}}>
          <div style={{fontSize:11,color:'#aaa',marginBottom:4}}>Time</div>
          <div style={{display:'flex',alignItems:'center',gap:4}}>
            <input value={f.time} onChange={e=>set('time',e.target.value)} style={{border:'none',background:'transparent',fontSize:13,fontWeight:500,color:'#1a1a1a',width:'100%',outline:'none',padding:0}}/>
            <ChevronDown size={13} style={{color:'#aaa',flexShrink:0}}/>
          </div>
        </div>
      </div>
      {/* Customer Name * */}
      <div style={{background:'#fff',marginTop:12,padding:'4px 16px 12px'}}>
        <div style={{position:'relative',border:'2px solid #1976d2',borderRadius:6,padding:'16px 12px 10px'}}>
          <label style={{position:'absolute',top:-10,left:10,background:'#fff',padding:'0 4px',fontSize:12,color:'#1976d2',fontWeight:500}}>Customer Name *</label>
          <input value={f.customerName} onChange={e=>set('customerName',e.target.value)} style={{border:'none',background:'transparent',fontSize:15,color:'#1a1a1a',width:'100%',outline:'none',padding:0}}/>
        </div>
      </div>
      {/* Billing Name (Optional) */}
      <div style={{background:'#fff',marginTop:10,padding:'4px 16px 14px'}}>
        <div style={{border:'1px solid #ccc',borderRadius:6,padding:'16px 12px 10px'}}>
          <input value={f.billingName} onChange={e=>set('billingName',e.target.value)} placeholder="Billing Name (Optional)" style={{border:'none',background:'transparent',fontSize:15,color:'#1a1a1a',width:'100%',outline:'none',padding:0}}/>
        </div>
      </div>
      {/* Status (small row) */}
      <div style={{background:'#fff',marginTop:8,padding:'10px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',borderTop:'1px solid #f5f5f5'}}>
        <span style={{fontSize:13,color:'#888'}}>Status</span>
        <select value={f.status} onChange={e=>set('status',e.target.value as ProformaInvoice['status'])} style={{border:'1px solid #ddd',borderRadius:6,padding:'5px 10px',fontSize:13,background:'#fafafa',color:'#333',outline:'none',cursor:'pointer'}}>
          <option>Draft</option><option>Sent</option><option>Converted</option><option>Cancelled</option>
        </select>
      </div>
      {/* + Add Items (Optional) */}
      <div style={{background:'#fff',marginTop:8,padding:'0 16px 8px'}}>
        <button onClick={()=>setShowItems(v=>!v)} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'16px',border:'1px solid #e0e0e0',borderRadius:6,background:'#fff',color:'#333',fontSize:15,fontWeight:500,cursor:'pointer'}}>
          <span style={{width:26,height:26,borderRadius:'50%',background:'#1976d2',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:900,lineHeight:'1',flexShrink:0}}>+</span>
          <span><b style={{color:'#1976d2'}}>Add Items</b> <span style={{color:'#999',fontWeight:400}}>(Optional)</span></span>
        </button>
        {showItems&&(
          <div style={{marginTop:10,border:'1px solid #e0e0e0',borderRadius:6,padding:'12px',background:'#fafafa'}}>
            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr auto',gap:8,alignItems:'flex-end',marginBottom:8}}>
              <div><div style={{fontSize:11,color:'#888',marginBottom:4}}>Book</div>
                <select value={selBook} onChange={e=>setSelBook(e.target.value)} style={{width:'100%',border:'1px solid #ddd',borderRadius:5,padding:'7px',fontSize:13,outline:'none',background:'#fff'}}>
                  <option value="">Select…</option>{data.books.map(b=><option key={b.id} value={b.id}>{b.title}</option>)}
                </select>
              </div>
              <div><div style={{fontSize:11,color:'#888',marginBottom:4}}>Qty</div>
                <input type="number" min="1" value={selQty} onChange={e=>setSelQty(Number(e.target.value))} style={{width:'100%',border:'1px solid #ddd',borderRadius:5,padding:'7px',fontSize:13,outline:'none'}}/>
              </div>
              <div><div style={{fontSize:11,color:'#888',marginBottom:4}}>Disc %</div>
                <input type="number" min="0" max="100" value={selDisc} onChange={e=>setSelDisc(Number(e.target.value))} style={{width:'100%',border:'1px solid #ddd',borderRadius:5,padding:'7px',fontSize:13,outline:'none'}}/>
              </div>
              <button onClick={addItem} className="btn primary" style={{padding:'7px 10px',height:34,alignSelf:'flex-end'}}><Plus size={13}/></button>
            </div>
            {f.items.map(item=>(
              <div key={item.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderTop:'1px solid #f0f0f0'}}>
                <div><div style={{fontSize:13,fontWeight:600,color:'#1a1a1a'}}>{item.name}</div><div style={{fontSize:11,color:'#888'}}>{item.qty} × {money(item.price)}{item.discount>0?` − ${item.discount}%`:''}</div></div>
                <div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontWeight:600}}>{money(item.qty*item.price*(1-item.discount/100))}</span><button onClick={()=>removeItem(item.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#ccc',display:'flex'}}><Trash2 size={14}/></button></div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Total Amount */}
      <div style={{background:'#fff',marginTop:8,padding:'0 16px'}}>
        {f.items.length>0&&<>
          <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px dashed #eee',fontSize:14,color:'#555'}}>
            <span>Sub Total</span><span>{money(f.subTotal)}</span>
          </div>
          {f.discountAmt>0&&<div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px dashed #eee',fontSize:14,color:'#a24840'}}>
            <span>Discount</span><span>− {money(f.discountAmt)}</span>
          </div>}
        </>}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'20px 0'}}>
          <span style={{fontSize:16,fontWeight:700,color:'#1a1a1a'}}>Total Amount</span>
          <div style={{display:'flex',alignItems:'center',gap:4}}>
            <span style={{fontSize:16,color:'#1a1a1a',fontWeight:700}}>₹</span>
            <div style={{borderBottom:'2px dashed #bbb',minWidth:160,paddingBottom:3}}>
              <input type="number" min="0" value={f.totalAmount||''} onChange={e=>set('totalAmount',Number(e.target.value))} placeholder="" style={{border:'none',background:'transparent',fontSize:16,fontWeight:700,color:'#1a1a1a',width:'100%',outline:'none',padding:0,textAlign:'right'}}/>
            </div>
          </div>
        </div>
      </div>
      {/* Notes */}
      <div style={{background:'#fff',marginTop:8,padding:'12px 16px'}}>
        <label style={{fontSize:12,color:'#888',display:'block',marginBottom:6}}>Notes (Optional)</label>
        <textarea value={f.notes} onChange={e=>set('notes',e.target.value)} placeholder="Add a note or terms…" style={{width:'100%',border:'1px solid #ddd',borderRadius:6,padding:'10px',fontSize:14,background:'#fafafa',resize:'vertical',height:68,outline:'none',boxSizing:'border-box'}}/>
      </div>
      {validationMsg&&(
        <div style={{position:'fixed',bottom:90,left:'50%',transform:'translateX(-50%)',background:'rgba(40,40,40,0.92)',color:'#fff',borderRadius:28,padding:'12px 20px',display:'flex',alignItems:'center',gap:10,fontSize:14,fontWeight:500,zIndex:999,boxShadow:'0 4px 20px rgba(0,0,0,0.25)',whiteSpace:'nowrap'}}>
          <span style={{width:22,height:22,background:'#e53935',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,flexShrink:0}}>!</span>
          {validationMsg}
        </div>
      )}
      {/* Bottom action bar */}
      <div style={{position:'sticky',bottom:0,background:'#fff',borderTop:'1px solid #e8e8e8',display:'grid',gridTemplateColumns:'1fr 1fr auto',zIndex:10,marginTop:'auto'}}>
        <button onClick={()=>handleSave(true)} style={{padding:'16px 0',background:'#fff',border:'none',borderRight:'1px solid #e8e8e8',fontSize:14,fontWeight:600,color:'#555',cursor:'pointer'}} onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='#f5f5f5'} onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='#fff'}>Save &amp; New</button>
        <button onClick={()=>handleSave(false)} style={{padding:'16px 0',background:'#1565c0',border:'none',fontSize:14,fontWeight:700,color:'#fff',cursor:'pointer'}} onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='#0d47a1'} onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='#1565c0'}>Save</button>
        <button style={{padding:'16px 18px',background:'#fff',border:'none',borderLeft:'1px solid #e8e8e8',fontSize:20,color:'#555',cursor:'pointer',lineHeight:1}} title="More options">⋮</button>
      </div>
    </main>
  );
}

function ComingSoon({title,sub,Icon}:{title:string;sub:string;Icon:any}){
  return <main className="page"><div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'55vh',textAlign:'center',gap:14}}><div style={{width:60,height:60,borderRadius:18,background:'#e8f0e6',display:'grid',placeItems:'center',color:'#3d6b4a'}}><Icon size={26}/></div><h1 style={{fontFamily:'var(--app-font-serif)',fontSize:'clamp(22px,3vw,30px)',color:'#1e3d2c',margin:0}}>{title}</h1><p style={{fontSize:13,color:'#6d7d6e',maxWidth:380,margin:0,lineHeight:1.6}}>{sub}</p><span style={{fontSize:11,color:'#9aaa99',background:'#f0ede4',padding:'6px 14px',borderRadius:20,fontWeight:600}}>Coming soon</span></div></main>;
}

// ─────────────────────────────── Parties Section ─────────────────────────────// ─────────────────────────────── Parties Section ─────────────────────────────
const PARTIES_KEY = 'bookbazaar-parties-v1';

type PartyTransaction = {
  id: string;
  type: 'Purchase' | 'Payment-Out' | 'Debit Note' | 'Party To Party';
  billNo: string;
  date: string;
  time: string;
  partyName: string;
  billingName: string;
  phone: string;
  items: { id: string; name: string; qty: number; price: number; discountPct: number }[];
  total: number;
  received: number;
  status: 'Paid' | 'Partial' | 'Unpaid';
  notes: string;
};

type Party = {
  id: string;
  name: string;
  phone: string;
  billingName: string;
  lastDate: string;
  transactions: PartyTransaction[];
};

function readParties(): Party[] {
  try { const v = localStorage.getItem(PARTIES_KEY); return v ? JSON.parse(v) : []; } catch { return []; }
}

function savePartiesStore(pts: Party[]) {
  localStorage.setItem(PARTIES_KEY, JSON.stringify(pts));
}

function calcTxBalance(tx: PartyTransaction) { return Math.max(0, tx.total - tx.received); }

// ── Party Bill Detail ──────────────────────────────────────────────────────
function PartyBillDetail({ tx, onBack, onEdit, onDelete }: { tx: PartyTransaction; onBack: () => void; onEdit: () => void; onDelete: () => void }) {
  return (
    <main style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', flexDirection: 'column', maxWidth: 560, margin: '0 auto' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e8e8', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', color: '#333' }}><ChevronLeft size={22} /></button>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{tx.type}</h1>
        </div>
        <button onClick={onEdit} style={{ background: 'none', border: '1px solid #e2ded2', borderRadius: 7, cursor: 'pointer', padding: '6px 12px', fontSize: 12, fontWeight: 600, color: '#315a41', display: 'flex', alignItems: 'center', gap: 5 }}><Pencil size={13} /> Edit</button>
      </div>

      <div style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1px 1fr 1px 1fr' }}>
        <div style={{ paddingRight: 12 }}><div style={{ fontSize: 10, color: '#999', marginBottom: 2 }}>Bill No.</div><div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>{tx.billNo}</div></div>
        <div style={{ background: '#e0e0e0' }} />
        <div style={{ padding: '0 12px' }}><div style={{ fontSize: 10, color: '#999', marginBottom: 2 }}>Date</div><div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a' }}>{tx.date}</div></div>
        <div style={{ background: '#e0e0e0' }} />
        <div style={{ paddingLeft: 12 }}><div style={{ fontSize: 10, color: '#999', marginBottom: 2 }}>Time</div><div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a' }}>{tx.time}</div></div>
      </div>

      <div style={{ background: '#fff', marginTop: 8, padding: '4px 16px 4px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 11, color: '#a24840', fontWeight: 600, marginBottom: 4 }}>Party Balance: {money(calcTxBalance(tx))}</div>
        <div style={{ position: 'relative', border: '2px solid #1976d2', borderRadius: 6, padding: '16px 12px 8px', marginBottom: 10 }}>
          <label style={{ position: 'absolute', top: -10, left: 10, background: '#fff', padding: '0 4px', fontSize: 12, color: '#1976d2', fontWeight: 500 }}>Party Name *</label>
          <div style={{ fontSize: 15, color: '#1a1a1a', fontWeight: 500 }}>{tx.partyName}</div>
        </div>
        <div style={{ position: 'relative', border: '1px solid #ccc', borderRadius: 6, padding: '16px 12px 8px', marginBottom: 10 }}>
          <label style={{ position: 'absolute', top: -10, left: 10, background: '#fff', padding: '0 4px', fontSize: 12, color: '#888', fontWeight: 500 }}>Billing Name (Optional)</label>
          <div style={{ fontSize: 15, color: '#1a1a1a' }}>{tx.billingName || tx.partyName}</div>
        </div>
        <div style={{ border: '1px solid #ccc', borderRadius: 6, padding: '14px 12px', marginBottom: 10 }}>
          <div style={{ fontSize: 15, color: tx.phone ? '#1a1a1a' : '#aaa' }}>{tx.phone || 'Phone Number'}</div>
        </div>
      </div>

      <div style={{ background: '#fff', marginTop: 8 }}>
        <div style={{ background: '#4a90d9', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontWeight: 600, fontSize: 13 }}>
          <BookOpen size={15} /> Billed Items ({tx.items.length})
        </div>
        <div style={{ padding: '12px 16px' }}>
          {tx.items.length === 0 && <div style={{ textAlign: 'center', padding: '24px', color: '#8a9389', fontSize: 13 }}>No items on this bill.</div>}
          {tx.items.map((item, i) => {
            const lineTotal = item.qty * item.price * (1 - item.discountPct / 100);
            return (
              <div key={item.id} style={{ border: '1px solid #e7e1d4', borderRadius: 9, padding: 13, marginBottom: 10, background: '#fafaf7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: '#91a796', fontWeight: 700, marginRight: 8 }}>#{i + 1}</span>
                  <b style={{ fontSize: 13, color: '#1e3d2c', flex: 1 }}>{item.name}</b>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e3d2c' }}>{money(lineTotal)}</span>
                </div>
                <div style={{ fontSize: 11, color: '#7d877d' }}>Item Subtotal &nbsp;&nbsp; {item.qty} × {money(item.price)} = {money(item.qty * item.price)}</div>
                <div style={{ fontSize: 11, color: '#a9663b', marginTop: 2 }}>Discount (%): {item.discountPct} &nbsp;&nbsp; {item.discountPct > 0 ? money(item.qty * item.price * item.discountPct / 100) : '₹ 0'}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ background: '#fff', marginTop: 8, padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #eee9df' }}>
          <span style={{ fontSize: 13, color: '#536157' }}>Total</span><span style={{ fontSize: 13, fontWeight: 700, color: '#1e3d2c' }}>{money(tx.total)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #eee9df' }}>
          <span style={{ fontSize: 13, color: '#536157' }}>Received</span><span style={{ fontSize: 13, color: '#3a6647', fontWeight: 600 }}>{money(tx.received)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: calcTxBalance(tx) > 0 ? '#a24840' : '#3a6647' }}>Balance Due</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: calcTxBalance(tx) > 0 ? '#a24840' : '#3a6647' }}>{money(calcTxBalance(tx))}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #e8e8e8', background: '#fff', marginTop: 8 }}>
        <button onClick={onDelete} style={{ padding: '16px', background: '#fff', border: 'none', borderRight: '1px solid #e8e8e8', fontSize: 15, fontWeight: 600, color: '#a24840', cursor: 'pointer' }}>Delete</button>
        <button onClick={onEdit} style={{ padding: '16px', background: '#1565c0', border: 'none', fontSize: 15, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>Edit</button>
      </div>
    </main>
  );
}

// ── Party Detail ───────────────────────────────────────────────────────────
function PartyDetail({ party, onBack, onTxClick, onAddTx, onEditParty, onTakePayment, onAddSale }: { party: Party; onBack: () => void; onTxClick: (tx: PartyTransaction) => void; onAddTx: () => void; onEditParty: () => void; onTakePayment: () => void; onAddSale: () => void }) {
  const [query, setQuery] = useState('');
  const totalPayable = party.transactions.reduce((s, tx) => s + calcTxBalance(tx), 0);
  const filtered = party.transactions.filter(tx =>
    `${tx.type} ${tx.billNo} ${tx.partyName}`.toLowerCase().includes(query.toLowerCase())
  ).sort((a, b) => b.date.localeCompare(a.date));
  const statusColor = (s: string) => s === 'Paid' ? '#3a6647' : s === 'Partial' ? '#a9663b' : '#a24840';
  const statusBg = (s: string) => s === 'Paid' ? '#e5efe3' : s === 'Partial' ? '#f7eadb' : '#f4e1dd';
  const formatDate = (d: string) => { try { return new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }); } catch { return d; } };

  return (
    <main style={{ minHeight: '100vh', background: '#f2f0e8', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e8e8', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', color: '#333' }}><ChevronLeft size={22} /></button>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Party Details</h1>
        </div>
        <button onClick={onEditParty} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#315a41', display: 'flex', alignItems: 'center' }}><Pencil size={18} /></button>
      </div>

      <div style={{ background: '#fff', margin: '10px 12px', borderRadius: 10, border: '1px solid #e7e2d6', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>{party.name}</div>
            <div style={{ fontSize: 12, color: '#1976d2', marginTop: 2 }}>{party.phone || 'Add Phone'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#a24840', fontSize: 13, fontWeight: 700, justifyContent: 'flex-end' }}>
              <ArrowUpRight size={14} /> Payable: {money(totalPayable)}
            </div>
            <div style={{ fontSize: 11, color: '#8a9389', marginTop: 2 }}>No Credit Limit Set</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', marginTop: 8, borderTop: '1px solid #eee9df', paddingTop: 10 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'not-allowed', opacity: 0.45, fontSize: 13, fontWeight: 600, color: '#536157', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', padding: '6px 0' }}>
            <Bell size={15} /> Send Reminder
          </button>
          <div style={{ background: '#e0e0e0' }} />
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', padding: '6px 0' }}>
            <FileText size={15} /> Send Statement
          </button>
        </div>
      </div>

      <div style={{ margin: '0 12px 8px', background: '#fff', borderRadius: 10, border: '1px solid #e7e2d6', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Search size={16} style={{ color: '#8a9389', flexShrink: 0 }} />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search Transactions" style={{ border: 'none', background: 'transparent', flex: 1, fontSize: 14, color: '#1a1a1a', outline: 'none' }} />
      </div>

      <div style={{ flex: 1, padding: '0 12px 100px' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#8a9389' }}>
            <FileText size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
            <div style={{ fontSize: 14, fontWeight: 600 }}>No transactions yet</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Add a purchase or payment to get started.</div>
          </div>
        )}
        {filtered.map(tx => {
          const bal = calcTxBalance(tx);
          return (
            <div key={tx.id} onClick={() => onTxClick(tx)}
              style={{ background: '#fff', borderRadius: 10, border: '1px solid #e7e2d6', padding: '14px 16px', marginBottom: 10, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(30,61,44,0.10)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>{tx.type}</div>
                <div style={{ fontSize: 11, color: '#8a9389' }}>#{tx.billNo} &nbsp; {formatDate(tx.date)} · {tx.time}</div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 12, background: statusBg(tx.status), color: statusColor(tx.status), letterSpacing: '0.3px' }}>{tx.status.toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', gap: 24, fontSize: 12, color: '#536157' }}>
                <div><div style={{ fontSize: 10, color: '#8a9389', marginBottom: 2 }}>Total</div><div style={{ fontWeight: 700, color: '#1a1a1a' }}>{money(tx.total)}</div></div>
                <div><div style={{ fontSize: 10, color: '#8a9389', marginBottom: 2 }}>Balance</div><div style={{ fontWeight: 700, color: bal > 0 ? '#a24840' : '#3a6647' }}>{money(bal)}</div></div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button onClick={e => e.stopPropagation()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a9389', display: 'flex', alignItems: 'center' }}><Printer size={16} /></button>
                  <button onClick={e => e.stopPropagation()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a9389', display: 'flex', alignItems: 'center' }}><Share2 size={16} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 900, background: 'linear-gradient(to top, rgba(242,240,232,0.98) 80%, transparent)', padding: '16px 24px 20px', display: 'flex', gap: 12, alignItems: 'center', zIndex: 20 }}>
        <button onClick={onTakePayment} className="btn primary" style={{ flex: 1, padding: '12px 0', borderRadius: 28, fontSize: 14, fontWeight: 700, justifyContent: 'center', boxShadow: '0 4px 16px rgba(36,76,56,0.25)' }}>Take Payment</button>
        <button onClick={onAddTx} style={{ width: 46, height: 46, background: '#fff', color: '#244c38', border: '2px solid #244c38', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.12)' }}><Plus size={20} /></button>
        <button onClick={onAddSale} className="btn danger" style={{ flex: 1, padding: '12px 0', borderRadius: 28, fontSize: 14, fontWeight: 700, background: '#a3453e', color: '#fff', border: 'none', justifyContent: 'center', boxShadow: '0 4px 16px rgba(163,69,62,0.30)' }}>Add Sale</button>
      </div>
    </main>
  );
}

// ── Add / Edit Transaction Form ────────────────────────────────────────────
function PartyTxForm({ initial, partyName, nextNo, nowTime, books, onSave, onClose, onDelete }: {
  initial: PartyTransaction | null; partyName: string; nextNo: string; nowTime: string; books: Book[];
  onSave: (tx: PartyTransaction) => void; onClose: () => void; onDelete?: () => void;
}) {
  const blank: Omit<PartyTransaction, 'id'> = {
    type: 'Purchase', billNo: nextNo, date: today, time: nowTime, partyName, billingName: partyName,
    phone: '', items: [], total: 0, received: 0, status: 'Unpaid', notes: '',
  };
  const [f, setF] = useState<Omit<PartyTransaction, 'id'>>(initial || blank);
  const set = (k: string, v: any) => setF(p => ({ ...p, [k]: v }));
  const [selBook, setSelBook] = useState('');
  const [selQty, setSelQty] = useState(1);
  const [selPrice, setSelPrice] = useState(0);
  const [selDisc, setSelDisc] = useState(0);

  const itemsSub = f.items.reduce((s, i) => s + i.qty * i.price * (1 - i.discountPct / 100), 0);
  const balDue = itemsSub - f.received;

  const addItem = () => {
    const book = books.find(b => b.id === selBook);
    const name = book?.title || (selBook ? selBook : '');
    const price = selPrice || (book?.price || 0);
    if (!name || price <= 0) return;
    setF(p => ({ ...p, items: [...p.items, { id: idFor('TXI'), name, qty: selQty, price, discountPct: selDisc }] }));
    setSelBook(''); setSelQty(1); setSelPrice(0); setSelDisc(0);
  };

  const remItem = (id: string) => setF(p => ({ ...p, items: p.items.filter(i => i.id !== id) }));

  const handleSave = () => {
    const computedTotal = f.items.reduce((s, i) => s + i.qty * i.price * (1 - i.discountPct / 100), 0);
    const st: PartyTransaction['status'] = f.received === 0 ? 'Unpaid' : f.received >= computedTotal ? 'Paid' : 'Partial';
    onSave({ ...f, id: initial?.id || idFor('PTX'), total: computedTotal, status: st });
  };

  return (
    <main className="page" style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="icon-button" onClick={onClose} style={{ border: '1px solid #e2ded2', flexShrink: 0 }}><ArrowRight style={{ transform: 'rotate(180deg)' }} /></button>
        <h1 style={{ fontFamily: 'var(--app-font-serif)', fontSize: 22, margin: 0, color: '#1e3d2c', flex: 1 }}>{initial ? 'Edit Transaction' : 'New Transaction'}</h1>
        {onDelete && <button className="btn danger" onClick={onDelete}><Trash2 /> Delete</button>}
        <button className="btn primary" onClick={handleSave}><Save /> Save</button>
      </div>

      <section className="panel panel-pad" style={{ marginBottom: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
          <div className="field"><label>Type</label>
            <select value={f.type} onChange={e => set('type', e.target.value)}>
              {(['Purchase', 'Payment-Out', 'Debit Note', 'Party To Party'] as const).map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field"><label>Bill No.</label><input value={f.billNo} onChange={e => set('billNo', e.target.value)} /></div>
          <div className="field"><label>Date</label><input type="date" value={f.date} onChange={e => set('date', e.target.value)} /></div>
          <div className="field"><label>Time</label><input type="time" value={f.time} onChange={e => set('time', e.target.value)} /></div>
        </div>
      </section>

      <section className="panel panel-pad" style={{ marginBottom: 14 }}>
        <h2 style={{ fontFamily: 'var(--app-font-serif)', fontSize: 16, margin: '0 0 12px', color: '#264333' }}>Party Details</h2>
        <div className="field" style={{ marginBottom: 10 }}><label>Party Name *</label><input required value={f.partyName} onChange={e => set('partyName', e.target.value)} placeholder="Party name" /></div>
        <div className="field" style={{ marginBottom: 10 }}><label>Billing Name (Optional)</label><input value={f.billingName} onChange={e => set('billingName', e.target.value)} placeholder="Same as party name" /></div>
        <div className="field"><label>Phone Number</label><input value={f.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 00000 00000" /></div>
      </section>

      <section className="panel" style={{ marginBottom: 14 }}>
        <div style={{ background: '#4a90d9', borderRadius: '12px 12px 0 0', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontWeight: 600, fontSize: 13 }}><BookOpen size={15} /> Billed Items ({f.items.length})</div>
        <div className="panel-pad">
          {f.items.map((item, i) => (
            <div key={item.id} style={{ border: '1px solid #e7e1d4', borderRadius: 9, padding: 13, marginBottom: 10, background: '#fafaf7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#91a796', fontWeight: 700 }}>#{i + 1}</span>
                <b style={{ fontSize: 13, color: '#1e3d2c', flex: 1, marginLeft: 8 }}>{item.name}</b>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1e3d2c' }}>{money(item.qty * item.price * (1 - item.discountPct / 100))}</span>
              </div>
              <div style={{ fontSize: 11, color: '#7d877d', marginBottom: 4 }}>Subtotal: {item.qty} × {money(item.price)} = {money(item.qty * item.price)}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, alignItems: 'flex-end', marginTop: 8 }}>
                <div className="field" style={{ marginBottom: 0, gap: 3 }}><label style={{ fontSize: 9 }}>QTY</label><input type="number" min="1" value={item.qty} style={{ height: 32 }} onChange={e => setF(p => ({ ...p, items: p.items.map(x => x.id === item.id ? { ...x, qty: Number(e.target.value) } : x) }))} /></div>
                <div className="field" style={{ marginBottom: 0, gap: 3 }}><label style={{ fontSize: 9 }}>PRICE (₹)</label><input type="number" min="0" value={item.price} style={{ height: 32 }} onChange={e => setF(p => ({ ...p, items: p.items.map(x => x.id === item.id ? { ...x, price: Number(e.target.value) } : x) }))} /></div>
                <div className="field" style={{ marginBottom: 0, gap: 3 }}><label style={{ fontSize: 9 }}>DISC %</label><input type="number" min="0" max="100" value={item.discountPct} style={{ height: 32 }} onChange={e => setF(p => ({ ...p, items: p.items.map(x => x.id === item.id ? { ...x, discountPct: Number(e.target.value) } : x) }))} /></div>
                <button className="icon-button" style={{ border: '1px solid #e4ddd2', marginBottom: 1 }} onClick={() => remItem(item.id)}><Trash2 /></button>
              </div>
            </div>
          ))}
          <div style={{ border: '1.5px dashed #c5c0b4', borderRadius: 9, padding: 14, background: '#f9f8f3' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#8a9389', letterSpacing: '0.8px', marginBottom: 10 }}>ADD ITEM</div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.7fr 1fr 0.7fr auto', gap: 8, alignItems: 'flex-end' }}>
              <div className="field" style={{ marginBottom: 0, gap: 3 }}><label style={{ fontSize: 9 }}>BOOK</label>
                <select value={selBook} onChange={e => { setSelBook(e.target.value); const b = books.find(b => b.id === e.target.value); if (b) setSelPrice(b.price); }} style={{ height: 34 }}>
                  <option value="">Select book…</option>{books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                </select>
              </div>
              <div className="field" style={{ marginBottom: 0, gap: 3 }}><label style={{ fontSize: 9 }}>QTY</label><input type="number" min="1" value={selQty} style={{ height: 34 }} onChange={e => setSelQty(Number(e.target.value))} /></div>
              <div className="field" style={{ marginBottom: 0, gap: 3 }}><label style={{ fontSize: 9 }}>PRICE (₹)</label><input type="number" min="0" value={selPrice} style={{ height: 34 }} onChange={e => setSelPrice(Number(e.target.value))} /></div>
              <div className="field" style={{ marginBottom: 0, gap: 3 }}><label style={{ fontSize: 9 }}>DISC %</label><input type="number" min="0" max="100" value={selDisc} style={{ height: 34 }} onChange={e => setSelDisc(Number(e.target.value))} /></div>
              <button className="btn primary" style={{ height: 34, padding: '0 12px' }} onClick={addItem}><Plus size={13} /></button>
            </div>
          </div>
        </div>
      </section>

      <section className="panel panel-pad" style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: 'var(--app-font-serif)', fontSize: 16, margin: '0 0 14px', color: '#264333' }}>Payment</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee9df' }}>
          <span style={{ fontSize: 13, color: '#536157' }}>Total</span><span style={{ fontSize: 15, fontWeight: 700, color: '#1e3d2c' }}>{money(itemsSub)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
          <span style={{ fontSize: 13, color: '#536157' }}>Received</span>
          <input type="number" min="0" value={f.received} onChange={e => set('received', Number(e.target.value))} style={{ width: 130, height: 32, border: '1px solid #e2ded2', borderRadius: 7, padding: '0 8px', fontSize: 13 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #eee9df' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: balDue > 0 ? '#a24840' : '#3a6647' }}>Balance Due</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: balDue > 0 ? '#a24840' : '#3a6647' }}>{money(Math.max(0, balDue))}</span>
        </div>
      </section>
    </main>
  );
}

// ── Add Party Modal ────────────────────────────────────────────────────────
function AddPartyForm({ initial, onSave, onClose }: { initial: Party | null; onSave: (p: Party) => void; onClose: () => void }) {
  const [name, setName] = useState(initial?.name || '');
  const [phone, setPhone] = useState(initial?.phone || '');
  const [billingName, setBillingName] = useState(initial?.billingName || '');
  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ id: initial?.id || idFor('PTY'), name: name.trim(), phone, billingName: billingName || name.trim(), lastDate: today, transactions: initial?.transactions || [] });
  };
  return (
    <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-head">
          <div><h2>{initial ? 'Edit Party' : 'Add New Party'}</h2><p>Name, contact, and billing details</p></div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close"><X /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="field full"><label>Party Name *</label><input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Avni Prakashan Pvt. Ltd." /></div>
            <div className="field"><label>Billing Name (Optional)</label><input value={billingName} onChange={e => setBillingName(e.target.value)} placeholder="Same as party name" /></div>
            <div className="field"><label>Phone Number</label><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 00000 00000" /></div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn" type="button" onClick={onClose}>Cancel</button>
          <button className="btn primary" type="button" onClick={handleSave}><Save /> {initial ? 'Save Changes' : 'Add Party'}</button>
        </div>
      </div>
    </div>
  );
}

// ── Parties Page (main entry point) ───────────────────────────────────────
function PartiesPage({ data }: { data: Dataset }) {
  const [parties, setParties] = useState<Party[]>(readParties);
  const [view, setView] = useState<'list' | 'detail' | 'tx-form' | 'bill-detail' | 'payment-in-form' | 'sale-invoice-form'>('list');
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [selectedTx, setSelectedTx] = useState<PartyTransaction | null>(null);
  const [editingTx, setEditingTx] = useState<PartyTransaction | null>(null);
  const [showAddParty, setShowAddParty] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [query, setQuery] = useState('');

  // Payment-In store (shared with /sale/payment-in)
  const [paymentIns, setPaymentIns] = useState<PaymentIn[]>(() => {
    try { const v = localStorage.getItem(PAYMENT_IN_KEY); return v ? JSON.parse(v) : []; } catch { return []; }
  });
  useEffect(() => { localStorage.setItem(PAYMENT_IN_KEY, JSON.stringify(paymentIns)); }, [paymentIns]);

  // Sale Invoice store (shared with /sale/invoice)
  const [saleInvoices, setSaleInvoices] = useState<SaleInvoiceType[]>(() => {
    try { const v = localStorage.getItem(INVOICE_KEY); return v ? JSON.parse(v) : []; } catch { return []; }
  });
  useEffect(() => { localStorage.setItem(INVOICE_KEY, JSON.stringify(saleInvoices)); }, [saleInvoices]);

  useEffect(() => { savePartiesStore(parties); }, [parties]);

  const nowTime = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const nextPaymentNo = () => `${paymentIns.length + 1}`;
  const nextInvoiceNo = () => `BB-${String(saleInvoices.length + 1).padStart(4, '0')}`;

  const saveParty = (p: Party) => {
    setParties(prev => { const exists = prev.find(x => x.id === p.id); return exists ? prev.map(x => x.id === p.id ? { ...x, ...p } : x) : [p, ...prev]; });
    setShowAddParty(false); setEditingParty(null);
  };

  const saveTx = (tx: PartyTransaction) => {
    if (!selectedParty) return;
    const updated = parties.map(p => {
      if (p.id !== selectedParty.id) return p;
      const exists = p.transactions.find(t => t.id === tx.id);
      const txs = exists ? p.transactions.map(t => t.id === tx.id ? tx : t) : [tx, ...p.transactions];
      return { ...p, transactions: txs, lastDate: tx.date };
    });
    setParties(updated);
    setSelectedParty(updated.find(p => p.id === selectedParty.id)!);
    setView('detail'); setEditingTx(null);
  };

  const deleteTx = (txId: string) => {
    if (!selectedParty) return;
    const updated = parties.map(p => p.id !== selectedParty.id ? p : { ...p, transactions: p.transactions.filter(t => t.id !== txId) });
    setParties(updated);
    setSelectedParty(updated.find(p => p.id === selectedParty.id)!);
    setView('detail'); setSelectedTx(null);
  };

  const nextTxNo = () => selectedParty ? String(selectedParty.transactions.length + 1) : '1';
  const formatDate = (d: string) => { try { return new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }); } catch { return d; } };
  const filteredParties = parties.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

  // ── Payment-In form (inline, shared store)
  if (view === 'payment-in-form') {
    return (
      <PaymentInForm
        initial={null}
        nextNo={nextPaymentNo()}
        nowTime={nowTime()}
        onSave={(rec) => {
          setPaymentIns(prev => [rec, ...prev]);
          setView('detail');
        }}
        onClose={() => setView('detail')}
      />
    );
  }

  // ── Sale Invoice form (inline, shared store)
  if (view === 'sale-invoice-form') {
    return (
      <InvoiceForm
        data={data}
        initial={null}
        nextNo={nextInvoiceNo()}
        nowTime={nowTime()}
        onSave={(inv) => {
          setSaleInvoices(prev => [inv, ...prev]);
          setView('detail');
        }}
        onClose={() => setView('detail')}
      />
    );
  }

  // Bill Detail
  if (view === 'bill-detail' && selectedTx) return (
    <>
      <PartyBillDetail tx={selectedTx} onBack={() => { setView('detail'); setSelectedTx(null); }} onEdit={() => { setEditingTx(selectedTx); setView('tx-form'); }} onDelete={() => deleteTx(selectedTx.id)} />
      {showAddParty && editingParty && <AddPartyForm initial={editingParty} onSave={saveParty} onClose={() => { setShowAddParty(false); setEditingParty(null); }} />}
    </>
  );

  // Transaction Form
  if (view === 'tx-form' && selectedParty) return (
    <PartyTxForm initial={editingTx} partyName={selectedParty.name} nextNo={nextTxNo()} nowTime={nowTime()} books={data.books} onSave={saveTx} onClose={() => { setView('detail'); setEditingTx(null); }} onDelete={editingTx ? () => deleteTx(editingTx.id) : undefined} />
  );

  // Party Detail
  if (view === 'detail' && selectedParty) {
    const refreshed = parties.find(p => p.id === selectedParty.id) || selectedParty;
    return (
      <>
        <PartyDetail
          party={refreshed}
          onBack={() => { setView('list'); setSelectedParty(null); }}
          onTxClick={tx => { setSelectedTx(tx); setView('bill-detail'); }}
          onAddTx={() => { setEditingTx(null); setView('tx-form'); }}
          onEditParty={() => { setEditingParty(refreshed); setShowAddParty(true); }}
          onTakePayment={() => setView('payment-in-form')}
          onAddSale={() => setView('sale-invoice-form')}
        />
        {showAddParty && editingParty && <AddPartyForm initial={editingParty} onSave={saveParty} onClose={() => { setShowAddParty(false); setEditingParty(null); }} />}
      </>
    );
  }

  // All Parties List
  const totalPayable = parties.reduce((s, p) => s + p.transactions.reduce((ts, tx) => ts + calcTxBalance(tx), 0), 0);
  return (
    <main className="page">
      <Heading eyebrow="Ledger" title="Parties" subtitle="Manage your buyers and suppliers in one place.">
        <button className="btn primary" onClick={() => { setEditingParty(null); setShowAddParty(true); }}><Plus /> Add new party</button>
      </Heading>

      <div className="stat-grid">
        <Stat label="Total Parties" value={parties.length} note="Buyers & suppliers" Icon={Users2} />
        <Stat label="You'll Give" value={money(totalPayable)} note="Total payable balance" Icon={ArrowUpLeft} tint="red" />
        <Stat label="Total Transactions" value={parties.reduce((s, p) => s + p.transactions.length, 0)} note="All bills & payments" Icon={FileText} />
        <Stat label="Active This Month" value={parties.filter(p => p.lastDate >= today.slice(0, 8) + '01').length} note="Had activity this month" Icon={PackageCheck} />
      </div>

      <div className="toolbar" style={{ marginBottom: 16 }}>
        <div className="search-box" style={{ maxWidth: '100%', flex: 1 }}>
          <Search /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search Parties…" />
        </div>
      </div>

      {filteredParties.length === 0 ? (
        <TableEmpty label="No parties yet" detail="Add your first buyer or supplier to get started." Icon={Users2} action={
          <button className="btn primary" onClick={() => { setEditingParty(null); setShowAddParty(true); }}><Plus /> Add new party</button>
        } />
      ) : (
        <section className="panel">
          {filteredParties.map((party, i) => {
            const payable = party.transactions.reduce((s, tx) => s + calcTxBalance(tx), 0);
            const lastTx = [...party.transactions].sort((a, b) => b.date.localeCompare(a.date))[0];
            return (
              <div key={party.id} onClick={() => { setSelectedParty(party); setView('detail'); }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: i < filteredParties.length - 1 ? '1px solid #eee9df' : 'none', cursor: 'pointer', background: '#fbfaf5', transition: 'background .15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#f3f1e8'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = '#fbfaf5'}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1e3d2c' }}>{party.name}</div>
                  <div style={{ fontSize: 11, color: '#8a9389', marginTop: 2 }}>{lastTx ? formatDate(lastTx.date) : 'No transactions'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: payable > 0 ? '#a24840' : '#3a6647' }}>{money(payable)}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: payable > 0 ? '#a24840' : '#3a6647', marginTop: 2 }}>{payable > 0 ? "You'll Give" : payable < 0 ? "You'll Get" : '—'}</div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {showAddParty && <AddPartyForm initial={editingParty} onSave={saveParty} onClose={() => { setShowAddParty(false); setEditingParty(null); }} />}
    </main>
  );
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
      <Route path="/parties"><PartiesPage data={data}/></Route>
      <Route path="/books"><Books {...context}/></Route>
      <Route path="/offers"><Offers {...context}/></Route>
      <Route path="/inventory"><Inventory {...context}/></Route>
      <Route path="/purchases"><Purchases {...context}/></Route>
      <Route path="/sale/invoice"><SaleInvoicePage {...context}/></Route>
      <Route path="/sale/payment-in"><PaymentInPage {...context}/></Route>
      <Route path="/sale/return"><SaleReturnPage {...context}/></Route>
      <Route path="/sale/estimate"><EstimatePage {...context}/></Route>
      <Route path="/sale/proforma"><ProformaInvoicePage {...context}/></Route>
      <Route path="/sale/order"><SaleOrderPage {...context}/></Route>
      <Route path="/sale/challan"><DeliveryChallanPage {...context}/></Route>
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
  {kind==='customer'&&<div className="form-grid"><div className="field"><label>Full name *</label><input required value={values.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. Aanya Sharma"/></div><div className="field"><label>Email address *</label><input required type="email" value={values.email} onChange={e=>set('email',e.target.value)} placeholder="family@email.com"/></div><div className="field"><label>Phone number *</label><input required value={values.phone} onChange={e=>set('phone',e.target.value)} placeholder="+91 98xxx xxxxx"/></div><div className="field"><label>School *</label><input required value={values.school} onChange={e=>set('school',e.target.value)} placeholder="School name"/></div><div className="field"><label>Amount Paid (₹)</label><input type="number" min="0" value={values.amountPaid ?? ''} onChange={e=>set('amountPaid',e.target.value)}/></div><div className="field"><label>Amount Due (₹)</label><input type="number" min="0" value={values.amountDue ?? ''} onChange={e=>set('amountDue',e.target.value)}/></div><div className="field"><label>Account status</label><select value={values.status} onChange={e=>set('status',e.target.value)}><option>Active</option><option>Pending</option><option>Inactive</option></select></div><div className="field full"><label>Assign specific books</label><div style={{display:'flex',gap:8,marginBottom:8}}><select style={{flex:1}} value={selClass} onChange={e=>{setSelClass(e.target.value);setSelPub('');setSelBook('');}}><option value="">Select Class</option>{'Pre Nur,Nursery,LKG,UKG'.split(',').concat(Array.from({length:12},(_,i)=>`Class ${i+1}`)).map(x=><option key={x}>{x}</option>)}</select><select style={{flex:1}} value={selPub} onChange={e=>{setSelPub(e.target.value);setSelBook('');}} disabled={!selClass}><option value="">Select Publication</option>{Array.from(new Set(data.books.filter(b=>b.className===selClass).map(b=>b.publication))).map(p=><option key={p}>{p}</option>)}</select><select style={{flex:1}} value={selBook} onChange={e=>setSelBook(e.target.value)} disabled={!selPub}><option value="">Select Book</option>{data.books.filter(b=>b.className===selClass&&b.publication===selPub).map(b=><option key={b.id} value={b.id}>{b.title}</option>)}</select><button type="button" className="btn" disabled={!selBook} onClick={()=>{if(!values.allowedBooks?.includes(selBook))set('allowedBooks',[...(values.allowedBooks||[]),selBook]);setSelBook('');}}>Add</button></div><div className="checks">{(values.allowedBooks||[]).map((id:string)=>{const b=data.books.find(x=>x.id===id);return <label className="check-pill" key={id}><input type="checkbox" checked onChange={()=>set('allowedBooks',values.allowedBooks.filter((x:string)=>x!==id))}/>{b?.title||id}</label>})}</div><span className="muted">Families can only purchase these selected titles.</span></div></div>}
  {kind==='book'&&<div className="form-grid"><div className="field full"><label>Book title *</label><input required value={values.title} onChange={e=>set('title',e.target.value)} placeholder="Title as it appears on the cover"/></div><div className="field full"><label>Publication *</label><div style={{display:'flex',gap:8,alignItems:'flex-start'}}><select style={{flex:1}} value={values.publication} onChange={e=>set('publication',e.target.value)}>{pubs.map(p=><option key={p}>{p}</option>)}</select><button type="button" title="Add new publication" style={{flexShrink:0,display:'flex',alignItems:'center',gap:5,padding:'8px 12px',background:'#f0efe6',border:'1px solid #d5cfc3',borderRadius:7,cursor:'pointer',fontSize:12,color:'#3a5241',fontWeight:600,whiteSpace:'nowrap'}} onClick={()=>setShowPubInput(v=>!v)}><PlusCircle size={14}/> Add publication</button></div>{showPubInput&&<div style={{display:'flex',gap:8,marginTop:8,alignItems:'center'}}><input style={{flex:1,fontSize:13,padding:'7px 10px',border:'1px solid #d5cfc3',borderRadius:7,outline:'none'}} placeholder="e.g. Oxford University Press" value={newPubInput} onChange={e=>setNewPubInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();if(newPubInput.trim()){onAddPub(newPubInput.trim());set('publication',newPubInput.trim());setNewPubInput('');setShowPubInput(false);}}}}/><button type="button" style={{padding:'7px 14px',background:'#3a5241',color:'#fff',border:'none',borderRadius:7,cursor:'pointer',fontWeight:600,fontSize:12}} onClick={()=>{if(newPubInput.trim()){onAddPub(newPubInput.trim());set('publication',newPubInput.trim());setNewPubInput('');setShowPubInput(false);}}}>Add</button><button type="button" style={{padding:'7px 12px',background:'transparent',border:'1px solid #d5cfc3',borderRadius:7,cursor:'pointer',fontSize:12,color:'#536157'}} onClick={()=>{setShowPubInput(false);setNewPubInput('');}}>Cancel</button></div>}</div><div className="field"><label>Subject</label><input value={values.subject} onChange={e=>set('subject',e.target.value)} placeholder="Mathematics"/></div><div className="field"><label>Class</label><select value={values.className} onChange={e=>set('className',e.target.value)}>{'Pre Nur,Nursery,LKG,UKG'.split(',').concat(Array.from({length:12},(_,i)=>`Class ${i+1}`)).map(x=><option key={x}>{x}</option>)}</select></div><div className="field"><label>ISBN</label><input value={values.isbn} onChange={e=>set('isbn',e.target.value)} placeholder="978-…"/></div><div className="field"><label>SKU *</label><input required value={values.sku} onChange={e=>set('sku',e.target.value)} placeholder="RDS-MTH-08"/></div><div className="field"><label>Price (₹) *</label><input required type="number" min="0" step="1" value={values.price} onChange={e=>set('price',e.target.value)} placeholder="0"/></div><div className="field"><label>Units in stock</label><input type="number" min="0" value={values.stock} onChange={e=>set('stock',e.target.value)}/></div><div className="field"><label>Low-stock threshold</label><input type="number" min="0" value={values.lowStockThreshold} onChange={e=>set('lowStockThreshold',e.target.value)}/></div><div className="field"><label>Catalog status</label><select value={values.status} onChange={e=>set('status',e.target.value)}><option>Active</option><option>Draft</option><option>Archived</option></select></div></div>}
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
