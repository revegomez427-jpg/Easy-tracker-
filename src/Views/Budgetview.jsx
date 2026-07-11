
import { useState } from "react";
import { fmt } from "../utils.js";
import { CATEGORIES } from "../constants.js";

const RULES = [
  { id:"50-30-20", label:"50/30/20", desc:"Clásica — necesidades, personal, ahorro", needs:50, personal:30, saving:20 },
  { id:"70-20-10", label:"70/20/10", desc:"Para deudas o ingresos bajos",            needs:70, personal:20, saving:10 },
  { id:"60-20-20", label:"60/20/20", desc:"Equilibrada con buen ahorro",             needs:60, personal:20, saving:20 },
  { id:"80-20",    label:"80/20",    desc:"Simple — gasta 80, ahorra 20",            needs:60, personal:20, saving:20 },
  { id:"custom",   label:"Custom",   desc:"Tú decides los porcentajes",              needs:50, personal:30, saving:20 },
];

const NEEDS_CATS    = ["housing","transport","bills","health"];
const PERSONAL_CATS = ["food","personal","loan","other"];

export default function BudgetView({ expenses, totalIncome, budgetRule, setBudgetRule, budgetPcts, setBudgetPcts, persist, T, i }) {
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
