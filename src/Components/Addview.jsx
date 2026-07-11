import ET from "./ET.jsx";
import { fmt, fmtKey, todayKey } from "../utils.js";
import { CATEGORIES } from "../constants.js";

export default function AddView({ form, setForm, addExpense, etMood, remColor, remaining, i, T }) {
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
