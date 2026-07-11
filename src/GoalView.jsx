import { useState, useMemo } from "react";
import { fmt, todayKey, fmtDate } from "./utils.js";
import { CATEGORIES } from "./constants.js";

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
export default function GoalView({ savedPeriods, showToast, persistGoals, goals, setGoals, theme }) {
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
