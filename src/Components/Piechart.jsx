import { fmt } from "../utils.js";

export default function PieChart({ items, size=200, C }) {
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
