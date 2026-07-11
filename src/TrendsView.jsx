import { useMemo } from "react";

const MONTHS_ES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function fmt(n) {
  return n.toLocaleString("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0});
}
function fmtMonth(ym) {
  const [y,m] = ym.split("-");
  return `${MONTHS_ES[parseInt(m)-1]} ${y.slice(2)}`;
}

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
          {fmtMonth(d.ym)}
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
              {fmtMonth(d.ym)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── TRENDS VIEW ─────────────────────────────────────────
export default function TrendsView({ savedPeriods, expenses, income, C, i }) {
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
    <div style={{padding:"1.5rem 1.25rem",paddingBottom:"6rem",textAlign:"center"}}>
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
    <div style={{padding:"1rem 1.25rem",paddingBottom:"6rem"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
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
      </div>

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

      {/* Period list */}
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
              {/* Progress bar */}
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
  );
}

// Need useState
import { useState } from "react";
