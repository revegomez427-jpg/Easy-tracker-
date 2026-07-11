
import { useState } from "react";
import { fmt, fmtKey, fmtKeyLong, todayKey } from "../utils.js";
import { CATEGORIES, MONTHS_ES, DAYS_ES } from "../constants.js";

export default function CalendarView({ expenses, remaining, remColor, delExpense, setEditExp, T, i }) {
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
