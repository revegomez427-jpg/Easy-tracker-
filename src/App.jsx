import { useState, useMemo } from "react";
import ET from "./ET.jsx";
import GoalView from "./GoalView.jsx";
import { THEMES, THEME_ORDER } from "./themes.js";
import { LANGUAGES, T as TRANSLATIONS } from "./i18n.js";

// Base colors — components outside App use dark theme defaults
const C = {
  bg:"#080f1e", card:"#0d1526", elevated:"#152038", border:"#1c2d4a",
  lime:"#c8f135", slate:"#4a6080", white:"#f0f4ff", danger:"#ff5e5e", warn:"#f5a623",
};

const PERIODS = [
  { id: "weekly",   label: i.weekly,   short: i.week   },
  { id: "biweekly", label: i.biweekly, short: i.biweek },
  { id: "monthly",  label: i.monthly,   short: i.month      },
];

const CATEGORIES = [
  { id: "housing",   label: "Renta",      emoji: "🏠", color: "#7c6af7" },
  { id: "food",      label: "Comida",     emoji: "🛒", color: "#f5a623" },
  { id: "transport", label: "Transporte", emoji: "🚗", color: C.lime    },
  { id: "bills",     label: "Bills",      emoji: "💡", color: "#38bdf8" },
  { id: "health",    label: "Salud",      emoji: "💊", color: "#fb7185" },
  { id: "savings",   label: "Ahorros",    emoji: "🏦", color: "#a78bfa" },
  { id: "personal",  label: "Personal",   emoji: "👤", color: "#34d399" },
  { id: "loan",      label: "Préstamo",   emoji: "🤝", color: "#f97316" },
  { id: "other",     label: "Otro",       emoji: "📦", color: C.slate   },
];

const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAYS_ES   = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

const INP = {
  width:"100%", padding:"0.8rem 1rem", background:C.border,
  border:"1.5px solid transparent", borderRadius:12,
  color:C.white, fontSize:"0.95rem", outline:"none",
  boxSizing:"border-box", fontFamily:"inherit",
};

function fmt(n) {
  return n.toLocaleString("en-US",{style:"currency",currency:"USD",maximumFractionDigits:2});
}
function todayKey() {
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function monthKey(dateKey) {
  return dateKey.slice(0,7); // "YYYY-MM"
}
function fmtKey(key) {
  const [y,m,d]=key.split("-"); return `${d}/${m}/${y}`;
}
function fmtKeyLong(key) {
  const [,m,d]=key.split("-");
  return `${parseInt(d)} de ${MONTHS_ES[parseInt(m)-1]}`;
}
function fmtMonth(ym) {
  const [y,m]=ym.split("-");
  return `${MONTHS_ES[parseInt(m)-1]} ${y}`;
}

// ── OWL ────────────────────────────────────────────────
function Owl({size=64,eyeColor=C.lime,mood="happy"}) {
  const py=mood==="alert"?26:28;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <ellipse cx="40" cy="50" rx="22" ry="24" fill="#152038"/>
      <ellipse cx="40" cy="28" rx="20" ry="18" fill="#1c2d4a"/>
      <polygon points="24,14 20,4 28,12" fill="#1c2d4a"/>
      <polygon points="56,14 60,4 52,12" fill="#1c2d4a"/>
      <ellipse cx="20" cy="54" rx="9" ry="14" fill="#152038" transform="rotate(-12 20 54)"/>
      <ellipse cx="60" cy="54" rx="9" ry="14" fill="#152038" transform="rotate(12 60 54)"/>
      <ellipse cx="40" cy="55" rx="13" ry="14" fill="#1c2d4a"/>
      <path d="M33 50 Q40 53 47 50" stroke="#253858" strokeWidth="1.5" fill="none"/>
      <path d="M31 56 Q40 60 49 56" stroke="#253858" strokeWidth="1.5" fill="none"/>
      <circle cx="31" cy="27" r="9" fill="#080f1e"/>
      <circle cx="49" cy="27" r="9" fill="#080f1e"/>
      <circle cx="31" cy="27" r="9" fill="none" stroke={eyeColor} strokeWidth="2" opacity="0.6"/>
      <circle cx="49" cy="27" r="9" fill="none" stroke={eyeColor} strokeWidth="2" opacity="0.6"/>
      <circle cx="31" cy={py} r="4.5" fill={eyeColor}/>
      <circle cx="49" cy={py} r="4.5" fill={eyeColor}/>
      <circle cx="29" cy={py-1.5} r="1.5" fill="white" opacity="0.8"/>
      <circle cx="47" cy={py-1.5} r="1.5" fill="white" opacity="0.8"/>
      <polygon points="40,30 36,36 44,36" fill={eyeColor} opacity="0.9"/>
      <path d="M33 72 L30 76 M33 72 L33 76 M33 72 L36 76" stroke={C.slate} strokeWidth="2" strokeLinecap="round"/>
      <path d="M47 72 L44 76 M47 72 L47 76 M47 72 L50 76" stroke={C.slate} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

// ── RING ───────────────────────────────────────────────
function Ring({pct,color,size=72}) {
  const r=28,circ=2*Math.PI*r;
  const dash=Math.min(pct/100,1)*circ;
  const stroke=pct>90?C.danger:pct>70?C.warn:color;
  return (
    <svg width={size} height={size} viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke={C.border} strokeWidth="6"/>
      <circle cx="36" cy="36" r={r} fill="none" stroke={stroke} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 36 36)"
        style={{transition:"stroke-dasharray 0.6s cubic-bezier(.4,0,.2,1)"}}/>
      <text x="36" y="40" textAnchor="middle" fill={stroke} fontSize="11" fontWeight="800">
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

// ── PIE CHART (Safari-compatible) ─────────────────────
function PieChart({items,size=200}) {
  const total=items.reduce((s,i)=>s+i.value,0);
  if(total===0)return null;
  const pad=8; // padding so stroke doesn't get clipped
  const cx=size/2, cy=size/2;
  const r=(size/2)-pad-10;
  const inner=r*0.45;
  const strokeW=r-inner;
  const circumference=2*Math.PI*r;

  let accumulated=0;
  const slices=items.map(item=>{
    const pct=item.value/total;
    const dash=pct*circumference;
    const gap=circumference-dash;
    const offset=circumference*0.25-accumulated;
    accumulated+=dash;
    return {...item, dash, gap, offset, pct:Math.round(pct*100)};
  });

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        style={{overflow:"visible"}}>
        {/* Background */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth={strokeW}/>
        {/* Slices */}
        {slices.map((s,i)=>(
          <circle key={i} cx={cx} cy={cy} r={r}
            fill="none" stroke={s.color} strokeWidth={strokeW}
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={s.offset}
            strokeLinecap="butt"/>
        ))}
        {/* Center */}
        <circle cx={cx} cy={cy} r={inner} fill={C.card}/>
        <text x={cx} y={cy-4} textAnchor="middle" fill={C.white}
          fontSize="12" fontWeight="800" fontFamily="Inter,sans-serif">
          {fmt(total).replace("$","")}
        </text>
        <text x={cx} y={cy+10} textAnchor="middle" fill={C.slate}
          fontSize="8" fontFamily="Inter,sans-serif">total</text>
      </svg>
      {/* Legend with percentages */}
      <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem",justifyContent:"center",marginTop:"0.5rem",padding:"0 0.5rem"}}>
        {slices.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:4,
            background:C.elevated,borderRadius:8,padding:"0.2rem 0.5rem",fontSize:"0.7rem"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:s.color,flexShrink:0}}/>
            <span style={{color:C.white,fontWeight:600}}>{s.label}</span>
            <span style={{color:s.color,fontWeight:700}}>{s.pct}%</span>
            <span style={{color:C.slate}}>{fmt(s.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CATEGORY MODAL ─────────────────────────────────────
function CategoryModal({cat,expenses,onClose,onDelete,onEdit}) {
  const catExp=expenses.filter(e=>e.cat===cat.id).sort((a,b)=>b.date.localeCompare(a.date));
  const total=catExp.reduce((s,e)=>s+e.amount,0);
  const byDesc={};
  catExp.forEach(e=>{byDesc[e.desc]=(byDesc[e.desc]||0)+e.amount;});
  const pieItems=Object.entries(byDesc).map(([label,value],i)=>({
    label,value,color:[cat.color,"#7c6af7","#38bdf8","#fb7185","#34d399","#f5a623","#a78bfa"][i%7],
  }));
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:200,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}
      onClick={onClose}>
      <div style={{background:C.card,borderRadius:"20px 20px 0 0",padding:"1.5rem 1.25rem",maxHeight:"85vh",overflowY:"auto"}}
        onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem"}}>
          <div>
            <div style={{fontSize:"1.1rem",fontWeight:900,color:C.white}}>{cat.emoji} {cat.label}</div>
            <div style={{fontSize:"0.75rem",color:C.slate}}>{catExp.length} {i.expenses}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontWeight:800,color:cat.color,fontSize:"1.2rem"}}>{fmt(total)}</div>
            <button onClick={onClose}
              style={{background:C.border,border:"none",color:C.slate,borderRadius:8,padding:"0.25rem 0.6rem",fontSize:"0.75rem",cursor:"pointer",fontFamily:"inherit",marginTop:4}}>
              ✕ Cerrar
            </button>
          </div>
        </div>
        {pieItems.length>1&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:"1.25rem"}}>
            <PieChart items={pieItems} size={180}/>

          </div>
        )}
        <div style={{fontSize:"0.7rem",color:C.slate,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.6rem"}}>Todos los {i.expenses}</div>
        <div style={{display:"flex",flexDirection:"column",gap:"0.45rem"}}>
          {catExp.map(e=>(
            <div key={e.id} style={{background:C.elevated,borderRadius:11,padding:"0.65rem 0.75rem",borderLeft:`3px solid ${cat.color}`}}>
              <div style={{display:"flex",alignItems:"center",gap:"0.65rem"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:"0.85rem",color:C.white}}>{e.desc}</div>
                  {e.note&&<div style={{fontSize:"0.7rem",color:C.lime,marginTop:2}}>📝 {e.note}</div>}
                  <div style={{fontSize:"0.65rem",color:C.slate,marginTop:2}}>{fmtKey(e.date)}</div>
                </div>
                <div style={{fontWeight:700,color:C.danger,fontSize:"0.85rem",whiteSpace:"nowrap"}}>-{fmt(e.amount)}</div>
                <button onClick={()=>onEdit(e)} style={{background:"none",border:"none",color:C.lime,cursor:"pointer",fontSize:"0.85rem",padding:"0.1rem"}}>✏️</button>
                <button onClick={()=>onDelete(e.id)} style={{background:"none",border:"none",color:C.slate,cursor:"pointer",fontSize:"0.85rem",padding:"0.1rem"}}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── EDIT MODAL ─────────────────────────────────────────
function EditModal({expense,onSave,onClose}) {
  const [desc,setDesc]=useState(expense.desc);
  const [amount,setAmount]=useState(String(expense.amount));
  const [note,setNote]=useState(expense.note||"");
  const [cat,setCat]=useState(expense.cat);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"1.25rem"}}
      onClick={onClose}>
      <div style={{background:C.card,borderRadius:20,padding:"1.5rem",width:"100%",maxWidth:380,border:`1px solid ${C.border}`}}
        onClick={e=>e.stopPropagation()}>
        <div style={{fontWeight:800,fontSize:"1rem",color:C.white,marginBottom:"1.25rem"}}>✏️ Editar gasto</div>
        <select value={cat} onChange={e=>setCat(e.target.value)} style={{...INP,marginBottom:"0.75rem",cursor:"pointer"}}>
          {CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
        </select>
        <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder={i.description}
          style={{...INP,marginBottom:"0.75rem"}} autoComplete="off"/>
        <div style={{position:"relative",marginBottom:"0.75rem"}}>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:C.lime,fontWeight:800}}>$</span>
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00"
            style={{...INP,paddingLeft:"1.75rem"}}/>
        </div>
        <input value={note} onChange={e=>setNote(e.target.value)} placeholder=i.noteHint
          style={{...INP,marginBottom:"1rem"}} autoComplete="off"/>
        <div style={{display:"flex",gap:"0.5rem"}}>
          <button onClick={onClose}
            style={{flex:1,padding:"0.8rem",background:C.border,border:"none",borderRadius:12,color:C.slate,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
            Cancelar
          </button>
          <button onClick={()=>{
            const amt=parseFloat(amount);
            if(!desc.trim()||isNaN(amt)||amt<=0)return;
            onSave({...expense,desc,amount:amt,note,cat});
          }}
            style={{flex:2,padding:"0.8rem",background:C.lime,border:"none",borderRadius:12,color:C.bg,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── STORAGE ────────────────────────────────────────────
const STORAGE_KEY="et_data";
function loadData(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY));}catch{return null;}}
function saveData(data){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}catch{}}

// ── CSV EXPORT ─────────────────────────────────────────
function exportCSV(expenses) {
  const header="Fecha,Categoría,Descripción,Nota,Monto\n";
  const rows=expenses.map(e=>{
    const cat=CATEGORIES.find(c=>c.id===e.cat)||CATEGORIES[8];
    return `${fmtKey(e.date)},${cat.label},"${e.desc}","${e.note||""}",${e.amount}`;
  }).join("\n");
  const blob=new Blob([header+rows],{type:"text/csv"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url; a.download="gastos-easy-tracker.csv"; a.click();
  URL.revokeObjectURL(url);
}

// ── BACKUP & RESTORE ───────────────────────────────────
function exportBackup(expenses, income, period, budgetRule, budgetPcts, savedPeriods) {
  const data = { income, period, expenses, budgetRule, budgetPcts, savedPeriods,
    version:"1.1", exportedAt:new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `et-backup-${todayKey()}.json`; a.click();
  URL.revokeObjectURL(url);
}

// ── ADD VIEW ───────────────────────────────────────────
function AddView({form,setForm,addExpense,etMood,remColor,remaining,i,T}) {
  return (
    <div style={{padding:"1.5rem 1.25rem",paddingBottom:"6rem"}}>
      <div style={{textAlign:"center",marginBottom:"1.5rem"}}>
        <ET size={56} mood={etMood}/>
        <div style={{fontSize:"0.75rem",color:C.slate,marginTop:4}}>
          Disponible: <span style={{color:remColor,fontWeight:700}}>{fmt(remaining)}</span>
        </div>
      </div>
      <div style={{background:C.card,borderRadius:16,padding:"1.25rem",border:`1px solid ${C.border}`}}>
        <div style={{fontSize:"0.7rem",color:C.slate,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.75rem"}}>
          {i.newExpense} — {fmtKey(todayKey())}
        </div>
        <select value={form.cat} onChange={e=>setForm(f=>({...f,cat:e.target.value}))}
          style={{...INP,marginBottom:"0.75rem",cursor:"pointer"}}>
          {CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
        </select>
        <input placeholder=i.description value={form.desc}
          autoComplete="off" autoCorrect="off" spellCheck="false"
          onChange={e=>setForm(f=>({...f,desc:e.target.value}))}
          style={{...INP,marginBottom:"0.75rem"}}/>
        <input placeholder={i.noteHint} value={form.note||""}
          autoComplete="off"
          onChange={e=>setForm(f=>({...f,note:e.target.value}))}
          style={{...INP,marginBottom:"0.75rem"}}/>
        <div style={{position:"relative",marginBottom:"1rem"}}>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:C.lime,fontWeight:800}}>$</span>
          <input type="number" placeholder="0.00" value={form.amount}
            onChange={e=>setForm(f=>({...f,amount:e.target.value}))}
            onKeyDown={e=>e.key==="Enter"&&addExpense()}
            style={{...INP,paddingLeft:"1.75rem"}}/>
        </div>
        <button onClick={addExpense}
          style={{width:"100%",padding:"0.9rem",background:C.lime,border:"none",borderRadius:12,color:C.bg,fontWeight:900,fontSize:"1rem",cursor:"pointer",fontFamily:"inherit"}}>{i?.saveExpense||"Guardar gasto"}</button>
      </div>
    </div>
  );
}

// ── APP ────────────────────────────────────────────────
export default function App() {
  const saved=useMemo(()=>loadData(),[]);
  const [screen,setScreen]     = useState(saved?.income?"main":"setup");
  const [income,setIncome]     = useState(saved?.income||"");
  const [period,setPeriod]     = useState(saved?.period||"biweekly");
  const [expenses,setExpenses] = useState(saved?.expenses||[]);
  const [tab,setTab]           = useState("home");
  const [homeTab,setHomeTab]   = useState("gastos"); // "gastos" | "savings"
  const [form,setForm]         = useState({desc:"",amount:"",cat:"food",note:""});
  const [calMonth,setCalMonth] = useState(new Date());
  const [selDay,setSelDay]     = useState(null);
  const [toast,setToast]       = useState(null);
  const [selCat,setSelCat]     = useState(null);
  const [editExp,setEditExp]   = useState(null);
  const [showReset,setShowReset] = useState(false);
  const [showMenu,setShowMenu]   = useState(false);
  const [searchTerm,setSearchTerm] = useState("");
  const [goals,setGoals]           = useState(saved?.goals||[]);
  const [themeId,setThemeId]       = useState(saved?.themeId||"dark");
  const [lang,setLang]             = useState(saved?.lang||"es");
  const i = TRANSLATIONS[lang] || TRANSLATIONS.es;
  const T = THEMES[themeId] || THEMES.dark; // T = active theme colors
  const [newMonthAlert,setNewMonthAlert] = useState(false);
  const [prevMonthLabel,setPrevMonthLabel] = useState("");
  const [selMonth,setSelMonth]   = useState(null);
  const [budgetRule,setBudgetRule] = useState(saved?.budgetRule||null);
  const [budgetPcts,setBudgetPcts] = useState(saved?.budgetPcts||{needs:50,personal:30,saving:20});
  const [savedPeriods,setSavedPeriods] = useState(saved?.savedPeriods||[]);

  const totalIncome = parseFloat(income)||0;
  const totalSpent  = useMemo(()=>expenses.reduce((s,e)=>s+e.amount,0),[expenses]);
  const remaining   = totalIncome-totalSpent;
  const pct         = totalIncome>0?(totalSpent/totalIncome)*100:0;
  // ET mood based on spend %
  const etMood = pct === 0 ? "sleepy"
               : pct < 50  ? "happy"
               : pct < 70  ? "cool"
               : pct < 90  ? "sweat"
               : remaining < 0 ? "cry"
               : "sweat";
  // Keep owlEye/owlMood for backward compat
  const owlEye  = pct>90?T.danger:pct>70?T.warn:T.lime;
  const owlMood = pct>90?"alert":"happy";
  const remColor    = remaining<0?T.danger:remaining<totalIncome*0.1?T.warn:T.lime;
  const periodLabel = PERIODS.find(p=>p.id===period)?.short||"período";

  const byDate=useMemo(()=>{
    const m={};
    expenses.forEach(e=>{if(!m[e.date])m[e.date]=[];m[e.date].push(e);});
    return m;
  },[expenses]);

  const byCategory=useMemo(()=>{
    const m={};
    expenses.forEach(e=>{m[e.cat]=(m[e.cat]||0)+e.amount;});
    return m;
  },[expenses]);

  // Savings per month: income - spent that month
  // We use income as the per-period income; for simplicity map period income to monthly
  const savingsByMonth=useMemo(()=>{
    const perMonth={};
    expenses.forEach(e=>{
      const mk=monthKey(e.date);
      if(!perMonth[mk]) perMonth[mk]={spent:0,items:[]};
      perMonth[mk].spent+=e.amount;
      perMonth[mk].items.push(e);
    });
    return Object.entries(perMonth)
      .sort(([a],[b])=>b.localeCompare(a))
      .map(([ym,{spent,items}])=>({ym, spent, saved: totalIncome-spent, items}));
  },[expenses,totalIncome]);

  function persist(ni,np,ne,br,bp,sp){
    saveData({
      income:      ni!==undefined ? ni : income,
      period:      np!==undefined ? np : period,
      expenses:    ne!==undefined ? ne : expenses,
      budgetRule:  br!==undefined ? br : budgetRule,
      budgetPcts:  bp!==undefined ? bp : budgetPcts,
      savedPeriods:sp!==undefined ? sp : savedPeriods,
      themeId,
      goals,
      lang,
    });
  }

  function cycleTheme(){
    const idx = THEME_ORDER.indexOf(themeId);
    const next = THEME_ORDER[(idx+1)%THEME_ORDER.length];
    setThemeId(next);
    saveData({income,period,expenses,budgetRule,budgetPcts,savedPeriods,goals,themeId:next,lang});
    showToast(`${THEMES[next].icon} ${THEMES[next].name}`);
  }
  function persistGoals(newGoals){
    saveData({income,period,expenses,budgetRule,budgetPcts,savedPeriods,goals:newGoals});
  }

  function changeLang(newLang){
    setLang(newLang);
    saveData({income,period,expenses,budgetRule,budgetPcts,savedPeriods,goals,themeId,lang:newLang});
    const found = LANGUAGES.find(l=>l.id===newLang);
    showToast(`${found?.flag} ${found?.label}`);
  }

  function showToast(msg){setToast(msg);setTimeout(()=>setToast(null),2200);}

  function handleImportBackup(e){
    const file=e.target.files[0];
    if(!file)return;
    const reader=new FileReader();
    reader.onload=(ev)=>{
      try{
        const data=JSON.parse(ev.target.result);
        if(data.income)    setIncome(data.income);
        if(data.period)    setPeriod(data.period);
        if(data.expenses)  setExpenses(data.expenses);
        if(data.budgetRule)setBudgetRule(data.budgetRule);
        if(data.budgetPcts)setBudgetPcts(data.budgetPcts);
        if(data.savedPeriods)setSavedPeriods(data.savedPeriods);
        persist(data.income,data.period,data.expenses,data.budgetRule,data.budgetPcts,data.savedPeriods);
        showToast(i.backupRestored);
      }catch(err){
        showToast(i.backupError);
      }
    };
    reader.readAsText(file);
  }

  // Detect month change on load
  useMemo(()=>{
    if(expenses.length===0) return;
    const lastDate = expenses.reduce((a,b)=>a.date>b.date?a:b).date;
    const lastMonth = lastDate.slice(0,7); // YYYY-MM
    const nowMonth = todayKey().slice(0,7);
    if(nowMonth > lastMonth){
      const [y,m] = lastMonth.split("-");
      setPrevMonthLabel(`${MONTHS_ES[parseInt(m)-1]} ${y}`);
      setNewMonthAlert(true);
    }
  },[]);

  function addExpense(){
    const amt=parseFloat(form.amount);
    if(!form.desc.trim()||isNaN(amt)||amt<=0)return;
    const updated=[{id:Date.now(),...form,amount:amt,date:todayKey()},...expenses];
    setExpenses(updated); persist(income,period,updated);
    setForm({desc:"",amount:"",cat:form.cat,note:""});
    showToast(i.expenseSaved); setTab("home");
  }

  function delExpense(id){
    const updated=expenses.filter(e=>e.id!==id);
    setExpenses(updated); persist(income,period,updated);
    showToast(i.deleted);
  }

  function saveEdit(updated){
    const list=expenses.map(e=>e.id===updated.id?updated:e);
    setExpenses(list); persist(income,period,list);
    setEditExp(null); setSelCat(null);
    showToast(i.expenseUpdated);
  }

  function resetPeriod(){
    // Save current period to history before clearing
    if(expenses.length>0){
      const now = new Date();
      const label = `${MONTHS_ES[now.getMonth()]} ${now.getFullYear()}`;
      const periodRecord = {
        id: Date.now(),
        label,
        date: todayKey(),
        income: totalIncome,
        spent: totalSpent,
        saved: totalIncome - totalSpent,
        expenses: [...expenses],
      };
      const updatedPeriods = [periodRecord, ...savedPeriods];
      setSavedPeriods(updatedPeriods);
      setExpenses([]);
      persist(income, period, [], budgetRule, budgetPcts, updatedPeriods);
    } else {
      setExpenses([]);
      persist(income, period, []);
    }
    setShowReset(false);
    showToast(i.periodSaved);
  }

  // ── SETUP ──────────────────────────────────────────
  if(screen==="setup") return (
    <div style={{minHeight:"100svh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif",padding:"1.5rem"}}>
      <ET size={96} mood="happy"/>
      <div style={{display:"flex",alignItems:"baseline",gap:6,margin:"0.5rem 0 2px"}}>
        <span style={{fontSize:"2rem",fontWeight:900,color:T.white}}>Easy</span>
        <span style={{fontSize:"2rem",fontWeight:900,color:T.lime}}>Tracker</span>
      </div>
      <p style={{color:T.slate,fontSize:"0.75rem",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"2rem"}}>ET · Tu dinero, claro</p>
      <div style={{width:"100%",maxWidth:340,background:T.card,borderRadius:20,padding:"1.75rem 1.5rem",boxShadow:"0 32px 64px rgba(0,0,0,0.5)"}}>
        <p style={{color:T.slate,fontSize:"0.8rem",textAlign:"center",marginBottom:"0.6rem"}}>{i.howOftenPaid}</p>
        <div style={{display:"flex",gap:"0.4rem",marginBottom:"1.25rem"}}>
          {PERIODS.map(p=>(
            <button key={p.id} onClick={()=>setPeriod(p.id)}
              style={{flex:1,padding:"0.6rem 0",border:`1.5px solid ${period===p.id?T.lime:T.border}`,
                borderRadius:10,background:period===p.id?`${T.lime}18`:T.border,
                color:period===p.id?T.lime:T.slate,fontWeight:period===p.id?800:400,
                fontSize:"0.8rem",cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"}}>
              {p.label}
            </button>
          ))}
        </div>
        <p style={{color:T.slate,fontSize:"0.8rem",textAlign:"center",marginBottom:"0.6rem"}}>
          {i.howMuchPerPeriod} {PERIODS.find(p=>p.id===period)?.short}?
        </p>
        <div style={{position:"relative",marginBottom:"1rem"}}>
          <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:T.lime,fontWeight:800,fontSize:"1.1rem"}}>$</span>
          <input type="number" placeholder="0.00" value={income}
            onChange={e=>setIncome(e.target.value)} autoFocus
            style={{...INP,paddingLeft:"2.2rem",fontSize:"1.4rem",fontWeight:800,textAlign:"center",border:`1.5px solid ${T.lime}40`}}/>
        </div>
        <button onClick={()=>{if(income){persist(income,period,expenses);setScreen("main");}}}
          style={{width:"100%",padding:"0.9rem",background:T.lime,border:"none",borderRadius:12,color:T.bg,fontWeight:900,fontSize:"1rem",cursor:"pointer",fontFamily:"inherit"}}>
          {saved?.income?i.saveChanges:i.start}
        </button>
      </div>
    </div>
  );

  // ── HOME ───────────────────────────────────────────
  function HomeView() {
    return (
      <div style={{paddingBottom:"6rem"}}>
        {/* Header */}
        <div style={{background:T.card,padding:"1.25rem 1.25rem 1rem",borderBottom:`1px solid ${T.border}`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <ET size={38} mood={etMood}/>
              <div>
                <div style={{fontSize:"0.6rem",color:T.slate,letterSpacing:"0.1em",textTransform:"uppercase"}}>Easy Tracker</div>
                <div style={{fontSize:"0.95rem",fontWeight:900,color:T.lime}}>ET</div>
              </div>
            </div>
            <button onClick={()=>setShowMenu(true)}
              style={{background:T.border,border:"none",color:T.white,borderRadius:10,
                padding:"0.4rem 0.65rem",cursor:"pointer",fontFamily:"inherit",
                display:"flex",flexDirection:"column",gap:"4px",alignItems:"center",justifyContent:"center"}}>
              <div style={{width:18,height:2,background:T.white,borderRadius:2}}/>
              <div style={{width:18,height:2,background:T.white,borderRadius:2}}/>
              <div style={{width:18,height:2,background:T.white,borderRadius:2}}/>
            </button>
          </div>
          <div style={{textAlign:"center",marginBottom:"1rem"}}>
            <div style={{fontSize:"0.65rem",color:T.slate,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>
              Disponible esta {periodLabel}
            </div>
            <div style={{fontSize:"2.75rem",fontWeight:900,color:remColor,letterSpacing:-1,lineHeight:1}}>{fmt(remaining)}</div>
            {savedPeriods.length>0&&(
              <div style={{marginTop:6,display:"inline-flex",alignItems:"center",gap:6,background:T.elevated,borderRadius:20,padding:"0.25rem 0.75rem"}}>
                <span style={{fontSize:"0.7rem",color:T.slate}}>💰 Ahorrado:</span>
                <span style={{fontSize:"0.8rem",fontWeight:800,color:T.lime}}>
                  {fmt(savedPeriods.reduce((s,p)=>s+(p.saved>0?p.saved:0),0))}
                </span>
              </div>
            )}
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:"0.65rem",color:T.slate,textTransform:"uppercase",marginBottom:2}}>{i.earned}</div>
              <div style={{fontWeight:700,color:T.white}}>{fmt(totalIncome)}</div>
            </div>
            <Ring pct={pct} color={T.lime} size={70}/>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:"0.65rem",color:T.slate,textTransform:"uppercase",marginBottom:2}}>{i.spent}</div>
              <div style={{fontWeight:700,color:T.danger}}>{fmt(totalSpent)}</div>
            </div>
          </div>
          <div style={{marginTop:"1rem",height:5,background:T.border,borderRadius:999,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${Math.min(pct,100)}%`,background:pct>90?T.danger:pct>70?T.warn:T.lime,borderRadius:999,transition:"width 0.5s ease"}}/>
          </div>

          {/* Sub-tabs */}
          <div style={{display:"flex",gap:"0.5rem",marginTop:"1rem"}}>
            {["gastos","savings"].map(t=>(
              <button key={t} onClick={()=>setHomeTab(t)}
                style={{flex:1,padding:"0.5rem",border:`1.5px solid ${homeTab===t?T.lime:T.border}`,
                  borderRadius:10,background:homeTab===t?`${T.lime}18`:T.elevated,
                  color:homeTab===t?T.lime:T.slate,fontWeight:homeTab===t?800:400,
                  fontSize:"0.8rem",cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"}}>
                {t==="gastos"?"📊 Gastos":"💰 Savings"}
              </button>
            ))}
          </div>
        </div>

        {/* GASTOS TAB */}
        {homeTab==="gastos"&&(
          <div style={{padding:"1rem 1.25rem"}}>
            {Object.keys(byCategory).length>0&&(
              <>
                <div style={{fontSize:"0.7rem",color:T.slate,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.6rem"}}>
                  {i.byCategory} <span style={{color:T.lime,fontWeight:400,textTransform:"none",letterSpacing:0}}>· {i.tapForDetail}</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem",marginBottom:"1.25rem"}}>
                  {CATEGORIES.filter(c=>byCategory[c.id]).map(cat=>{
                    const amt=byCategory[cat.id];
                    const cp=totalIncome>0?(amt/totalIncome)*100:0;
                    return(
                      <button key={cat.id} onClick={()=>setSelCat(cat)}
                        style={{background:T.card,borderRadius:12,padding:"0.65rem",display:"flex",alignItems:"center",gap:8,border:`1px solid ${T.border}`,cursor:"pointer",textAlign:"left",fontFamily:"inherit"}}>
                        <Ring pct={cp} color={cat.color} size={48}/>
                        <div style={{minWidth:0}}>
                          <div style={{fontSize:"0.7rem",color:T.slate}}>{cat.emoji} {cat.label}</div>
                          <div style={{fontWeight:700,color:cat.color,fontSize:"0.9rem"}}>{fmt(amt)}</div>
                          <div style={{fontSize:"0.6rem",color:T.slate}}>{expenses.filter(e=>e.cat===cat.id).length} {i.expenses}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            <div style={{fontSize:"0.7rem",color:T.slate,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.6rem"}}>
              {i.allExpenses} ({expenses.length})
            </div>
            {expenses.length>0&&(
              <input
                type="text"
                placeholder={i.search}
                value={searchTerm}
                onChange={e=>setSearchTerm(e.target.value)}
                style={{...INP,marginBottom:"0.75rem",fontSize:"0.85rem"}}/>
            )}
            {expenses.length===0?(
              <div style={{textAlign:"center",padding:"2rem 0",color:T.slate,fontSize:"0.85rem"}}>
                <ET size={56} mood="sleepy"/>
                <div style={{marginTop:"0.75rem"}}>{i.noExpenses}<br/>{i.tapToAdd}</div>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:"0.45rem"}}>
                {expenses.filter(e=>
                  e.desc.toLowerCase().includes(searchTerm.toLowerCase())||
                  (e.note&&e.note.toLowerCase().includes(searchTerm.toLowerCase()))
                ).map(e=>{
                  const cat=CATEGORIES.find(c=>c.id===e.cat)||CATEGORIES[8];
                  return(
                    <div key={e.id} style={{background:T.card,borderRadius:11,padding:"0.65rem 0.75rem",borderLeft:`3px solid ${cat.color}`}}>
                      <div style={{display:"flex",alignItems:"center",gap:"0.65rem"}}>
                        <span style={{fontSize:"1rem"}}>{cat.emoji}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:600,fontSize:"0.85rem",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.desc}</div>
                          {e.note&&<div style={{fontSize:"0.65rem",color:T.lime}}>📝 {e.note}</div>}
                          <div style={{fontSize:"0.65rem",color:T.slate}}>{fmtKey(e.date)} · {cat.label}</div>
                        </div>
                        <div style={{fontWeight:700,color:T.danger,fontSize:"0.85rem",whiteSpace:"nowrap"}}>-{fmt(e.amount)}</div>
                        <button onClick={()=>setEditExp(e)} style={{background:"none",border:"none",color:T.lime,cursor:"pointer",fontSize:"0.8rem",padding:"0.1rem"}}>✏️</button>
                        <button onClick={()=>delExpense(e.id)} style={{background:"none",border:"none",color:T.slate,cursor:"pointer",fontSize:"0.85rem",padding:"0.1rem"}}>✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SAVINGS TAB */}
        {homeTab==="savings"&&(
          <div style={{padding:"1rem 1.25rem"}}>
            {/* Accumulated savings from closed periods */}
            {(()=>{
              const totalSaved = savedPeriods.reduce((s,p)=>s+(p.saved>0?p.saved:0),0);
              return (
                <div style={{background:T.card,borderRadius:16,padding:"1.25rem",border:`1px solid ${T.border}`,marginBottom:"1rem"}}>
                  <div style={{fontSize:"0.65rem",color:T.slate,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>💰 Ahorro acumulado total</div>
                  <div style={{fontSize:"2rem",fontWeight:900,color:totalSaved>0?T.lime:T.slate}}>
                    {fmt(totalSaved)}
                  </div>
                  <div style={{fontSize:"0.7rem",color:T.slate,marginTop:4}}>
                    De {savedPeriods.length} {savedPeriods.length!==1?i.periodsPlural:i.fromPeriods} cerrado{savedPeriods.length!==1?"s":""}
                    {savedPeriods.length===0 && " — {i.reinitToAccumulate}"}
                  </div>
                </div>
              );
            })()}

            <div style={{fontSize:"0.7rem",color:T.slate,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.6rem"}}>
              Períodos cerrados — <span style={{color:T.lime,textTransform:"none"}}>toca para ver {i.expenses}</span>
            </div>

            {/* Current period always shown first */}
            {expenses.length>0&&(
              <>
                <div style={{fontSize:"0.7rem",color:T.lime,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.5rem"}}>
                  Período actual
                </div>
                {(()=>{
                  const isPos=remaining>=0;
                  const byCat={};
                  expenses.forEach(e=>{byCat[e.cat]=(byCat[e.cat]||0)+e.amount;});
                  const pieItems=Object.entries(byCat).map(([catId,value])=>{
                    const cat=CATEGORIES.find(c=>c.id===catId)||CATEGORIES[8];
                    return {label:cat.label,value,color:cat.color};
                  });
                  const isOpen=selMonth==="current";
                  return(
                    <div style={{background:T.card,borderRadius:12,border:`1px solid ${T.lime}40`,borderLeft:`3px solid ${isPos?T.lime:T.danger}`,overflow:"hidden",marginBottom:"1rem"}}>
                      <button onClick={()=>setSelMonth(isOpen?null:"current")}
                        style={{width:"100%",padding:"0.85rem 1rem",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.4rem"}}>
                          <div>
                            <span style={{fontWeight:700,fontSize:"0.9rem",color:T.lime}}>
                              {(()=>{const d=new Date();return `${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`;})()}
                            </span>
                            <div style={{fontSize:"0.6rem",color:T.slate}}>Ingreso: {fmt(totalIncome)}</div>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{fontWeight:800,fontSize:"0.95rem",color:isPos?T.lime:T.danger}}>
                              {isPos?"+":"-"}{fmt(Math.abs(remaining))}
                            </span>
                            <span style={{color:T.slate,fontSize:"0.8rem"}}>{isOpen?"▲":"▼"}</span>
                          </div>
                        </div>
                        <div style={{fontSize:"0.65rem",color:T.slate,display:"flex",justifyContent:"space-between"}}> 
                          <span>Gastado: <span style={{color:T.white}}>{fmt(totalSpent)}</span></span>
                          <span>{expenses.length} {i.expenses}</span>
                        </div>
                      </button>
                      {isOpen&&(
                        <div style={{borderTop:`1px solid ${T.border}`,padding:"0.75rem 1rem"}}>
                          {pieItems.length>1&&(
                            <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:"0.75rem"}}>
                              <PieChart items={pieItems} size={160}/>
                            </div>
                          )}
                          <div style={{display:"flex",flexDirection:"column",gap:"0.4rem"}}>
                            {expenses.map(e=>{
                              const cat=CATEGORIES.find(c=>c.id===e.cat)||CATEGORIES[8];
                              return(
                                <div key={e.id} style={{display:"flex",alignItems:"center",gap:"0.5rem",background:T.elevated,borderRadius:8,padding:"0.5rem 0.65rem",borderLeft:`2px solid ${cat.color}`}}>
                                  <span>{cat.emoji}</span>
                                  <div style={{flex:1,minWidth:0}}>
                                    <div style={{fontSize:"0.8rem",fontWeight:600,color:T.white,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.desc}</div>
                                    {e.note&&<div style={{fontSize:"0.65rem",color:T.lime}}>📝 {e.note}</div>}
                                    <div style={{fontSize:"0.6rem",color:T.slate}}>{fmtKey(e.date)}</div>
                                  </div>
                                  <div style={{fontWeight:700,color:T.danger,fontSize:"0.8rem",whiteSpace:"nowrap"}}>-{fmt(e.amount)}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </>
            )}

            {/* Closed periods */}
            {savedPeriods.length>0&&(
              <div style={{fontSize:"0.7rem",color:T.slate,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.5rem"}}>
                Períodos anteriores
              </div>
            )}
            {savedPeriods.length===0&&expenses.length===0?(
              <div style={{textAlign:"center",padding:"2rem 0",color:T.slate,fontSize:"0.85rem"}}>
                <div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>🔄</div>
                <div>Agrega {i.expenses} y cuando reinicies<br/>se guardarán aquí.</div>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
                {savedPeriods.map(({id,label,income:pIncome,spent,saved,expenses:pExp})=>{
                  const isPos=saved>=0;
                  const maxSpent=Math.max(...savedPeriods.map(m=>m.spent));
                  const barW=maxSpent>0?(spent/maxSpent)*100:0;
                  const isOpen=selMonth===id;
                  const ym=id; const items=pExp;
                  return(
                    <div key={ym} style={{background:T.card,borderRadius:12,border:`1px solid ${T.border}`,borderLeft:`3px solid ${isPos?T.lime:T.danger}`,overflow:"hidden"}}>
                      {/* Month header — tappable */}
                      <button onClick={()=>setSelMonth(isOpen?null:ym)}
                        style={{width:"100%",padding:"0.85rem 1rem",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.4rem"}}>
                          <div>
                            <span style={{fontWeight:700,fontSize:"0.9rem",color:T.white}}>{label}</span>
                            <div style={{fontSize:"0.6rem",color:T.slate}}>Ingreso: {fmt(pIncome)}</div>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{fontWeight:800,fontSize:"0.95rem",color:isPos?T.lime:T.danger}}>
                              {isPos?"+":"−"}{fmt(Math.abs(saved))}
                            </span>
                            <span style={{color:T.slate,fontSize:"0.8rem"}}>{isOpen?"▲":"▼"}</span>
                          </div>
                        </div>
                        <div style={{height:4,background:T.border,borderRadius:999,overflow:"hidden",marginBottom:"0.35rem"}}>
                          <div style={{height:"100%",width:`${barW}%`,background:isPos?T.lime:T.danger,borderRadius:999}}/>
                        </div>
                        <div style={{fontSize:"0.65rem",color:T.slate,display:"flex",justifyContent:"space-between"}}>
                          <span>Gastado: <span style={{color:T.white}}>{fmt(spent)}</span></span>
                          <span>{items.length} {i.expenses}</span>
                        </div>
                      </button>

                      {/* Expanded detail */}
                      {isOpen&&(
                        <div style={{borderTop:`1px solid ${T.border}`,padding:"0.75rem 1rem"}}>
                          {/* Pie chart by category */}
                          {(()=>{
                            const byCat={};
                            items.forEach(e=>{byCat[e.cat]=(byCat[e.cat]||0)+e.amount;});
                            const pieItems=Object.entries(byCat).map(([catId,value])=>{
                              const cat=CATEGORIES.find(c=>c.id===catId)||CATEGORIES[8];
                              return {label:cat.label,value,color:cat.color};
                            });
                            return pieItems.length>1?(
                              <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:"0.75rem"}}>
                                <PieChart items={pieItems} size={160}/>

                              </div>
                            ):null;
                          })()}
                          {/* Expense list */}
                          <div style={{display:"flex",flexDirection:"column",gap:"0.4rem"}}>
                            {[...items].sort((a,b)=>b.date.localeCompare(a.date)).map(e=>{
                              const cat=CATEGORIES.find(c=>c.id===e.cat)||CATEGORIES[8];
                              return(
                                <div key={e.id} style={{display:"flex",alignItems:"center",gap:"0.5rem",background:T.elevated,borderRadius:9,padding:"0.55rem 0.65rem",borderLeft:`2px solid ${cat.color}`}}>
                                  <span style={{fontSize:"0.9rem"}}>{cat.emoji}</span>
                                  <div style={{flex:1,minWidth:0}}>
                                    <div style={{fontWeight:600,fontSize:"0.8rem",color:T.white,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.desc}</div>
                                    {e.note&&<div style={{fontSize:"0.6rem",color:T.lime}}>📝 {e.note}</div>}
                                    <div style={{fontSize:"0.6rem",color:T.slate}}>{fmtKey(e.date)}</div>
                                  </div>
                                  <span style={{fontWeight:700,color:T.danger,fontSize:"0.8rem",whiteSpace:"nowrap"}}>-{fmt(e.amount)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }


  // ── BUDGET VIEW ───────────────────────────────────────
  function BudgetView() {
    const RULES = [
      { id:"50-30-20", label:"50/30/20", desc:i.needsDesc+" / "+i.personalDesc, needs:50, personal:30, saving:20 },
      { id:"70-20-10", label:"70/20/10", desc:"Para deudas o ingresos bajos",            needs:70, personal:20, saving:10 },
      { id:"60-20-20", label:"60/20/20", desc:"Equilibrada con buen ahorro",             needs:60, personal:20, saving:20 },
      { id:"80-20",    label:"80/20",    desc:"Simple — gasta 80, ahorra 20",            needs:60, personal:20, saving:20 },
      { id:"custom",   label:"Custom",   desc:"Tú decides los porcentajes",              needs:50, personal:30, saving:20 },
    ];

    const GROUPS = [
      { id:"needs",    label:i.needs, desc:i.needsDesc, color:"#fb7185" },
      { id:"personal", label:i.personal,    desc:i.personalDesc, color:"#f5a623" },
      { id:"saving",   label:i.saving,      desc:i.savingDesc,                   color:T.lime    },
    ];

    // Spent by group this period
    const NEEDS_CATS    = ["housing","transport","bills","health"];
    const PERSONAL_CATS = ["food","personal","loan","other"];
    const SAVING_CATS   = ["savings"];

    const spentNeeds    = expenses.filter(e=>NEEDS_CATS.includes(e.cat)).reduce((s,e)=>s+e.amount,0);
    const spentPersonal = expenses.filter(e=>PERSONAL_CATS.includes(e.cat)).reduce((s,e)=>s+e.amount,0);
    const spentSaving   = expenses.filter(e=>SAVING_CATS.includes(e.cat)).reduce((s,e)=>s+e.amount,0);

    const limitNeeds    = totalIncome * (budgetPcts.needs/100);
    const limitPersonal = totalIncome * (budgetPcts.personal/100);
    const limitSaving   = totalIncome * (budgetPcts.saving/100);

    const spentMap  = { needs: spentNeeds,    personal: spentPersonal,    saving: spentSaving    };
    const limitMap  = { needs: limitNeeds,     personal: limitPersonal,     saving: limitSaving     };

    function applyRule(rule) {
      const newPcts = { needs: rule.needs, personal: rule.personal, saving: rule.saving };
      setBudgetRule(rule.id);
      setBudgetPcts(newPcts);
      persist(income, period, expenses, rule.id, newPcts);
    }

    function adjustPct(key, delta) {
      const keys = ["needs","personal","saving"];
      const others = keys.filter(k=>k!==key);
      const newVal = Math.max(5, Math.min(90, budgetPcts[key]+delta));
      const diff = newVal - budgetPcts[key];
      // Distribute diff from other two equally
      const adj0 = Math.round(diff/2);
      const adj1 = diff - adj0;
      const newPcts = {
        ...budgetPcts,
        [key]: newVal,
        [others[0]]: Math.max(5, budgetPcts[others[0]]-adj0),
        [others[1]]: Math.max(5, budgetPcts[others[1]]-adj1),
      };
      // Normalize to 100
      const total = newPcts.needs + newPcts.personal + newPcts.saving;
      if(total !== 100) newPcts[others[1]] += 100-total;
      setBudgetRule("custom");
      setBudgetPcts(newPcts);
      persist(income, period, expenses, "custom", newPcts);
    }

    return (
      <div style={{padding:"1rem 1.25rem", paddingBottom:"6rem"}}>
        {/* Header */}
        <div style={{textAlign:"center", marginBottom:"1.25rem"}}>
          <div style={{fontSize:"1.1rem", fontWeight:900, color:T.white}}>🎯 Presupuesto</div>
          <div style={{fontSize:"0.75rem", color:T.slate, marginTop:2}}>{i.budget} — {fmt(totalIncome)}</div>
        </div>

        {/* Rule selector */}
        <div style={{fontSize:"0.7rem", color:T.slate, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"0.6rem"}}>
          Elige tu regla
        </div>
        <div style={{display:"flex", flexDirection:"column", gap:"0.4rem", marginBottom:"1.25rem"}}>
          {RULES.map(rule=>(
            <button key={rule.id} onClick={()=>applyRule(rule)}
              style={{padding:"0.75rem 1rem", border:`1.5px solid ${budgetRule===rule.id?T.lime:T.border}`,
                borderRadius:12, background:budgetRule===rule.id?`${T.lime}15`:T.card,
                cursor:"pointer", fontFamily:"inherit", textAlign:"left", transition:"all 0.2s"}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <span style={{fontWeight:800, fontSize:"0.95rem", color:budgetRule===rule.id?T.lime:T.white}}>{rule.label}</span>
                {budgetRule===rule.id && <span style={{color:T.lime, fontSize:"0.8rem"}}>✓ Activa</span>}
              </div>
              <div style={{fontSize:"0.7rem", color:T.slate, marginTop:2}}>{rule.desc}</div>
            </button>
          ))}
        </div>

        {/* Sliders / adjusters */}
        {budgetRule && (
          <>
            <div style={{fontSize:"0.7rem", color:T.slate, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"0.6rem"}}>
              Ajusta los porcentajes — suman {budgetPcts.needs+budgetPcts.personal+budgetPcts.saving}%
            </div>
            <div style={{display:"flex", flexDirection:"column", gap:"0.75rem", marginBottom:"1.25rem"}}>
              {GROUPS.map(g=>{
                const pct = budgetPcts[g.id];
                const limit = limitMap[g.id];
                const spent = spentMap[g.id];
                const spentPct = limit>0 ? Math.min((spent/limit)*100,100) : 0;
                const overBudget = spent > limit;
                return (
                  <div key={g.id} style={{background:T.card, borderRadius:14, padding:"1rem", border:`1px solid ${T.border}`, borderLeft:`3px solid ${g.color}`}}>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.5rem"}}>
                      <div>
                        <div style={{fontWeight:700, fontSize:"0.9rem", color:T.white}}>{g.label}</div>
                        <div style={{fontSize:"0.65rem", color:T.slate}}>{g.desc}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontWeight:900, fontSize:"1.1rem", color:g.color}}>{pct}%</div>
                        <div style={{fontSize:"0.65rem", color:T.slate}}>{fmt(limit)}</div>
                      </div>
                    </div>
                    {/* +/- buttons */}
                    <div style={{display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.6rem"}}>
                      <button onClick={()=>adjustPct(g.id,-5)}
                        style={{width:32, height:32, borderRadius:8, background:T.border, border:"none", color:T.white, fontSize:"1.1rem", cursor:"pointer", fontFamily:"inherit"}}>−</button>
                      <div style={{flex:1, height:6, background:T.border, borderRadius:999, overflow:"hidden"}}>
                        <div style={{height:"100%", width:`${pct}%`, background:g.color, borderRadius:999, transition:"width 0.3s ease"}}/>
                      </div>
                      <button onClick={()=>adjustPct(g.id,5)}
                        style={{width:32, height:32, borderRadius:8, background:T.border, border:"none", color:T.white, fontSize:"1.1rem", cursor:"pointer", fontFamily:"inherit"}}>+</button>
                    </div>
                    {/* Spent vs limit */}
                    <div style={{fontSize:"0.65rem", color:T.slate, marginBottom:"0.3rem"}}>
                      Gastado: <span style={{color:overBudget?T.danger:T.white, fontWeight:600}}>{fmt(spent)}</span>
                      {" / "}<span style={{color:g.color}}>{fmt(limit)}</span>
                    </div>
                    <div style={{height:4, background:T.border, borderRadius:999, overflow:"hidden"}}>
                      <div style={{height:"100%", width:`${spentPct}%`, background:overBudget?T.danger:g.color, borderRadius:999, transition:"width 0.5s ease"}}/>
                    </div>
                    {overBudget && (
                      <div style={{fontSize:"0.65rem", color:T.danger, marginTop:"0.3rem", fontWeight:600}}>
                        ⚠️ Excediste por {fmt(spent-limit)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {!budgetRule && (
          <div style={{textAlign:"center", padding:"2rem 0", color:T.slate, fontSize:"0.85rem"}}>
            <div style={{fontSize:"2.5rem", marginBottom:"0.75rem"}}>🎯</div>
            {i.noRuleSelected}
          </div>
        )}
      </div>
    );
  }

  // ── CALENDAR ──────────────────────────────────────────
  function CalendarView() {
    const year=calMonth.getFullYear(),month=calMonth.getMonth();
    const firstDay=new Date(year,month,1).getDay();
    const daysInMonth=new Date(year,month+1,0).getDate();
    const cells=[];
    for(let i=0;i<firstDay;i++)cells.push(null);
    for(let d=1;d<=daysInMonth;d++)cells.push(d);
    const todayStr=todayKey();
    return(
      <div style={{padding:"1rem 1.25rem",paddingBottom:"6rem"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem"}}>
          <button onClick={()=>setCalMonth(new Date(year,month-1,1))}
            style={{background:T.card,border:`1px solid ${T.border}`,color:T.white,borderRadius:8,padding:"0.4rem 0.75rem",cursor:"pointer",fontSize:"1rem"}}>‹</button>
          <span style={{fontWeight:800,fontSize:"1rem",color:T.white}}>{MONTHS_ES[month]} {year}</span>
          <button onClick={()=>setCalMonth(new Date(year,month+1,1))}
            style={{background:T.card,border:`1px solid ${T.border}`,color:T.white,borderRadius:8,padding:"0.4rem 0.75rem",cursor:"pointer",fontSize:"1rem"}}>›</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:"0.4rem"}}>
          {DAYS_ES.map(d=>(
            <div key={d} style={{textAlign:"center",fontSize:"0.65rem",color:T.slate,fontWeight:700,padding:"0.3rem 0"}}>{d}</div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"0.25rem"}}>
          {cells.map((d,i)=>{
            if(!d)return<div key={`e${i}`}/>;
            const key=`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
            const hasExp=!!byDate[key];
            const dayTotal=hasExp?byDate[key].reduce((s,e)=>s+e.amount,0):0;
            const isToday=key===todayStr, isSel=key===selDay;
            return(
              <button key={key} onClick={()=>setSelDay(isSel?null:key)}
                style={{background:isSel?T.lime:hasExp?T.elevated:T.card,
                  border:isToday?`2px solid ${T.lime}`:`1px solid ${T.border}`,
                  borderRadius:10,padding:"0.4rem 0.2rem",cursor:hasExp?"pointer":"default",
                  display:"flex",flexDirection:"column",alignItems:"center",gap:1,minHeight:44,transition:"background 0.2s"}}>
                <span style={{fontSize:"0.85rem",fontWeight:isToday?900:600,color:isSel?T.bg:isToday?T.lime:T.white}}>{d}</span>
                {hasExp&&<span style={{fontSize:"0.55rem",color:isSel?T.bg:T.danger,fontWeight:700}}>-{fmt(dayTotal).replace("$","")}</span>}
                {hasExp&&<div style={{width:4,height:4,borderRadius:"50%",background:isSel?T.bg:T.lime}}/>}
              </button>
            );
          })}
        </div>
        {selDay&&byDate[selDay]&&(
          <div style={{marginTop:"1.25rem",background:T.card,borderRadius:16,padding:"1.25rem",border:`1px solid ${T.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.75rem"}}>
              <div>
                <div style={{fontSize:"0.7rem",color:T.slate,textTransform:"uppercase",letterSpacing:"0.06em"}}>{fmtKeyLong(selDay)}</div>
                <div style={{fontWeight:800,color:T.danger,fontSize:"1.1rem"}}>-{fmt(byDate[selDay].reduce((s,e)=>s+e.amount,0))}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:"0.7rem",color:T.slate}}>{i.allExpenses}</div>
                <div style={{fontWeight:700,color:T.white}}>{byDate[selDay].length}</div>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
              {byDate[selDay].map(e=>{
                const cat=CATEGORIES.find(c=>c.id===e.cat)||CATEGORIES[8];
                return(
                  <div key={e.id} style={{background:T.elevated,borderRadius:10,padding:"0.65rem 0.75rem",borderLeft:`3px solid ${cat.color}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
                      <span style={{fontSize:"1.1rem"}}>{cat.emoji}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:600,fontSize:"0.85rem",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.desc}</div>
                        {e.note&&<div style={{fontSize:"0.65rem",color:T.lime}}>📝 {e.note}</div>}
                        <div style={{fontSize:"0.7rem",color:T.slate}}>{cat.label}</div>
                      </div>
                      <div style={{fontWeight:700,color:T.danger,fontSize:"0.9rem",whiteSpace:"nowrap"}}>-{fmt(e.amount)}</div>
                      <button onClick={()=>setEditExp(e)} style={{background:"none",border:"none",color:T.lime,cursor:"pointer",fontSize:"0.85rem",padding:"0.2rem"}}>✏️</button>
                      <button onClick={()=>delExpense(e.id)} style={{background:"none",border:"none",color:T.slate,cursor:"pointer",fontSize:"0.9rem",padding:"0.2rem"}}>✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{marginTop:"0.75rem",padding:"0.6rem 0.75rem",background:T.elevated,borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:"0.75rem",color:T.slate}}>{i.remaining}</span>
              <span style={{fontWeight:800,color:remColor,fontSize:"0.95rem"}}>{fmt(remaining)}</span>
            </div>
          </div>
        )}
        {selDay&&!byDate[selDay]&&(
          <div style={{marginTop:"1.25rem",background:T.card,borderRadius:16,padding:"1.5rem",textAlign:"center",color:T.slate,fontSize:"0.85rem"}}>
            Sin {i.expenses} registrados ese día.
          </div>
        )}
      </div>
    );
  }

  const navItems=[
    {id:"home",     icon:"📊", label:i.home},
    {id:"calendar", icon:"📅", label:i.history},
    {id:"goals",    icon:"🏆", label:i.goals},
    {id:"budget",   icon:"🎯", label:i.budget},
  ];

  return(
    <div style={{minHeight:"100svh",background:T.bg,fontFamily:"'Inter',sans-serif",color:T.white,maxWidth:480,margin:"0 auto",position:"relative"}}>

      {toast&&(
        <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:T.lime,color:T.bg,padding:"0.5rem 1.25rem",borderRadius:999,fontWeight:700,fontSize:"0.85rem",zIndex:999,whiteSpace:"nowrap",boxShadow:`0 8px 24px rgba(200,241,53,0.3)`}}>
          {toast}
        </div>
      )}

      {/* New month alert */}
      {newMonthAlert&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:"1.25rem"}}>
          <div style={{background:T.card,borderRadius:20,padding:"1.5rem",width:"100%",maxWidth:340,border:`1px solid ${T.lime}40`,textAlign:"center"}}>
            <ET size={72} mood="cool"/>
            <div style={{fontWeight:900,color:T.lime,fontSize:"1.1rem",marginTop:"0.75rem",marginBottom:"0.25rem"}}>
              ¡Nuevo mes!
            </div>
            <div style={{fontSize:"0.85rem",color:T.slate,marginBottom:"1rem"}}>
              {i.closeMonth} <span style={{color:T.white,fontWeight:700}}>{prevMonthLabel}</span> {i.andSave}
            </div>
            <div style={{background:T.elevated,borderRadius:12,padding:"0.75rem",marginBottom:"1.25rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.3rem"}}>
                <span style={{fontSize:"0.75rem",color:T.slate}}>{i.spent}</span>
                <span style={{fontSize:"0.75rem",color:T.danger,fontWeight:700}}>{fmt(totalSpent)}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:"0.75rem",color:T.slate}}>{i.remaining}</span>
                <span style={{fontSize:"0.75rem",color:remaining>=0?T.lime:T.danger,fontWeight:700}}>{fmt(Math.abs(remaining))}</span>
              </div>
            </div>
            <div style={{display:"flex",gap:"0.5rem"}}>
              <button onClick={()=>setNewMonthAlert(false)}
                style={{flex:1,padding:"0.8rem",background:T.border,border:"none",borderRadius:12,color:T.slate,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                Después
              </button>
              <button onClick={()=>{
                if(expenses.length>0){
                  const periodRecord={
                    id:Date.now(),
                    label:prevMonthLabel,
                    date:todayKey(),
                    income:totalIncome,
                    spent:totalSpent,
                    saved:totalIncome-totalSpent,
                    expenses:[...expenses],
                  };
                  const updatedPeriods=[periodRecord,...savedPeriods];
                  setSavedPeriods(updatedPeriods);
                  setExpenses([]);
                  persist(income,period,[],budgetRule,budgetPcts,updatedPeriods);
                }
                setNewMonthAlert(false);
                showToast(`${prevMonthLabel} ${i.monthSaved}`);
              }}
                style={{flex:2,padding:"0.8rem",background:T.lime,border:"none",borderRadius:12,color:T.bg,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>
                Cerrar y guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-in menu from right */}
      {showMenu&&(
        <div style={{position:"fixed",inset:0,zIndex:500,display:"flex"}}
          onClick={()=>setShowMenu(false)}>
          {/* Dark overlay */}
          <div style={{flex:1,background:"rgba(0,0,0,0.6)"}}/>
          {/* Menu panel */}
          <div style={{width:260,background:T.card,height:"100%",padding:"0",
            boxShadow:"-8px 0 32px rgba(0,0,0,0.5)",display:"flex",flexDirection:"column"}}
            onClick={e=>e.stopPropagation()}>
            
            {/* Menu header */}
            <div style={{padding:"1.5rem 1.25rem 1rem",borderBottom:`1px solid ${T.border}`,
              display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontWeight:900,color:T.white,fontSize:"1rem"}}>Easy Tracker</div>
                <div style={{fontSize:"0.7rem",color:T.slate}}>ET · Tu dinero, claro</div>
              </div>
              <button onClick={()=>setShowMenu(false)}
                style={{background:T.border,border:"none",color:T.slate,borderRadius:8,
                  padding:"0.35rem 0.6rem",cursor:"pointer",fontFamily:"inherit",fontSize:"1rem"}}>
                ✕
              </button>
            </div>

            {/* Menu items */}
            <div style={{flex:1,overflowY:"auto",padding:"0.75rem 0"}}>
              
              {/* Theme */}
              <div style={{padding:"0.25rem 1.25rem 0.5rem"}}>
                <div style={{fontSize:"0.65rem",color:T.slate,textTransform:"uppercase",
                  letterSpacing:"0.08em",marginBottom:"0.5rem"}}>{i.appearance}</div>
                <button onClick={()=>{cycleTheme();}}
                  style={{width:"100%",padding:"0.85rem 1rem",background:T.elevated,
                    border:`1px solid ${T.border}`,borderRadius:12,cursor:"pointer",
                    fontFamily:"inherit",display:"flex",alignItems:"center",gap:12,textAlign:"left"}}>
                  <span style={{fontSize:"1.3rem"}}>{THEMES[themeId].icon}</span>
                  <div>
                    <div style={{fontWeight:700,color:T.white,fontSize:"0.9rem"}}>{i.theme}: {THEMES[themeId].name}</div>
                    <div style={{fontSize:"0.7rem",color:T.slate}}>{i.tapToChange}</div>
                  </div>
                </button>
              </div>

              <div style={{height:1,background:T.border,margin:"0.5rem 1.25rem"}}/>

              {/* Data options */}
              <div style={{padding:"0.25rem 1.25rem 0.5rem"}}>
                <div style={{fontSize:"0.65rem",color:T.slate,textTransform:"uppercase",
                  letterSpacing:"0.08em",marginBottom:"0.5rem"}}>{i.data}</div>
                <div style={{display:"flex",flexDirection:"column",gap:"0.4rem"}}>
                  
                  <button onClick={()=>{exportCSV(expenses);setShowMenu(false);}}
                    style={{width:"100%",padding:"0.85rem 1rem",background:T.elevated,
                      border:`1px solid ${T.border}`,borderRadius:12,cursor:"pointer",
                      fontFamily:"inherit",display:"flex",alignItems:"center",gap:12,textAlign:"left"}}>
                    <span style={{fontSize:"1.2rem"}}>📥</span>
                    <div>
                      <div style={{fontWeight:700,color:T.white,fontSize:"0.9rem"}}>{i.exportCSV}</div>
                      <div style={{fontSize:"0.7rem",color:T.slate}}>{i.downloadExpenses}</div>
                    </div>
                  </button>

                  <button onClick={()=>{exportBackup(expenses,income,period,budgetRule,budgetPcts,savedPeriods);setShowMenu(false);}}
                    style={{width:"100%",padding:"0.85rem 1rem",background:T.elevated,
                      border:`1px solid ${T.border}`,borderRadius:12,cursor:"pointer",
                      fontFamily:"inherit",display:"flex",alignItems:"center",gap:12,textAlign:"left"}}>
                    <span style={{fontSize:"1.2rem"}}>💾</span>
                    <div>
                      <div style={{fontWeight:700,color:T.white,fontSize:"0.9rem"}}>{i.backup}</div>
                      <div style={{fontSize:"0.7rem",color:T.slate}}>{i.saveBackup}</div>
                    </div>
                  </button>

                  <label style={{width:"100%",padding:"0.85rem 1rem",background:T.elevated,
                    border:`1px solid ${T.border}`,borderRadius:12,cursor:"pointer",
                    display:"flex",alignItems:"center",gap:12}}>
                    <span style={{fontSize:"1.2rem"}}>📂</span>
                    <div>
                      <div style={{fontWeight:700,color:T.white,fontSize:"0.9rem"}}>{i.restore}</div>
                      <div style={{fontSize:"0.7rem",color:T.slate}}>{i.importBackup}</div>
                    </div>
                    <input type="file" accept=".json" onChange={(e)=>{handleImportBackup(e);setShowMenu(false);}} style={{display:"none"}}/>
                  </label>
                </div>
              </div>

              <div style={{height:1,background:T.border,margin:"0.5rem 1.25rem"}}/>

              {/* Language */}
              <div style={{padding:"0.25rem 1.25rem 0.5rem"}}>
                <div style={{fontSize:"0.65rem",color:T.slate,textTransform:"uppercase",
                  letterSpacing:"0.08em",marginBottom:"0.5rem"}}>{i.language}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
                  {LANGUAGES.map(l=>(
                    <button key={l.id} onClick={()=>changeLang(l.id)}
                      style={{padding:"0.5rem 0.75rem",borderRadius:10,fontFamily:"inherit",
                        cursor:"pointer",fontSize:"0.8rem",fontWeight:lang===l.id?800:400,
                        background:lang===l.id?T.lime:T.elevated,
                        color:lang===l.id?T.bg:T.white,
                        border:`1px solid ${lang===l.id?T.lime:T.border}`}}>
                      {l.flag} {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{height:1,background:T.border,margin:"0.5rem 1.25rem"}}/>

              {/* Settings */}
              <div style={{padding:"0.25rem 1.25rem 0.5rem"}}>
                <div style={{fontSize:"0.65rem",color:T.slate,textTransform:"uppercase",
                  letterSpacing:"0.08em",marginBottom:"0.5rem"}}>{i.settings}</div>
                <div style={{display:"flex",flexDirection:"column",gap:"0.4rem"}}>

                  <button onClick={()=>{setScreen("setup");setShowMenu(false);}}
                    style={{width:"100%",padding:"0.85rem 1rem",background:T.elevated,
                      border:`1px solid ${T.border}`,borderRadius:12,cursor:"pointer",
                      fontFamily:"inherit",display:"flex",alignItems:"center",gap:12,textAlign:"left"}}>
                    <span style={{fontSize:"1.2rem"}}>✏️</span>
                    <div>
                      <div style={{fontWeight:700,color:T.white,fontSize:"0.9rem"}}>{i.editIncome}</div>
                      <div style={{fontSize:"0.7rem",color:T.slate}}>{i.changeAmount}</div>
                    </div>
                  </button>

                  <button onClick={()=>{setShowReset(true);setShowMenu(false);}}
                    style={{width:"100%",padding:"0.85rem 1rem",background:T.elevated,
                      border:`1px solid ${T.border}`,borderRadius:12,cursor:"pointer",
                      fontFamily:"inherit",display:"flex",alignItems:"center",gap:12,textAlign:"left"}}>
                    <span style={{fontSize:"1.2rem"}}>🔄</span>
                    <div>
                      <div style={{fontWeight:700,color:T.white,fontSize:"0.9rem"}}>{i.resetPeriod}</div>
                      <div style={{fontSize:"0.7rem",color:T.slate}}>{i.closeAndStart}</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{padding:"1rem 1.25rem",borderTop:`1px solid ${T.border}`,
              textAlign:"center",fontSize:"0.7rem",color:T.slate}}>
              ET v1.2 · Easy Tracker 🦉
            </div>
          </div>
        </div>
      )}

      {/* Reset confirm */}}}
      {showReset&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"1.25rem"}}>
          <div style={{background:T.card,borderRadius:20,padding:"1.5rem",width:"100%",maxWidth:340,border:`1px solid ${T.border}`,textAlign:"center"}}>
            <div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>🔄</div>
            <div style={{fontWeight:800,color:T.white,marginBottom:"0.5rem"}}>¿Reiniciar período?</div>
            <div style={{fontSize:"0.8rem",color:T.slate,marginBottom:"1.25rem"}}>{i.resetDesc}</div>
            <div style={{display:"flex",gap:"0.5rem"}}>
              <button onClick={()=>setShowReset(false)}
                style={{flex:1,padding:"0.8rem",background:T.border,border:"none",borderRadius:12,color:T.slate,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                Cancelar
              </button>
              <button onClick={resetPeriod}
                style={{flex:1,padding:"0.8rem",background:T.danger,border:"none",borderRadius:12,color:T.white,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>
                Sí, reiniciar
              </button>
            </div>
          </div>
        </div>
      )}

      {selCat&&(
        <CategoryModal cat={selCat} expenses={expenses}
          onClose={()=>setSelCat(null)}
          onDelete={(id)=>{delExpense(id);}}
          onEdit={(e)=>setEditExp(e)}/>
      )}

      {editExp&&(
        <EditModal expense={editExp} onSave={saveEdit} onClose={()=>setEditExp(null)}/>
      )}

      <div style={{paddingBottom:70}}>
        {tab==="home"     && <HomeView/>}
        {tab==="budget"   && <BudgetView/>}
        {tab==="goals"    && <GoalView
          savedPeriods={savedPeriods}
          showToast={showToast}
          persistGoals={persistGoals}
          goals={goals}
          setGoals={setGoals}
          theme={T}/>}
        {tab==="calendar" && <CalendarView/>}
        {tab==="add"      && (
          <AddView form={form} setForm={setForm} addExpense={addExpense}
            etMood={etMood} remColor={remColor} remaining={remaining} i={i} T={T}/>
        )}
      </div>

      {/* Floating + button */}
      {tab!=="add"&&(
        <button onClick={()=>setTab("add")}
          style={{position:"fixed",bottom:80,right:20,width:58,height:58,
            borderRadius:"50%",background:T.lime,color:T.bg,fontSize:"1.8rem",
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:"0 10px 30px rgba(200,241,53,0.4)",
            border:"none",zIndex:150,cursor:"pointer",fontFamily:"inherit",
            maxWidth:"calc(50vw + 220px)"}}>
          ＋
        </button>
      )}

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:T.card,borderTop:`1px solid ${T.border}`,display:"flex",zIndex:100}}>
        {navItems.map(item=>{
          const active=tab===item.id, isAdd=item.id==="add";
          return(
            <button key={item.id} onClick={()=>setTab(item.id)}
              style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                padding:isAdd?"0.5rem 0":"0.6rem 0",
                background:isAdd?(active?T.lime:`${T.lime}15`):"none",
                border:"none",cursor:"pointer",gap:2,
                borderTop:isAdd&&active?`2px solid ${T.lime}`:"2px solid transparent"}}>
              <span style={{fontSize:isAdd?"1.4rem":"1.1rem",color:active?(isAdd?T.bg:T.lime):T.slate,lineHeight:1}}>{item.icon}</span>
              <span style={{fontSize:"0.6rem",color:active?(isAdd?T.bg:T.lime):T.slate,fontWeight:active?700:400}}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
