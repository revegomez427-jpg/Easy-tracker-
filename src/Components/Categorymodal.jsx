
import { CATEGORIES } from "../constants.js";
import { fmt, fmtKey } from "../utils.js";
import PieChart from "./PieChart.jsx";

export default function CategoryModal({ cat, expenses, onClose, onDelete, onEdit, C }) {
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
