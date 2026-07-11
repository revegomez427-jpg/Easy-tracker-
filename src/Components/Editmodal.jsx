
import { useState } from "react";
import { fmt } from "../utils.js";
import { CATEGORIES } from "../constants.js";

export default function EditModal({ expense, onSave, onClose, C, i }) {
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
