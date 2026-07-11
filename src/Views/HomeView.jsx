
import { useState, useMemo } from "react";
import ET from "../components/ET.jsx";
import Ring from "../components/Ring.jsx";
import PieChart from "../components/PieChart.jsx";
import CategoryModal from "../components/CategoryModal.jsx";
import EditModal from "../components/EditModal.jsx";
import { fmt, fmtKey, todayKey } from "../utils.js";
import { CATEGORIES } from "../constants.js";

export default function HomeView({
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
