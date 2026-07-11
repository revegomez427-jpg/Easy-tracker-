
import { useState, useMemo } from "react";
// ── HOME VIEW ─────────────────────────────────────────

function HomeView({
  expenses, totalIncome, totalSpent, remaining, pct,
  owlEye, etMood, remColor, periodLabel, byCategory,
  delExpense, saveEdit, setScreen, T, i, DINP,
  savedPeriods,
}) {
  const [homeTab, setHomeTab]   = useState("gastos");
  const [selCat, setSelCat]     = useState(null);
  const [editExp, setEditExp]   = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const byDate = useMemo(()=>{
    const m={};
    expenses.forEach(e=>{if(!m[e.date])m[e.date]=[];m[e.date].push(e);});
    return m;
  },[expenses]);

  // Savings by month for current period
  const savingsByMonth = useMemo(()=>{
    const perMonth={};
    expenses.forEach(e=>{
      const mk=e.date.slice(0,7);
      if(!perMonth[mk])perMonth[mk]={spent:0,items:[]};
      perMonth[mk].spent+=e.amount;
      perMonth[mk].items.push(e);
    });
    return Object.entries(perMonth)
      .sort(([a],[b])=>b.localeCompare(a))
      .map(([ym,{spent,items}])=>({ym,spent,saved:totalIncome-spent,items}));
  },[expenses,totalIncome]);

  const [selMonth, setSelMonth] = useState(null);

  const filteredExpenses = expenses.filter(e=>
    e.desc.toLowerCase().includes(searchTerm.toLowerCase())||
    (e.note&&e.note.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{paddingBottom:"6rem"}}>
      {/* Modals */}
      {selCat&&(
        <CategoryModal cat={selCat} expenses={expenses}
          onClose={()=>setSelCat(null)}
          onDelete={(id)=>delExpense(id)}
          onEdit={(e)=>setEditExp(e)}
          C={T}/>
      )}
      {editExp&&(
        <EditModal expense={editExp} onSave={saveEdit}
          onClose={()=>setEditExp(null)} C={T} i={i}/>
      )}

      {/* Header card */}
      <div style={{background:T.card,padding:"1.25rem 1.25rem 1rem",
        borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <ET size={38} mood={etMood}/>
            <div>
              <div style={{fontSize:"0.6rem",color:T.slate,letterSpacing:"0.1em",textTransform:"uppercase"}}>Easy Tracker</div>
              <div style={{fontSize:"0.95rem",fontWeight:900,color:T.lime}}>ET</div>
            </div>
          </div>
        </div>

        <div style={{textAlign:"center",marginBottom:"1rem"}}>
          <div style={{fontSize:"0.65rem",color:T.slate,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>
            {i.available} {periodLabel}
          </div>
          <div style={{fontSize:"2.75rem",fontWeight:900,color:remColor,letterSpacing:-1,lineHeight:1}}>
            {fmt(remaining)}
          </div>
          {savedPeriods.length>0&&(
            <div style={{marginTop:6,display:"inline-flex",alignItems:"center",gap:6,
              background:T.elevated,borderRadius:20,padding:"0.25rem 0.75rem"}}>
              <span style={{fontSize:"0.7rem",color:T.slate}}>💰 {i.accumulatedSaving||"Ahorrado:"}</span>
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
          <Ring pct={pct} color={T.lime} size={70} C={T}/>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:"0.65rem",color:T.slate,textTransform:"uppercase",marginBottom:2}}>{i.spent}</div>
            <div style={{fontWeight:700,color:T.danger}}>{fmt(totalSpent)}</div>
          </div>
        </div>

        <div style={{marginTop:"1rem",height:5,background:T.border,borderRadius:999,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${Math.min(pct,100)}%`,
            background:pct>90?T.danger:pct>70?T.warn:T.lime,
            borderRadius:999,transition:"width 0.5s ease"}}/>
        </div>

        {/* Sub-tabs */}
        <div style={{display:"flex",gap:"0.5rem",marginTop:"1rem"}}>
          {["gastos","savings"].map(t=>(
            <button key={t} onClick={()=>setHomeTab(t)}
              style={{flex:1,padding:"0.5rem",border:`1.5px solid ${homeTab===t?T.lime:T.border}`,
                borderRadius:10,background:homeTab===t?`${T.lime}18`:T.elevated,
                color:homeTab===t?T.lime:T.slate,fontWeight:homeTab===t?800:400,
                fontSize:"0.8rem",cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"}}>
              {t==="gastos"?(i.gastos||"📊 Gastos"):(i.savingsTab||"💰 Savings")}
            </button>
          ))}
        </div>
      </div>

      {/* GASTOS TAB */}
      {homeTab==="gastos"&&(
        <div style={{padding:"1rem 1.25rem"}}>
          {Object.keys(byCategory).length>0&&(
            <>
              <div style={{fontSize:"0.7rem",color:T.slate,textTransform:"uppercase",
                letterSpacing:"0.08em",marginBottom:"0.6rem"}}>
                {i.byCategory} · <span style={{color:T.lime,textTransform:"none"}}>{i.tapForDetail}</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem",marginBottom:"1.25rem"}}>
                {CATEGORIES.filter(c=>byCategory[c.id]).map(cat=>{
                  const amt=byCategory[cat.id];
                  const cp=totalIncome>0?(amt/totalIncome)*100:0;
                  return(
                    <button key={cat.id} onClick={()=>setSelCat(cat)}
                      style={{background:T.card,borderRadius:12,padding:"0.65rem",
                        display:"flex",alignItems:"center",gap:8,
                        border:`1px solid ${T.border}`,cursor:"pointer",
                        textAlign:"left",fontFamily:"inherit"}}>
                      <Ring pct={cp} color={cat.color} size={48} C={T}/>
                      <div style={{minWidth:0}}>
                        <div style={{fontSize:"0.7rem",color:T.slate}}>{cat.emoji} {cat.label}</div>
                        <div style={{fontWeight:700,color:cat.color,fontSize:"0.9rem"}}>{fmt(amt)}</div>
                        <div style={{fontSize:"0.6rem",color:T.slate}}>
                          {expenses.filter(e=>e.cat===cat.id).length} {i.expenses||"gastos"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div style={{fontSize:"0.7rem",color:T.slate,textTransform:"uppercase",
            letterSpacing:"0.08em",marginBottom:"0.6rem"}}>
            {i.allExpenses||"Todos los gastos"} ({expenses.length})
          </div>

          {expenses.length>0&&(
            <input type="text"
              placeholder={i.search||"🔍 Buscar..."}
              value={searchTerm}
              onChange={e=>setSearchTerm(e.target.value)}
              style={{...DINP,marginBottom:"0.75rem",fontSize:"0.85rem"}}/>
          )}

          {expenses.length===0?(
            <div style={{textAlign:"center",padding:"2rem 0",color:T.slate,fontSize:"0.85rem"}}>
              <ET size={56} mood="sleepy"/>
              <div style={{marginTop:"0.75rem"}}>
                {i.noExpenses||"Sin gastos aún."}<br/>
                {i.tapToAdd||"Toca + para agregar."}
              </div>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:"0.45rem"}}>
              {filteredExpenses.map(e=>{
                const cat=CATEGORIES.find(c=>c.id===e.cat)||CATEGORIES[8];
                return(
                  <div key={e.id} style={{background:T.card,borderRadius:11,
                    padding:"0.65rem 0.75rem",borderLeft:`3px solid ${cat.color}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:"0.65rem"}}>
                      <span style={{fontSize:"1rem"}}>{cat.emoji}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:600,fontSize:"0.85rem",color:T.white,
                          whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.desc}</div>
                        {e.note&&<div style={{fontSize:"0.65rem",color:T.lime}}>📝 {e.note}</div>}
                        <div style={{fontSize:"0.65rem",color:T.slate}}>{fmtKey(e.date)} · {cat.label}</div>
                      </div>
                      <div style={{fontWeight:700,color:T.danger,fontSize:"0.85rem",whiteSpace:"nowrap"}}>
                        -{fmt(e.amount)}
                      </div>
                      <button onClick={()=>setEditExp(e)}
                        style={{background:"none",border:"none",color:T.lime,cursor:"pointer",fontSize:"0.8rem"}}>✏️</button>
                      <button onClick={()=>delExpense(e.id)}
                        style={{background:"none",border:"none",color:T.slate,cursor:"pointer",fontSize:"0.85rem"}}>✕</button>
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
          {/* Accumulated */}
          {(()=>{
            const totalSaved=savedPeriods.reduce((s,p)=>s+(p.saved>0?p.saved:0),0);
            return(
              <div style={{background:T.card,borderRadius:16,padding:"1.25rem",
                border:`1px solid ${T.border}`,marginBottom:"1rem"}}>
                <div style={{fontSize:"0.65rem",color:T.slate,textTransform:"uppercase",
                  letterSpacing:"0.1em",marginBottom:4}}>💰 {i.totalSaved||"Ahorro acumulado"}</div>
                <div style={{fontSize:"2rem",fontWeight:900,color:totalSaved>0?T.lime:T.slate}}>
                  {fmt(totalSaved)}
                </div>
                <div style={{fontSize:"0.7rem",color:T.slate,marginTop:4}}>
                  {savedPeriods.length} {i.periodsPlural||"períodos"} cerrados
                  {savedPeriods.length===0&&` — ${i.reinitToAccumulate||"reinicia para acumular"}`}
                </div>
              </div>
            );
          })()}

          {/* Periods list */}
          {savedPeriods.length>0&&(
            <div style={{fontSize:"0.7rem",color:T.slate,textTransform:"uppercase",
              letterSpacing:"0.08em",marginBottom:"0.5rem"}}>
              {i.previousPeriods||"Períodos anteriores"}
            </div>
          )}
          {savedPeriods.length===0&&expenses.length===0?(
            <div style={{textAlign:"center",padding:"2rem 0",color:T.slate,fontSize:"0.85rem"}}>
              <div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>🔄</div>
              {i.noPeriods||"Agrega gastos y reinicia para guardar aquí."}
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
              {savedPeriods.map(({id,label,income:pIncome,spent,saved,expenses:pExp})=>{
                const isPos=saved>=0;
                const maxSpent=Math.max(...savedPeriods.map(m=>m.spent),1);
                const barW=maxSpent>0?(spent/maxSpent)*100:0;
                const isOpen=selMonth===id;
                const byCat={};
                (pExp||[]).forEach(e=>{byCat[e.cat]=(byCat[e.cat]||0)+e.amount;});
                const pieItems=Object.entries(byCat).map(([catId,value])=>{
                  const cat=CATEGORIES.find(c=>c.id===catId)||CATEGORIES[8];
                  return{label:cat.label,value,color:cat.color};
                });
                return(
                  <div key={id} style={{background:T.card,borderRadius:12,
                    border:`1px solid ${T.border}`,
                    borderLeft:`3px solid ${isPos?T.lime:T.danger}`,overflow:"hidden"}}>
                    <button onClick={()=>setSelMonth(isOpen?null:id)}
                      style={{width:"100%",padding:"0.85rem 1rem",background:"none",
                        border:"none",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                      <div style={{display:"flex",justifyContent:"space-between",
                        alignItems:"center",marginBottom:"0.4rem"}}>
                        <div>
                          <span style={{fontWeight:700,fontSize:"0.9rem",color:T.white}}>{label}</span>
                          <div style={{fontSize:"0.6rem",color:T.slate}}>{i.income||"Ingreso"}: {fmt(pIncome)}</div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontWeight:800,fontSize:"0.95rem",color:isPos?T.lime:T.danger}}>
                            {isPos?"+":"-"}{fmt(Math.abs(saved))}
                          </span>
                          <span style={{color:T.slate}}>{isOpen?"▲":"▼"}</span>
                        </div>
                      </div>
                      <div style={{height:4,background:T.border,borderRadius:999,overflow:"hidden",marginBottom:"0.3rem"}}>
                        <div style={{height:"100%",width:`${barW}%`,
                          background:isPos?T.lime:T.danger,borderRadius:999}}/>
                      </div>
                      <div style={{fontSize:"0.65rem",color:T.slate}}>
                        {i.spentOf||"Gastado"}: {fmt(spent)} · {i.income||"Ingreso"}: {fmt(pIncome)}
                      </div>
                    </button>
                    {isOpen&&(
                      <div style={{borderTop:`1px solid ${T.border}`,padding:"0.75rem 1rem"}}>
                        {pieItems.length>1&&(
                          <div style={{marginBottom:"0.75rem"}}>
                            <PieChart items={pieItems} size={160} C={T}/>
                          </div>
                        )}
                        <div style={{display:"flex",flexDirection:"column",gap:"0.4rem"}}>
                          {[...(pExp||[])].sort((a,b)=>b.date.localeCompare(a.date)).map(e=>{
                            const cat=CATEGORIES.find(c=>c.id===e.cat)||CATEGORIES[8];
                            return(
                              <div key={e.id} style={{display:"flex",alignItems:"center",
                                gap:"0.5rem",background:T.elevated,borderRadius:8,
                                padding:"0.5rem 0.65rem",borderLeft:`2px solid ${cat.color}`}}>
                                <span>{cat.emoji}</span>
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{fontSize:"0.8rem",fontWeight:600,color:T.white,
                                    whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.desc}</div>
                                  {e.note&&<div style={{fontSize:"0.65rem",color:T.lime}}>📝 {e.note}</div>}
                                  <div style={{fontSize:"0.6rem",color:T.slate}}>{fmtKey(e.date)}</div>
                                </div>
                                <div style={{fontWeight:700,color:T.danger,fontSize:"0.8rem",whiteSpace:"nowrap"}}>
                                  -{fmt(e.amount)}
                                </div>
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

// ── CALENDAR VIEW ─────────────────────────────────────

function CalendarView({ expenses, remaining, remColor, delExpense, setEditExp, T, i }) {
  const [calMonth, setCalMonth] = useState(new Date());
  const [selDay, setSelDay]     = useState(null);

  const byDate = {};
  expenses.forEach(e=>{ if(!byDate[e.date])byDate[e.date]=[]; byDate[e.date].push(e); });

  const year=calMonth.getFullYear(), month=calMonth.getMonth();
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
          style={{background:T.card,border:`1px solid ${T.border}`,color:T.white,
            borderRadius:8,padding:"0.4rem 0.75rem",cursor:"pointer",fontSize:"1rem"}}>‹</button>
        <span style={{fontWeight:800,fontSize:"1rem",color:T.white}}>
          {MONTHS_ES[month]} {year}
        </span>
        <button onClick={()=>setCalMonth(new Date(year,month+1,1))}
          style={{background:T.card,border:`1px solid ${T.border}`,color:T.white,
            borderRadius:8,padding:"0.4rem 0.75rem",cursor:"pointer",fontSize:"1rem"}}>›</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:"0.4rem"}}>
        {DAYS_ES.map(d=>(
          <div key={d} style={{textAlign:"center",fontSize:"0.65rem",color:T.slate,
            fontWeight:700,padding:"0.3rem 0"}}>{d}</div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"0.25rem"}}>
        {cells.map((d,idx)=>{
          if(!d)return<div key={`e${idx}`}/>;
          const key=`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
          const hasExp=!!byDate[key];
          const dayTotal=hasExp?byDate[key].reduce((s,e)=>s+e.amount,0):0;
          const isToday=key===todayStr, isSel=key===selDay;
          return(
            <button key={key} onClick={()=>setSelDay(isSel?null:key)}
              style={{background:isSel?T.lime:hasExp?T.elevated:T.card,
                border:isToday?`2px solid ${T.lime}`:`1px solid ${T.border}`,
                borderRadius:10,padding:"0.4rem 0.2rem",
                cursor:hasExp?"pointer":"default",
                display:"flex",flexDirection:"column",alignItems:"center",gap:1,
                minHeight:44,transition:"background 0.2s"}}>
              <span style={{fontSize:"0.85rem",fontWeight:isToday?900:600,
                color:isSel?T.bg:isToday?T.lime:T.white}}>{d}</span>
              {hasExp&&<span style={{fontSize:"0.55rem",color:isSel?T.bg:T.danger,fontWeight:700}}>
                -{fmt(dayTotal).replace("$","")}
              </span>}
              {hasExp&&<div style={{width:4,height:4,borderRadius:"50%",
                background:isSel?T.bg:T.lime}}/>}
            </button>
          );
        })}
      </div>

      {selDay&&byDate[selDay]&&(
        <div style={{marginTop:"1.25rem",background:T.card,borderRadius:16,
          padding:"1.25rem",border:`1px solid ${T.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.75rem"}}>
            <div>
              <div style={{fontSize:"0.7rem",color:T.slate,textTransform:"uppercase",
                letterSpacing:"0.06em"}}>{fmtKeyLong(selDay)}</div>
              <div style={{fontWeight:800,color:T.danger,fontSize:"1.1rem"}}>
                -{fmt(byDate[selDay].reduce((s,e)=>s+e.amount,0))}
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:"0.7rem",color:T.slate}}>Gastos ese día</div>
              <div style={{fontWeight:700,color:T.white}}>{byDate[selDay].length}</div>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
            {byDate[selDay].map(e=>{
              const cat=CATEGORIES.find(c=>c.id===e.cat)||CATEGORIES[8];
              return(
                <div key={e.id} style={{background:T.elevated,borderRadius:10,
                  padding:"0.65rem 0.75rem",borderLeft:`3px solid ${cat.color}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
                    <span style={{fontSize:"1.1rem"}}>{cat.emoji}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:"0.85rem",color:T.white,
                        whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.desc}</div>
                      {e.note&&<div style={{fontSize:"0.65rem",color:T.lime}}>📝 {e.note}</div>}
                      <div style={{fontSize:"0.7rem",color:T.slate}}>{cat.label}</div>
                    </div>
                    <div style={{fontWeight:700,color:T.danger,fontSize:"0.9rem",whiteSpace:"nowrap"}}>
                      -{fmt(e.amount)}
                    </div>
                    <button onClick={()=>setEditExp(e)}
                      style={{background:"none",border:"none",color:T.lime,cursor:"pointer",fontSize:"0.85rem"}}>✏️</button>
                    <button onClick={()=>delExpense(e.id)}
                      style={{background:"none",border:"none",color:T.slate,cursor:"pointer",fontSize:"0.9rem"}}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{marginTop:"0.75rem",padding:"0.6rem 0.75rem",background:T.elevated,
            borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:"0.75rem",color:T.slate}}>{i.remaining||"Balance restante"}</span>
            <span style={{fontWeight:800,color:remColor,fontSize:"0.95rem"}}>{fmt(remaining)}</span>
          </div>
        </div>
      )}
      {selDay&&!byDate[selDay]&&(
        <div style={{marginTop:"1.25rem",background:T.card,borderRadius:16,
          padding:"1.5rem",textAlign:"center",color:T.slate,fontSize:"0.85rem"}}>
          Sin gastos registrados ese día.
        </div>
      )}
    </div>
  );
}

// ── BUDGET VIEW ───────────────────────────────────────

const RULES = [
  { id:"50-30-20", label:"50/30/20", desc:"Clásica — necesidades, personal, ahorro", needs:50, personal:30, saving:20 },
  { id:"70-20-10", label:"70/20/10", desc:"Para deudas o ingresos bajos",            needs:70, personal:20, saving:10 },
  { id:"60-20-20", label:"60/20/20", desc:"Equilibrada con buen ahorro",             needs:60, personal:20, saving:20 },
  { id:"80-20",    label:"80/20",    desc:"Simple — gasta 80, ahorra 20",            needs:60, personal:20, saving:20 },
  { id:"custom",   label:"Custom",   desc:"Tú decides los porcentajes",              needs:50, personal:30, saving:20 },
];

const NEEDS_CATS    = ["housing","transport","bills","health"];
const PERSONAL_CATS = ["food","personal","loan","other"];

function BudgetView({ expenses, totalIncome, budgetRule, setBudgetRule, budgetPcts, setBudgetPcts, persist, T, i }) {
  const GROUPS = [
    { id:"needs",    label: i.needs||"🔴 Necesidades",  desc: i.needsDesc||"Renta, Bills, Salud, Transporte",    color:T.danger  },
    { id:"personal", label: i.personal||"🟡 Personal",   desc: i.personalDesc||"Comida, Personal, Préstamo, Otro", color:T.warn    },
    { id:"saving",   label: i.saving||"🟢 Ahorro",       desc: i.savingDesc||"Meta de ahorro",                    color:T.lime    },
  ];

  const spentNeeds    = expenses.filter(e=>NEEDS_CATS.includes(e.cat)).reduce((s,e)=>s+e.amount,0);
  const spentPersonal = expenses.filter(e=>PERSONAL_CATS.includes(e.cat)).reduce((s,e)=>s+e.amount,0);
  const spentSaving   = expenses.filter(e=>e.cat==="savings").reduce((s,e)=>s+e.amount,0);

  const limitNeeds    = totalIncome*(budgetPcts.needs/100);
  const limitPersonal = totalIncome*(budgetPcts.personal/100);
  const limitSaving   = totalIncome*(budgetPcts.saving/100);

  const spentMap  = { needs:spentNeeds,    personal:spentPersonal,    saving:spentSaving    };
  const limitMap  = { needs:limitNeeds,     personal:limitPersonal,     saving:limitSaving     };

  function applyRule(rule) {
    const newPcts={needs:rule.needs,personal:rule.personal,saving:rule.saving};
    setBudgetRule(rule.id);
    setBudgetPcts(newPcts);
    persist(undefined,undefined,undefined,rule.id,newPcts);
  }

  function adjustPct(key,delta) {
    const keys=["needs","personal","saving"];
    const others=keys.filter(k=>k!==key);
    const newVal=Math.max(5,Math.min(90,budgetPcts[key]+delta));
    const diff=newVal-budgetPcts[key];
    const adj0=Math.round(diff/2), adj1=diff-adj0;
    const newPcts={
      ...budgetPcts,[key]:newVal,
      [others[0]]:Math.max(5,budgetPcts[others[0]]-adj0),
      [others[1]]:Math.max(5,budgetPcts[others[1]]-adj1),
    };
    const total=newPcts.needs+newPcts.personal+newPcts.saving;
    if(total!==100)newPcts[others[1]]+=100-total;
    setBudgetRule("custom");
    setBudgetPcts(newPcts);
    persist(undefined,undefined,undefined,"custom",newPcts);
  }

  const inp = {
    width:"100%", padding:"0.6rem 0.75rem",
    background:T.isLight?"#F5E6F0":T.border,
    border:`1px solid ${T.border}`,
    borderRadius:10, color:T.white, fontFamily:"inherit",
  };

  return (
    <div style={{padding:"1rem 1.25rem",paddingBottom:"6rem"}}>
      <div style={{textAlign:"center",marginBottom:"1.25rem"}}>
        <div style={{fontSize:"1.1rem",fontWeight:900,color:T.white}}>🎯 {i.budget||"Presupuesto"}</div>
        <div style={{fontSize:"0.75rem",color:T.slate,marginTop:2}}>
          {i.budget||"Basado en tu ingreso de"} {fmt(totalIncome)}
        </div>
      </div>

      {/* Rule selector */}
      <div style={{fontSize:"0.7rem",color:T.slate,textTransform:"uppercase",
        letterSpacing:"0.08em",marginBottom:"0.6rem"}}>{i.chooseRule||"Elige tu regla"}</div>
      <div style={{display:"flex",flexDirection:"column",gap:"0.4rem",marginBottom:"1.25rem"}}>
        {RULES.map(rule=>(
          <button key={rule.id} onClick={()=>applyRule(rule)}
            style={{padding:"0.75rem 1rem",border:`1.5px solid ${budgetRule===rule.id?T.lime:T.border}`,
              borderRadius:12,background:budgetRule===rule.id?`${T.lime}15`:T.card,
              cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"all 0.2s"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontWeight:800,fontSize:"0.95rem",
                color:budgetRule===rule.id?T.lime:T.white}}>{rule.label}</span>
              {budgetRule===rule.id&&<span style={{color:T.lime,fontSize:"0.8rem"}}>{i.active||"✓ Activa"}</span>}
            </div>
            <div style={{fontSize:"0.7rem",color:T.slate,marginTop:2}}>{rule.desc}</div>
          </button>
        ))}
      </div>

      {/* Sliders */}
      {budgetRule&&(
        <>
          <div style={{fontSize:"0.7rem",color:T.slate,textTransform:"uppercase",
            letterSpacing:"0.08em",marginBottom:"0.6rem"}}>
            {i.adjustPcts||"Ajusta los porcentajes"} — {budgetPcts.needs+budgetPcts.personal+budgetPcts.saving}%
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"0.75rem",marginBottom:"1.25rem"}}>
            {GROUPS.map(g=>{
              const pct=budgetPcts[g.id];
              const limit=limitMap[g.id];
              const spent=spentMap[g.id];
              const spentPct=limit>0?Math.min((spent/limit)*100,100):0;
              const overBudget=spent>limit;
              return(
                <div key={g.id} style={{background:T.card,borderRadius:14,padding:"1rem",
                  border:`1px solid ${T.border}`,borderLeft:`3px solid ${g.color}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.5rem"}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:"0.9rem",color:T.white}}>{g.label}</div>
                      <div style={{fontSize:"0.65rem",color:T.slate}}>{g.desc}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontWeight:900,fontSize:"1.1rem",color:g.color}}>{pct}%</div>
                      <div style={{fontSize:"0.65rem",color:T.slate}}>{fmt(limit)}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.6rem"}}>
                    <button onClick={()=>adjustPct(g.id,-5)}
                      style={{width:32,height:32,borderRadius:8,background:T.border,
                        border:"none",color:T.white,fontSize:"1.1rem",cursor:"pointer",fontFamily:"inherit"}}>−</button>
                    <div style={{flex:1,height:6,background:T.border,borderRadius:999,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${pct}%`,background:g.color,
                        borderRadius:999,transition:"width 0.3s ease"}}/>
                    </div>
                    <button onClick={()=>adjustPct(g.id,5)}
                      style={{width:32,height:32,borderRadius:8,background:T.border,
                        border:"none",color:T.white,fontSize:"1.1rem",cursor:"pointer",fontFamily:"inherit"}}>+</button>
                  </div>
                  <div style={{fontSize:"0.65rem",color:T.slate,marginBottom:"0.3rem"}}>
                    {i.spentOf||"Gastado"}: <span style={{color:overBudget?T.danger:T.white,fontWeight:600}}>{fmt(spent)}</span>
                    {" / "}<span style={{color:g.color}}>{fmt(limit)}</span>
                  </div>
                  <div style={{height:4,background:T.border,borderRadius:999,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${spentPct}%`,
                      background:overBudget?T.danger:g.color,borderRadius:999,transition:"width 0.5s ease"}}/>
                  </div>
                  {overBudget&&(
                    <div style={{fontSize:"0.65rem",color:T.danger,marginTop:"0.3rem",fontWeight:600}}>
                      {i.exceeded||"⚠️ Excediste por"} {fmt(spent-limit)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {!budgetRule&&(
        <div style={{textAlign:"center",padding:"2rem 0",color:T.slate,fontSize:"0.85rem"}}>
          <div style={{fontSize:"2.5rem",marginBottom:"0.75rem"}}>🎯</div>
          {i.noRuleSelected||"Elige una regla para activar tu presupuesto."}
        </div>
      )}
    </div>
  );
}

// ── GOAL VIEW ─────────────────────────────────────────

// C is passed as theme prop from App


// ── WALKING ET ─────────────────────────────────────────
function WalkingET({ size=56, mood="happy", flip=false, C }) {
  const id = `wet_${Math.random().toString(36).slice(2,6)}`;
  const css = `
    @keyframes ${id}_walk {
      0%,100% { transform: translateY(0) rotate(0deg); }
      25%      { transform: translateY(-3px) rotate(-3deg); }
      75%      { transform: translateY(-3px) rotate(3deg); }
    }
    @keyframes ${id}_legL {
      0%,100% { transform: rotate(-20deg); }
      50%     { transform: rotate(20deg); }
    }
    @keyframes ${id}_legR {
      0%,100% { transform: rotate(20deg); }
      50%     { transform: rotate(-20deg); }
    }
    @keyframes ${id}_wingL {
      0%,100% { transform: rotate(-5deg); }
      50%     { transform: rotate(10deg); }
    }
    @keyframes ${id}_wingR {
      0%,100% { transform: rotate(5deg); }
      50%     { transform: rotate(-10deg); }
    }
  `;

  const s = size;
  const eyeColor = mood==="happy"||mood==="cool" ? C.lime
                 : mood==="sweat"               ? C.warn
                 : mood==="cry"                 ? "#7EC8E3"
                 : C.lime;

  return (
    <svg width={s} height={s} viewBox="0 0 80 80" overflow="visible"
      style={{transform: flip?"scaleX(-1)":"none", flexShrink:0}}>
      <style>{css}</style>

      {/* Body bounce */}
      <g style={{animation:`${id}_walk 0.6s ease-in-out infinite`}}>

        {/* Left leg */}
        <g style={{transformOrigin:"38px 68px", animation:`${id}_legL 0.6s ease-in-out infinite`}}>
          <rect x="33" y="66" width="8" height="10" rx="3" fill="#7A3B10"/>
          <rect x="29" y="73" width="12" height="5" rx="2" fill="#7A3B10"/>
        </g>
        {/* Right leg */}
        <g style={{transformOrigin:"46px 68px", animation:`${id}_legR 0.6s ease-in-out infinite`}}>
          <rect x="41" y="66" width="8" height="10" rx="3" fill="#7A3B10"/>
          <rect x="41" y="73" width="12" height="5" rx="2" fill="#7A3B10"/>
        </g>

        {/* Body */}
        <ellipse cx="40" cy="52" rx="20" ry="20" fill="#E8913A"/>
        {/* Belly */}
        <ellipse cx="40" cy="56" rx="12" ry="13" fill="#FFF3DC"/>

        {/* Left wing */}
        <g style={{transformOrigin:"22px 52px", animation:`${id}_wingL 0.6s ease-in-out infinite`}}>
          <ellipse cx="22" cy="52" rx="8" ry="14" fill="#7A3B10" transform="rotate(-10 22 52)"/>
        </g>
        {/* Right wing */}
        <g style={{transformOrigin:"58px 52px", animation:`${id}_wingR 0.6s ease-in-out infinite`}}>
          <ellipse cx="58" cy="52" rx="8" ry="14" fill="#7A3B10" transform="rotate(10 58 52)"/>
        </g>

        {/* Head */}
        <circle cx="40" cy="30" r="22" fill="#E8913A"/>
        {/* Ear tufts */}
        <polygon points="28,12 23,2 34,10" fill="#7A3B10"/>
        <polygon points="52,12 57,2 46,10" fill="#7A3B10"/>
        {/* Face */}
        <ellipse cx="40" cy="32" rx="16" ry="14" fill="#F5C98A" opacity=".5"/>

        {/* Eyes — white sclera first, then pupil on top */}
        <circle cx="31" cy="28" r="9" fill="white"/>
        <circle cx="49" cy="28" r="9" fill="white"/>
        <circle cx="31" cy="28" r="9" fill="none" stroke={eyeColor} strokeWidth="2" opacity=".7"/>
        <circle cx="49" cy="28" r="9" fill="none" stroke={eyeColor} strokeWidth="2" opacity=".7"/>

        {/* Pupils on top of white sclera */}
        {mood==="sleepy" ? (
          <>
            <rect x="23" y="24" width="16" height="9" rx="4" fill="#E8913A"/>
            <rect x="41" y="24" width="16" height="9" rx="4" fill="#E8913A"/>
            <line x1="23" y1="28" x2="39" y2="28" stroke="#7A3B10" strokeWidth="1.5"/>
            <line x1="41" y1="28" x2="57" y2="28" stroke="#7A3B10" strokeWidth="1.5"/>
          </>
        ) : mood==="cry" ? (
          <>
            <circle cx="31" cy="29" r="4.5" fill="#3A2A10"/>
            <circle cx="49" cy="29" r="4.5" fill="#3A2A10"/>
            <circle cx="29" cy="27" r="1.5" fill="white" opacity=".6"/>
            <circle cx="47" cy="27" r="1.5" fill="white" opacity=".6"/>
            <ellipse cx="27" cy="39" rx="2" ry="4.5" fill="#7EC8E3" opacity=".9"/>
            <ellipse cx="52" cy="39" rx="2" ry="4.5" fill="#7EC8E3" opacity=".9"/>
          </>
        ) : mood==="cool" ? (
          <>
            <circle cx="31" cy="29" r="4.5" fill="#3A2A10"/>
            <circle cx="49" cy="29" r="4.5" fill="#3A2A10"/>
            <circle cx="29" cy="27" r="1.5" fill="white" opacity=".7"/>
            <circle cx="47" cy="27" r="1.5" fill="white" opacity=".7"/>
            {/* Sunglasses */}
            <rect x="22" y="23" width="18" height="11" rx="5" fill={eyeColor} opacity=".85"/>
            <rect x="41" y="23" width="18" height="11" rx="5" fill={eyeColor} opacity=".85"/>
            <line x1="40" y1="28" x2="41" y2="28" stroke="#1A0A00" strokeWidth="2"/>
          </>
        ) : (
          <>
            <circle cx="31" cy="29" r="4.5" fill={eyeColor}/>
            <circle cx="49" cy="29" r="4.5" fill={eyeColor}/>
            <circle cx="29" cy="27" r="1.8" fill="white" opacity=".85"/>
            <circle cx="47" cy="27" r="1.8" fill="white" opacity=".85"/>
            <circle cx="33" cy="30" r="1" fill="#1A0A00" opacity=".4"/>
            <circle cx="51" cy="30" r="1" fill="#1A0A00" opacity=".4"/>
          </>
        )}

        {/* Beak */}
        <polygon points="40,33 36,39 44,39" fill="#FF8C00"/>

        {/* Mood extras */}
        {mood==="cool" && (
          <>
            <rect x="22" y="24" width="18" height="10" rx="4" fill={C.lime}/>
            <rect x="42" y="24" width="18" height="10" rx="4" fill={C.lime}/>
            <line x1="40" y1="29" x2="42" y2="29" stroke="#1A0A00" strokeWidth="2"/>
          </>
        )}
        {mood==="sweat" && (
          <ellipse cx="18" cy="26" rx="2" ry="3.5" fill="#7EC8E3" opacity=".8"/>
        )}
      </g>
    </svg>
  );
}

// ── WINDING ROAD SVG ───────────────────────────────────
function WindingRoad({ progress, checkpoints, deposits, totalGoal, size, C }) {
  const W = size.w;
  const H = size.h;

  // Path points with enough padding so ET never gets clipped
  const pathPoints = [
    {x: W*0.20, y: H*0.88},  // start — bottom left
    {x: W*0.78, y: H*0.74},  // swing right
    {x: W*0.80, y: H*0.58},  // right curve
    {x: W*0.22, y: H*0.46},  // cross to left
    {x: W*0.20, y: H*0.30},  // left curve
    {x: W*0.75, y: H*0.18},  // cross to right
    {x: W*0.78, y: H*0.08},  // goal — top right
  ];

  function buildPath(pts) {
    if(pts.length<2) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for(let i=1; i<pts.length; i++) {
      const prev=pts[i-1], curr=pts[i];
      const cp1x=prev.x+(curr.x-prev.x)*0.5, cp1y=prev.y;
      const cp2x=prev.x+(curr.x-prev.x)*0.5, cp2y=curr.y;
      d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${curr.x} ${curr.y}`;
    }
    return d;
  }

  function getPointOnPath(t) {
    // clamp t so ET is always on a valid segment
    const clamped = Math.max(0, Math.min(t, 1));
    const total = pathPoints.length - 1;
    const segment = clamped * total;
    const i = Math.min(Math.floor(segment), total-1);
    const frac = segment - i;
    const a=pathPoints[i], b=pathPoints[Math.min(i+1,total)];
    return { x: a.x+(b.x-a.x)*frac, y: a.y+(b.y-a.y)*frac };
  }

  const pathD = buildPath(pathPoints);

  // ET position — always at least a little way along so it's visible at start
  const etProgress = progress===0 ? 0.01 : Math.min(progress, 1);
  const etPos = getPointOnPath(etProgress);
  const prevPos = getPointOnPath(Math.max(etProgress-0.04, 0));
  const movingRight = etPos.x >= prevPos.x;
  const etMood = progress>=1?"cool":progress>=0.65?"happy":progress>=0.35?"sweat":"cry";

  // Progress road highlight — only draw completed portion
  const progressPts = pathPoints.slice(0, Math.min(Math.ceil(etProgress*(pathPoints.length-1))+1, pathPoints.length));
  const progressD = buildPath(progressPts);

  const cpPositions = checkpoints.map(cp=>({ ...cp, pos:getPointOnPath(cp.t) }));

  // Accumulate deposit amounts to get position on path
  let runningTotal = 0;
  const depositMarkers = deposits.map(d=>{
    runningTotal += d.amount;
    return { ...d, pos:getPointOnPath(Math.min(runningTotal/totalGoal,0.99)) };
  });

  return (
    <svg width={W} height={H} viewBox={`-10 -10 ${W+20} ${H+10}`}
      style={{width:"100%",maxWidth:W,display:"block",margin:"0 auto"}}>

      {/* Road shadow */}
      <path d={pathD} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="24"
        strokeLinecap="round" strokeLinejoin="round"/>
      {/* Road base */}
      <path d={pathD} fill="none" stroke={C.elevated} strokeWidth="20"
        strokeLinecap="round" strokeLinejoin="round"/>
      {/* Center dashes */}
      <path d={pathD} fill="none" stroke={C.border} strokeWidth="2"
        strokeLinecap="round" strokeDasharray="12 10"/>
      {/* Completed road highlight */}
      {progressD&&<path d={progressD} fill="none" stroke={`${C.lime}35`} strokeWidth="20"
        strokeLinecap="round"/>}

      {/* Checkpoints */}
      {cpPositions.map((cp,i)=>{
        const done = progress>=cp.t;
        const labelRight = cp.pos.x < W*0.5;
        return (
          <g key={i}>
            <circle cx={cp.pos.x} cy={cp.pos.y} r="11"
              fill={done?C.lime:C.card} stroke={done?C.lime:C.border} strokeWidth="2"/>
            <text x={cp.pos.x} y={cp.pos.y+4} textAnchor="middle"
              fontSize="8" fill={done?C.bg:C.slate} fontWeight="900">
              {Math.round(cp.t*100)}%
            </text>
            <text x={labelRight?cp.pos.x+16:cp.pos.x-16}
              y={cp.pos.y-10}
              textAnchor={labelRight?"start":"end"}
              fontSize="8" fill={done?C.lime:C.slate} fontWeight="700">
              {fmt(cp.amount)}
            </text>
          </g>
        );
      })}

      {/* Deposit markers */}
      {depositMarkers.map((d,i)=>{
        const labelRight = d.pos.x < W*0.55;
        return (
          <g key={i}>
            <circle cx={d.pos.x} cy={d.pos.y} r="7"
              fill={C.lime} stroke={C.bg} strokeWidth="1.5"/>
            <text x={d.pos.x} y={d.pos.y+3} textAnchor="middle"
              fontSize="7" fill={C.bg} fontWeight="900">$</text>
            <rect x={labelRight?d.pos.x+10:d.pos.x-46}
              y={d.pos.y-12} width="36" height="14" rx="4"
              fill={C.card} stroke={C.lime} strokeWidth="1"/>
            <text x={labelRight?d.pos.x+28:d.pos.x-28}
              y={d.pos.y-2} textAnchor="middle"
              fontSize="7" fill={C.lime} fontWeight="700">
              +{fmt(d.amount)}
            </text>
          </g>
        );
      })}

      {/* Start marker */}
      <circle cx={pathPoints[0].x} cy={pathPoints[0].y} r="10"
        fill={C.card} stroke={C.slate} strokeWidth="2"/>
      <text x={pathPoints[0].x} y={pathPoints[0].y+4}
        textAnchor="middle" fontSize="10">🏁</text>
      <text x={pathPoints[0].x-14} y={pathPoints[0].y+18}
        textAnchor="middle" fontSize="7" fill={C.slate}>$0</text>

      {/* Goal marker */}
      {(()=>{
        const gp=pathPoints[pathPoints.length-1];
        return (
          <g>
            <circle cx={gp.x} cy={gp.y} r={progress>=1?15:11}
              fill={progress>=1?C.lime:C.card}
              stroke={progress>=1?C.lime:C.border} strokeWidth="2"/>
            <text x={gp.x} y={gp.y+5} textAnchor="middle"
              fontSize={progress>=1?13:10}>
              {progress>=1?"🏆":"🎯"}
            </text>
            <text x={gp.x+16} y={gp.y-12} fontSize="8"
              fill={C.lime} fontWeight="800">{fmt(totalGoal)}</text>
            <text x={gp.x+16} y={gp.y-2} fontSize="7" fill={C.slate}>meta</text>
          </g>
        );
      })()}

      {/* ET — always fully visible */}
      <g transform={`translate(${etPos.x-24},${etPos.y-52})`}>
        <WalkingET size={48} mood={etMood} flip={!movingRight} C={C}/>
      </g>
    </svg>
  );
}

// ── GOAL VIEW ──────────────────────────────────────────
function GoalView({ savedPeriods, showToast, persistGoals, goals, setGoals, theme }) {
  const C = theme || {bg:"#080f1e",card:"#0d1526",elevated:"#152038",border:"#1c2d4a",lime:"#c8f135",slate:"#4a6080",white:"#f0f4ff",danger:"#ff5e5e",warn:"#f5a623"};
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [newGoal, setNewGoal]         = useState({name:"", target:""});
  const [selGoal, setSelGoal]         = useState(null);
  const [addAmount, setAddAmount]     = useState("");
  const [showAddDeposit, setShowAddDeposit] = useState(false);

  const INP = {
    width:"100%", padding:"0.8rem 1rem", background:C.border,
    border:"1.5px solid transparent", borderRadius:12,
    color:C.white, fontSize:"0.95rem", outline:"none",
    boxSizing:"border-box", fontFamily:"inherit",
  };

  function createGoal() {
    const target = parseFloat(newGoal.target);
    if(!newGoal.name.trim()||isNaN(target)||target<=0) return;
    const g = {
      id: Date.now(),
      name: newGoal.name.trim(),
      target,
      deposits: [],
      createdAt: todayKey(),
    };
    const updated = [...goals, g];
    setGoals(updated);
    persistGoals(updated);
    setNewGoal({name:"",target:""});
    setShowNewGoal(false);
    showToast("🎯 Meta creada");
  }

  function addDeposit(goalId, amount, label) {
    const amt = parseFloat(amount);
    if(isNaN(amt)||amt<=0) return;
    const updated = goals.map(g=>{
      if(g.id!==goalId) return g;
      const deposit = {id:Date.now(), amount:amt, date:todayKey(), label:label||"Depósito"};
      return {...g, deposits:[...g.deposits, deposit]};
    });
    setGoals(updated);
    persistGoals(updated);
    setAddAmount("");
    setShowAddDeposit(false);
    showToast("💰 Ahorro agregado");
  }

  function deleteGoal(id) {
    const updated = goals.filter(g=>g.id!==id);
    setGoals(updated);
    persistGoals(updated);
    setSelGoal(null);
    showToast("Eliminado");
  }

  return (
    <div style={{padding:"1rem 1.25rem", paddingBottom:"6rem"}}>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem"}}>
        <div>
          <div style={{fontWeight:900,fontSize:"1.1rem",color:C.white}}>🏆 Mis Metas</div>
          <div style={{fontSize:"0.7rem",color:C.slate}}>El camino de ET hacia tus sueños</div>
        </div>
        <button onClick={()=>setShowNewGoal(true)}
          style={{background:C.lime,border:"none",borderRadius:10,padding:"0.5rem 1rem",
            color:C.bg,fontWeight:800,fontSize:"0.85rem",cursor:"pointer",fontFamily:"inherit"}}>
          + Nueva
        </button>
      </div>

      {/* Goals list */}
      {goals.length===0?(
        <div style={{textAlign:"center",padding:"3rem 1rem",color:C.slate}}>
          <div style={{fontSize:"3rem",marginBottom:"0.75rem"}}>🎯</div>
          <div style={{fontSize:"0.9rem",marginBottom:"0.5rem",color:C.white}}>Sin metas todavía</div>
          <div style={{fontSize:"0.8rem"}}>Crea tu primera meta y ET<br/>empezará su camino</div>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:"1.25rem"}}>
          {goals.map(goal=>{
            const totalSaved = goal.deposits.reduce((s,d)=>s+d.amount,0);
            const progress   = Math.min(totalSaved/goal.target, 1);
            const isOpen     = selGoal===goal.id;
            const etMood     = progress>=1?"cool":progress>=0.7?"happy":progress>=0.4?"sweat":"cry";

            // Checkpoints at 25%, 50%, 75%
            const checkpoints = [0.25,0.5,0.75].map(t=>({
              t, amount: goal.target*t
            }));

            return (
              <div key={goal.id} style={{background:C.card,borderRadius:16,border:`1px solid ${C.border}`,overflow:"hidden"}}>
                {/* Goal header */}
                <button onClick={()=>setSelGoal(isOpen?null:goal.id)}
                  style={{width:"100%",padding:"1rem 1.25rem",background:"none",border:"none",
                    cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.5rem"}}>
                    <div style={{fontWeight:800,fontSize:"1rem",color:C.white}}>{goal.name}</div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:"0.7rem",color:C.slate}}>Ahorrado</div>
                        <div style={{fontWeight:800,color:C.lime,fontSize:"0.95rem"}}>{fmt(totalSaved)}</div>
                      </div>
                      <span style={{color:C.slate}}>{isOpen?"▲":"▼"}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{height:6,background:C.border,borderRadius:999,overflow:"hidden",marginBottom:"0.4rem"}}>
                    <div style={{height:"100%",width:`${progress*100}%`,
                      background:progress>=1?C.lime:progress>=0.7?C.lime:progress>=0.4?C.warn:C.danger,
                      borderRadius:999,transition:"width 0.5s ease"}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.65rem",color:C.slate}}>
                    <span>{Math.round(progress*100)}% completado</span>
                    <span>Meta: {fmt(goal.target)}</span>
                  </div>
                </button>

                {/* Expanded — winding road */}
                {isOpen&&(
                  <div style={{borderTop:`1px solid ${C.border}`}}>
                    {/* Winding road */}
                    <div style={{padding:"0.5rem 0.25rem",overflowX:"hidden"}}>
                      <WindingRoad
                        progress={progress}
                        checkpoints={checkpoints}
                        deposits={goal.deposits}
                        totalGoal={goal.target}
                        size={{w:340,h:380}}
                        C={C}/>
                    </div>

                    {/* Deposit list */}
                    {goal.deposits.length>0&&(
                      <div style={{padding:"0 1.25rem 0.75rem"}}>
                        <div style={{fontSize:"0.65rem",color:C.slate,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.5rem"}}>
                          Historial de depósitos
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:"0.35rem",maxHeight:160,overflowY:"auto"}}>
                          {[...goal.deposits].reverse().map(d=>(
                            <div key={d.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                              background:C.elevated,borderRadius:8,padding:"0.5rem 0.75rem",
                              borderLeft:`2px solid ${C.lime}`}}>
                              <div>
                                <div style={{fontSize:"0.8rem",color:C.white,fontWeight:600}}>{d.label}</div>
                                <div style={{fontSize:"0.6rem",color:C.slate}}>{fmtDate(d.date)}</div>
                              </div>
                              <div style={{fontWeight:700,color:C.lime,fontSize:"0.85rem"}}>+{fmt(d.amount)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{display:"flex",gap:"0.5rem",padding:"0 1.25rem 1.25rem"}}>
                      {showAddDeposit&&selGoal===goal.id?(
                        <div style={{flex:1,display:"flex",gap:"0.5rem"}}>
                          <input type="number" placeholder="$0.00" value={addAmount}
                            onChange={e=>setAddAmount(e.target.value)}
                            autoFocus
                            style={{...INP,flex:1,padding:"0.6rem 0.75rem"}}/>
                          <button onClick={()=>addDeposit(goal.id,addAmount,"Depósito manual")}
                            style={{background:C.lime,border:"none",borderRadius:10,padding:"0.6rem 1rem",
                              color:C.bg,fontWeight:800,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
                            ✓ Guardar
                          </button>
                          <button onClick={()=>setShowAddDeposit(false)}
                            style={{background:C.border,border:"none",borderRadius:10,padding:"0.6rem 0.75rem",
                              color:C.slate,cursor:"pointer",fontFamily:"inherit"}}>
                            ✕
                          </button>
                        </div>
                      ):(
                        <>
                          <button onClick={()=>{setShowAddDeposit(true);setSelGoal(goal.id);}}
                            style={{flex:2,padding:"0.65rem",background:C.lime,border:"none",
                              borderRadius:10,color:C.bg,fontWeight:800,fontSize:"0.85rem",
                              cursor:"pointer",fontFamily:"inherit"}}>
                            💰 Agregar ahorro
                          </button>
                          <button onClick={()=>deleteGoal(goal.id)}
                            style={{flex:1,padding:"0.65rem",background:C.elevated,border:`1px solid ${C.border}`,
                              borderRadius:10,color:C.danger,fontWeight:700,fontSize:"0.85rem",
                              cursor:"pointer",fontFamily:"inherit"}}>
                            🗑️ Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* New goal modal */}
      {showNewGoal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:300,
          display:"flex",alignItems:"center",justifyContent:"center",padding:"1.25rem"}}>
          <div style={{background:C.card,borderRadius:20,padding:"1.5rem",width:"100%",
            maxWidth:360,border:`1px solid ${C.lime}40`}}>
            <div style={{fontWeight:900,color:C.white,fontSize:"1rem",marginBottom:"1.25rem",textAlign:"center"}}>
              🎯 Nueva meta
            </div>
            <input placeholder="Nombre (ej: Laptop, Vacaciones...)" value={newGoal.name}
              onChange={e=>setNewGoal(g=>({...g,name:e.target.value}))}
              style={{...INP,marginBottom:"0.75rem"}} autoFocus autoComplete="off"/>
            <div style={{position:"relative",marginBottom:"1.25rem"}}>
              <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",
                color:C.lime,fontWeight:800}}>$</span>
              <input type="number" placeholder="Meta de ahorro (ej: 2000)"
                value={newGoal.target}
                onChange={e=>setNewGoal(g=>({...g,target:e.target.value}))}
                style={{...INP,paddingLeft:"1.75rem"}}/>
            </div>
            <div style={{display:"flex",gap:"0.5rem"}}>
              <button onClick={()=>{setShowNewGoal(false);setNewGoal({name:"",target:"",initial:""});}}
                style={{flex:1,padding:"0.8rem",background:C.border,border:"none",borderRadius:12,
                  color:C.slate,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                Cancelar
              </button>
              <button onClick={createGoal}
                style={{flex:2,padding:"0.8rem",background:C.lime,border:"none",borderRadius:12,
                  color:C.bg,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>
                Crear meta →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── TRENDS VIEW ───────────────────────────────────────

const MONTHS_ES_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];


// ── MINI ET FACE ────────────────────────────────────────
function MiniET({ mood="happy", size=28, C }) {
  const eyeColor = mood==="cool"?C.lime:mood==="sweat"?C.warn:mood==="cry"?C.danger:C.lime;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="18" fill="#E8913A"/>
      <circle cx="20" cy="22" r="12" fill="#FFF3DC" opacity=".5"/>
      <circle cx="13" cy="17" r="5" fill="white"/>
      <circle cx="27" cy="17" r="5" fill="white"/>
      <circle cx="13" cy="18" r="2.5" fill={eyeColor}/>
      <circle cx="27" cy="18" r="2.5" fill={eyeColor}/>
      <circle cx="12" cy="17" r="1" fill="white" opacity=".8"/>
      <circle cx="26" cy="17" r="1" fill="white" opacity=".8"/>
      <polygon points="20,21 17,26 23,26" fill="#FF8C00"/>
      {mood==="cool"&&<>
        <rect x="9" y="14" width="10" height="6" rx="3" fill={C.lime} opacity=".85"/>
        <rect x="21" y="14" width="10" height="6" rx="3" fill={C.lime} opacity=".85"/>
        <line x1="19" y1="17" x2="21" y2="17" stroke="#1A0A00" strokeWidth="1.5"/>
      </>}
      {mood==="cry"&&<>
        <ellipse cx="11" cy="24" rx="1.5" ry="3" fill="#7EC8E3" opacity=".9"/>
        <ellipse cx="29" cy="24" rx="1.5" ry="3" fill="#7EC8E3" opacity=".9"/>
      </>}
      {mood==="sweat"&&<>
        <ellipse cx="6" cy="16" rx="1.5" ry="2.5" fill="#7EC8E3" opacity=".8"/>
      </>}
    </svg>
  );
}

// ── LINE CHART ──────────────────────────────────────────
function LineChart({ data, C, size }) {
  const W = size.w;
  const H = size.h;
  const padL = 52, padR = 20, padT = 20, padB = 40;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  if(data.length === 0) return null;

  const maxVal = Math.max(...data.map(d=>Math.max(d.income, d.spent)), 1);
  const minVal = 0;

  function xPos(i) { return padL + (i/(Math.max(data.length-1,1)))*chartW; }
  function yPos(v) { return padT + chartH - ((v-minVal)/(maxVal-minVal))*chartH; }

  // Build path strings
  const incomePath = data.map((d,i)=>`${i===0?"M":"L"}${xPos(i)},${yPos(d.income)}`).join(" ");
  const spentPath  = data.map((d,i)=>`${i===0?"M":"L"}${xPos(i)},${yPos(d.spent)}`).join(" ");
  const savedPath  = data.map((d,i)=>`${i===0?"M":"L"}${xPos(i)},${yPos(Math.max(d.saved,0))}`).join(" ");

  // Fill area under spent
  const spentArea = `${spentPath} L${xPos(data.length-1)},${padT+chartH} L${padL},${padT+chartH} Z`;

  const lastIdx = data.length - 1;
  const lastSpent = data[lastIdx];
  const etMood = lastSpent.saved >= lastSpent.income*0.2 ? "cool"
               : lastSpent.saved >= 0 ? "happy"
               : lastSpent.saved >= -lastSpent.income*0.1 ? "sweat"
               : "cry";

  // Y axis labels
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t=>({
    val: minVal + t*(maxVal-minVal),
    y: yPos(minVal + t*(maxVal-minVal)),
  }));

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{width:"100%"}}>
      {/* Grid lines */}
      {yTicks.map((t,i)=>(
        <g key={i}>
          <line x1={padL} y1={t.y} x2={W-padR} y2={t.y}
            stroke={C.border} strokeWidth="1" strokeDasharray="4 4"/>
          <text x={padL-6} y={t.y+4} textAnchor="end"
            fontSize="8" fill={C.slate} fontFamily="Inter,sans-serif">
            {t.val>=1000?`${Math.round(t.val/100)/10}k`:Math.round(t.val)}
          </text>
        </g>
      ))}

      {/* Spent area fill */}
      <path d={spentArea} fill={C.danger} opacity=".1"/>

      {/* Lines */}
      <path d={incomePath} fill="none" stroke={C.lime} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"/>
      <path d={spentPath} fill="none" stroke={C.danger} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"/>
      <path d={savedPath} fill="none" stroke={C.warn} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 4"/>

      {/* Data points */}
      {data.map((d,i)=>(
        <g key={i}>
          <circle cx={xPos(i)} cy={yPos(d.income)} r="3.5" fill={C.lime}/>
          <circle cx={xPos(i)} cy={yPos(d.spent)} r="3.5" fill={C.danger}/>
        </g>
      ))}

      {/* ET on last point */}
      <g transform={`translate(${xPos(lastIdx)-14},${yPos(lastSpent.spent)-32})`}>
        <MiniET mood={etMood} size={28} C={C}/>
      </g>

      {/* X axis labels */}
      {data.map((d,i)=>(
        <text key={i} x={xPos(i)} y={H-padB+16}
          textAnchor="middle" fontSize="8" fill={C.slate} fontFamily="Inter,sans-serif">
          {fmtMonthShort(d.ym)}
        </text>
      ))}

      {/* Legend */}
      <g transform={`translate(${padL}, ${H-10})`}>
        <circle cx="0" cy="0" r="3" fill={C.lime}/>
        <text x="6" y="4" fontSize="8" fill={C.lime} fontFamily="Inter,sans-serif">Ingreso</text>
        <circle cx="50" cy="0" r="3" fill={C.danger}/>
        <text x="56" y="4" fontSize="8" fill={C.danger} fontFamily="Inter,sans-serif">Gasto</text>
        <circle cx="100" cy="0" r="3" fill={C.warn}/>
        <text x="106" y="4" fontSize="8" fill={C.warn} fontFamily="Inter,sans-serif">Ahorro</text>
      </g>
    </svg>
  );
}

// ── BAR CHART ───────────────────────────────────────────
function BarChart({ data, C, size }) {
  const W = size.w;
  const H = size.h;
  const padL = 52, padR = 20, padT = 20, padB = 40;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  if(data.length === 0) return null;

  const maxVal = Math.max(...data.map(d=>d.spent), 1);
  const barW = Math.min((chartW/data.length)*0.6, 32);

  function xPos(i) { return padL + ((i+0.5)/data.length)*chartW; }
  function barH(v) { return (v/maxVal)*chartH; }

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{width:"100%"}}>
      {/* Grid */}
      {[0,0.5,1].map((t,i)=>{
        const y = padT + chartH - t*chartH;
        const val = t*maxVal;
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W-padR} y2={y}
              stroke={C.border} strokeWidth="1" strokeDasharray="4 4"/>
            <text x={padL-6} y={y+4} textAnchor="end"
              fontSize="8" fill={C.slate} fontFamily="Inter,sans-serif">
              {val>=1000?`${Math.round(val/100)/10}k`:Math.round(val)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d,i)=>{
        const bH = barH(d.spent);
        const color = d.saved >= 0 ? C.lime : C.danger;
        return (
          <g key={i}>
            <rect x={xPos(i)-barW/2} y={padT+chartH-bH} width={barW} height={bH}
              rx="4" fill={color} opacity=".8"/>
            <text x={xPos(i)} y={padT+chartH-bH-4} textAnchor="middle"
              fontSize="7" fill={color} fontFamily="Inter,sans-serif" fontWeight="700">
              {d.saved>=0?"+":""}{fmt(d.saved).replace("$","").replace("-","-$")}
            </text>
            <text x={xPos(i)} y={H-padB+16} textAnchor="middle"
              fontSize="8" fill={C.slate} fontFamily="Inter,sans-serif">
              {fmtMonthShort(d.ym)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── TRENDS VIEW ─────────────────────────────────────────
function TrendsView({ savedPeriods, expenses, income, C, i, compact=false }) {
  const allPeriods = useMemo(()=>{
    // Combine closed periods + current period
    const now = new Date();
    const nowYM = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
    const totalIncome = parseFloat(income)||0;
    const totalSpent  = expenses.reduce((s,e)=>s+e.amount,0);

    const closed = savedPeriods.map(p=>({
      ym:     p.date?.slice(0,7)||nowYM,
      label:  p.label,
      income: p.income||totalIncome,
      spent:  p.spent,
      saved:  p.saved,
    }));

    const current = {
      ym:     nowYM,
      label:  "Actual",
      income: totalIncome,
      spent:  totalSpent,
      saved:  totalIncome-totalSpent,
    };

    return [...closed.reverse(), current];
  },[savedPeriods, expenses, income]);

  const stats = useMemo(()=>{
    if(allPeriods.length===0) return null;
    const avgSpent  = allPeriods.reduce((s,p)=>s+p.spent,0)/allPeriods.length;
    const avgSaved  = allPeriods.reduce((s,p)=>s+p.saved,0)/allPeriods.length;
    const bestMonth = allPeriods.reduce((a,b)=>a.saved>b.saved?a:b);
    const worstMonth= allPeriods.reduce((a,b)=>a.saved<b.saved?a:b);
    const totalSaved= allPeriods.reduce((s,p)=>s+(p.saved>0?p.saved:0),0);
    return { avgSpent, avgSaved, bestMonth, worstMonth, totalSaved };
  },[allPeriods]);

  const [chartType, setChartType] = useState("line");

  if(allPeriods.length < 2) return (
    <div style={{padding:compact?"1rem":"1.5rem 1.25rem",paddingBottom:compact?"0":"6rem",textAlign:"center"}}>
      <div style={{marginTop:"3rem"}}>
        <MiniET mood="sleepy" size={56} C={C}/>
        <div style={{fontSize:"1rem",fontWeight:700,color:C.white,marginTop:"1rem"}}>
          {i?.myGoals ? "📈" : "📈"} Tendencias
        </div>
        <div style={{fontSize:"0.85rem",color:C.slate,marginTop:"0.5rem",lineHeight:1.5}}>
          Necesitas al menos 2 períodos<br/>para ver tendencias.<br/>
          <span style={{color:C.lime}}>Reinicia un período para empezar.</span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{padding:compact?"0.5rem":"1rem 1.25rem",paddingBottom:compact?"0":"6rem"}}>
      {/* Header - hidden in compact mode */}
      {!compact&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
        <div>
          <div style={{fontWeight:900,fontSize:"1.1rem",color:C.white}}>📈 Tendencias</div>
          <div style={{fontSize:"0.7rem",color:C.slate}}>{allPeriods.length} períodos analizados</div>
        </div>
        {/* Chart type toggle */}
        <div style={{display:"flex",gap:"0.3rem"}}>
          {[{id:"line",icon:"📈"},{id:"bar",icon:"📊"}].map(t=>(
            <button key={t.id} onClick={()=>setChartType(t.id)}
              style={{padding:"0.4rem 0.6rem",borderRadius:8,border:`1px solid ${chartType===t.id?C.lime:C.border}`,
                background:chartType===t.id?`${C.lime}20`:C.elevated,
                color:chartType===t.id?C.lime:C.slate,cursor:"pointer",fontFamily:"inherit",fontSize:"0.9rem"}}>
              {t.icon}
            </button>
          ))}
        </div>
      </div>}

      {/* Stats cards */}
      {stats&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem",marginBottom:"1rem"}}>
          {[
            {label:"Mejor mes",   value:stats.bestMonth.label,  sub:fmt(stats.bestMonth.saved),  color:C.lime,   icon:"🏆"},
            {label:"Peor mes",    value:stats.worstMonth.label, sub:fmt(stats.worstMonth.saved), color:C.danger, icon:"📉"},
            {label:"Gasto prom.", value:fmt(stats.avgSpent),    sub:"por período",               color:C.warn,   icon:"📊"},
            {label:"Total ahorrado",value:fmt(stats.totalSaved),sub:"acumulado",                 color:C.lime,   icon:"💰"},
          ].map((s,i)=>(
            <div key={i} style={{background:C.card,borderRadius:12,padding:"0.75rem",
              border:`1px solid ${C.border}`,borderLeft:`3px solid ${s.color}`}}>
              <div style={{fontSize:"0.65rem",color:C.slate,marginBottom:2}}>{s.icon} {s.label}</div>
              <div style={{fontWeight:800,color:s.color,fontSize:"0.95rem"}}>{s.value}</div>
              <div style={{fontSize:"0.65rem",color:C.slate}}>{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      <div style={{background:C.card,borderRadius:16,padding:"0.75rem",
        border:`1px solid ${C.border}`,marginBottom:"1rem"}}>
        {chartType==="line"
          ? <LineChart data={allPeriods} C={C} size={{w:320,h:200}}/>
          : <BarChart  data={allPeriods} C={C} size={{w:320,h:200}}/>
        }
      </div>

      {/* Period list - hidden in compact mode */}
      {!compact&&(
        <div>
          <div style={{fontSize:"0.7rem",color:C.slate,textTransform:"uppercase",
            letterSpacing:"0.08em",marginBottom:"0.6rem"}}>
            Detalle por período
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"0.4rem"}}>
            {[...allPeriods].reverse().map((p,idx)=>{
              const isPos = p.saved >= 0;
              const pct   = p.income>0 ? Math.min((p.spent/p.income)*100,100) : 0;
              const mood  = p.saved>=p.income*0.2?"cool":isPos?"happy":p.saved>=-p.income*0.1?"sweat":"cry";
              return (
                <div key={idx} style={{background:C.card,borderRadius:12,padding:"0.75rem 1rem",
                  border:`1px solid ${C.border}`,borderLeft:`3px solid ${isPos?C.lime:C.danger}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.4rem"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <MiniET mood={mood} size={24} C={C}/>
                      <div>
                        <div style={{fontWeight:700,fontSize:"0.85rem",color:C.white}}>{p.label}</div>
                        <div style={{fontSize:"0.6rem",color:C.slate}}>
                          Ingreso: <span style={{color:C.white}}>{fmt(p.income)}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontWeight:800,fontSize:"0.9rem",color:isPos?C.lime:C.danger}}>
                        {isPos?"+":""}{fmt(p.saved)}
                      </div>
                      <div style={{fontSize:"0.6rem",color:C.slate}}>Gastado: {fmt(p.spent)}</div>
                    </div>
                  </div>
                  <div style={{height:4,background:C.border,borderRadius:999,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,
                      background:pct>90?C.danger:pct>70?C.warn:C.lime,
                      borderRadius:999,transition:"width 0.5s ease"}}/>
                  </div>
                  <div style={{fontSize:"0.6rem",color:C.slate,marginTop:3}}>
                    {Math.round(pct)}% del ingreso gastado
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


// ── RING ──────────────────────────────────────────────
function Ring({ pct, color, size=72, C }) {
  const r=28, circ=2*Math.PI*r;
  const dash=Math.min(pct/100,1)*circ;
  const stroke=pct>90?C.danger:pct>70?C.warn:color;
  return (
    <svg width={size} height={size} viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke={C.border} strokeWidth="6"/>
      <circle cx="36" cy="36" r={r} fill="none" stroke={stroke} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 36 36)"
        style={{transition:"stroke-dasharray 0.6s cubic-bezier(.4,0,.2,1)"}}/>
      <text x="36" y="40" textAnchor="middle" fill={stroke} fontSize="11" fontWeight="800"
        fontFamily="Inter,sans-serif">
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

// ── PIE CHART ─────────────────────────────────────────

function PieChart({ items, size=200, C }) {
  const total = items.reduce((s,i)=>s+i.value,0);
  if(total===0) return null;
  const pad=8, cx=size/2, cy=size/2;
  const r=(size/2)-pad-10, inner=r*0.45;
  const strokeW=r-inner, circumference=2*Math.PI*r;

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
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth={strokeW}/>
        {slices.map((s,i)=>(
          <circle key={i} cx={cx} cy={cy} r={r}
            fill="none" stroke={s.color} strokeWidth={strokeW}
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={s.offset}
            strokeLinecap="butt"/>
        ))}
        <circle cx={cx} cy={cy} r={inner} fill={C.card}/>
        <text x={cx} y={cy-4} textAnchor="middle" fill={C.white}
          fontSize="12" fontWeight="800" fontFamily="Inter,sans-serif">
          {fmt(total).replace("$","")}
        </text>
        <text x={cx} y={cy+10} textAnchor="middle" fill={C.slate}
          fontSize="8" fontFamily="Inter,sans-serif">total</text>
      </svg>
      <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem",justifyContent:"center",
        marginTop:"0.5rem",padding:"0 0.5rem"}}>
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

// ── CATEGORY MODAL ────────────────────────────────────

function CategoryModal({ cat, expenses, onClose, onDelete, onEdit, C }) {
  const catExp = expenses.filter(e=>e.cat===cat.id).sort((a,b)=>b.date.localeCompare(a.date));
  const total = catExp.reduce((s,e)=>s+e.amount,0);
  const byDesc = {};
  catExp.forEach(e=>{ byDesc[e.desc]=(byDesc[e.desc]||0)+e.amount; });
  const pieItems = Object.entries(byDesc).map(([label,value],i)=>({
    label, value,
    color:[cat.color,"#7c6af7","#38bdf8","#fb7185","#34d399","#f5a623","#a78bfa"][i%7],
  }));

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:200,
      display:"flex",flexDirection:"column",justifyContent:"flex-end"}}
      onClick={onClose}>
      <div style={{background:C.card,borderRadius:"20px 20px 0 0",padding:"1.5rem 1.25rem",
        maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem"}}>
          <div>
            <div style={{fontSize:"1.1rem",fontWeight:900,color:C.white}}>{cat.emoji} {cat.label}</div>
            <div style={{fontSize:"0.75rem",color:C.slate}}>{catExp.length} gastos</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontWeight:800,color:cat.color,fontSize:"1.2rem"}}>{fmt(total)}</div>
            <button onClick={onClose}
              style={{background:C.border,border:"none",color:C.slate,borderRadius:8,
                padding:"0.25rem 0.6rem",fontSize:"0.75rem",cursor:"pointer",
                fontFamily:"inherit",marginTop:4}}>
              ✕ Cerrar
            </button>
          </div>
        </div>
        {pieItems.length>1&&(
          <div style={{marginBottom:"1.25rem"}}>
            <PieChart items={pieItems} size={180} C={C}/>
          </div>
        )}
        <div style={{fontSize:"0.7rem",color:C.slate,textTransform:"uppercase",
          letterSpacing:"0.08em",marginBottom:"0.6rem"}}>Todos los gastos</div>
        <div style={{display:"flex",flexDirection:"column",gap:"0.45rem"}}>
          {catExp.map(e=>(
            <div key={e.id} style={{background:C.elevated,borderRadius:11,
              padding:"0.65rem 0.75rem",borderLeft:`3px solid ${cat.color}`}}>
              <div style={{display:"flex",alignItems:"center",gap:"0.65rem"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:"0.85rem",color:C.white}}>{e.desc}</div>
                  {e.note&&<div style={{fontSize:"0.7rem",color:C.lime,marginTop:2}}>📝 {e.note}</div>}
                  <div style={{fontSize:"0.65rem",color:C.slate,marginTop:2}}>{fmtKey(e.date)}</div>
                </div>
                <div style={{fontWeight:700,color:C.danger,fontSize:"0.85rem",whiteSpace:"nowrap"}}>
                  -{fmt(e.amount)}
                </div>
                <button onClick={()=>onEdit(e)}
                  style={{background:"none",border:"none",color:C.lime,cursor:"pointer",fontSize:"0.85rem"}}>✏️</button>
                <button onClick={()=>onDelete(e.id)}
                  style={{background:"none",border:"none",color:C.slate,cursor:"pointer",fontSize:"0.85rem"}}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── EDIT MODAL ────────────────────────────────────────

function EditModal({ expense, onSave, onClose, C, i }) {
  const [desc,setDesc]     = useState(expense.desc);
  const [amount,setAmount] = useState(String(expense.amount));
  const [note,setNote]     = useState(expense.note||"");
  const [cat,setCat]       = useState(expense.cat);

  const inp = {
    width:"100%", padding:"0.8rem 1rem",
    background: C.isLight ? "#F5E6F0" : C.border,
    border:`1.5px solid ${C.border}`,
    borderRadius:12, color:C.white, fontSize:"0.95rem",
    outline:"none", boxSizing:"border-box", fontFamily:"inherit",
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:300,
      display:"flex",alignItems:"center",justifyContent:"center",padding:"1.25rem"}}
      onClick={onClose}>
      <div style={{background:C.card,borderRadius:20,padding:"1.5rem",width:"100%",
        maxWidth:380,border:`1px solid ${C.border}`}} onClick={e=>e.stopPropagation()}>
        <div style={{fontWeight:800,fontSize:"1rem",color:C.white,marginBottom:"1.25rem"}}>
          {i?.editExpense||"✏️ Editar gasto"}
        </div>
        <select value={cat} onChange={e=>setCat(e.target.value)}
          style={{...inp,marginBottom:"0.75rem",cursor:"pointer"}}>
          {CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
        </select>
        <input value={desc} onChange={e=>setDesc(e.target.value)}
          placeholder={i?.description||"Descripción"}
          style={{...inp,marginBottom:"0.75rem"}} autoComplete="off"/>
        <div style={{position:"relative",marginBottom:"0.75rem"}}>
          <span style={{position:"absolute",left:12,top:"50%",
            transform:"translateY(-50%)",color:C.lime,fontWeight:800}}>$</span>
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)}
            placeholder="0.00" style={{...inp,paddingLeft:"1.75rem"}}/>
        </div>
        <input value={note} onChange={e=>setNote(e.target.value)}
          placeholder={i?.noteHint||"Nota (opcional)"}
          style={{...inp,marginBottom:"1rem"}} autoComplete="off"/>
        <div style={{display:"flex",gap:"0.5rem"}}>
          <button onClick={onClose}
            style={{flex:1,padding:"0.8rem",background:C.border,border:"none",
              borderRadius:12,color:C.slate,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
            {i?.cancel||"Cancelar"}
          </button>
          <button onClick={()=>{
            const amt=parseFloat(amount);
            if(!desc.trim()||isNaN(amt)||amt<=0)return;
            onSave({...expense,desc,amount:amt,note,cat});
          }}
            style={{flex:2,padding:"0.8rem",background:C.lime,border:"none",
              borderRadius:12,color:C.bg,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>
            {i?.save||"Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ADD VIEW ──────────────────────────────────────────

function AddView({ form, setForm, addExpense, etMood, remColor, remaining, i, T }) {
  const tc = T || {};
  const ti = i || {};
  const inputStyle = {
    width:"100%", padding:"0.8rem 1rem",
    background: tc.isLight ? "#F5E6F0" : tc.border,
    border:`1.5px solid ${tc.border}`,
    borderRadius:12, color:tc.white, fontSize:"0.95rem",
    outline:"none", boxSizing:"border-box", fontFamily:"inherit",
  };

  return (
    <div style={{padding:"1.5rem 1.25rem",paddingBottom:"6rem",
      background:tc.bg,minHeight:"100svh"}}>
      <div style={{textAlign:"center",marginBottom:"1.5rem"}}>
        <ET size={56} mood={etMood}/>
        <div style={{fontSize:"0.75rem",color:tc.slate,marginTop:4}}>
          Disponible: <span style={{color:remColor,fontWeight:700}}>{fmt(remaining)}</span>
        </div>
      </div>
      <div style={{background:tc.card,borderRadius:16,padding:"1.25rem",
        border:`1px solid ${tc.border}`}}>
        <div style={{fontSize:"0.7rem",color:tc.slate,textTransform:"uppercase",
          letterSpacing:"0.08em",marginBottom:"0.75rem"}}>
          {ti.newExpense||"Nuevo gasto"} — {fmtKey(todayKey())}
        </div>
        <select value={form.cat} onChange={e=>setForm(f=>({...f,cat:e.target.value}))}
          style={{...inputStyle,marginBottom:"0.75rem",cursor:"pointer"}}>
          {CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
        </select>
        <input
          placeholder={ti.description||"Descripción"}
          value={form.desc}
          autoComplete="off" autoCorrect="off" spellCheck="false"
          onChange={e=>setForm(f=>({...f,desc:e.target.value}))}
          style={{...inputStyle,marginBottom:"0.75rem"}}/>
        <input
          placeholder={ti.noteHint||"Nota (opcional)"}
          value={form.note||""}
          autoComplete="off"
          onChange={e=>setForm(f=>({...f,note:e.target.value}))}
          style={{...inputStyle,marginBottom:"0.75rem"}}/>
        <div style={{position:"relative",marginBottom:"1rem"}}>
          <span style={{position:"absolute",left:12,top:"50%",
            transform:"translateY(-50%)",color:tc.lime,fontWeight:800}}>$</span>
          <input type="number" placeholder="0.00" value={form.amount}
            onChange={e=>setForm(f=>({...f,amount:e.target.value}))}
            onKeyDown={e=>e.key==="Enter"&&addExpense()}
            style={{...inputStyle,paddingLeft:"1.75rem"}}/>
        </div>
        <button onClick={addExpense}
          style={{width:"100%",padding:"0.9rem",background:tc.lime,border:"none",
            borderRadius:12,color:tc.bg,fontWeight:900,fontSize:"1rem",
            cursor:"pointer",fontFamily:"inherit"}}>
          {ti.saveExpense||"Guardar gasto"}
        </button>
      </div>
    </div>
  );
}



// ET — Mascota de Easy Tracker
// Rediseñado estilo caricatura moderna (referencia búho verde)
// Estados: "happy" | "sleepy" | "coffee" | "sweat" | "cool" | "cry"

function ET({ size = 80, mood = "happy" }) {
  const s = size;
  const id = `et_${mood}_${Math.random().toString(36).slice(2,6)}`;

  const css = `
    @keyframes ${id}_bounce {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-4px); }
    }
    @keyframes ${id}_blink {
      0%,88%,100% { transform: scaleY(1); }
      93%         { transform: scaleY(0.05); }
    }
    @keyframes ${id}_zzz1 {
      0%   { opacity:0; transform: translate(0,0) scale(0.5); }
      40%  { opacity:1; }
      100% { opacity:0; transform: translate(12px,-16px) scale(1); }
    }
    @keyframes ${id}_zzz2 {
      0%,25% { opacity:0; transform: translate(0,0) scale(0.4); }
      65%    { opacity:1; }
      100%   { opacity:0; transform: translate(18px,-22px) scale(1.2); }
    }
    @keyframes ${id}_sweat {
      0%   { opacity:1; transform: translateY(0) scaleY(1); }
      100% { opacity:0; transform: translateY(14px) scaleY(1.3); }
    }
    @keyframes ${id}_tear {
      0%   { opacity:1; transform: translateY(0); }
      100% { opacity:0; transform: translateY(18px); }
    }
    @keyframes ${id}_shake {
      0%,100% { transform: rotate(0deg); }
      20%     { transform: rotate(-4deg); }
      60%     { transform: rotate(4deg); }
    }
    @keyframes ${id}_celebrate {
      0%,100% { transform: rotate(-8deg) translateY(0); }
      50%     { transform: rotate(8deg) translateY(-4px); }
    }
    @keyframes ${id}_confetti1 {
      0%   { opacity:1; transform: translate(0,0) rotate(0deg); }
      100% { opacity:0; transform: translate(-14px,-18px) rotate(-120deg); }
    }
    @keyframes ${id}_confetti2 {
      0%   { opacity:1; transform: translate(0,0) rotate(0deg); }
      100% { opacity:0; transform: translate(14px,-20px) rotate(120deg); }
    }
    @keyframes ${id}_confetti3 {
      0%   { opacity:1; transform: translate(0,0); }
      100% { opacity:0; transform: translate(0,-22px); }
    }
    @keyframes ${id}_tilt {
      0%,100% { transform: rotate(-10deg); }
      50%     { transform: rotate(-14deg); }
    }
    @keyframes ${id}_wing {
      0%,100% { transform: rotate(-5deg); }
      50%     { transform: rotate(8deg); }
    }
  `;

  // Color palette — green owl
  const bodyGreen  = "#2EAF7D";
  const bodyDark   = "#1D8F62";
  const bodyLight  = "#4DD4A0";
  const cream      = "#F5EDD6";
  const creamDark  = "#E8D9B8";
  const eyeWhite   = "#FFFFFF";
  const pupilDark  = "#1A1A1A";
  const beakOrange = "#F5A623";
  const beakDark   = "#D4891A";
  const footOrange = "#F5A623";
  const lime       = "#c8f135";

  // ── SHARED BODY PARTS ────────────────────────────────
  function Body({ anim }) {
    return (
      <g style={anim ? { animation: anim } : {}}>
        {/* Shadow */}
        <ellipse cx={s*.5} cy={s*.94} rx={s*.28} ry={s*.04} fill="rgba(0,0,0,0.12)"/>

        {/* Left wing */}
        <g style={{transformOrigin:`${s*.18}px ${s*.62}px`,
          animation:`${id}_wing 1.2s ease-in-out infinite`}}>
          <ellipse cx={s*.18} cy={s*.62} rx={s*.13} ry={s*.2}
            fill={bodyDark} transform={`rotate(-20,${s*.18},${s*.62})`}/>
          <ellipse cx={s*.15} cy={s*.64} rx={s*.09} ry={s*.15}
            fill={bodyGreen} transform={`rotate(-20,${s*.15},${s*.64})`}/>
        </g>

        {/* Right wing */}
        <g style={{transformOrigin:`${s*.82}px ${s*.62}px`,
          animation:`${id}_wing 1.2s ease-in-out infinite reverse`}}>
          <ellipse cx={s*.82} cy={s*.62} rx={s*.13} ry={s*.2}
            fill={bodyDark} transform={`rotate(20,${s*.82},${s*.62})`}/>
          <ellipse cx={s*.85} cy={s*.64} rx={s*.09} ry={s*.15}
            fill={bodyGreen} transform={`rotate(20,${s*.85},${s*.64})`}/>
        </g>

        {/* Body */}
        <ellipse cx={s*.5} cy={s*.65} rx={s*.28} ry={s*.3} fill={bodyGreen}/>
        {/* Body shading */}
        <ellipse cx={s*.44} cy={s*.58} rx={s*.1} ry={s*.14} fill={bodyLight} opacity=".35"/>

        {/* Belly */}
        <ellipse cx={s*.5} cy={s*.7} rx={s*.18} ry={s*.2} fill={cream}/>
        {/* Belly feather marks */}
        <path d={`M${s*.43},${s*.67} Q${s*.5},${s*.64} ${s*.57},${s*.67}`}
          stroke={creamDark} strokeWidth={s*.015} fill="none" strokeLinecap="round"/>
        <path d={`M${s*.42},${s*.73} Q${s*.5},${s*.7} ${s*.58},${s*.73}`}
          stroke={creamDark} strokeWidth={s*.013} fill="none" strokeLinecap="round"/>
        <path d={`M${s*.44},${s*.79} Q${s*.5},${s*.76} ${s*.56},${s*.79}`}
          stroke={creamDark} strokeWidth={s*.012} fill="none" strokeLinecap="round"/>

        {/* Feet */}
        <g>
          <rect x={s*.35} y={s*.88} width={s*.06} height={s*.07} rx={s*.02} fill={footOrange}/>
          <rect x={s*.29} y={s*.93} width={s*.07} height={s*.04} rx={s*.02} fill={footOrange}/>
          <rect x={s*.36} y={s*.93} width={s*.07} height={s*.04} rx={s*.02} fill={footOrange}/>
          <rect x={s*.43} y={s*.93} width={s*.07} height={s*.04} rx={s*.02} fill={footOrange}/>
        </g>
        <g>
          <rect x={s*.59} y={s*.88} width={s*.06} height={s*.07} rx={s*.02} fill={footOrange}/>
          <rect x={s*.53} y={s*.93} width={s*.07} height={s*.04} rx={s*.02} fill={footOrange}/>
          <rect x={s*.6} y={s*.93} width={s*.07} height={s*.04} rx={s*.02} fill={footOrange}/>
          <rect x={s*.67} y={s*.93} width={s*.07} height={s*.04} rx={s*.02} fill={footOrange}/>
        </g>

        {/* Head */}
        <circle cx={s*.5} cy={s*.36} r={s*.3} fill={bodyGreen}/>
        {/* Head shading */}
        <circle cx={s*.4} cy={s*.28} r={s*.12} fill={bodyLight} opacity=".3"/>

        {/* Ear tufts */}
        <path d={`M${s*.27},${s*.14} L${s*.22},${s*.03} L${s*.34},${s*.12}`}
          fill={bodyDark} stroke={bodyDark} strokeWidth={s*.01}
          strokeLinejoin="round"/>
        <path d={`M${s*.73},${s*.14} L${s*.78},${s*.03} L${s*.66},${s*.12}`}
          fill={bodyDark} stroke={bodyDark} strokeWidth={s*.01}
          strokeLinejoin="round"/>
        {/* Tuft highlight */}
        <path d={`M${s*.27},${s*.13} L${s*.24},${s*.06} L${s*.31},${s*.12}`}
          fill={bodyGreen} opacity=".6"/>
        <path d={`M${s*.73},${s*.13} L${s*.76},${s*.06} L${s*.69},${s*.12}`}
          fill={bodyGreen} opacity=".6"/>

        {/* Face plate */}
        <ellipse cx={s*.5} cy={s*.38} rx={s*.22} ry={s*.2} fill={cream} opacity=".9"/>

        {/* Beak */}
        <path d={`M${s*.44},${s*.44} L${s*.56},${s*.44} L${s*.5},${s*.52}`}
          fill={beakOrange}/>
        <path d={`M${s*.44},${s*.44} L${s*.56},${s*.44} L${s*.5},${s*.47}`}
          fill={beakDark} opacity=".4"/>
      </g>
    );
  }

  // ── EYE HELPER ───────────────────────────────────────
  function Eye({ cx, cy, r=s*.1, pupilDy=2, blinkAnim, extra }) {
    return (
      <g style={blinkAnim?{animation:blinkAnim,transformOrigin:`${cx}px ${cy}px`}:{}}>
        {/* Eye white */}
        <circle cx={cx} cy={cy} r={r} fill={eyeWhite}/>
        {/* Eye ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={bodyDark}
          strokeWidth={s*.015} opacity=".3"/>
        {/* Pupil */}
        <circle cx={cx} cy={cy+pupilDy*s*.01} r={r*.52} fill={pupilDark}/>
        {/* Shine 1 */}
        <circle cx={cx-r*.28} cy={cy-r*.3+pupilDy*s*.01} r={r*.2} fill={eyeWhite}/>
        {/* Shine 2 small */}
        <circle cx={cx+r*.22} cy={cy+r*.15+pupilDy*s*.01} r={r*.1} fill={eyeWhite} opacity=".7"/>
        {extra}
      </g>
    );
  }

  // ── HAPPY ────────────────────────────────────────────
  if(mood==="happy") return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} overflow="visible">
      <style>{css}</style>
      <g style={{animation:`${id}_bounce 2s ease-in-out infinite`}}>
        <Body/>
        {/* Brow happy */}
        <path d={`M${s*.26},${s*.23} Q${s*.33},${s*.19} ${s*.4},${s*.23}`}
          stroke={bodyDark} strokeWidth={s*.022} fill="none" strokeLinecap="round"/>
        <path d={`M${s*.6},${s*.23} Q${s*.67},${s*.19} ${s*.74},${s*.23}`}
          stroke={bodyDark} strokeWidth={s*.022} fill="none" strokeLinecap="round"/>
        {/* Eyes with blink */}
        <Eye cx={s*.34} cy={s*.33} blinkAnim={`${id}_blink 3.5s ease-in-out infinite`}/>
        <Eye cx={s*.66} cy={s*.33} blinkAnim={`${id}_blink 3.5s ease-in-out infinite 0.1s`}/>
        {/* Smile */}
        <path d={`M${s*.4},${s*.5} Q${s*.5},${s*.56} ${s*.6},${s*.5}`}
          stroke={bodyDark} strokeWidth={s*.022} fill="none" strokeLinecap="round"/>
      </g>
    </svg>
  );

  // ── SLEEPY ───────────────────────────────────────────
  if(mood==="sleepy") return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} overflow="visible">
      <style>{css}</style>
      <Body anim={`${id}_tilt 2.5s ease-in-out infinite`}/>
      {/* Half closed eyes */}
      <circle cx={s*.34} cy={s*.33} r={s*.1} fill={eyeWhite}/>
      <rect x={s*.24} y={s*.24} width={s*.2} height={s*.12} rx={s*.04}
        fill={bodyGreen}/>
      <circle cx={s*.66} cy={s*.33} r={s*.1} fill={eyeWhite}/>
      <rect x={s*.56} y={s*.24} width={s*.2} height={s*.12} rx={s*.04}
        fill={bodyGreen}/>
      {/* Drowsy lines */}
      <path d={`M${s*.26},${s*.27} L${s*.42},${s*.27}`}
        stroke={bodyDark} strokeWidth={s*.02} strokeLinecap="round"/>
      <path d={`M${s*.58},${s*.27} L${s*.74},${s*.27}`}
        stroke={bodyDark} strokeWidth={s*.02} strokeLinecap="round"/>
      {/* Zzz */}
      <text x={s*.72} y={s*.2} fontSize={s*.12} fill={lime} fontWeight="900"
        fontFamily="Inter,sans-serif"
        style={{animation:`${id}_zzz1 2s ease-in-out infinite`}}>z</text>
      <text x={s*.8} y={s*.1} fontSize={s*.16} fill={lime} fontWeight="900"
        fontFamily="Inter,sans-serif"
        style={{animation:`${id}_zzz2 2s ease-in-out infinite`}}>Z</text>
    </svg>
  );

  // ── COOL (celebrating) ───────────────────────────────
  if(mood==="cool") return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} overflow="visible">
      <style>{css}</style>
      <g style={{animation:`${id}_celebrate 1s ease-in-out infinite`}}>
        <Body/>
        {/* Happy arc eyes */}
        <path d={`M${s*.24},${s*.33} Q${s*.34},${s*.24} ${s*.44},${s*.33}`}
          stroke={pupilDark} strokeWidth={s*.035} fill="none" strokeLinecap="round"/>
        <path d={`M${s*.56},${s*.33} Q${s*.66},${s*.24} ${s*.76},${s*.33}`}
          stroke={pupilDark} strokeWidth={s*.035} fill="none" strokeLinecap="round"/>
        {/* Big smile */}
        <path d={`M${s*.38},${s*.5} Q${s*.5},${s*.6} ${s*.62},${s*.5}`}
          stroke={bodyDark} strokeWidth={s*.025} fill="none" strokeLinecap="round"/>
        {/* Rosy cheeks */}
        <circle cx={s*.24} cy={s*.42} r={s*.05} fill="#FF9BB0" opacity=".5"/>
        <circle cx={s*.76} cy={s*.42} r={s*.05} fill="#FF9BB0" opacity=".5"/>
      </g>
      {/* Confetti */}
      <rect x={s*.2} y={s*.12} width={s*.05} height={s*.05} rx={s*.01}
        fill="#FF6B9D" style={{animation:`${id}_confetti1 1.2s ease-out infinite`}}/>
      <rect x={s*.72} y={s*.1} width={s*.05} height={s*.05} rx={s*.01}
        fill="#c8f135" style={{animation:`${id}_confetti2 1.2s ease-out infinite 0.2s`}}/>
      <circle cx={s*.5} cy={s*.08} r={s*.03}
        fill="#38bdf8" style={{animation:`${id}_confetti3 1.2s ease-out infinite 0.4s`}}/>
      <rect x={s*.14} y={s*.18} width={s*.04} height={s*.04} rx={s*.01}
        fill="#a78bfa" style={{animation:`${id}_confetti1 1.2s ease-out infinite 0.6s`}}/>
      <rect x={s*.78} y={s*.2} width={s*.04} height={s*.04} rx={s*.01}
        fill="#f5a623" style={{animation:`${id}_confetti2 1.2s ease-out infinite 0.3s`}}/>
    </svg>
  );

  // ── SWEAT ────────────────────────────────────────────
  if(mood==="sweat") return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} overflow="visible">
      <style>{css}</style>
      <g style={{animation:`${id}_shake 0.6s ease-in-out infinite`}}>
        <Body/>
        {/* Wide worried eyes */}
        <Eye cx={s*.34} cy={s*.32} r={s*.11} pupilDy={1}/>
        <Eye cx={s*.66} cy={s*.32} r={s*.11} pupilDy={1}/>
        {/* Worried brows — inner corners up */}
        <path d={`M${s*.24},${s*.2} Q${s*.31},${s*.24} ${s*.4},${s*.21}`}
          stroke={bodyDark} strokeWidth={s*.025} fill="none" strokeLinecap="round"/>
        <path d={`M${s*.6},${s*.21} Q${s*.69},${s*.24} ${s*.76},${s*.2}`}
          stroke={bodyDark} strokeWidth={s*.025} fill="none" strokeLinecap="round"/>
        {/* Nervous mouth */}
        <path d={`M${s*.41},${s*.52} Q${s*.46},${s*.49} ${s*.5},${s*.52} Q${s*.54},${s*.55} ${s*.59},${s*.52}`}
          stroke={bodyDark} strokeWidth={s*.02} fill="none" strokeLinecap="round"/>
      </g>
      {/* Sweat drops */}
      <ellipse cx={s*.16} cy={s*.3} rx={s*.025} ry={s*.04}
        fill="#7EC8E3" style={{animation:`${id}_sweat 0.9s ease-in infinite`}}/>
      <ellipse cx={s*.84} cy={s*.28} rx={s*.02} ry={s*.032}
        fill="#7EC8E3" style={{animation:`${id}_sweat 0.9s ease-in infinite 0.3s`}}/>
      <ellipse cx={s*.12} cy={s*.42} rx={s*.018} ry={s*.028}
        fill="#7EC8E3" style={{animation:`${id}_sweat 0.9s ease-in infinite 0.6s`}}/>
    </svg>
  );

  // ── CRY ──────────────────────────────────────────────
  if(mood==="cry") return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} overflow="visible">
      <style>{css}</style>
      <Body/>
      {/* Sad droopy eyes */}
      <Eye cx={s*.34} cy={s*.34} r={s*.1} pupilDy={2}
        extra={
          <>
            <path d={`M${s*.25},${s*.27} Q${s*.31},${s*.3} ${s*.38},${s*.27}`}
              stroke={bodyDark} strokeWidth={s*.02} fill="none" strokeLinecap="round"/>
          </>
        }/>
      <Eye cx={s*.66} cy={s*.34} r={s*.1} pupilDy={2}
        extra={
          <>
            <path d={`M${s*.62},${s*.27} Q${s*.69},${s*.3} ${s*.75},${s*.27}`}
              stroke={bodyDark} strokeWidth={s*.02} fill="none" strokeLinecap="round"/>
          </>
        }/>
      {/* Sad brows */}
      <path d={`M${s*.26},${s*.22} Q${s*.3},${s*.26} ${s*.38},${s*.23}`}
        stroke={bodyDark} strokeWidth={s*.022} fill="none" strokeLinecap="round"/>
      <path d={`M${s*.62},${s*.23} Q${s*.7},${s*.26} ${s*.74},${s*.22}`}
        stroke={bodyDark} strokeWidth={s*.022} fill="none" strokeLinecap="round"/>
      {/* Sad mouth */}
      <path d={`M${s*.4},${s*.55} Q${s*.5},${s*.5} ${s*.6},${s*.55}`}
        stroke={bodyDark} strokeWidth={s*.022} fill="none" strokeLinecap="round"/>
      {/* Tears */}
      <ellipse cx={s*.29} cy={s*.46} rx={s*.025} ry={s*.05}
        fill="#7EC8E3" style={{animation:`${id}_tear 1s ease-in infinite`}}/>
      <ellipse cx={s*.71} cy={s*.46} rx={s*.025} ry={s*.05}
        fill="#7EC8E3" style={{animation:`${id}_tear 1s ease-in infinite 0.3s`}}/>
      <ellipse cx={s*.26} cy={s*.56} rx={s*.02} ry={s*.038}
        fill="#7EC8E3" style={{animation:`${id}_tear 1s ease-in infinite 0.5s`}}/>
      <ellipse cx={s*.74} cy={s*.56} rx={s*.02} ry={s*.038}
        fill="#7EC8E3" style={{animation:`${id}_tear 1s ease-in infinite 0.7s`}}/>
    </svg>
  );

  // ── COFFEE (default fallback) ─────────────────────────
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} overflow="visible">
      <style>{css}</style>
      <g style={{animation:`${id}_bounce 1.5s ease-in-out infinite`}}>
        <Body/>
        <Eye cx={s*.34} cy={s*.32} r={s*.11} pupilDy={0}/>
        <Eye cx={s*.66} cy={s*.32} r={s*.11} pupilDy={0}/>
        <path d={`M${s*.26},${s*.2} Q${s*.33},${s*.15} ${s*.42},${s*.2}`}
          stroke={bodyDark} strokeWidth={s*.022} fill="none" strokeLinecap="round"/>
        <path d={`M${s*.58},${s*.2} Q${s*.67},${s*.15} ${s*.74},${s*.2}`}
          stroke={bodyDark} strokeWidth={s*.022} fill="none" strokeLinecap="round"/>
        <path d={`M${s*.4},${s*.51} Q${s*.5},${s*.57} ${s*.6},${s*.51}`}
          stroke={bodyDark} strokeWidth={s*.022} fill="none" strokeLinecap="round"/>
      </g>
    </svg>
  );
}

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
  const totalSpent  = useMemo(()=>expenses.reduce((s,e)=>s
