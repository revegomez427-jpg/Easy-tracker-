import { useState, useMemo } from "react";

const C = {
  bg:       "#080f1e",
  card:     "#0d1526",
  elevated: "#152038",
  border:   "#1c2d4a",
  lime:     "#c8f135",
  slate:    "#4a6080",
  white:    "#f0f4ff",
  danger:   "#ff5e5e",
  warn:     "#f5a623",
};

const PERIODS = [
  { id: "weekly",   label: "Semanal",   short: "semana"   },
  { id: "biweekly", label: "Quincenal", short: "quincena" },
  { id: "monthly",  label: "Mensual",   short: "mes"      },
];

const CATEGORIES = [
  { id: "housing",   label: "Renta",      emoji: "🏠", color: "#7c6af7" },
  { id: "food",      label: "Comida",     emoji: "🛒", color: "#f5a623" },
  { id: "transport", label: "Transporte", emoji: "🚗", color: C.lime    },
  { id: "bills",     label: "Bills",      emoji: "💡", color: "#38bdf8" },
  { id: "health",    label: "Salud",      emoji: "💊", color: "#fb7185" },
  { id: "savings",   label: "Ahorros",    emoji: "🏦", color: "#a78bfa" },
  { id: "personal",  label: "Personal",   emoji: "👤", color: "#34d399" },
  { id: "loan",      label: "Préstamo",   emoji: "🤝", color: "#f97316" },
  { id: "other",     label: "Otro",       emoji: "📦", color: C.slate   },
];

const MONTHS_ES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];
const DAYS_ES = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

function fmt(n) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function fmtKey(key) {
  const [y,m,d] = key.split("-");
  return `${d}/${m}/${y}`;
}
function fmtKeyLong(key) {
  const [,m,d] = key.split("-");
  return `${parseInt(d)} de ${MONTHS_ES[parseInt(m)-1]}`;
}

// ── OWL ────────────────────────────────────────────────
function Owl({ size = 64, eyeColor = C.lime, mood = "happy" }) {
  const py = mood === "alert" ? 26 : 28;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <ellipse cx="40" cy="50" rx="22" ry="24" fill="#152038"/>
      <ellipse cx="40" cy="28" rx="20" ry="18" fill="#1c2d4a"/>
      <polygon points="24,14 20,4 28,12" fill="#1c2d4a"/>
      <polygon points="56,14 60,4 52,12" fill="#1c2d4a"/>
      <ellipse cx="20" cy="54" rx="9" ry="14" fill="#152038" transform="rotate(-12 20 54)"/>
      <ellipse cx="60" cy="54" rx="9" ry="14" fill="#152038" transform="rotate(12 60 54)"/>
      <ellipse cx="40" cy="55" rx="13" ry="14" fill="#1c2d4a"/>
      <path d="M33 50 Q40 53 47 50" stroke="#253858" strokeWidth="1.5" fill="none"/>
      <path d="M31 56 Q40 60 49 56" stroke="#253858" strokeWidth="1.5" fill="none"/>
      <circle cx="31" cy="27" r="9" fill="#080f1e"/>
      <circle cx="49" cy="27" r="9" fill="#080f1e"/>
      <circle cx="31" cy="27" r="9" fill="none" stroke={eyeColor} strokeWidth="2" opacity="0.6"/>
      <circle cx="49" cy="27" r="9" fill="none" stroke={eyeColor} strokeWidth="2" opacity="0.6"/>
      <circle cx="31" cy={py} r="4.5" fill={eyeColor}/>
      <circle cx="49" cy={py} r="4.5" fill={eyeColor}/>
      <circle cx="29" cy={py-1.5} r="1.5" fill="white" opacity="0.8"/>
      <circle cx="47" cy={py-1.5} r="1.5" fill="white" opacity="0.8"/>
      <polygon points="40,30 36,36 44,36" fill={eyeColor} opacity="0.9"/>
      <path d="M33 72 L30 76 M33 72 L33 76 M33 72 L36 76" stroke={C.slate} strokeWidth="2" strokeLinecap="round"/>
      <path d="M47 72 L44 76 M47 72 L47 76 M47 72 L50 76" stroke={C.slate} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

// ── RING ───────────────────────────────────────────────
function Ring({ pct, color, size = 72 }) {
  const r = 28, circ = 2 * Math.PI * r;
  const dash = Math.min(pct / 100, 1) * circ;
  const stroke = pct > 90 ? C.danger : pct > 70 ? C.warn : color;
  return (
    <svg width={size} height={size} viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke={C.border} strokeWidth="6"/>
      <circle cx="36" cy="36" r={r} fill="none" stroke={stroke} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 36 36)"
        style={{ transition: "stroke-dasharray 0.6s cubic-bezier(.4,0,.2,1)" }}/>
      <text x="36" y="40" textAnchor="middle" fill={stroke} fontSize="11" fontWeight="800">
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

// ── STORAGE HELPERS ────────────────────────────────────
const STORAGE_KEY = "et_data";

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {/* ignore */}
}

// ── APP ────────────────────────────────────────────────
export default function App() {
  const saved = useMemo(() => loadData(), []);

  const [screen, setScreen]     = useState(saved?.income ? "main" : "setup");
  const [income, setIncome]     = useState(saved?.income || "");
  const [period, setPeriod]     = useState(saved?.period || "biweekly");
  const [expenses, setExpenses] = useState(saved?.expenses || []);
  const [tab, setTab]           = useState("home");
  const [form, setForm]         = useState({ desc: "", amount: "", cat: "food" });
  const [calMonth, setCalMonth] = useState(new Date());
  const [selDay, setSelDay]     = useState(null);
  const [toast, setToast]       = useState(null);

  const totalIncome = parseFloat(income) || 0;
  const totalSpent  = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const remaining   = totalIncome - totalSpent;
  const pct         = totalIncome > 0 ? (totalSpent / totalIncome) * 100 : 0;
  const owlEye      = pct > 90 ? C.danger : pct > 70 ? C.warn : C.lime;
  const owlMood     = pct > 90 ? "alert" : "happy";
  const remColor    = remaining < 0 ? C.danger : remaining < totalIncome * 0.1 ? C.warn : C.lime;
  const periodLabel = PERIODS.find(p => p.id === period)?.short || "período";

  const byDate = useMemo(() => {
    const m = {};
    expenses.forEach(e => { if (!m[e.date]) m[e.date] = []; m[e.date].push(e); });
    return m;
  }, [expenses]);

  const byCategory = useMemo(() => {
    const m = {};
    expenses.forEach(e => { m[e.cat] = (m[e.cat] || 0) + e.amount; });
    return m;
  }, [expenses]);

  function persist(newIncome, newPeriod, newExpenses) {
    saveData({ income: newIncome, period: newPeriod, expenses: newExpenses });
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  function handleStart() {
    if (!income) return;
    persist(income, period, expenses);
    setScreen("main");
  }

  function addExpense() {
    const amt = parseFloat(form.amount);
    if (!form.desc.trim() || isNaN(amt) || amt <= 0) return;
    const newExp = { id: Date.now(), ...form, amount: amt, date: todayKey() };
    const updated = [newExp, ...expenses];
    setExpenses(updated);
    persist(income, period, updated);
    setForm({ desc: "", amount: "", cat: form.cat });
    showToast("✓ Gasto guardado");
    setTab("home");
  }

  function delExpense(id) {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    persist(income, period, updated);
    showToast("Eliminado");
  }

  function handleEditSetup() {
    setScreen("setup");
  }

  function handleSetupSave() {
    persist(income, period, expenses);
    setScreen("main");
  }

  const inp = {
    width: "100%",
    padding: "0.8rem 1rem",
    background: C.border,
    border: "1.5px solid transparent",
    borderRadius: 12,
    color: C.white,
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  // ── SETUP ────────────────────────────────────────────
  if (screen === "setup") return (
    <div style={{ minHeight: "100svh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',sans-serif", padding: "1.5rem" }}>
      <Owl size={96} eyeColor={C.lime} mood="happy"/>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "0.5rem 0 2px" }}>
        <span style={{ fontSize: "2rem", fontWeight: 900, color: C.white }}>Easy</span>
        <span style={{ fontSize: "2rem", fontWeight: 900, color: C.lime }}>Tracker</span>
      </div>
      <p style={{ color: C.slate, fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "2rem" }}>ET · Tu dinero, claro</p>

      <div style={{ width: "100%", maxWidth: 340, background: C.card, borderRadius: 20, padding: "1.75rem 1.5rem", boxShadow: "0 32px 64px rgba(0,0,0,0.5)" }}>
        <p style={{ color: C.slate, fontSize: "0.8rem", textAlign: "center", marginBottom: "0.6rem" }}>¿Cada cuánto cobras?</p>
        <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.25rem" }}>
          {PERIODS.map(p => (
            <button key={p.id} onClick={() => setPeriod(p.id)}
              style={{ flex: 1, padding: "0.6rem 0", border: `1.5px solid ${period === p.id ? C.lime : C.border}`,
                borderRadius: 10, background: period === p.id ? `${C.lime}18` : C.border,
                color: period === p.id ? C.lime : C.slate, fontWeight: period === p.id ? 800 : 400,
                fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
              {p.label}
            </button>
          ))}
        </div>

        <p style={{ color: C.slate, fontSize: "0.8rem", textAlign: "center", marginBottom: "0.6rem" }}>
          ¿Cuánto cobras por {PERIODS.find(p => p.id === period)?.short}?
        </p>
        <div style={{ position: "relative", marginBottom: "1rem" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: C.lime, fontWeight: 800, fontSize: "1.1rem" }}>$</span>
          <input type="number" placeholder="0.00" value={income}
            onChange={e => setIncome(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleStart()}
            autoFocus
            style={{ ...inp, paddingLeft: "2.2rem", fontSize: "1.4rem", fontWeight: 800, textAlign: "center", border: `1.5px solid ${C.lime}40` }}/>
        </div>

        <button onClick={saved?.income ? handleSetupSave : handleStart}
          style={{ width: "100%", padding: "0.9rem", background: C.lime, border: "none", borderRadius: 12, color: C.bg, fontWeight: 900, fontSize: "1rem", cursor: "pointer", fontFamily: "inherit" }}>
          {saved?.income ? "Guardar cambios" : "Comenzar →"}
        </button>
      </div>
    </div>
  );

  // ── HOME ─────────────────────────────────────────────
  function HomeView() {
    const recent = expenses.slice(0, 5);
    return (
      <div style={{ paddingBottom: "6rem" }}>
        <div style={{ background: C.card, padding: "1.25rem 1.25rem 1.5rem", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Owl size={38} eyeColor={owlEye} mood={owlMood}/>
              <div>
                <div style={{ fontSize: "0.6rem", color: C.slate, letterSpacing: "0.1em", textTransform: "uppercase" }}>Easy Tracker</div>
                <div style={{ fontSize: "0.95rem", fontWeight: 900, color: C.lime }}>ET</div>
              </div>
            </div>
            <button onClick={handleEditSetup}
              style={{ background: C.border, border: "none", color: C.slate, borderRadius: 8, padding: "0.35rem 0.75rem", fontSize: "0.75rem", cursor: "pointer", fontFamily: "inherit" }}>
              ✏️ Editar
            </button>
          </div>

          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.65rem", color: C.slate, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
              Disponible esta {periodLabel}
            </div>
            <div style={{ fontSize: "2.75rem", fontWeight: 900, color: remColor, letterSpacing: -1, lineHeight: 1 }}>{fmt(remaining)}</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.65rem", color: C.slate, textTransform: "uppercase", marginBottom: 2 }}>Cobrado</div>
              <div style={{ fontWeight: 700, color: C.white }}>{fmt(totalIncome)}</div>
            </div>
            <Ring pct={pct} color={C.lime} size={70}/>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.65rem", color: C.slate, textTransform: "uppercase", marginBottom: 2 }}>Gastado</div>
              <div style={{ fontWeight: 700, color: C.danger }}>{fmt(totalSpent)}</div>
            </div>
          </div>

          <div style={{ marginTop: "1rem", height: 5, background: C.border, borderRadius: 999, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: pct > 90 ? C.danger : pct > 70 ? C.warn : C.lime, borderRadius: 999, transition: "width 0.5s ease" }}/>
          </div>
        </div>

        <div style={{ padding: "1rem 1.25rem" }}>
          {Object.keys(byCategory).length > 0 && (
            <>
              <div style={{ fontSize: "0.7rem", color: C.slate, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.6rem" }}>Por categoría</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1.25rem" }}>
                {CATEGORIES.filter(c => byCategory[c.id]).map(cat => {
                  const amt = byCategory[cat.id];
                  const cp = totalIncome > 0 ? (amt / totalIncome) * 100 : 0;
                  return (
                    <div key={cat.id} style={{ background: C.card, borderRadius: 12, padding: "0.65rem", display: "flex", alignItems: "center", gap: 8, border: `1px solid ${C.border}` }}>
                      <Ring pct={cp} color={cat.color} size={48}/>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: "0.7rem", color: C.slate }}>{cat.emoji} {cat.label}</div>
                        <div style={{ fontWeight: 700, color: cat.color, fontSize: "0.9rem" }}>{fmt(amt)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div style={{ fontSize: "0.7rem", color: C.slate, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.6rem" }}>Últimos gastos</div>
          {recent.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem 0", color: C.slate, fontSize: "0.85rem" }}>
              <Owl size={56} eyeColor={C.slate} mood="happy"/>
              <div style={{ marginTop: "0.75rem" }}>Sin gastos aún.<br/>Toca <strong style={{ color: C.lime }}>＋</strong> para agregar.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
              {recent.map(e => {
                const cat = CATEGORIES.find(c => c.id === e.cat) || CATEGORIES[7];
                return (
                  <div key={e.id} style={{ display: "flex", alignItems: "center", gap: "0.65rem", background: C.card, borderRadius: 11, padding: "0.65rem 0.75rem", borderLeft: `3px solid ${cat.color}` }}>
                    <span style={{ fontSize: "1rem" }}>{cat.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.desc}</div>
                      <div style={{ fontSize: "0.65rem", color: C.slate }}>{fmtKey(e.date)} · {cat.label}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: C.danger, fontSize: "0.85rem", whiteSpace: "nowrap" }}>-{fmt(e.amount)}</div>
                    <button onClick={() => delExpense(e.id)} style={{ background: "none", border: "none", color: C.slate, cursor: "pointer", fontSize: "0.85rem", padding: "0.1rem" }}>✕</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── CALENDAR ──────────────────────────────────────────
  function CalendarView() {
    const year = calMonth.getFullYear(), month = calMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    const todayStr = todayKey();

    return (
      <div style={{ padding: "1rem 1.25rem", paddingBottom: "6rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <button onClick={() => setCalMonth(new Date(year, month - 1, 1))}
            style={{ background: C.card, border: `1px solid ${C.border}`, color: C.white, borderRadius: 8, padding: "0.4rem 0.75rem", cursor: "pointer", fontSize: "1rem" }}>‹</button>
          <span style={{ fontWeight: 800, fontSize: "1rem", color: C.white }}>{MONTHS_ES[month]} {year}</span>
          <button onClick={() => setCalMonth(new Date(year, month + 1, 1))}
            style={{ background: C.card, border: `1px solid ${C.border}`, color: C.white, borderRadius: 8, padding: "0.4rem 0.75rem", cursor: "pointer", fontSize: "1rem" }}>›</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: "0.4rem" }}>
          {DAYS_ES.map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: "0.65rem", color: C.slate, fontWeight: 700, padding: "0.3rem 0" }}>{d}</div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "0.25rem" }}>
          {cells.map((d, i) => {
            if (!d) return <div key={`e${i}`}/>;
            const key = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
            const hasExp = !!byDate[key];
            const dayTotal = hasExp ? byDate[key].reduce((s, e) => s + e.amount, 0) : 0;
            const isToday = key === todayStr;
            const isSel = key === selDay;
            return (
              <button key={key} onClick={() => setSelDay(isSel ? null : key)}
                style={{ background: isSel ? C.lime : hasExp ? C.elevated : C.card,
                  border: isToday ? `2px solid ${C.lime}` : `1px solid ${C.border}`,
                  borderRadius: 10, padding: "0.4rem 0.2rem",
                  cursor: hasExp ? "pointer" : "default",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
                  minHeight: 44, transition: "background 0.2s" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: isToday ? 900 : 600, color: isSel ? C.bg : isToday ? C.lime : C.white }}>{d}</span>
                {hasExp && <span style={{ fontSize: "0.55rem", color: isSel ? C.bg : C.danger, fontWeight: 700 }}>-{fmt(dayTotal).replace("$","")}</span>}
                {hasExp && <div style={{ width: 4, height: 4, borderRadius: "50%", background: isSel ? C.bg : C.lime }}/>}
              </button>
            );
          })}
        </div>

        {selDay && byDate[selDay] && (
          <div style={{ marginTop: "1.25rem", background: C.card, borderRadius: 16, padding: "1.25rem", border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <div>
                <div style={{ fontSize: "0.7rem", color: C.slate, textTransform: "uppercase", letterSpacing: "0.06em" }}>{fmtKeyLong(selDay)}</div>
                <div style={{ fontWeight: 800, color: C.danger, fontSize: "1.1rem" }}>-{fmt(byDate[selDay].reduce((s,e) => s+e.amount, 0))}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.7rem", color: C.slate }}>Gastos ese día</div>
                <div style={{ fontWeight: 700, color: C.white }}>{byDate[selDay].length}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {byDate[selDay].map(e => {
                const cat = CATEGORIES.find(c => c.id === e.cat) || CATEGORIES[7];
                return (
                  <div key={e.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: C.elevated, borderRadius: 10, padding: "0.65rem 0.75rem", borderLeft: `3px solid ${cat.color}` }}>
                    <span style={{ fontSize: "1.1rem" }}>{cat.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.desc}</div>
                      <div style={{ fontSize: "0.7rem", color: C.slate }}>{cat.label}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: C.danger, fontSize: "0.9rem", whiteSpace: "nowrap" }}>-{fmt(e.amount)}</div>
                    <button onClick={() => delExpense(e.id)} style={{ background: "none", border: "none", color: C.slate, cursor: "pointer", fontSize: "0.9rem", padding: "0.2rem" }}>✕</button>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: "0.75rem", padding: "0.6rem 0.75rem", background: C.elevated, borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", color: C.slate }}>Balance total restante</span>
              <span style={{ fontWeight: 800, color: remColor, fontSize: "0.95rem" }}>{fmt(remaining)}</span>
            </div>
          </div>
        )}
        {selDay && !byDate[selDay] && (
          <div style={{ marginTop: "1.25rem", background: C.card, borderRadius: 16, padding: "1.5rem", textAlign: "center", color: C.slate, fontSize: "0.85rem" }}>
            Sin gastos registrados ese día.
          </div>
        )}
      </div>
    );
  }

  // ── ADD ───────────────────────────────────────────────
  function AddView() {
    return (
      <div style={{ padding: "1.5rem 1.25rem", paddingBottom: "6rem" }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <Owl size={56} eyeColor={owlEye} mood={owlMood}/>
          <div style={{ fontSize: "0.75rem", color: C.slate, marginTop: 4 }}>
            Disponible: <span style={{ color: remColor, fontWeight: 700 }}>{fmt(remaining)}</span>
          </div>
        </div>
        <div style={{ background: C.card, borderRadius: 16, padding: "1.25rem", border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: "0.7rem", color: C.slate, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
            Nuevo gasto — {fmtKey(todayKey())}
          </div>
          <select value={form.cat} onChange={e => setForm(f => ({ ...f, cat: e.target.value }))}
            style={{ ...inp, marginBottom: "0.75rem", cursor: "pointer" }}>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
          </select>
          <input
            placeholder="Descripción (ej: Gasolina)"
            value={form.desc}
            autoComplete="off"
            onChange={e => { const v = e.target.value; setForm(f => ({ ...f, desc: v })); }}
            style={{ ...inp, marginBottom: "0.75rem" }}/>
          <div style={{ position: "relative", marginBottom: "1rem" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.lime, fontWeight: 800 }}>$</span>
            <input type="number" placeholder="0.00" value={form.amount}
              onChange={e => { const v = e.target.value; setForm(f => ({ ...f, amount: v })); }}
              onKeyDown={e => e.key === "Enter" && addExpense()}
              style={{ ...inp, paddingLeft: "1.75rem" }}/>
          </div>
          <button onClick={addExpense}
            style={{ width: "100%", padding: "0.9rem", background: C.lime, border: "none", borderRadius: 12, color: C.bg, fontWeight: 900, fontSize: "1rem", cursor: "pointer", fontFamily: "inherit" }}>
            Guardar gasto
          </button>
        </div>
      </div>
    );
  }

  // ── NAV ───────────────────────────────────────────────
  const navItems = [
    { id: "home",     icon: "📊", label: "Inicio"   },
    { id: "calendar", icon: "📅", label: "Historial" },
    { id: "add",      icon: "＋",  label: "Agregar"  },
  ];

  return (
    <div style={{ minHeight: "100svh", background: C.bg, fontFamily: "'Inter',sans-serif", color: C.white, maxWidth: 480, margin: "0 auto", position: "relative" }}>

      {toast && (
        <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", background: C.lime, color: C.bg, padding: "0.5rem 1.25rem", borderRadius: 999, fontWeight: 700, fontSize: "0.85rem", zIndex: 999, whiteSpace: "nowrap", boxShadow: `0 8px 24px rgba(200,241,53,0.3)` }}>
          {toast}
        </div>
      )}

      <div style={{ paddingBottom: 70 }}>
        {tab === "home"     && <HomeView/>}
        {tab === "calendar" && <CalendarView/>}
        {tab === "add"      && <AddView/>}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: C.card, borderTop: `1px solid ${C.border}`, display: "flex", zIndex: 100 }}>
        {navItems.map(item => {
          const active = tab === item.id;
          const isAdd = item.id === "add";
          return (
            <button key={item.id} onClick={() => setTab(item.id)}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: isAdd ? "0.5rem 0" : "0.6rem 0",
                background: isAdd ? (active ? C.lime : `${C.lime}15`) : "none",
                border: "none", cursor: "pointer", gap: 2,
                borderTop: isAdd && active ? `2px solid ${C.lime}` : "2px solid transparent" }}>
              <span style={{ fontSize: isAdd ? "1.4rem" : "1.1rem", color: active ? (isAdd ? C.bg : C.lime) : C.slate, lineHeight: 1 }}>{item.icon}</span>
              <span style={{ fontSize: "0.6rem", color: active ? (isAdd ? C.bg : C.lime) : C.slate, fontWeight: active ? 700 : 400 }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
