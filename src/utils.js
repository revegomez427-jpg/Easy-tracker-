import { MONTHS_ES, STORAGE_KEY } from "./constants.js";

export function fmt(n) {
  return n.toLocaleString("en-US",{style:"currency",currency:"USD",maximumFractionDigits:2});
}

export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

export function monthKey(dateKey) {
  return dateKey.slice(0,7);
}

export function fmtKey(key) {
  const [y,m,d] = key.split("-");
  return `${d}/${m}/${y}`;
}

export function fmtKeyLong(key) {
  const [,m,d] = key.split("-");
  return `${parseInt(d)} de ${MONTHS_ES[parseInt(m)-1]}`;
}

export function fmtMonth(ym) {
  const [y,m] = ym.split("-");
  return `${MONTHS_ES[parseInt(m)-1]} ${y}`;
}

export function loadData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
}

export function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export function exportCSV(expenses, categories) {
  const header = "Fecha,Categoría,Descripción,Nota,Monto\n";
  const rows = expenses.map(e => {
    const cat = categories.find(c=>c.id===e.cat) || categories[categories.length-1];
    return `${fmtKey(e.date)},${cat.label},"${e.desc}","${e.note||""}",${e.amount}`;
  }).join("\n");
  const blob = new Blob([header+rows],{type:"text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href=url; a.download="gastos-easy-tracker.csv"; a.click();
  URL.revokeObjectURL(url);
}

export function exportBackup(data) {
  const blob = new Blob([JSON.stringify({...data,version:"1.2",exportedAt:new Date().toISOString()},null,2)],
    {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href=url; a.download=`et-backup-${todayKey()}.json`; a.click();
  URL.revokeObjectURL(url);
}

export function fmtDate(key) {
  const [y,m,d] = key.split("-");
  return `${d}/${m}/${y}`;
}
