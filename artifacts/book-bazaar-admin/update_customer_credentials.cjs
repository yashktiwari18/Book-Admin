const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update Customer type
content = content.replace(
  `type Customer = { id:string; name:string; email:string; phone:string; school:string; className:string; status:'Active'|'Pending'|'Inactive'; allowedPublications:string[]; allowedBooks?:string[]; joinedAt:string; amountPaid?:number; amountDue?:number };`,
  `type Customer = { id:string; name:string; email:string; phone:string; school:string; className:string; status:'Active'|'Pending'|'Inactive'; allowedPublications:string[]; allowedBooks?:string[]; joinedAt:string; amountPaid?:number; amountDue?:number; password?:string; loginId?:string };`
);

// 2. Update lucide-react imports to add KeyRound, EyeOff, Lock, GraduationCap, LogOut, LogIn, Copy
content = content.replace(
  `import { LayoutDashboard, Truck, Building2, UsersRound, BookOpen, Tags, Boxes, Search, Plus, Pencil, Trash2, ArrowUpRight, ArrowRight, Menu, X, Bell, TriangleAlert, PackageCheck, Library, Check, Minus, Save, CalendarDays, PlusCircle, Users2, FileOutput, FileText, ArrowDownLeft, RotateCcw, ClipboardList, FilePen, ShoppingBag, Package, Smartphone, Wallet, ChevronDown, FileInput, ArrowUpLeft, RotateCw, ClipboardCheck, RefreshCcw, Download, Share2, Eye, Printer, ChevronLeft } from 'lucide-react';`,
  `import { LayoutDashboard, Truck, Building2, UsersRound, BookOpen, Tags, Boxes, Search, Plus, Pencil, Trash2, ArrowUpRight, ArrowRight, Menu, X, Bell, TriangleAlert, PackageCheck, Library, Check, Minus, Save, CalendarDays, PlusCircle, Users2, FileOutput, FileText, ArrowDownLeft, RotateCcw, ClipboardList, FilePen, ShoppingBag, Package, Smartphone, Wallet, ChevronDown, FileInput, ArrowUpLeft, RotateCw, ClipboardCheck, RefreshCcw, Download, Share2, Eye, Printer, ChevronLeft, KeyRound, EyeOff, Lock, GraduationCap, LogOut, LogIn, Copy } from 'lucide-react';`
);

// 3. Update seed customers with password and loginId
content = content.replace(
  `const seed:Dataset={
  customers:[
    {id:'BB-1048',name:'Aarav Mehta',email:'aarav.mehta@gmail.com',phone:'+91 98765 23410',school:'The Heritage School',className:'Class 8',status:'Active',allowedPublications:['RD Sharma','NCERT'],allowedBooks:['BK-0281','BK-0283'],joinedAt:'2025-01-28',amountPaid:4500,amountDue:1200},
    {id:'BB-1047',name:'Isha Kapoor',email:'isha.kapoor@gmail.com',phone:'+91 98112 40832',school:'Delhi Public School',className:'Class 10',status:'Active',allowedPublications:['R.S. Aggarwal','Arihant Publications'],allowedBooks:['BK-0284','BK-0280'],joinedAt:'2025-01-26',amountPaid:6200,amountDue:0},
    {id:'BB-1046',name:'Kabir Sethi',email:'kabir.sethi@gmail.com',phone:'+91 98990 11476',school:'Modern School',className:'Class 6',status:'Pending',allowedPublications:['NCERT'],allowedBooks:[],joinedAt:'2025-01-25',amountPaid:0,amountDue:0},
    {id:'BB-1045',name:'Anaya Rao',email:'anaya.rao@gmail.com',phone:'+91 98105 77142',school:'Vasant Valley School',className:'Class 9',status:'Active',allowedPublications:['RD Sharma','S. Chand'],allowedBooks:['BK-0282'],joinedAt:'2025-01-23',amountPaid:3200,amountDue:150},
    {id:'BB-1044',name:'Vihaan Khanna',email:'vihaan.k@gmail.com',phone:'+91 99102 60119',school:'The Shri Ram School',className:'Class 7',status:'Inactive',allowedPublications:['NCERT','Arihant Publications'],allowedBooks:[],joinedAt:'2025-01-20',amountPaid:1800,amountDue:300},
    {id:'BB-1043',name:'Myra Bansal',email:'myra.bansal@gmail.com',phone:'+91 98108 62214',school:'The Heritage School',className:'Class 5',status:'Active',allowedPublications:['R.S. Aggarwal','NCERT'],allowedBooks:[],joinedAt:'2025-01-18',amountPaid:2700,amountDue:0},
  ],`,
  `const seed:Dataset={
  customers:[
    {id:'BB-1048',name:'Aarav Mehta',email:'aarav.mehta@gmail.com',phone:'+91 98765 23410',school:'The Heritage School',className:'Class 8',status:'Active',allowedPublications:['RD Sharma','NCERT'],allowedBooks:['BK-0281','BK-0283'],joinedAt:'2025-01-28',amountPaid:4500,amountDue:1200,password:'Aarav@123',loginId:'aarav.mehta'},
    {id:'BB-1047',name:'Isha Kapoor',email:'isha.kapoor@gmail.com',phone:'+91 98112 40832',school:'Delhi Public School',className:'Class 10',status:'Active',allowedPublications:['R.S. Aggarwal','Arihant Publications'],allowedBooks:['BK-0284','BK-0280'],joinedAt:'2025-01-26',amountPaid:6200,amountDue:0,password:'Isha@123',loginId:'isha.kapoor'},
    {id:'BB-1046',name:'Kabir Sethi',email:'kabir.sethi@gmail.com',phone:'+91 98990 11476',school:'Modern School',className:'Class 6',status:'Pending',allowedPublications:['NCERT'],allowedBooks:[],joinedAt:'2025-01-25',amountPaid:0,amountDue:0,password:'Kabir@123',loginId:'kabir.sethi'},
    {id:'BB-1045',name:'Anaya Rao',email:'anaya.rao@gmail.com',phone:'+91 98105 77142',school:'Vasant Valley School',className:'Class 9',status:'Active',allowedPublications:['RD Sharma','S. Chand'],allowedBooks:['BK-0282'],joinedAt:'2025-01-23',amountPaid:3200,amountDue:150,password:'Anaya@123',loginId:'anaya.rao'},
    {id:'BB-1044',name:'Vihaan Khanna',email:'vihaan.k@gmail.com',phone:'+91 99102 60119',school:'The Shri Ram School',className:'Class 7',status:'Inactive',allowedPublications:['NCERT','Arihant Publications'],allowedBooks:[],joinedAt:'2025-01-20',amountPaid:1800,amountDue:300,password:'Vihaan@123',loginId:'vihaan.k'},
    {id:'BB-1043',name:'Myra Bansal',email:'myra.bansal@gmail.com',phone:'+91 98108 62214',school:'The Heritage School',className:'Class 5',status:'Active',allowedPublications:['R.S. Aggarwal','NCERT'],allowedBooks:[],joinedAt:'2025-01-18',amountPaid:2700,amountDue:0,password:'Myra@123',loginId:'myra.bansal'},
  ],`
);

// 4. Update readStore to ensure customers always have password and loginId fallback
content = content.replace(
  `const readStore=():Dataset=>{try{const value=localStorage.getItem('bookbazaar-admin-v1');if(!value)return seed;const parsed=JSON.parse(value);return {...seed,...parsed,purchases:parsed.purchases||seed.purchases,bunches:(parsed.bunches&&parsed.bunches.length)?parsed.bunches:DEFAULT_BUNCHES};}catch{return seed;}};`,
  `const readStore=():Dataset=>{try{const value=localStorage.getItem('bookbazaar-admin-v1');if(!value)return seed;const parsed=JSON.parse(value);return {...seed,...parsed,customers:(parsed.customers||seed.customers).map((c:Customer)=>({...c,password:c.password||(\`\${(c.name||'Student').split(' ')[0]}@123\`),loginId:c.loginId||(c.email?c.email.split('@')[0]:c.id)})),purchases:parsed.purchases||seed.purchases,bunches:(parsed.bunches&&parsed.bunches.length)?parsed.bunches:DEFAULT_BUNCHES};}catch{return seed;}};`
);

// 5. Update Editor values initialization and add showPassword state
content = content.replace(
  `   if(kind==='customer')return original?{...original,allowedPublications:[...original.allowedPublications],allowedBooks:original.allowedBooks?[...original.allowedBooks]:[]}:{name:'',email:'',phone:'',school:'',className:'Class 5',status:'Active',allowedPublications:[],allowedBooks:[]};`,
  `   if(kind==='customer')return original?{...original,allowedPublications:[...original.allowedPublications],allowedBooks:original.allowedBooks?[...original.allowedBooks]:[],password:original.password||(\`\${(original.name||'Student').split(' ')[0]}@123\`),loginId:original.loginId||(original.email?original.email.split('@')[0]:'')}:{name:'',email:'',phone:'',school:'',className:'Class 5',status:'Active',allowedPublications:[],allowedBooks:[],password:'Book@123',loginId:''};`
);

content = content.replace(
  ` const [bunchFeedback, setBunchFeedback] = useState('');`,
  ` const [bunchFeedback, setBunchFeedback] = useState('');
 const [showPassword, setShowPassword] = useState(false);`
);

// 6. Update Editor Customer form to include Login Credentials (ID & Password) card
const oldCustFields = `  <div className="field"><label>Amount Paid (₹)</label><input type="number" min="0" value={values.amountPaid ?? ''} onChange={e=>set('amountPaid',e.target.value)}/></div>
  <div className="field"><label>Amount Due (₹)</label><input type="number" min="0" value={values.amountDue ?? ''} onChange={e=>set('amountDue',e.target.value)}/></div>`;

const newCustFields = `  <div className="field"><label>Amount Paid (₹)</label><input type="number" min="0" value={values.amountPaid ?? ''} onChange={e=>set('amountPaid',e.target.value)}/></div>
  <div className="field"><label>Amount Due (₹)</label><input type="number" min="0" value={values.amountDue ?? ''} onChange={e=>set('amountDue',e.target.value)}/></div>

  {/* Student Portal Login Credentials (ID & Password) */}
  <div className="field full" style={{background:'#f6f9f6',border:'1px solid #c9ddcd',borderRadius:9,padding:'12px 14px',margin:'2px 0 4px'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
      <div style={{display:'flex',alignItems:'center',gap:6}}>
        <KeyRound size={14} style={{color:'#264333'}}/>
        <span style={{fontSize:11,fontWeight:700,color:'#264333',letterSpacing:'0.4px',textTransform:'uppercase'}}>
          Student Portal Login Credentials (ID & Password)
        </span>
      </div>
      <span style={{fontSize:10,color:'#526b57'}}>For family to log in & buy assigned books</span>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
      <div className="field">
        <label style={{fontSize:10,fontWeight:700,color:'#59685c'}}>
          LOGIN ID / USERNAME *
        </label>
        <input
          required
          value={values.loginId ?? ''}
          onChange={e => set('loginId', e.target.value)}
          placeholder={values.email ? values.email.split('@')[0] : 'e.g. aanya.sharma'}
        />
        <span className="muted" style={{fontSize:9}}>
          Student can log in using either this ID or their Email ({values.email || 'email'})
        </span>
      </div>
      <div className="field">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <label style={{fontSize:10,fontWeight:700,color:'#59685c',margin:0}}>
            PASSWORD *
          </label>
          <button
            type="button"
            onClick={() => {
              const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
              let auto = 'Pass@';
              for (let i = 0; i < 4; i++) auto += chars[Math.floor(Math.random() * chars.length)];
              set('password', auto);
              setShowPassword(true);
            }}
            style={{background:'none',border:'none',color:'#3a6647',fontSize:10,fontWeight:600,cursor:'pointer',textDecoration:'underline',padding:0}}
          >
            Auto-generate
          </button>
        </div>
        <div style={{position:'relative',display:'flex',alignItems:'center'}}>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={values.password ?? ''}
            onChange={e => set('password', e.target.value)}
            placeholder="Set customer password"
            style={{paddingRight:36}}
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            style={{position:'absolute',right:8,background:'none',border:'none',color:'#778279',cursor:'pointer',padding:2}}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={14}/> : <Eye size={14}/>}
          </button>
        </div>
        <span className="muted" style={{fontSize:9}}>
          Share this password with the family to log in and buy books
        </span>
      </div>
    </div>
  </div>`;

content = content.replace(oldCustFields, newCustFields);

// 7. Update Customers table to display credentials
content = content.replace(
  `<thead><tr><th>Customer</th><th>School / class</th><th>Book & Publication access</th><th>Payments</th><th>Joined</th><th>Status</th><th></th></tr></thead>`,
  `<thead><tr><th>Customer</th><th>School / class</th><th>Book & Publication access</th><th>Login Credentials</th><th>Payments</th><th>Joined</th><th>Status</th><th></th></tr></thead>`
);

content = content.replace(
  `<td>{x.allowedBooks && x.allowedBooks.length > 0 ? (<div style={{display:'flex',gap:4,flexWrap:'wrap',alignItems:'center'}}><span className="pill" style={{background:'#dbebe0',color:'#1c3829',fontWeight:700,fontSize:10}}>📚 {x.allowedBooks.length} {x.allowedBooks.length===1?'book':'books'}</span>{x.allowedBooks.slice(0,2).map(id=>{const bk=c.data.books.find(b=>b.id===id);return <span key={id} className="pill neutral" style={{maxWidth:110,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:10}} title={bk?.title||id}>{bk?.title||id}</span>;})}{x.allowedBooks.length>2&&<span className="pill neutral" style={{fontSize:10}}>+{x.allowedBooks.length-2}</span>}</div>) : (<div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{x.allowedPublications.slice(0,2).map(p=><span key={p} className="pill neutral">{p}</span>)}{x.allowedPublications.length>2&&<span className="pill neutral">+{x.allowedPublications.length-2}</span>}{!x.allowedPublications.length&&<span className="muted" style={{fontSize:11}}>All books</span>}</div>)}</td>`,
  `<td>{x.allowedBooks && x.allowedBooks.length > 0 ? (<div style={{display:'flex',gap:4,flexWrap:'wrap',alignItems:'center'}}><span className="pill" style={{background:'#dbebe0',color:'#1c3829',fontWeight:700,fontSize:10}}>📚 {x.allowedBooks.length} {x.allowedBooks.length===1?'book':'books'}</span>{x.allowedBooks.slice(0,2).map(id=>{const bk=c.data.books.find(b=>b.id===id);return <span key={id} className="pill neutral" style={{maxWidth:110,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:10}} title={bk?.title||id}>{bk?.title||id}</span>;})}{x.allowedBooks.length>2&&<span className="pill neutral" style={{fontSize:10}}>+{x.allowedBooks.length-2}</span>}</div>) : (<div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{x.allowedPublications.slice(0,2).map(p=><span key={p} className="pill neutral">{p}</span>)}{x.allowedPublications.length>2&&<span className="pill neutral">+{x.allowedPublications.length-2}</span>}{!x.allowedPublications.length&&<span className="muted" style={{fontSize:11}}>All books</span>}</div>)}</td><td><div style={{display:'flex',flexDirection:'column',gap:3}}><div style={{display:'flex',alignItems:'center',gap:5}}><span style={{fontSize:10,fontWeight:700,color:'#536157'}}>ID:</span><code style={{fontSize:10,background:'#f0efe6',padding:'1px 5px',borderRadius:4,color:'#315a41',fontFamily:'monospace'}}>{x.loginId || x.email.split('@')[0]}</code></div><div style={{display:'flex',alignItems:'center',gap:5}}><span style={{fontSize:10,fontWeight:700,color:'#536157'}}>Pass:</span><code style={{fontSize:10,background:'#f0efe6',padding:'1px 5px',borderRadius:4,color:'#315a41',fontFamily:'monospace'}}>{x.password || 'Book@123'}</code></div><button type="button" onClick={()=>{const text=\`Book Bazaar Student Login:\\nPortal: \${window.location.origin}/portal\\nEmail: \${x.email}\\nLogin ID: \${x.loginId || x.email.split('@')[0]}\\nPassword: \${x.password || 'Book@123'}\`;navigator.clipboard.writeText(text);c.setToast(\`Copied login details for \${x.name}\`);}} style={{border:'none',background:'none',color:'#3a6647',fontSize:10,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:4,padding:0,marginTop:2}}><Copy size={11}/> Copy Info</button></div></td>`
);

// 8. Add Student Portal button to row actions in Customers table
content = content.replace(
  `<td><div className="row-actions"><button className="icon-button" aria-label={\`Edit \${x.name}\`} title="Edit customer" onClick={()=>c.edit('customer',x)} data-testid={\`button-edit-customer-\${x.id}\`}><Pencil/></button><button className="icon-button" aria-label={\`Remove \${x.name}\`} title="Remove customer" onClick={()=>c.setConfirm({kind:'customer',id:x.id,name:x.name})} data-testid={\`button-remove-customer-\${x.id}\`}><Trash2/></button></div></td>`,
  `<td><div className="row-actions"><button className="icon-button" aria-label={\`Login as \${x.name}\`} title="Open Student Portal as this customer" onClick={()=>{sessionStorage.setItem('bookbazaar-current-student-id',x.id);window.location.href='#/portal';}}><GraduationCap size={14}/></button><button className="icon-button" aria-label={\`Edit \${x.name}\`} title="Edit customer" onClick={()=>c.edit('customer',x)} data-testid={\`button-edit-customer-\${x.id}\`}><Pencil/></button><button className="icon-button" aria-label={\`Remove \${x.name}\`} title="Remove customer" onClick={()=>c.setConfirm({kind:'customer',id:x.id,name:x.name})} data-testid={\`button-remove-customer-\${x.id}\`}><Trash2/></button></div></td>`
);

// 9. Add CustomerPortal Component
const customerPortalComponent = `
/* ─── Customer / Student Purchase Portal ───────────────────────────── */
function CustomerPortal({ data, onExit }: { data: Dataset; onExit?: () => void }) {
  const [currentUser, setCurrentUser] = useState<Customer | null>(() => {
    const savedId = sessionStorage.getItem('bookbazaar-current-student-id');
    return savedId ? (data.customers.find(c => c.id === savedId) || null) : null;
  });
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [orderNotice, setOrderNotice] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const input = loginIdentifier.trim().toLowerCase();
    const pass = password.trim();
    const found = data.customers.find(c =>
      (c.email.toLowerCase() === input || (c.loginId && c.loginId.toLowerCase() === input) || c.id.toLowerCase() === input) &&
      (c.password === pass || (!c.password && pass === 'Book@123') || pass === \`\${c.name.split(' ')[0]}@123\`)
    );
    if (!found) {
      setLoginError('Invalid Email / Login ID or Password. Please check with your school bookstore.');
      return;
    }
    setCurrentUser(found);
    sessionStorage.setItem('bookbazaar-current-student-id', found.id);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('bookbazaar-current-student-id');
  };

  // Determine which books are assigned to this student
  const assignedBooks = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.allowedBooks && currentUser.allowedBooks.length > 0) {
      return currentUser.allowedBooks.map(id => data.books.find(b => b.id === id)).filter(Boolean) as Book[];
    }
    // Fallback: match by class or publications
    return data.books.filter(b => b.className === currentUser.className || currentUser.allowedPublications.includes(b.publication));
  }, [currentUser, data.books]);

  // Default select all assigned books when logged in
  useEffect(() => {
    if (currentUser && assignedBooks.length > 0 && selectedBooks.length === 0) {
      setSelectedBooks(assignedBooks.map(b => b.id));
    }
  }, [currentUser, assignedBooks]);

  const selectedTotal = useMemo(() => {
    return selectedBooks.reduce((sum, bid) => {
      const bk = data.books.find(b => b.id === bid);
      return sum + (bk?.price || 0);
    }, 0);
  }, [selectedBooks, data.books]);

  const handlePlaceOrder = () => {
    if (!currentUser || selectedBooks.length === 0) return;
    const invItems: InvoiceItem[] = selectedBooks.map(bid => {
      const bk = data.books.find(b => b.id === bid);
      return {
        id: idFor('ITM'),
        bookId: bid,
        name: bk?.title || bid,
        qty: 1,
        price: bk?.price || 0,
        discountPct: 0
      };
    });

    const newInvoice: SaleInvoiceType = {
      id: idFor('INV'),
      invoiceNo: \`INV-\${Math.floor(1000 + Math.random() * 9000)}\`,
      date: today,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      customerName: currentUser.name,
      billingName: currentUser.name,
      phone: currentUser.phone,
      email: currentUser.email,
      partyBalance: currentUser.amountDue || 0,
      billingAddress: { line1: currentUser.school, line2: currentUser.className, city: 'Delhi', state: 'Delhi', pincode: '110001' },
      shippingAddress: { line1: currentUser.school, line2: currentUser.className, city: 'Delhi', state: 'Delhi', pincode: '110001' },
      shipSameAsBill: true,
      items: invItems,
      discountPct: 0,
      shipping: 0,
      roundOff: false,
      received: paymentMode === 'Cash on Delivery' ? 0 : selectedTotal,
      paymentType: paymentMode,
      paymentRef: paymentMode === 'UPI' ? \`UPI-\${Math.random().toString(36).slice(2, 8).toUpperCase()}\` : '',
      notes: \`Student portal order placed by \${currentUser.name} for \${currentUser.className}\`,
      terms: 'Thank you for your order. School pack will be dispatched directly to your student desk.',
      status: paymentMode === 'Cash on Delivery' ? 'Unpaid' : 'Paid'
    };

    try {
      const existingInvoices: SaleInvoiceType[] = JSON.parse(localStorage.getItem('bookbazaar-invoices-v1') || '[]');
      localStorage.setItem('bookbazaar-invoices-v1', JSON.stringify([newInvoice, ...existingInvoices]));
    } catch {}

    setOrderNotice(\`🎉 Order successfully placed for \${invItems.length} books! Invoice \${newInvoice.invoiceNo} has been generated.\`);
  };

  // Past student invoices
  const studentInvoices = useMemo(() => {
    if (!currentUser) return [];
    try {
      const all: SaleInvoiceType[] = JSON.parse(localStorage.getItem('bookbazaar-invoices-v1') || '[]');
      return all.filter(inv => inv.customerName.toLowerCase() === currentUser.name.toLowerCase() || inv.phone === currentUser.phone || inv.email === currentUser.email);
    } catch {
      return [];
    }
  }, [currentUser, orderNotice]);

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3ec', color: '#1e3d2c', fontFamily: 'var(--app-font-sans)' }}>
      {/* Top Navbar */}
      <header style={{ background: '#1c3829', color: '#fff', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: '#e8ddcb', color: '#1c3829', fontWeight: 900, display: 'grid', placeItems: 'center', fontSize: 18 }}>b</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.3px' }}>Book Bazaar</div>
            <div style={{ fontSize: 10, color: '#a6c0b0', letterSpacing: '1px', textTransform: 'uppercase' }}>Student & Family Purchase Portal</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {currentUser && (
            <div style={{ textAlign: 'right', marginRight: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{currentUser.name}</div>
              <div style={{ fontSize: 10, color: '#9bc4a8' }}>{currentUser.school} · {currentUser.className}</div>
            </div>
          )}
          {currentUser ? (
            <button onClick={handleLogout} className="btn" style={{ background: '#29543c', color: '#fff', border: '1px solid #3c7353', fontSize: 11, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 5 }}>
              <LogOut size={13}/> Log Out
            </button>
          ) : null}
          <Link href="/" className="btn" style={{ background: '#fff', color: '#1c3829', border: 'none', fontSize: 11, fontWeight: 700, padding: '6px 14px', textDecoration: 'none' }}>
            Store Workspace →
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: 900, margin: '24px auto', padding: '0 16px' }}>
        {!currentUser ? (
          /* Login Screen */
          <div style={{ maxWidth: 440, margin: '40px auto', background: '#fff', borderRadius: 14, border: '1px solid #e5ded2', padding: 28, boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <div style={{ width: 48, height: 48, borderRadius: 24, background: '#eef5f0', color: '#244331', margin: '0 auto 12px', display: 'grid', placeItems: 'center' }}>
                <GraduationCap size={26}/>
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1c3829', margin: '0 0 6px', fontFamily: 'var(--app-font-serif)' }}>Student & Parent Login</h1>
              <p style={{ fontSize: 12, color: '#6d756e', margin: 0 }}>
                Sign in with your Email ID or Login ID and Password to purchase your child's assigned school books.
              </p>
            </div>

            {loginError && (
              <div style={{ background: '#fdf2f2', border: '1px solid #f8b4b4', color: '#9b1c1c', borderRadius: 8, padding: '10px 14px', fontSize: 12, marginBottom: 16 }}>
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="field">
                <label style={{ fontSize: 11, fontWeight: 700, color: '#4a574d' }}>EMAIL ADDRESS OR LOGIN ID *</label>
                <input
                  required
                  placeholder="e.g. aarav.mehta@gmail.com or aarav.mehta"
                  value={loginIdentifier}
                  onChange={e => setLoginIdentifier(e.target.value)}
                  style={{ height: 38, fontSize: 13 }}
                />
              </div>
              <div className="field">
                <label style={{ fontSize: 11, fontWeight: 700, color: '#4a574d' }}>PASSWORD *</label>
                <input
                  required
                  type="password"
                  placeholder="Enter your customer password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ height: 38, fontSize: 13 }}
                />
              </div>
              <button type="submit" className="btn primary" style={{ height: 42, fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
                <LogIn size={15}/> Log In to Purchase Books
              </button>
            </form>

            {/* Quick Demo Login Pills for Instant Testing */}
            <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #eee9df' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8a9389', textTransform: 'uppercase', marginBottom: 10, textAlign: 'center' }}>
                Quick Test Accounts (Click to Fill & Sign In):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {data.customers.slice(0, 3).map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setLoginIdentifier(c.loginId || c.email);
                      setPassword(c.password || 'Aarav@123');
                      setCurrentUser(c);
                      sessionStorage.setItem('bookbazaar-current-student-id', c.id);
                    }}
                    style={{ background: '#f8f6f0', border: '1px solid #e2ded2', borderRadius: 7, padding: '7px 12px', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#244331' }}>{c.name} ({c.className})</div>
                      <div style={{ fontSize: 10, color: '#7a857b' }}>ID: {c.loginId || c.email.split('@')[0]} · Pass: {c.password || 'Book@123'}</div>
                    </div>
                    <span style={{ fontSize: 10, color: '#3a6647', fontWeight: 600 }}>Login →</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Student Dashboard & Purchase Screen */
          <div>
            {/* Student Banner */}
            <div style={{ background: '#fff', border: '1px solid #e5ded2', borderRadius: 12, padding: 20, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
              <div>
                <span style={{ fontSize: 11, color: '#8a9389', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>STUDENT ACCOUNT</span>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1c3829', margin: '2px 0 4px', fontFamily: 'var(--app-font-serif)' }}>{currentUser.name}</h1>
                <div style={{ fontSize: 12, color: '#556358' }}>
                  <b>School:</b> {currentUser.school} &nbsp;|&nbsp; <b>Class:</b> {currentUser.className} &nbsp;|&nbsp; <b>Login ID:</b> <code style={{ background: '#f0efe6', padding: '1px 5px', borderRadius: 4 }}>{currentUser.loginId || currentUser.email}</code>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ background: '#f6f9f6', border: '1px solid #c9ddcd', padding: '10px 16px', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#59685c', fontWeight: 700 }}>AMOUNT PAID</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#244331' }}>{money(currentUser.amountPaid || 0)}</div>
                </div>
                {(currentUser.amountDue || 0) > 0 && (
                  <div style={{ background: '#fdf3f3', border: '1px solid #f2c7c7', padding: '10px 16px', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#a24840', fontWeight: 700 }}>OUTSTANDING DUE</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#a24840' }}>{money(currentUser.amountDue || 0)}</div>
                  </div>
                )}
              </div>
            </div>

            {orderNotice && (
              <div style={{ background: '#eaf5ec', border: '1px solid #a3cfb0', color: '#1f482d', padding: '12px 16px', borderRadius: 9, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
                <Check size={16}/> {orderNotice}
              </div>
            )}

            {/* Assigned Books Section */}
            <div style={{ background: '#fff', border: '1px solid #e5ded2', borderRadius: 12, padding: 22, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c3829', margin: 0, fontFamily: 'var(--app-font-serif)' }}>
                    📚 Books Assigned to You ({assignedBooks.length})
                  </h2>
                  <p style={{ fontSize: 12, color: '#7a857b', margin: '3px 0 0' }}>
                    Select the titles you want to purchase. The bookshop will prepare and deliver your package.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setSelectedBooks(assignedBooks.map(b => b.id))}
                    style={{ background: '#f0efe6', border: '1px solid #dcd7ca', borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 600, color: '#264333', cursor: 'pointer' }}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedBooks([])}
                    style={{ background: 'none', border: 'none', fontSize: 11, color: '#a24840', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Clear
                  </button>
                </div>
              </div>

              {assignedBooks.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#8a9389', fontSize: 13 }}>
                  No specific titles have been restricted for your account. You can purchase any class titles directly.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {assignedBooks.map(b => {
                    const isSelected = selectedBooks.includes(b.id);
                    return (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBooks(prev => isSelected ? prev.filter(x => x !== b.id) : [...prev, b.id])}
                        style={{
                          border: isSelected ? '1.5px solid #244331' : '1px solid #e6e0d3',
                          background: isSelected ? '#f8faf8' : '#faf9f5',
                          borderRadius: 9,
                          padding: '12px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14,
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          style={{ width: 18, height: 18, accentColor: '#244331', cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3d2c' }}>{b.title}</div>
                          <div style={{ fontSize: 11, color: '#7a857b', marginTop: 2 }}>
                            {b.author} · {b.publication} · <span style={{ background: '#e8e6dc', padding: '1px 5px', borderRadius: 4 }}>{b.className}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: '#1c3829' }}>{money(b.price)}</div>
                          <div style={{ fontSize: 10, color: b.stock > 0 ? '#3a6647' : '#a24840', fontWeight: 600 }}>
                            {b.stock > 0 ? '✓ In Stock' : 'Pre-order'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Checkout / Order Summary Box */}
              {selectedBooks.length > 0 && (
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #e5ded2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#8a9389', fontWeight: 600 }}>ORDER TOTAL ({selectedBooks.length} items):</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#244331' }}>{money(selectedTotal)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <select
                      value={paymentMode}
                      onChange={e => setPaymentMode(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: 7, border: '1px solid #d5cfc3', fontSize: 12, background: '#fff', color: '#1e3d2c', fontWeight: 600 }}
                    >
                      <option value="UPI">Pay via UPI (Instant)</option>
                      <option value="Cash on Delivery">Pay at Bookshop Counter (COD)</option>
                      <option value="Net Banking">Net Banking / Card</option>
                    </select>
                    <button
                      type="button"
                      onClick={handlePlaceOrder}
                      className="btn primary"
                      style={{ padding: '10px 22px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7 }}
                    >
                      <ShoppingBag size={15}/> Place Book Order Now
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Invoices & Order History */}
            {studentInvoices.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #e5ded2', borderRadius: 12, padding: 22 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1c3829', margin: '0 0 12px', fontFamily: 'var(--app-font-serif)' }}>
                  🧾 Your Invoices & Past Orders ({studentInvoices.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {studentInvoices.map(inv => (
                    <div key={inv.id} style={{ border: '1px solid #e8e4da', borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3d2c' }}>Invoice {inv.invoiceNo}</div>
                        <div style={{ fontSize: 11, color: '#8a9389' }}>{inv.date} · {inv.items.length} titles · Paid via {inv.paymentType}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1c3829' }}>{money(calcInvoiceTotal(inv))}</div>
                        <span className={\`pill \${inv.status === 'Paid' ? '' : 'warn'}\`} style={{ fontSize: 9 }}>{inv.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
`;

// 10. Add CustomerPortal Component before AppShell
content = content.replace(
  'function AppShell({children}:{children:ReactNode}){',
  customerPortalComponent + '\nfunction AppShell({children}:{children:ReactNode}){'
);

// 11. Add route in AppContent
content = content.replace(
  `<Route path="/sale/pos"><ComingSoon title="Mobile POS" sub="Quick point-of-sale billing on the go." Icon={Smartphone}/></Route>`,
  `<Route path="/sale/pos"><ComingSoon title="Mobile POS" sub="Quick point-of-sale billing on the go." Icon={Smartphone}/></Route>
      <Route path="/portal"><CustomerPortal data={data}/></Route>`
);

// 12. Add Student Portal button to topbar
content = content.replace(
  `<div className="top-actions"><span className="today">Friday, 14 February</span><Bell size={16}/><div className="avatar">S</div><span>Store team</span></div>`,
  `<div className="top-actions"><Link href="/portal" style={{display:'flex',alignItems:'center',gap:5,background:'#244331',color:'#fff',padding:'5px 11px',borderRadius:7,fontSize:11,fontWeight:600,textDecoration:'none',marginRight:6}}><GraduationCap size={13}/> Student Portal</Link><span className="today">Friday, 14 February</span><Bell size={16}/><div className="avatar">S</div><span>Store team</span></div>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated App.tsx with Customer ID, Password, and Student Portal!');

