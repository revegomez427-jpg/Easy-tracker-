import { useState, useMemo } from "react";
import ET from "./components/ET.jsx";
import AddView from "./components/AddView.jsx";
import HomeView from "./views/HomeView.jsx";
import CalendarView from "./views/CalendarView.jsx";
import BudgetView from "./views/BudgetView.jsx";
import GoalView from "./GoalView.jsx";
import TrendsView from "./TrendsView.jsx";
import { THEMES, THEME_ORDER } from "./themes.js";
import { LANGUAGES, T as TRANSLATIONS } from "./i18n.js";
import { CATEGORIES, PERIODS, STORAGE_KEY } from "./constants.js";
import { fmt, todayKey, loadData, saveData, exportCSV, exportBackup } from "./utils.js";

const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

export default function App() {
  const saved = useMemo(()=>loadData(),[]);

  const [screen,setScreen]           = useState(saved?.income?"main":"setup");
  const [income,setIncome]           = useState(saved?.income||"");
  const [period,setPeriod]           = useState(saved?.period||"biweekly");
  const [expenses,setExpenses]       = useState(saved?.expenses||[]);
  const [tab,setTab]                 = useState("home");
  const [form,setForm]               = useState({desc:"",amount:"",cat:"food",note:""});
  const [toast,setToast]             = useState(null);
  const [selCat,setSelCat]           = useState(null);
  const [editExp,setEditExp]         = useState(null);
  const [showReset,setShowReset]     = useState(false);
  const [showMenu,setShowMenu]       = useState(false);
  const [goals,setGoals]             = useState(saved?.goals||[]);
  const [savedPeriods,setSavedPeriods] = useState(saved?.savedPeriods||[]);
  const [budgetRule,setBudgetRule]   = useState(saved?.budgetRule||null);
  const [budgetPcts,setBudgetPcts]   = useState(saved?.budgetPcts||{needs:50,personal:30,saving:20});
  const [themeId,setThemeId]         = useState(saved?.themeId||"dark");
  const [lang,setLang]               = useState(saved?.lang||"es");
  const [newMonthAlert,setNewMonthAlert] = useState(false);
  const [prevMonthLabel,setPrevMonthLabel] = useState("");

  const T  = THEMES[themeId] || THEMES.dark;
  const i  = TRANSLATIONS[lang] || TRANSLATIONS.es;

  const DINP = {
    width:"100%", padding:"0.8rem 1rem",
    background: T.isLight ? "#F5E6F0" : T.border,
    border:`1.5px solid ${T.border}`,
    borderRadius:12, color:T.white, fontSize:"0.95rem",
    outline:"none", boxSizing:"border-box", fontFamily:"inherit",
  };

  const totalIncome = parseFloat(income)||0;
  const totalSpent  = useMemo(()=>expenses.reduce((s,e)=>s+e.amount,0),[expenses]);
  const remaining   = totalIncome-totalSpent;
  const pct         = totalIncome>0?(totalSpent/totalIncome)*100:0;
  const etMood      = pct===0?"sleepy":pct<50?"happy":pct<70?"cool":pct<90?"sweat":remaining<0?"cry":"sweat";
  const remColor    = remaining<0?T.danger:remaining<totalIncome*0.1?T.warn:T.lime;
  const periodObj   = PERIODS.find(p=>p.id===period);
  const periodLabel = i[periodObj?.shortKey]||periodObj?.short||"período";

  const byCategory = useMemo(()=>{
    const m={};
    expenses.forEach(e=>{m[e.cat]=(m[e.cat]||0)+e.amount;});
    return m;
  },[expenses]);

  // Detect new month on load
  useMemo(()=>{
    if(expenses.length===0)return;
    const lastDate=expenses.reduce((a,b)=>a.date>b.date?a:b).date;
    const lastMonth=lastDate.slice(0,7);
    const nowMonth=todayKey().slice(0,7);
    if(nowMonth>lastMonth){
      const [y,m]=lastMonth.split("-");
      setPrevMonthLabel(`${MONTHS_ES[parseInt(m)-1]} ${y}`);
      setNewMonthAlert(true);
    }
  },[]);

  function persist(ni,np,ne,br,bp,sp){
    saveData({
      income:      ni!==undefined?ni:income,
      period:      np!==undefined?np:period,
      expenses:    ne!==undefined?ne:expenses,
      budgetRule:  br!==undefined?br:budgetRule,
      budgetPcts:  bp!==undefined?bp:budgetPcts,
      savedPeriods:sp!==undefined?sp:savedPeriods,
      themeId, goals, lang,
    });
  }

  function showToast(msg){setToast(msg);setTimeout(()=>setToast(null),2200);}

  function changeLang(newLang){
    setLang(newLang);
    saveData({income,period,expenses,budgetRule,budgetPcts,savedPeriods,goals,themeId,lang:newLang});
    const found=LANGUAGES.find(l=>l.id===newLang);
    setToast(`${found?.flag} ${found?.label}`);
    setTimeout(()=>setToast(null),2200);
  }

  function persistGoals(newGoals){
    saveData({income,period,expenses,budgetRule,budgetPcts,savedPeriods,goals:newGoals,themeId,lang});
  }

  function addExpense(){
    const amt=parseFloat(form.amount);
    if(!form.desc.trim()||isNaN(amt)||amt<=0)return;
    const updated=[{id:Date.now(),...form,amount:amt,date:todayKey()},...expenses];
    setExpenses(updated);
    persist(income,period,updated);
    setForm({desc:"",amount:"",cat:form.cat,note:""});
    showToast(i.expenseSaved||"✓ Gasto guardado");
    setTab("home");
  }

  function delExpense(id){
    const updated=expenses.filter(e=>e.id!==id);
    setExpenses(updated);
    persist(income,period,updated);
    showToast(i.deleted||"Eliminado");
  }

  function saveEdit(updated){
    const list=expenses.map(e=>e.id===updated.id?updated:e);
    setExpenses(list);
    persist(income,period,list);
    setEditExp(null);
    showToast(i.expenseUpdated||"✓ Gasto actualizado");
  }

  function resetPeriod(){
    if(expenses.length>0){
      const now=new Date();
      const label=`${MONTHS_ES[now.getMonth()]} ${now.getFullYear()}`;
      const rec={id:Date.now(),label,date:todayKey(),income:totalIncome,spent:totalSpent,saved:totalIncome-totalSpent,expenses:[...expenses]};
      const updatedPeriods=[rec,...savedPeriods];
      setSavedPeriods(updatedPeriods);
      setExpenses([]);
      persist(income,period,[],budgetRule,budgetPcts,updatedPeriods);
    }else{
      setExpenses([]);
      persist(income,period,[]);
    }
    setShowReset(false);
    showToast(i.periodSaved||"✓ Período guardado");
  }

  function handleImportBackup(e){
    const file=e.target.files[0];
    if(!file)return;
    const reader=new FileReader();
    reader.onload=(ev)=>{
      try{
        const data=JSON.parse(ev.target.result);
        if(data.income)setIncome(data.income);
        if(data.period)setPeriod(data.period);
        if(data.expenses)setExpenses(data.expenses);
        if(data.budgetRule)setBudgetRule(data.budgetRule);
        if(data.budgetPcts)setBudgetPcts(data.budgetPcts);
        if(data.savedPeriods)setSavedPeriods(data.savedPeriods);
        if(data.goals)setGoals(data.goals);
        saveData(data);
        showToast(i.backupRestored||"✅ Backup restaurado");
      }catch{
        showToast(i.backupError||"❌ Error al importar");
      }
    };
    reader.readAsText(file);
  }

  // ── SETUP ──────────────────────────────────────────
  if(screen==="setup") return (
    <div style={{minHeight:"100svh",background:T.bg,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif",
      color:T.white,padding:"1.5rem"}}>
      <ET size={96} mood="happy"/>
      <div style={{display:"flex",alignItems:"baseline",gap:6,margin:"0.5rem 0 2px"}}>
        <span style={{fontSize:"2rem",fontWeight:900,color:T.white}}>Easy</span>
        <span style={{fontSize:"2rem",fontWeight:900,color:T.lime}}>Tracker</span>
      </div>
      <p style={{color:T.slate,fontSize:"0.75rem",letterSpacing:"0.12em",
        textTransform:"uppercase",marginBottom:"2rem"}}>{i.appTagline||"ET · Tu dinero, claro"}</p>

      <div style={{width:"100%",maxWidth:340,background:T.card,borderRadius:20,
        padding:"1.75rem 1.5rem",boxShadow:"0 32px 64px rgba(0,0,0,0.3)"}}>
        <p style={{color:T.slate,fontSize:"0.8rem",textAlign:"center",marginBottom:"0.6rem"}}>
          {i.howOftenPaid||"¿Cada cuánto cobras?"}
        </p>
        <div style={{display:"flex",gap:"0.4rem",marginBottom:"1.25rem"}}>
          {PERIODS.map(p=>(
            <button key={p.id} onClick={()=>setPeriod(p.id)}
              style={{flex:1,padding:"0.6rem 0",
                border:`1.5px solid ${period===p.id?T.lime:T.border}`,
                borderRadius:10,background:period===p.id?`${T.lime}18`:T.border,
                color:period===p.id?T.lime:T.slate,fontWeight:period===p.id?800:400,
                fontSize:"0.8rem",cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"}}>
              {i[p.labelKey]||p.label}
            </button>
          ))}
        </div>
        <p style={{color:T.slate,fontSize:"0.8rem",textAlign:"center",marginBottom:"0.6rem"}}>
          {i.howMuchPerPeriod||"¿Cuánto cobras por"} {i[periodObj?.shortKey]||periodObj?.short}?
        </p>
        <div style={{position:"relative",marginBottom:"1rem"}}>
          <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",
            color:T.lime,fontWeight:800,fontSize:"1.1rem"}}>$</span>
          <input type="number" placeholder="0.00" value={income}
            onChange={e=>setIncome(e.target.value)} autoFocus
            style={{...DINP,paddingLeft:"2.2rem",fontSize:"1.4rem",fontWeight:800,
              textAlign:"center",border:`1.5px solid ${T.lime}40`}}/>
        </div>
        <button onClick={()=>{if(income){persist(income,period,expenses);setScreen("main");}}}
          style={{width:"100%",padding:"0.9rem",background:T.lime,border:"none",
            borderRadius:12,color:T.bg,fontWeight:900,fontSize:"1rem",
            cursor:"pointer",fontFamily:"inherit"}}>
          {saved?.income?(i.saveChanges||"Guardar cambios"):(i.start||"Comenzar →")}
        </button>
      </div>
    </div>
  );

  // ── MAIN ───────────────────────────────────────────
  const navItems=[
    {id:"home",     icon:"📊", label:i.home||"Inicio"},
    {id:"calendar", icon:"📅", label:i.history||"Historial"},
    {id:"goals",    icon:"🏆", label:i.goals||"Metas"},
    {id:"budget",   icon:"🎯", label:i.budget||"Presupuesto"},
  ];

  return (
    <div style={{minHeight:"100svh",background:T.bg,fontFamily:"'Inter',sans-serif",
      color:T.white,maxWidth:480,margin:"0 auto",position:"relative"}}>

      {/* Toast */}
      {toast&&(
        <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",
          background:T.lime,color:T.bg,padding:"0.5rem 1.25rem",borderRadius:999,
          fontWeight:700,fontSize:"0.85rem",zIndex:999,whiteSpace:"nowrap",
          boxShadow:`0 8px 24px rgba(200,241,53,0.3)`}}>
          {toast}
        </div>
      )}

      {/* New month alert */}
      {newMonthAlert&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:400,
          display:"flex",alignItems:"center",justifyContent:"center",padding:"1.25rem"}}>
          <div style={{background:T.card,borderRadius:20,padding:"1.5rem",width:"100%",
            maxWidth:340,border:`1px solid ${T.lime}40`,textAlign:"center"}}>
            <ET size={72} mood="cool"/>
            <div style={{fontWeight:900,color:T.lime,fontSize:"1.1rem",marginTop:"0.75rem",marginBottom:"0.25rem"}}>
              {i.newMonth||"¡Nuevo mes!"}
            </div>
            <div style={{fontSize:"0.85rem",color:T.slate,marginBottom:"1rem"}}>
              {i.closeMonth||"¿Cerramos"} <span style={{color:T.white,fontWeight:700}}>{prevMonthLabel}</span> {i.andSave||"y lo guardamos?"}
            </div>
            <div style={{background:T.elevated,borderRadius:12,padding:"0.75rem",marginBottom:"1.25rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.3rem"}}>
                <span style={{fontSize:"0.75rem",color:T.slate}}>{i.spent||"Gastado"}</span>
                <span style={{fontSize:"0.75rem",color:T.danger,fontWeight:700}}>{fmt(totalSpent)}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:"0.75rem",color:T.slate}}>Sobró</span>
                <span style={{fontSize:"0.75rem",color:remaining>=0?T.lime:T.danger,fontWeight:700}}>{fmt(Math.abs(remaining))}</span>
              </div>
            </div>
            <div style={{display:"flex",gap:"0.5rem"}}>
              <button onClick={()=>setNewMonthAlert(false)}
                style={{flex:1,padding:"0.8rem",background:T.border,border:"none",
                  borderRadius:12,color:T.slate,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                {i.later||"Después"}
              </button>
              <button onClick={()=>{
                if(expenses.length>0){
                  const rec={id:Date.now(),label:prevMonthLabel,date:todayKey(),
                    income:totalIncome,spent:totalSpent,saved:totalIncome-totalSpent,expenses:[...expenses]};
                  const updatedPeriods=[rec,...savedPeriods];
                  setSavedPeriods(updatedPeriods);
                  setExpenses([]);
                  persist(income,period,[],budgetRule,budgetPcts,updatedPeriods);
                }
                setNewMonthAlert(false);
                showToast(`${prevMonthLabel} ${i.monthSaved||"guardado"}`);
              }}
                style={{flex:2,padding:"0.8rem",background:T.lime,border:"none",
                  borderRadius:12,color:T.bg,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>
                {i.closeSave||"Cerrar y guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hamburger menu */}
      {showMenu&&(
        <div style={{position:"fixed",inset:0,zIndex:500,display:"flex"}}
          onClick={()=>setShowMenu(false)}>
          <div style={{flex:1,background:"rgba(0,0,0,0.6)"}}/>
          <div style={{width:260,background:T.card,height:"100%",
            boxShadow:"-8px 0 32px rgba(0,0,0,0.5)",display:"flex",flexDirection:"column"}}
            onClick={e=>e.stopPropagation()}>
            <div style={{padding:"1.5rem 1.25rem 1rem",borderBottom:`1px solid ${T.border}`,
              display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontWeight:900,color:T.white,fontSize:"1rem"}}>Easy Tracker</div>
                <div style={{fontSize:"0.7rem",color:T.slate}}>ET · Tu dinero, claro</div>
              </div>
              <button onClick={()=>setShowMenu(false)}
                style={{background:T.border,border:"none",color:T.slate,borderRadius:8,
                  padding:"0.35rem 0.6rem",cursor:"pointer",fontFamily:"inherit",fontSize:"1rem"}}>✕</button>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"0.75rem 0"}}>

              {/* Theme */}
              <div style={{padding:"0.25rem 1.25rem 0.5rem"}}>
                <div style={{fontSize:"0.65rem",color:T.slate,textTransform:"uppercase",
                  letterSpacing:"0.08em",marginBottom:"0.5rem"}}>{i.appearance||"Apariencia"}</div>
                <div style={{display:"flex",gap:"0.5rem"}}>
                  {THEME_ORDER.map(tid=>(
                    <button key={tid} onClick={()=>{
                      setThemeId(tid);
                      saveData({income,period,expenses,budgetRule,budgetPcts,savedPeriods,goals,themeId:tid,lang});
                      showToast(`${THEMES[tid].icon} ${THEMES[tid].name}`);
                      setShowMenu(false);
                    }}
                      style={{flex:1,padding:"0.85rem 0.5rem",
                        background:themeId===tid?T.lime:T.elevated,
                        border:`1.5px solid ${themeId===tid?T.lime:T.border}`,
                        borderRadius:12,cursor:"pointer",fontFamily:"inherit",
                        display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                      <span style={{fontSize:"1.5rem"}}>{THEMES[tid].icon}</span>
                      <span style={{fontSize:"0.7rem",fontWeight:700,
                        color:themeId===tid?T.bg:T.white}}>{THEMES[tid].name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{height:1,background:T.border,margin:"0.5rem 1.25rem"}}/>

              {/* Language */}
              <div style={{padding:"0.25rem 1.25rem 0.5rem"}}>
                <div style={{fontSize:"0.65rem",color:T.slate,textTransform:"uppercase",
                  letterSpacing:"0.08em",marginBottom:"0.5rem"}}>{i.language||"Idioma"}</div>
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

              {/* Data */}
              <div style={{padding:"0.25rem 1.25rem 0.5rem"}}>
                <div style={{fontSize:"0.65rem",color:T.slate,textTransform:"uppercase",
                  letterSpacing:"0.08em",marginBottom:"0.5rem"}}>{i.data||"Datos"}</div>
                <div style={{display:"flex",flexDirection:"column",gap:"0.4rem"}}>
                  <button onClick={()=>{setTab("trends");setShowMenu(false);}}
                    style={{width:"100%",padding:"0.85rem 1rem",background:T.elevated,
                      border:`1px solid ${T.border}`,borderRadius:12,cursor:"pointer",
                      fontFamily:"inherit",display:"flex",alignItems:"center",gap:12,textAlign:"left"}}>
                    <span style={{fontSize:"1.2rem"}}>📈</span>
                    <div>
                      <div style={{fontWeight:700,color:T.white,fontSize:"0.9rem"}}>Tendencias</div>
                      <div style={{fontSize:"0.7rem",color:T.slate}}>Gráficas y estadísticas</div>
                    </div>
                  </button>
                  <button onClick={()=>{exportCSV(expenses,CATEGORIES);setShowMenu(false);}}
                    style={{width:"100%",padding:"0.85rem 1rem",background:T.elevated,
                      border:`1px solid ${T.border}`,borderRadius:12,cursor:"pointer",
                      fontFamily:"inherit",display:"flex",alignItems:"center",gap:12,textAlign:"left"}}>
                    <span style={{fontSize:"1.2rem"}}>📥</span>
                    <div>
                      <div style={{fontWeight:700,color:T.white,fontSize:"0.9rem"}}>{i.exportCSV||"Exportar CSV"}</div>
                      <div style={{fontSize:"0.7rem",color:T.slate}}>{i.downloadExpenses||"Descargar gastos"}</div>
                    </div>
                  </button>
                  <button onClick={()=>{exportBackup({income,period,expenses,budgetRule,budgetPcts,savedPeriods,goals,themeId,lang});setShowMenu(false);}}
                    style={{width:"100%",padding:"0.85rem 1rem",background:T.elevated,
                      border:`1px solid ${T.border}`,borderRadius:12,cursor:"pointer",
                      fontFamily:"inherit",display:"flex",alignItems:"center",gap:12,textAlign:"left"}}>
                    <span style={{fontSize:"1.2rem"}}>💾</span>
                    <div>
                      <div style={{fontWeight:700,color:T.white,fontSize:"0.9rem"}}>{i.backup||"Backup"}</div>
                      <div style={{fontSize:"0.7rem",color:T.slate}}>{i.saveBackup||"Guardar copia"}</div>
                    </div>
                  </button>
                  <label style={{width:"100%",padding:"0.85rem 1rem",background:T.elevated,
                    border:`1px solid ${T.border}`,borderRadius:12,cursor:"pointer",
                    display:"flex",alignItems:"center",gap:12}}>
                    <span style={{fontSize:"1.2rem"}}>📂</span>
                    <div>
                      <div style={{fontWeight:700,color:T.white,fontSize:"0.9rem"}}>{i.restore||"Restaurar"}</div>
                      <div style={{fontSize:"0.7rem",color:T.slate}}>{i.importBackup||"Importar backup"}</div>
                    </div>
                    <input type="file" accept=".json"
                      onChange={(e)=>{handleImportBackup(e);setShowMenu(false);}}
                      style={{display:"none"}}/>
                  </label>
                </div>
              </div>

              <div style={{height:1,background:T.border,margin:"0.5rem 1.25rem"}}/>

              {/* Settings */}
              <div style={{padding:"0.25rem 1.25rem 0.5rem"}}>
                <div style={{fontSize:"0.65rem",color:T.slate,textTransform:"uppercase",
                  letterSpacing:"0.08em",marginBottom:"0.5rem"}}>{i.settings||"Configuración"}</div>
                <div style={{display:"flex",flexDirection:"column",gap:"0.4rem"}}>
                  <button onClick={()=>{setScreen("setup");setShowMenu(false);}}
                    style={{width:"100%",padding:"0.85rem 1rem",background:T.elevated,
                      border:`1px solid ${T.border}`,borderRadius:12,cursor:"pointer",
                      fontFamily:"inherit",display:"flex",alignItems:"center",gap:12,textAlign:"left"}}>
                    <span style={{fontSize:"1.2rem"}}>✏️</span>
                    <div>
                      <div style={{fontWeight:700,color:T.white,fontSize:"0.9rem"}}>{i.editIncome||"Editar ingreso"}</div>
                      <div style={{fontSize:"0.7rem",color:T.slate}}>{i.changeAmount||"Cambiar monto"}</div>
                    </div>
                  </button>
                  <button onClick={()=>{setShowReset(true);setShowMenu(false);}}
                    style={{width:"100%",padding:"0.85rem 1rem",background:T.elevated,
                      border:`1px solid ${T.border}`,borderRadius:12,cursor:"pointer",
                      fontFamily:"inherit",display:"flex",alignItems:"center",gap:12,textAlign:"left"}}>
                    <span style={{fontSize:"1.2rem"}}>🔄</span>
                    <div>
                      <div style={{fontWeight:700,color:T.white,fontSize:"0.9rem"}}>{i.resetPeriod||"Reiniciar período"}</div>
                      <div style={{fontSize:"0.7rem",color:T.slate}}>{i.closeAndStart||"Cerrar y empezar nuevo"}</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            <div style={{padding:"1rem 1.25rem",borderTop:`1px solid ${T.border}`,
              textAlign:"center",fontSize:"0.7rem",color:T.slate}}>
              ET v2.0 · Easy Tracker 🦉
            </div>
          </div>
        </div>
      )}

      {/* Reset confirm */}
      {showReset&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:300,
          display:"flex",alignItems:"center",justifyContent:"center",padding:"1.25rem"}}>
          <div style={{background:T.card,borderRadius:20,padding:"1.5rem",width:"100%",
            maxWidth:340,border:`1px solid ${T.border}`,textAlign:"center"}}>
            <div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>🔄</div>
            <div style={{fontWeight:800,color:T.white,marginBottom:"0.5rem"}}>
              {i.resetConfirm||"¿Reiniciar período?"}
            </div>
            <div style={{fontSize:"0.8rem",color:T.slate,marginBottom:"1.25rem"}}>
              {i.resetDesc||"Se guardarán todos los gastos antes de borrar."}
            </div>
            <div style={{display:"flex",gap:"0.5rem"}}>
              <button onClick={()=>setShowReset(false)}
                style={{flex:1,padding:"0.8rem",background:T.border,border:"none",
                  borderRadius:12,color:T.slate,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                {i.cancel||"Cancelar"}
              </button>
              <button onClick={resetPeriod}
                style={{flex:1,padding:"0.8rem",background:T.danger,border:"none",
                  borderRadius:12,color:T.white,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>
                {i.resetBtn||"Sí, reiniciar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{paddingBottom:70}}>
        {tab==="home"&&(
          <HomeView
            expenses={expenses} totalIncome={totalIncome}
            totalSpent={totalSpent} remaining={remaining}
            pct={pct} etMood={etMood} remColor={remColor}
            periodLabel={periodLabel} byCategory={byCategory}
            delExpense={delExpense} saveEdit={saveEdit}
            setScreen={setScreen} T={T} i={i} DINP={DINP}
            savedPeriods={savedPeriods}
            showMenu={showMenu} setShowMenu={setShowMenu}/>
        )}
        {tab==="calendar"&&(
          <CalendarView
            expenses={expenses} remaining={remaining}
            remColor={remColor} delExpense={delExpense}
            setEditExp={setEditExp} T={T} i={i}/>
        )}
        {tab==="budget"&&(
          <BudgetView
            expenses={expenses} totalIncome={totalIncome}
            budgetRule={budgetRule} setBudgetRule={setBudgetRule}
            budgetPcts={budgetPcts} setBudgetPcts={setBudgetPcts}
            persist={persist} T={T} i={i}/>
        )}
        {tab==="goals"&&(
          <GoalView
            savedPeriods={savedPeriods} showToast={showToast}
            persistGoals={persistGoals} goals={goals}
            setGoals={setGoals} theme={T}/>
        )}
        {tab==="trends"&&(
          <TrendsView
            savedPeriods={savedPeriods} expenses={expenses}
            income={income} C={T} i={i}/>
        )}
        {tab==="add"&&(
          <AddView
            form={form} setForm={setForm} addExpense={addExpense}
            etMood={etMood} remColor={remColor} remaining={remaining}
            i={i} T={T} DINP={DINP}/>
        )}
      </div>

      {/* Floating + button */}
      {tab!=="add"&&(
        <button onClick={()=>setTab("add")}
          style={{position:"fixed",bottom:80,right:20,width:58,height:58,
            borderRadius:"50%",background:T.lime,color:T.bg,fontSize:"1.8rem",
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:`0 10px 30px rgba(200,241,53,0.4)`,
            border:"none",zIndex:150,cursor:"pointer",fontFamily:"inherit"}}>
          ＋
        </button>
      )}

      {/* Hamburger button in top right */}
      <button onClick={()=>setShowMenu(true)}
        style={{position:"fixed",top:16,right:20,zIndex:99,
          background:T.card,border:`1px solid ${T.border}`,
          borderRadius:10,padding:"0.5rem 0.65rem",cursor:"pointer",
          display:"flex",flexDirection:"column",gap:"4px",
          alignItems:"center",justifyContent:"center"}}>
        <div style={{width:18,height:2,background:T.white,borderRadius:2}}/>
        <div style={{width:18,height:2,background:T.white,borderRadius:2}}/>
        <div style={{width:18,height:2,background:T.white,borderRadius:2}}/>
      </button>

      {/* Bottom nav */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",
        width:"100%",maxWidth:480,background:T.card,
        borderTop:`1px solid ${T.border}`,display:"flex",zIndex:100}}>
        {navItems.map(item=>{
          const active=tab===item.id;
          return(
            <button key={item.id} onClick={()=>setTab(item.id)}
              style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
                justifyContent:"center",padding:"0.6rem 0",background:"none",
                border:"none",cursor:"pointer",gap:2,
                borderTop:`2px solid ${active?T.lime:"transparent"}`}}>
              <span style={{fontSize:"1.1rem",color:active?T.lime:T.slate,lineHeight:1}}>
                {item.icon}
              </span>
              <span style={{fontSize:"0.6rem",color:active?T.lime:T.slate,fontWeight:active?700:400}}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
