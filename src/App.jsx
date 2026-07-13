import { useState, useEffect, useMemo } from 'react'
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore'

// ============================================================
// FIREBASE
// ============================================================
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}
const firebaseApp = initializeApp(firebaseConfig)
const auth = getAuth(firebaseApp)
const db = getFirestore(firebaseApp)
const googleProvider = new GoogleAuthProvider()

// ============================================================
// CATEGORÍAS
// ============================================================
const CATEGORIES = [
  { id: 'housing', label: 'Renta', emoji: '🏠', color: '#a78bfa' },
  { id: 'transport', label: 'Transporte', emoji: '🚗', color: '#38bdf8' },
  { id: 'bills', label: 'Servicios', emoji: '💡', color: '#22d3ee' },
  { id: 'health', label: 'Salud', emoji: '💊', color: '#4ade80' },
  { id: 'food', label: 'Comida', emoji: '🛒', color: '#fb923c' },
  { id: 'personal', label: 'Personal', emoji: '🎉', color: '#f472b6' },
  { id: 'loan', label: 'Préstamo', emoji: '🤝', color: '#f5a623' },
  { id: 'savings', label: 'Ahorro', emoji: '💰', color: '#c8f135' },
  { id: 'other', label: 'Otro', emoji: '📦', color: '#94a3b8' },
]

const NEEDS_CATS = ['housing', 'transport', 'bills', 'health']
const PERSONAL_CATS = ['food', 'personal', 'loan', 'other']
const SAVING_CATS = ['savings']

const PERIODS = [
  { id: 'weekly', label: 'Semanal', short: 'semana', shortKey: 'weekShort', labelKey: 'weeklyLabel' },
  { id: 'biweekly', label: 'Quincenal', short: 'quincena', shortKey: 'biweekShort', labelKey: 'biweeklyLabel' },
  { id: 'monthly', label: 'Mensual', short: 'mes', shortKey: 'monthShort', labelKey: 'monthlyLabel' },
]

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// ============================================================
// TEMAS
// ============================================================
const THEMES = {
  dark: {
    name: 'Oscuro', icon: '🌙',
    bg: '#080f1e', card: '#0d1526', elevated: '#152038', border: '#1c2d4a',
    lime: '#c8f135', slate: '#4a6080', white: '#f0f4ff',
    danger: '#ff5e5e', warn: '#f5a623', isLight: false,
  },
  light: {
    name: 'Claro', icon: '☀️',
    bg: '#f8fafc', card: '#ffffff', elevated: '#f1f5f9', border: '#e2e8f0',
    lime: '#65a30d', slate: '#64748b', white: '#0f172a',
    danger: '#dc2626', warn: '#d97706', isLight: true,
  },
}
const THEME_ORDER = ['dark', 'light']

// ============================================================
// IDIOMAS
// ============================================================
const LANGUAGES = [
  { id: 'es', label: 'Español', flag: '🇪🇸' },
  { id: 'en', label: 'English', flag: '🇺🇸' },
]

const T_ES = {
  howOftenPaid: '¿Cada cuánto te pagan?',
  howMuchPerPeriod: '¿Cuánto ganas por',
  saveChanges: 'Guardar cambios',
  start: 'Comenzar',
  weeklyLabel: 'Semanal', biweeklyLabel: 'Quincenal', monthlyLabel: 'Mensual',
  weekShort: 'semana', biweekShort: 'quincena', monthShort: 'mes',
  earned: 'Ingreso', spent: 'Gastado', remaining: 'Disponible',
  byCategory: 'Por categoría', tapForDetail: 'toca para detalles',
  allExpenses: 'Todos los gastos', search: 'Buscar...',
  noExpenses: 'Todavía no tienes gastos.', tapToAdd: 'Toca + para agregar.',
  expenses: 'gastos',
  periodsPlural: 'períodos', fromPeriods: 'período',
  reinitToAccumulate: 'Cierra un período para empezar a acumular',
  needs: 'Necesidades', needsDesc: 'Renta, servicios, transporte, salud',
  personal: 'Personal', personalDesc: 'Comida, gustos, préstamos',
  saving: 'Ahorro', savingDesc: 'Lo que apartas',
  budget: 'Presupuesto', noRuleSelected: 'Elige una regla arriba para empezar.',
  home: 'Inicio', history: 'Calendario', goals: 'Metas',
  appearance: 'Apariencia', data: 'Datos',
  exportCSV: 'Exportar CSV', downloadExpenses: 'Descargar tus gastos',
  backup: 'Respaldo', saveBackup: 'Guardar copia de seguridad',
  restore: 'Restaurar', importBackup: 'Importar copia de seguridad',
  language: 'Idioma', settings: 'Ajustes',
  editIncome: 'Editar ingreso', changeAmount: 'Cambiar monto y período',
  resetPeriod: 'Reiniciar período', closeAndStart: 'Cerrar y empezar de nuevo',
  resetDesc: 'Esto guarda tus gastos actuales en el historial y empieza un período nuevo.',
  closeMonth: 'Parece que cambiaste de mes. ¿Quieres cerrar', andSave: 'y guardarlo?',
  monthSaved: 'guardado ✓',
  periodSaved: 'Período guardado', deleted: 'Eliminado',
  expenseUpdated: 'Gasto actualizado', expenseSaved: 'Gasto guardado',
  backupRestored: 'Respaldo restaurado ✓', backupError: 'No se pudo leer el archivo',
  newExpense: 'Nuevo gasto', description: 'Descripción', noteHint: 'Nota (opcional)',
  saveExpense: 'Guardar gasto',
}
const T_EN = {
  ...T_ES,
  howOftenPaid: 'How often are you paid?',
  howMuchPerPeriod: 'How much do you earn per',
  saveChanges: 'Save changes', start: 'Start',
  weeklyLabel: 'Weekly', biweeklyLabel: 'Biweekly', monthlyLabel: 'Monthly',
  weekShort: 'week', biweekShort: 'period', monthShort: 'month',
  earned: 'Earned', spent: 'Spent', remaining: 'Available',
  byCategory: 'By category', tapForDetail: 'tap for detail',
  allExpenses: 'All expenses', search: 'Search...',
  noExpenses: "You don't have expenses yet.", tapToAdd: 'Tap + to add.',
  expenses: 'expenses',
  needs: 'Needs', personal: 'Personal', saving: 'Savings',
  budget: 'Budget', noRuleSelected: 'Choose a rule above to start.',
  home: 'Home', history: 'Calendar', goals: 'Goals',
  appearance: 'Appearance', data: 'Data',
  exportCSV: 'Export CSV', downloadExpenses: 'Download your expenses',
  backup: 'Backup', saveBackup: 'Save backup',
  restore: 'Restore', importBackup: 'Import backup',
  language: 'Language', settings: 'Settings',
  editIncome: 'Edit income', changeAmount: 'Change amount and period',
  resetPeriod: 'Reset period', closeAndStart: 'Close and start over',
  resetDesc: 'This saves your current expenses to history and starts a new period.',
  newExpense: 'New expense', description: 'Description', noteHint: 'Note (optional)',
  saveExpense: 'Save expense',
}
const TRANSLATIONS = { es: T_ES, en: T_EN }

// ============================================================
// UTILIDADES
// ============================================================
function fmt(n) {
  const num = Number(n) || 0
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function todayKey() {
  return new Date().toISOString().slice(0, 10)
}
function fmtKey(key) {
  if (!key) return ''
  const [y, m, d] = key.split('-').map(Number)
  return `${d} ${MONTHS_ES[m - 1]?.slice(0, 3)}`
}
function fmtKeyLong(key) {
  if (!key) return ''
  const [y, m, d] = key.split('-').map(Number)
  return `${d} de ${MONTHS_ES[m - 1]} ${y}`
}
function monthKey(dateKey) {
  return dateKey ? dateKey.slice(0, 7) : ''
}
function exportCSV(expenses) {
  const header = 'Fecha,Categoria,Descripcion,Monto,Nota\n'
  const rows = expenses
    .map((e) => `${e.date},${e.cat},"${e.desc}",${e.amount},"${e.note || ''}"`)
    .join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `easytracker_${todayKey()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
function exportBackup(expenses, income, period, budgetRule, budgetPcts, savedPeriods, goals) {
  const data = { income, period, expenses, budgetRule, budgetPcts, savedPeriods, goals }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `easytracker_backup_${todayKey()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// ============================================================
// ET — MASCOTA
// ============================================================
function ET({ size = 80, mood = 'happy' }) {
  const s = size
  const id = `et_${mood}_${Math.random().toString(36).slice(2, 6)}`
  const css = `
    @keyframes ${id}_bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
    @keyframes ${id}_blink { 0%,88%,100% { transform: scaleY(1); } 93% { transform: scaleY(0.05); } }
    @keyframes ${id}_zzz1 { 0% { opacity:0; transform: translate(0,0) scale(0.5); } 40% { opacity:1; } 100% { opacity:0; transform: translate(12px,-16px) scale(1); } }
    @keyframes ${id}_zzz2 { 0%,25% { opacity:0; transform: translate(0,0) scale(0.4); } 65% { opacity:1; } 100% { opacity:0; transform: translate(18px,-22px) scale(1.2); } }
    @keyframes ${id}_sweat { 0% { opacity:1; transform: translateY(0) scaleY(1); } 100% { opacity:0; transform: translateY(14px) scaleY(1.3); } }
    @keyframes ${id}_tear { 0% { opacity:1; transform: translateY(0); } 100% { opacity:0; transform: translateY(18px); } }
    @keyframes ${id}_shake { 0%,100% { transform: rotate(0deg); } 20% { transform: rotate(-4deg); } 60% { transform: rotate(4deg); } }
    @keyframes ${id}_celebrate { 0%,100% { transform: rotate(-8deg) translateY(0); } 50% { transform: rotate(8deg) translateY(-4px); } }
    @keyframes ${id}_confetti1 { 0% { opacity:1; transform: translate(0,0) rotate(0deg); } 100% { opacity:0; transform: translate(-14px,-18px) rotate(-120deg); } }
    @keyframes ${id}_confetti2 { 0% { opacity:1; transform: translate(0,0) rotate(0deg); } 100% { opacity:0; transform: translate(14px,-20px) rotate(120deg); } }
    @keyframes ${id}_confetti3 { 0% { opacity:1; transform: translate(0,0); } 100% { opacity:0; transform: translate(0,-22px); } }
    @keyframes ${id}_tilt { 0%,100% { transform: rotate(-10deg); } 50% { transform: rotate(-14deg); } }
    @keyframes ${id}_wing { 0%,100% { transform: rotate(-5deg); } 50% { transform: rotate(8deg); } }
  `
  const bodyGreen = '#2EAF7D', bodyDark = '#1D8F62', bodyLight = '#4DD4A0'
  const cream = '#F5EDD6', creamDark = '#E8D9B8', eyeWhite = '#FFFFFF', pupilDark = '#1A1A1A'
  const beakOrange = '#F5A623', beakDark = '#D4891A', footOrange = '#F5A623', lime = '#c8f135'

  function Body({ anim }) {
    return (
      <g style={anim ? { animation: anim } : {}}>
        <ellipse cx={s * 0.5} cy={s * 0.94} rx={s * 0.28} ry={s * 0.04} fill="rgba(0,0,0,0.12)" />
        <g style={{ transformOrigin: `${s * 0.18}px ${s * 0.62}px`, animation: `${id}_wing 1.2s ease-in-out infinite` }}>
          <ellipse cx={s * 0.18} cy={s * 0.62} rx={s * 0.13} ry={s * 0.2} fill={bodyDark} transform={`rotate(-20,${s * 0.18},${s * 0.62})`} />
          <ellipse cx={s * 0.15} cy={s * 0.64} rx={s * 0.09} ry={s * 0.15} fill={bodyGreen} transform={`rotate(-20,${s * 0.15},${s * 0.64})`} />
        </g>
        <g style={{ transformOrigin: `${s * 0.82}px ${s * 0.62}px`, animation: `${id}_wing 1.2s ease-in-out infinite reverse` }}>
          <ellipse cx={s * 0.82} cy={s * 0.62} rx={s * 0.13} ry={s * 0.2} fill={bodyDark} transform={`rotate(20,${s * 0.82},${s * 0.62})`} />
          <ellipse cx={s * 0.85} cy={s * 0.64} rx={s * 0.09} ry={s * 0.15} fill={bodyGreen} transform={`rotate(20,${s * 0.85},${s * 0.64})`} />
        </g>
        <ellipse cx={s * 0.5} cy={s * 0.65} rx={s * 0.28} ry={s * 0.3} fill={bodyGreen} />
        <ellipse cx={s * 0.44} cy={s * 0.58} rx={s * 0.1} ry={s * 0.14} fill={bodyLight} opacity=".35" />
        <ellipse cx={s * 0.5} cy={s * 0.7} rx={s * 0.18} ry={s * 0.2} fill={cream} />
        <path d={`M${s * 0.43},${s * 0.67} Q${s * 0.5},${s * 0.64} ${s * 0.57},${s * 0.67}`} stroke={creamDark} strokeWidth={s * 0.015} fill="none" strokeLinecap="round" />
        <path d={`M${s * 0.42},${s * 0.73} Q${s * 0.5},${s * 0.7} ${s * 0.58},${s * 0.73}`} stroke={creamDark} strokeWidth={s * 0.013} fill="none" strokeLinecap="round" />
        <path d={`M${s * 0.44},${s * 0.79} Q${s * 0.5},${s * 0.76} ${s * 0.56},${s * 0.79}`} stroke={creamDark} strokeWidth={s * 0.012} fill="none" strokeLinecap="round" />
        <g>
          <rect x={s * 0.35} y={s * 0.88} width={s * 0.06} height={s * 0.07} rx={s * 0.02} fill={footOrange} />
          <rect x={s * 0.29} y={s * 0.93} width={s * 0.07} height={s * 0.04} rx={s * 0.02} fill={footOrange} />
          <rect x={s * 0.36} y={s * 0.93} width={s * 0.07} height={s * 0.04} rx={s * 0.02} fill={footOrange} />
          <rect x={s * 0.43} y={s * 0.93} width={s * 0.07} height={s * 0.04} rx={s * 0.02} fill={footOrange} />
        </g>
        <g>
          <rect x={s * 0.59} y={s * 0.88} width={s * 0.06} height={s * 0.07} rx={s * 0.02} fill={footOrange} />
          <rect x={s * 0.53} y={s * 0.93} width={s * 0.07} height={s * 0.04} rx={s * 0.02} fill={footOrange} />
          <rect x={s * 0.6} y={s * 0.93} width={s * 0.07} height={s * 0.04} rx={s * 0.02} fill={footOrange} />
          <rect x={s * 0.67} y={s * 0.93} width={s * 0.07} height={s * 0.04} rx={s * 0.02} fill={footOrange} />
        </g>
        <circle cx={s * 0.5} cy={s * 0.36} r={s * 0.3} fill={bodyGreen} />
        <circle cx={s * 0.4} cy={s * 0.28} r={s * 0.12} fill={bodyLight} opacity=".3" />
        <path d={`M${s * 0.27},${s * 0.14} L${s * 0.22},${s * 0.03} L${s * 0.34},${s * 0.12}`} fill={bodyDark} stroke={bodyDark} strokeWidth={s * 0.01} strokeLinejoin="round" />
        <path d={`M${s * 0.73},${s * 0.14} L${s * 0.78},${s * 0.03} L${s * 0.66},${s * 0.12}`} fill={bodyDark} stroke={bodyDark} strokeWidth={s * 0.01} strokeLinejoin="round" />
        <path d={`M${s * 0.27},${s * 0.13} L${s * 0.24},${s * 0.06} L${s * 0.31},${s * 0.12}`} fill={bodyGreen} opacity=".6" />
        <path d={`M${s * 0.73},${s * 0.13} L${s * 0.76},${s * 0.06} L${s * 0.69},${s * 0.12}`} fill={bodyGreen} opacity=".6" />
        <ellipse cx={s * 0.5} cy={s * 0.38} rx={s * 0.22} ry={s * 0.2} fill={cream} opacity=".9" />
        <path d={`M${s * 0.44},${s * 0.44} L${s * 0.56},${s * 0.44} L${s * 0.5},${s * 0.52}`} fill={beakOrange} />
        <path d={`M${s * 0.44},${s * 0.44} L${s * 0.56},${s * 0.44} L${s * 0.5},${s * 0.47}`} fill={beakDark} opacity=".4" />
      </g>
    )
  }
  function Eye({ cx, cy, r = s * 0.1, pupilDy = 2, blinkAnim, extra }) {
    return (
      <g style={blinkAnim ? { animation: blinkAnim, transformOrigin: `${cx}px ${cy}px` } : {}}>
        <circle cx={cx} cy={cy} r={r} fill={eyeWhite} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={bodyDark} strokeWidth={s * 0.015} opacity=".3" />
        <circle cx={cx} cy={cy + pupilDy * s * 0.01} r={r * 0.52} fill={pupilDark} />
        <circle cx={cx - r * 0.28} cy={cy - r * 0.3 + pupilDy * s * 0.01} r={r * 0.2} fill={eyeWhite} />
        <circle cx={cx + r * 0.22} cy={cy + r * 0.15 + pupilDy * s * 0.01} r={r * 0.1} fill={eyeWhite} opacity=".7" />
        {extra}
      </g>
    )
  }

  if (mood === 'happy')
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} overflow="visible">
        <style>{css}</style>
        <g style={{ animation: `${id}_bounce 2s ease-in-out infinite` }}>
          <Body />
          <path d={`M${s * 0.26},${s * 0.23} Q${s * 0.33},${s * 0.19} ${s * 0.4},${s * 0.23}`} stroke={bodyDark} strokeWidth={s * 0.022} fill="none" strokeLinecap="round" />
          <path d={`M${s * 0.6},${s * 0.23} Q${s * 0.67},${s * 0.19} ${s * 0.74},${s * 0.23}`} stroke={bodyDark} strokeWidth={s * 0.022} fill="none" strokeLinecap="round" />
          <Eye cx={s * 0.34} cy={s * 0.33} blinkAnim={`${id}_blink 3.5s ease-in-out infinite`} />
          <Eye cx={s * 0.66} cy={s * 0.33} blinkAnim={`${id}_blink 3.5s ease-in-out infinite 0.1s`} />
          <path d={`M${s * 0.4},${s * 0.5} Q${s * 0.5},${s * 0.56} ${s * 0.6},${s * 0.5}`} stroke={bodyDark} strokeWidth={s * 0.022} fill="none" strokeLinecap="round" />
        </g>
      </svg>
    )
  if (mood === 'sleepy')
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} overflow="visible">
        <style>{css}</style>
        <Body anim={`${id}_tilt 2.5s ease-in-out infinite`} />
        <circle cx={s * 0.34} cy={s * 0.33} r={s * 0.1} fill={eyeWhite} />
        <rect x={s * 0.24} y={s * 0.24} width={s * 0.2} height={s * 0.12} rx={s * 0.04} fill={bodyGreen} />
        <circle cx={s * 0.66} cy={s * 0.33} r={s * 0.1} fill={eyeWhite} />
        <rect x={s * 0.56} y={s * 0.24} width={s * 0.2} height={s * 0.12} rx={s * 0.04} fill={bodyGreen} />
        <path d={`M${s * 0.26},${s * 0.27} L${s * 0.42},${s * 0.27}`} stroke={bodyDark} strokeWidth={s * 0.02} strokeLinecap="round" />
        <path d={`M${s * 0.58},${s * 0.27} L${s * 0.74},${s * 0.27}`} stroke={bodyDark} strokeWidth={s * 0.02} strokeLinecap="round" />
        <text x={s * 0.72} y={s * 0.2} fontSize={s * 0.12} fill={lime} fontWeight="900" fontFamily="Inter,sans-serif" style={{ animation: `${id}_zzz1 2s ease-in-out infinite` }}>z</text>
        <text x={s * 0.8} y={s * 0.1} fontSize={s * 0.16} fill={lime} fontWeight="900" fontFamily="Inter,sans-serif" style={{ animation: `${id}_zzz2 2s ease-in-out infinite` }}>Z</text>
      </svg>
    )
  if (mood === 'cool')
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} overflow="visible">
        <style>{css}</style>
        <g style={{ animation: `${id}_celebrate 1s ease-in-out infinite` }}>
          <Body />
          <path d={`M${s * 0.24},${s * 0.33} Q${s * 0.34},${s * 0.24} ${s * 0.44},${s * 0.33}`} stroke={pupilDark} strokeWidth={s * 0.035} fill="none" strokeLinecap="round" />
          <path d={`M${s * 0.56},${s * 0.33} Q${s * 0.66},${s * 0.24} ${s * 0.76},${s * 0.33}`} stroke={pupilDark} strokeWidth={s * 0.035} fill="none" strokeLinecap="round" />
          <path d={`M${s * 0.38},${s * 0.5} Q${s * 0.5},${s * 0.6} ${s * 0.62},${s * 0.5}`} stroke={bodyDark} strokeWidth={s * 0.025} fill="none" strokeLinecap="round" />
          <circle cx={s * 0.24} cy={s * 0.42} r={s * 0.05} fill="#FF9BB0" opacity=".5" />
          <circle cx={s * 0.76} cy={s * 0.42} r={s * 0.05} fill="#FF9BB0" opacity=".5" />
        </g>
        <rect x={s * 0.2} y={s * 0.12} width={s * 0.05} height={s * 0.05} rx={s * 0.01} fill="#FF6B9D" style={{ animation: `${id}_confetti1 1.2s ease-out infinite` }} />
        <rect x={s * 0.72} y={s * 0.1} width={s * 0.05} height={s * 0.05} rx={s * 0.01} fill="#c8f135" style={{ animation: `${id}_confetti2 1.2s ease-out infinite 0.2s` }} />
        <circle cx={s * 0.5} cy={s * 0.08} r={s * 0.03} fill="#38bdf8" style={{ animation: `${id}_confetti3 1.2s ease-out infinite 0.4s` }} />
        <rect x={s * 0.14} y={s * 0.18} width={s * 0.04} height={s * 0.04} rx={s * 0.01} fill="#a78bfa" style={{ animation: `${id}_confetti1 1.2s ease-out infinite 0.6s` }} />
        <rect x={s * 0.78} y={s * 0.2} width={s * 0.04} height={s * 0.04} rx={s * 0.01} fill="#f5a623" style={{ animation: `${id}_confetti2 1.2s ease-out infinite 0.3s` }} />
      </svg>
    )
  if (mood === 'sweat')
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} overflow="visible">
        <style>{css}</style>
        <g style={{ animation: `${id}_shake 0.6s ease-in-out infinite` }}>
          <Body />
          <Eye cx={s * 0.34} cy={s * 0.32} r={s * 0.11} pupilDy={1} />
          <Eye cx={s * 0.66} cy={s * 0.32} r={s * 0.11} pupilDy={1} />
          <path d={`M${s * 0.24},${s * 0.2} Q${s * 0.31},${s * 0.24} ${s * 0.4},${s * 0.21}`} stroke={bodyDark} strokeWidth={s * 0.025} fill="none" strokeLinecap="round" />
          <path d={`M${s * 0.6},${s * 0.21} Q${s * 0.69},${s * 0.24} ${s * 0.76},${s * 0.2}`} stroke={bodyDark} strokeWidth={s * 0.025} fill="none" strokeLinecap="round" />
          <path d={`M${s * 0.41},${s * 0.52} Q${s * 0.46},${s * 0.49} ${s * 0.5},${s * 0.52} Q${s * 0.54},${s * 0.55} ${s * 0.59},${s * 0.52}`} stroke={bodyDark} strokeWidth={s * 0.02} fill="none" strokeLinecap="round" />
        </g>
        <ellipse cx={s * 0.16} cy={s * 0.3} rx={s * 0.025} ry={s * 0.04} fill="#7EC8E3" style={{ animation: `${id}_sweat 0.9s ease-in infinite` }} />
        <ellipse cx={s * 0.84} cy={s * 0.28} rx={s * 0.02} ry={s * 0.032} fill="#7EC8E3" style={{ animation: `${id}_sweat 0.9s ease-in infinite 0.3s` }} />
        <ellipse cx={s * 0.12} cy={s * 0.42} rx={s * 0.018} ry={s * 0.028} fill="#7EC8E3" style={{ animation: `${id}_sweat 0.9s ease-in infinite 0.6s` }} />
      </svg>
    )
  if (mood === 'cry')
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} overflow="visible">
        <style>{css}</style>
        <Body />
        <Eye cx={s * 0.34} cy={s * 0.34} r={s * 0.1} pupilDy={2} extra={<path d={`M${s * 0.25},${s * 0.27} Q${s * 0.31},${s * 0.3} ${s * 0.38},${s * 0.27}`} stroke={bodyDark} strokeWidth={s * 0.02} fill="none" strokeLinecap="round" />} />
        <Eye cx={s * 0.66} cy={s * 0.34} r={s * 0.1} pupilDy={2} extra={<path d={`M${s * 0.62},${s * 0.27} Q${s * 0.69},${s * 0.3} ${s * 0.75},${s * 0.27}`} stroke={bodyDark} strokeWidth={s * 0.02} fill="none" strokeLinecap="round" />} />
        <path d={`M${s * 0.26},${s * 0.22} Q${s * 0.3},${s * 0.26} ${s * 0.38},${s * 0.23}`} stroke={bodyDark} strokeWidth={s * 0.022} fill="none" strokeLinecap="round" />
        <path d={`M${s * 0.62},${s * 0.23} Q${s * 0.7},${s * 0.26} ${s * 0.74},${s * 0.22}`} stroke={bodyDark} strokeWidth={s * 0.022} fill="none" strokeLinecap="round" />
        <path d={`M${s * 0.4},${s * 0.55} Q${s * 0.5},${s * 0.5} ${s * 0.6},${s * 0.55}`} stroke={bodyDark} strokeWidth={s * 0.022} fill="none" strokeLinecap="round" />
        <ellipse cx={s * 0.29} cy={s * 0.46} rx={s * 0.025} ry={s * 0.05} fill="#7EC8E3" style={{ animation: `${id}_tear 1s ease-in infinite` }} />
        <ellipse cx={s * 0.71} cy={s * 0.46} rx={s * 0.025} ry={s * 0.05} fill="#7EC8E3" style={{ animation: `${id}_tear 1s ease-in infinite 0.3s` }} />
        <ellipse cx={s * 0.26} cy={s * 0.56} rx={s * 0.02} ry={s * 0.038} fill="#7EC8E3" style={{ animation: `${id}_tear 1s ease-in infinite 0.5s` }} />
        <ellipse cx={s * 0.74} cy={s * 0.56} rx={s * 0.02} ry={s * 0.038} fill="#7EC8E3" style={{ animation: `${id}_tear 1s ease-in infinite 0.7s` }} />
      </svg>
    )
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} overflow="visible">
      <style>{css}</style>
      <g style={{ animation: `${id}_bounce 1.5s ease-in-out infinite` }}>
        <Body />
        <Eye cx={s * 0.34} cy={s * 0.32} r={s * 0.11} pupilDy={0} />
        <Eye cx={s * 0.66} cy={s * 0.32} r={s * 0.11} pupilDy={0} />
        <path d={`M${s * 0.26},${s * 0.2} Q${s * 0.33},${s * 0.15} ${s * 0.42},${s * 0.2}`} stroke={bodyDark} strokeWidth={s * 0.022} fill="none" strokeLinecap="round" />
        <path d={`M${s * 0.58},${s * 0.2} Q${s * 0.67},${s * 0.15} ${s * 0.74},${s * 0.2}`} stroke={bodyDark} strokeWidth={s * 0.022} fill="none" strokeLinecap="round" />
        <path d={`M${s * 0.4},${s * 0.51} Q${s * 0.5},${s * 0.57} ${s * 0.6},${s * 0.51}`} stroke={bodyDark} strokeWidth={s * 0.022} fill="none" strokeLinecap="round" />
      </g>
    </svg>
  )
}

// ============================================================
// RING (círculo de progreso)
// ============================================================
function Ring({ pct, color, size = 72, T }) {
  const r = 28, circ = 2 * Math.PI * r
  const dash = Math.min(pct / 100, 1) * circ
  const stroke = pct > 90 ? T.danger : pct > 70 ? T.warn : color
  return (
    <svg width={size} height={size} viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke={T.border} strokeWidth="6" />
      <circle cx="36" cy="36" r={r} fill="none" stroke={stroke} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 36 36)"
        style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(.4,0,.2,1)' }} />
      <text x="36" y="40" textAnchor="middle" fill={stroke} fontSize="11" fontWeight="800">
        {Math.round(pct)}%
      </text>
    </svg>
  )
}

// ============================================================
// PIE CHART
// ============================================================
function PieChart({ items, size = 200, T }) {
  const total = items.reduce((s, i) => s + i.value, 0)
  if (total === 0) return null
  const pad = 8
  const cx = size / 2, cy = size / 2
  const r = size / 2 - pad - 10
  const inner = r * 0.45
  const strokeW = r - inner
  const circumference = 2 * Math.PI * r
  let accumulated = 0
  const slices = items.map((item) => {
    const pct = item.value / total
    const dash = pct * circumference
    const gap = circumference - dash
    const offset = circumference * 0.25 - accumulated
    accumulated += dash
    return { ...item, dash, gap, offset, pct: Math.round(pct * 100) }
  })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.border} strokeWidth={strokeW} />
        {slices.map((s, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={strokeW}
            strokeDasharray={`${s.dash} ${s.gap}`} strokeDashoffset={s.offset} strokeLinecap="butt" />
        ))}
        <circle cx={cx} cy={cy} r={inner} fill={T.card} />
        <text x={cx} y={cy - 4} textAnchor="middle" fill={T.white} fontSize="12" fontWeight="800" fontFamily="Inter,sans-serif">
          {fmt(total).replace('$', '')}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill={T.slate} fontSize="8" fontFamily="Inter,sans-serif">total</text>
      </svg>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center', marginTop: '0.5rem', padding: '0 0.5rem' }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, background: T.elevated, borderRadius: 8, padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <span style={{ color: T.white, fontWeight: 600 }}>{s.label}</span>
            <span style={{ color: s.color, fontWeight: 700 }}>{s.pct}%</span>
            <span style={{ color: T.slate }}>{fmt(s.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// MODAL DE CATEGORÍA
// ============================================================
function CategoryModal({ cat, expenses, onClose, onDelete, onEdit, T }) {
  const catExp = expenses.filter((e) => e.cat === cat.id).sort((a, b) => b.date.localeCompare(a.date))
  const total = catExp.reduce((s, e) => s + e.amount, 0)
  const byDesc = {}
  catExp.forEach((e) => { byDesc[e.desc] = (byDesc[e.desc] || 0) + e.amount })
  const pieItems = Object.entries(byDesc).map(([label, value], i) => ({
    label, value, color: [cat.color, '#7c6af7', '#38bdf8', '#fb7185', '#34d399', '#f5a623', '#a78bfa'][i % 7],
  }))
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }} onClick={onClose}>
      <div style={{ background: T.card, borderRadius: '20px 20px 0 0', padding: '1.5rem 1.25rem', maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: T.white }}>{cat.emoji} {cat.label}</div>
            <div style={{ fontSize: '0.75rem', color: T.slate }}>{catExp.length} gastos</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 800, color: cat.color, fontSize: '1.2rem' }}>{fmt(total)}</div>
            <button onClick={onClose} style={{ background: T.border, border: 'none', color: T.slate, borderRadius: 8, padding: '0.25rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 }}>✕ Cerrar</button>
          </div>
        </div>
        {pieItems.length > 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.25rem' }}>
            <PieChart items={pieItems} size={180} T={T} />
          </div>
        )}
        <div style={{ fontSize: '0.7rem', color: T.slate, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>Todos los gastos</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {catExp.map((e) => (
            <div key={e.id} style={{ background: T.elevated, borderRadius: 11, padding: '0.65rem 0.75rem', borderLeft: `3px solid ${cat.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: T.white }}>{e.desc}</div>
                  {e.note && <div style={{ fontSize: '0.7rem', color: T.lime, marginTop: 2 }}>📝 {e.note}</div>}
                  <div style={{ fontSize: '0.65rem', color: T.slate, marginTop: 2 }}>{fmtKey(e.date)}</div>
                </div>
                <div style={{ fontWeight: 700, color: T.danger, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>-{fmt(e.amount)}</div>
                <button onClick={() => onEdit(e)} style={{ background: 'none', border: 'none', color: T.lime, cursor: 'pointer', fontSize: '0.85rem', padding: '0.1rem' }}>✏️</button>
                <button onClick={() => onDelete(e.id)} style={{ background: 'none', border: 'none', color: T.slate, cursor: 'pointer', fontSize: '0.85rem', padding: '0.1rem' }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// MODAL DE EDITAR GASTO
// ============================================================
function EditModal({ expense, onSave, onClose, T, i }) {
  const [desc, setDesc] = useState(expense.desc)
  const [amount, setAmount] = useState(String(expense.amount))
  const [note, setNote] = useState(expense.note || '')
  const [cat, setCat] = useState(expense.cat)
  const inputStyle = { width: '100%', padding: '0.8rem 1rem', background: T.border, border: `1.5px solid ${T.border}`, borderRadius: 12, color: T.white, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }} onClick={onClose}>
      <div style={{ background: T.card, borderRadius: 20, padding: '1.5rem', width: '100%', maxWidth: 380, border: `1px solid ${T.border}` }} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontWeight: 800, fontSize: '1rem', color: T.white, marginBottom: '1.25rem' }}>✏️ Editar gasto</div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} style={{ ...inputStyle, marginBottom: '0.75rem', cursor: 'pointer' }}>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
        </select>
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descripción" style={{ ...inputStyle, marginBottom: '0.75rem' }} autoComplete="off" />
        <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.lime, fontWeight: 800 }}>$</span>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" style={{ ...inputStyle, paddingLeft: '1.75rem' }} />
        </div>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={i?.noteHint || 'Nota'} style={{ ...inputStyle, marginBottom: '1rem' }} autoComplete="off" />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.8rem', background: T.border, border: 'none', borderRadius: 12, color: T.slate, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
          <button onClick={() => {
            const amt = parseFloat(amount)
            if (!desc.trim() || isNaN(amt) || amt <= 0) return
            onSave({ ...expense, desc, amount: amt, note, cat })
          }} style={{ flex: 2, padding: '0.8rem', background: T.lime, border: 'none', borderRadius: 12, color: T.bg, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' }}>Guardar</button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// VISTA: AGREGAR GASTO
// ============================================================
function AddView({ form, setForm, addExpense, etMood, remColor, remaining, i, T }) {
  const inputStyle = { width: '100%', padding: '0.8rem 1rem', background: T.border, border: `1.5px solid ${T.border}`, borderRadius: 12, color: T.white, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }
  return (
    <div style={{ padding: '1.5rem 1.25rem', paddingBottom: '6rem', background: T.bg, minHeight: '100svh' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <ET size={56} mood={etMood} />
        <div style={{ fontSize: '0.75rem', color: T.slate, marginTop: 4 }}>
          {i.remaining}: <span style={{ color: remColor, fontWeight: 700 }}>{fmt(remaining)}</span>
        </div>
      </div>
      <div style={{ background: T.card, borderRadius: 16, padding: '1.25rem', border: `1px solid ${T.border}` }}>
        <div style={{ fontSize: '0.7rem', color: T.slate, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
          {i.newExpense} — {fmtKey(todayKey())}
        </div>
        <select value={form.cat} onChange={(e) => setForm((f) => ({ ...f, cat: e.target.value }))} style={{ ...inputStyle, marginBottom: '0.75rem', cursor: 'pointer' }}>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
        </select>
        <input placeholder={i.description} value={form.desc} autoComplete="off" autoCorrect="off" spellCheck="false"
          onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))} style={{ ...inputStyle, marginBottom: '0.75rem' }} />
        <input placeholder={i.noteHint} value={form.note || ''} autoComplete="off"
          onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} style={{ ...inputStyle, marginBottom: '0.75rem' }} />
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.lime, fontWeight: 800 }}>$</span>
          <input type="number" placeholder="0.00" value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && addExpense()}
            style={{ ...inputStyle, paddingLeft: '1.75rem' }} />
        </div>
        <button onClick={addExpense} style={{ width: '100%', padding: '0.9rem', background: T.lime, border: 'none', borderRadius: 12, color: T.bg, fontWeight: 900, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit' }}>
          {i.saveExpense}
        </button>
      </div>
    </div>
  )
}

// ============================================================
// VISTA: METAS DE AHORRO
// ============================================================
function GoalView({ goals, setGoals, persistGoals, showToast, T }) {
  const [form, setForm] = useState({ name: '', target: '' })
  const [amountDrafts, setAmountDrafts] = useState({})

  function createGoal() {
    const target = parseFloat(form.target)
    if (!form.name.trim() || isNaN(target) || target <= 0) return
    const updated = [...goals, { id: Date.now(), name: form.name.trim(), target, current: 0 }]
    setGoals(updated)
    persistGoals(updated)
    setForm({ name: '', target: '' })
    showToast('Meta creada')
  }
  function deleteGoal(id) {
    const updated = goals.filter((g) => g.id !== id)
    setGoals(updated)
    persistGoals(updated)
  }
  function adjustGoal(id, direction) {
    const draft = parseFloat(amountDrafts[id])
    if (isNaN(draft) || draft <= 0) return
    const updated = goals.map((g) =>
      g.id === id ? { ...g, current: Math.max(0, g.current + (direction === 'add' ? draft : -draft)) } : g
    )
    setGoals(updated)
    persistGoals(updated)
    setAmountDrafts((prev) => ({ ...prev, [id]: '' }))
  }

  const inputStyle = { width: '100%', padding: '0.8rem 1rem', background: T.border, border: `1.5px solid ${T.border}`, borderRadius: 12, color: T.white, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }

  return (
    <div style={{ padding: '1rem 1.25rem', paddingBottom: '6rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: T.white }}>🏆 Metas de ahorro</div>
      </div>

      <div style={{ background: T.card, borderRadius: 16, padding: '1rem', border: `1px solid ${T.border}`, marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <input placeholder="Nombre de la meta" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle} />
        <input type="number" placeholder="Monto objetivo ($)" value={form.target} onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))} style={inputStyle} />
        <button onClick={createGoal} style={{ padding: '0.75rem', background: T.lime, border: 'none', borderRadius: 12, color: T.bg, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
          Crear meta
        </button>
      </div>

      {goals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: T.slate, fontSize: '0.85rem' }}>
          Todavía no tienes metas.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {goals.map((g) => {
            const pct = Math.min((g.current / g.target) * 100, 100)
            const done = g.current >= g.target
            return (
              <div key={g.id} style={{ background: T.card, borderRadius: 14, padding: '1rem', border: `1px solid ${T.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, color: T.white }}>{done ? '✅ ' : ''}{g.name}</span>
                  <button onClick={() => deleteGoal(g.id)} style={{ background: 'none', border: 'none', color: T.slate, cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ fontSize: '0.75rem', color: T.slate, marginBottom: '0.4rem' }}>
                  {fmt(g.current)} / {fmt(g.target)} ({pct.toFixed(0)}%)
                </div>
                <div style={{ height: 6, background: T.border, borderRadius: 999, overflow: 'hidden', marginBottom: '0.6rem' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: done ? T.lime : '#38bdf8', borderRadius: 999, transition: 'width 0.3s ease' }} />
                </div>
                {!done && (
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <input type="number" placeholder="Monto" value={amountDrafts[g.id] || ''}
                      onChange={(e) => setAmountDrafts((prev) => ({ ...prev, [g.id]: e.target.value }))}
                      style={{ ...inputStyle, flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.8rem' }} />
                    <button onClick={() => adjustGoal(g.id, 'add')} style={{ padding: '0.5rem 0.75rem', background: T.lime, border: 'none', borderRadius: 10, color: T.bg, fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>+ Agregar</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ============================================================
// VISTA: TENDENCIAS
// ============================================================
function TrendsView({ savedPeriods, expenses, income, T, i, compact }) {
  const totalIncome = parseFloat(income) || 0
  const currentSpent = expenses.reduce((s, e) => s + e.amount, 0)
  const rows = [
    { label: 'Actual', income: totalIncome, spent: currentSpent },
    ...savedPeriods.map((p) => ({ label: p.label, income: p.income, spent: p.spent })),
  ].slice(0, compact ? 4 : 12)
  const maxVal = Math.max(...rows.map((r) => Math.max(r.income, r.spent)), 1)

  return (
    <div style={{ padding: compact ? '0.75rem 1rem 1rem' : '1rem 1.25rem', paddingBottom: compact ? undefined : '6rem' }}>
      {!compact && (
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: T.white }}>📈 Tendencias</div>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {rows.map((r, idx) => (
          <div key={idx}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: T.slate, marginBottom: 2 }}>
              <span>{r.label}</span>
              <span>{fmt(r.spent)} / {fmt(r.income)}</span>
            </div>
            <div style={{ height: 6, background: T.border, borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min((r.spent / maxVal) * 100, 100)}%`, background: r.spent > r.income ? T.danger : T.lime, borderRadius: 999 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// APP
// ============================================================
export default function App() {
  // -------- Auth --------
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [dataLoaded, setDataLoaded] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthLoading(false)
      if (!u) setDataLoaded(false)
    })
    return () => unsub()
  }, [])

  // -------- Estado de datos (sincronizado con Firestore) --------
  const [screen, setScreen] = useState('setup')
  const [income, setIncome] = useState('')
  const [period, setPeriod] = useState('biweekly')
  const [expenses, setExpenses] = useState([])
  const [tab, setTab] = useState('home')
  const [homeTab, setHomeTab] = useState('gastos')
  const [form, setForm] = useState({ desc: '', amount: '', cat: 'food', note: '' })
  const [calMonth, setCalMonth] = useState(new Date())
  const [selDay, setSelDay] = useState(null)
  const [toast, setToast] = useState(null)
  const [selCat, setSelCat] = useState(null)
  const [editExp, setEditExp] = useState(null)
  const [showReset, setShowReset] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [goals, setGoals] = useState([])
  const [themeId, setThemeId] = useState('dark')
  const [lang, setLang] = useState('es')
  const [newMonthAlert, setNewMonthAlert] = useState(false)
  const [prevMonthLabel, setPrevMonthLabel] = useState('')
  const [selMonth, setSelMonth] = useState(null)
  const [budgetRule, setBudgetRule] = useState(null)
  const [budgetPcts, setBudgetPcts] = useState({ needs: 50, personal: 30, saving: 20 })
  const [savedPeriods, setSavedPeriods] = useState([])

  const i = TRANSLATIONS[lang] || TRANSLATIONS.es
  const T = THEMES[themeId] || THEMES.dark

  // -------- Firestore: escuchar el documento del usuario en tiempo real --------
  useEffect(() => {
    if (!user) return
    const userDocRef = doc(db, 'users', user.uid)
    const unsub = onSnapshot(userDocRef, (snap) => {
      const data = snap.data()
      if (data) {
        if (data.income !== undefined) setIncome(data.income)
        if (data.period) setPeriod(data.period)
        if (data.expenses) setExpenses(data.expenses)
        if (data.budgetRule !== undefined) setBudgetRule(data.budgetRule)
        if (data.budgetPcts) setBudgetPcts(data.budgetPcts)
        if (data.savedPeriods) setSavedPeriods(data.savedPeriods)
        if (data.goals) setGoals(data.goals)
        if (data.themeId) setThemeId(data.themeId)
        if (data.lang) setLang(data.lang)
        setScreen(data.income ? 'main' : 'setup')
      } else {
        setScreen('setup')
      }
      setDataLoaded(true)
    })
    return () => unsub()
  }, [user])

  function persist(overrides = {}) {
    if (!user) return
    const payload = {
      income, period, expenses, budgetRule, budgetPcts, savedPeriods, goals, themeId, lang,
      ...overrides,
    }
    setDoc(doc(db, 'users', user.uid), payload, { merge: true }).catch((err) => console.error(err))
  }

  function persistGoals(newGoals) {
    persist({ goals: newGoals })
  }

  function changeLang(newLang) {
    setLang(newLang)
    persist({ lang: newLang })
    const found = LANGUAGES.find((l) => l.id === newLang)
    setToast(`${found?.flag} ${found?.label}`)
    setTimeout(() => setToast(null), 2200)
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }

  async function handleLogin() {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      console.error(err)
      showToast('No se pudo iniciar sesión')
    }
  }
  async function handleLogout() {
    await signOut(auth)
  }

  function handleImportBackup(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (data.income !== undefined) setIncome(data.income)
        if (data.period) setPeriod(data.period)
        if (data.expenses) setExpenses(data.expenses)
        if (data.budgetRule !== undefined) setBudgetRule(data.budgetRule)
        if (data.budgetPcts) setBudgetPcts(data.budgetPcts)
        if (data.savedPeriods) setSavedPeriods(data.savedPeriods)
        if (data.goals) setGoals(data.goals)
        persist(data)
        showToast(i.backupRestored)
      } catch (err) {
        showToast(i.backupError)
      }
    }
    reader.readAsText(file)
  }

  const totalIncome = parseFloat(income) || 0
  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses])
  const remaining = totalIncome - totalSpent
  const pct = totalIncome > 0 ? (totalSpent / totalIncome) * 100 : 0
  const etMood =
    pct === 0 ? 'sleepy'
    : pct < 50 ? 'happy'
    : pct < 70 ? 'cool'
    : pct < 90 ? 'sweat'
    : remaining < 0 ? 'cry'
    : 'sweat'
  const remColor = remaining < 0 ? T.danger : remaining < totalIncome * 0.1 ? T.warn : T.lime
  const periodObj = PERIODS.find((p) => p.id === period)
  const periodLabel = i[periodObj?.shortKey] || periodObj?.short || 'período'

  const byDate = useMemo(() => {
    const m = {}
    expenses.forEach((e) => { if (!m[e.date]) m[e.date] = []; m[e.date].push(e) })
    return m
  }, [expenses])

  const byCategory = useMemo(() => {
    const m = {}
    expenses.forEach((e) => { m[e.cat] = (m[e.cat] || 0) + e.amount })
    return m
  }, [expenses])

  // Detectar cambio de mes
  useEffect(() => {
    if (!dataLoaded || expenses.length === 0) return
    const lastDate = expenses.reduce((a, b) => (a.date > b.date ? a : b)).date
    const lastMonth = lastDate.slice(0, 7)
    const nowMonth = todayKey().slice(0, 7)
    if (nowMonth > lastMonth) {
      const [y, m] = lastMonth.split('-')
      setPrevMonthLabel(`${MONTHS_ES[parseInt(m) - 1]} ${y}`)
      setNewMonthAlert(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataLoaded])

  function addExpense() {
    const amt = parseFloat(form.amount)
    if (!form.desc.trim() || isNaN(amt) || amt <= 0) return
    const updated = [{ id: Date.now(), ...form, amount: amt, date: todayKey() }, ...expenses]
    setExpenses(updated)
    persist({ expenses: updated })
    setForm({ desc: '', amount: '', cat: form.cat, note: '' })
    showToast(i.expenseSaved)
    setTab('home')
  }
  function delExpense(id) {
    const updated = expenses.filter((e) => e.id !== id)
    setExpenses(updated)
    persist({ expenses: updated })
    showToast(i.deleted)
  }
  function saveEdit(updatedExpense) {
    const list = expenses.map((e) => (e.id === updatedExpense.id ? updatedExpense : e))
    setExpenses(list)
    persist({ expenses: list })
    setEditExp(null)
    setSelCat(null)
    showToast(i.expenseUpdated)
  }
  function resetPeriod() {
    if (expenses.length > 0) {
      const now = new Date()
      const label = `${MONTHS_ES[now.getMonth()]} ${now.getFullYear()}`
      const periodRecord = {
        id: Date.now(), label, date: todayKey(),
        income: totalIncome, spent: totalSpent, saved: totalIncome - totalSpent,
        expenses: [...expenses],
      }
      const updatedPeriods = [periodRecord, ...savedPeriods]
      setSavedPeriods(updatedPeriods)
      setExpenses([])
      persist({ expenses: [], savedPeriods: updatedPeriods })
    }
    setShowReset(false)
    showToast(i.periodSaved)
  }

  // -------- Pantalla: cargando --------
  if (authLoading) {
    return (
      <div style={{ minHeight: '100svh', background: '#080f1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ET size={72} mood="sleepy" />
      </div>
    )
  }

  // -------- Pantalla: login --------
  if (!user) {
    return (
      <div style={{ minHeight: '100svh', background: THEMES.dark.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',sans-serif", padding: '1.5rem' }}>
        <ET size={96} mood="happy" />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '0.5rem 0 2px' }}>
          <span style={{ fontSize: '2rem', fontWeight: 900, color: THEMES.dark.white }}>Easy</span>
          <span style={{ fontSize: '2rem', fontWeight: 900, color: THEMES.dark.lime }}>Tracker</span>
        </div>
        <p style={{ color: THEMES.dark.slate, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '2rem' }}>ET · Tu dinero, claro</p>
        <button onClick={handleLogin} style={{ padding: '0.9rem 1.75rem', background: THEMES.dark.lime, border: 'none', borderRadius: 999, color: THEMES.dark.bg, fontWeight: 900, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit' }}>
          Iniciar sesión con Google
        </button>
      </div>
    )
  }

  // -------- Pantalla: cargando datos de Firestore --------
  if (!dataLoaded) {
    return (
      <div style={{ minHeight: '100svh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ET size={72} mood="sleepy" />
      </div>
    )
  }

  // -------- Pantalla: setup --------
  if (screen === 'setup') {
    return (
      <div style={{ minHeight: '100svh', background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',sans-serif", padding: '1.5rem' }}>
        <ET size={96} mood="happy" />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '0.5rem 0 2px' }}>
          <span style={{ fontSize: '2rem', fontWeight: 900, color: T.white }}>Easy</span>
          <span style={{ fontSize: '2rem', fontWeight: 900, color: T.lime }}>Tracker</span>
        </div>
        <p style={{ color: T.slate, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '2rem' }}>ET · Tu dinero, claro</p>
        <div style={{ width: '100%', maxWidth: 340, background: T.card, borderRadius: 20, padding: '1.75rem 1.5rem', boxShadow: '0 32px 64px rgba(0,0,0,0.5)' }}>
          <p style={{ color: T.slate, fontSize: '0.8rem', textAlign: 'center', marginBottom: '0.6rem' }}>{i.howOftenPaid}</p>
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem' }}>
            {PERIODS.map((p) => (
              <button key={p.id} onClick={() => setPeriod(p.id)}
                style={{ flex: 1, padding: '0.6rem 0', border: `1.5px solid ${period === p.id ? T.lime : T.border}`, borderRadius: 10, background: period === p.id ? `${T.lime}18` : T.border, color: period === p.id ? T.lime : T.slate, fontWeight: period === p.id ? 800 : 400, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                {i[p.labelKey] || p.label}
              </button>
            ))}
          </div>
          <p style={{ color: T.slate, fontSize: '0.8rem', textAlign: 'center', marginBottom: '0.6rem' }}>
            {i.howMuchPerPeriod} {PERIODS.find((p) => p.id === period)?.short}?
          </p>
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: T.lime, fontWeight: 800, fontSize: '1.1rem' }}>$</span>
            <input type="number" placeholder="0.00" value={income} onChange={(e) => setIncome(e.target.value)} autoFocus
              style={{ width: '100%', padding: '0.8rem 1rem', paddingLeft: '2.2rem', background: T.border, border: `1.5px solid ${T.lime}40`, borderRadius: 12, color: T.white, fontSize: '1.4rem', fontWeight: 800, textAlign: 'center', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          </div>
          <button onClick={() => { if (income) { persist({ income, period }); setScreen('main') } }}
            style={{ width: '100%', padding: '0.9rem', background: T.lime, border: 'none', borderRadius: 12, color: T.bg, fontWeight: 900, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            {i.saveChanges}
          </button>
        </div>
      </div>
    )
  }

  // ── HOME ───────────────────────────────────────────
  function HomeView() {
    return (
      <div style={{ paddingBottom: '6rem' }}>
        <div style={{ background: T.card, padding: '1.25rem 1.25rem 1rem', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ET size={38} mood={etMood} />
              <div>
                <div style={{ fontSize: '0.6rem', color: T.slate, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Easy Tracker</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: T.lime }}>ET</div>
              </div>
            </div>
            <button onClick={() => setShowMenu(true)}
              style={{ background: T.border, border: 'none', color: T.white, borderRadius: 10, padding: '0.4rem 0.65rem', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 18, height: 2, background: T.white, borderRadius: 2 }} />
              <div style={{ width: 18, height: 2, background: T.white, borderRadius: 2 }} />
              <div style={{ width: 18, height: 2, background: T.white, borderRadius: 2 }} />
            </button>
          </div>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.65rem', color: T.slate, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
              {i.remaining} esta {periodLabel}
            </div>
            <div style={{ fontSize: '2.75rem', fontWeight: 900, color: remColor, letterSpacing: -1, lineHeight: 1 }}>{fmt(remaining)}</div>
            {savedPeriods.length > 0 && (
              <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 6, background: T.elevated, borderRadius: 20, padding: '0.25rem 0.75rem' }}>
                <span style={{ fontSize: '0.7rem', color: T.slate }}>💰 Ahorrado:</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: T.lime }}>
                  {fmt(savedPeriods.reduce((s, p) => s + (p.saved > 0 ? p.saved : 0), 0))}
                </span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: T.slate, textTransform: 'uppercase', marginBottom: 2 }}>{i.earned}</div>
              <div style={{ fontWeight: 700, color: T.white }}>{fmt(totalIncome)}</div>
            </div>
            <Ring pct={pct} color={T.lime} size={70} T={T} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: T.slate, textTransform: 'uppercase', marginBottom: 2 }}>{i.spent}</div>
              <div style={{ fontWeight: 700, color: T.danger }}>{fmt(totalSpent)}</div>
            </div>
          </div>
          <div style={{ marginTop: '1rem', height: 5, background: T.border, borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: pct > 90 ? T.danger : pct > 70 ? T.warn : T.lime, borderRadius: 999, transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            {['gastos', 'savings'].map((t) => (
              <button key={t} onClick={() => setHomeTab(t)}
                style={{ flex: 1, padding: '0.5rem', border: `1.5px solid ${homeTab === t ? T.lime : T.border}`, borderRadius: 10, background: homeTab === t ? `${T.lime}18` : T.elevated, color: homeTab === t ? T.lime : T.slate, fontWeight: homeTab === t ? 800 : 400, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                {t === 'gastos' ? '📊 Gastos' : '💰 Savings'}
              </button>
            ))}
          </div>
        </div>

        {homeTab === 'gastos' && (
          <div style={{ padding: '1rem 1.25rem' }}>
            {Object.keys(byCategory).length > 0 && (
              <>
                <div style={{ fontSize: '0.7rem', color: T.slate, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
                  {i.byCategory} <span style={{ color: T.lime, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>· {i.tapForDetail}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {CATEGORIES.filter((c) => byCategory[c.id]).map((cat) => {
                    const amt = byCategory[cat.id]
                    const cp = totalIncome > 0 ? (amt / totalIncome) * 100 : 0
                    return (
                      <button key={cat.id} onClick={() => setSelCat(cat)}
                        style={{ background: T.card, borderRadius: 12, padding: '0.65rem', display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${T.border}`, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                        <Ring pct={cp} color={cat.color} size={48} T={T} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.7rem', color: T.slate }}>{cat.emoji} {cat.label}</div>
                          <div style={{ fontWeight: 700, color: cat.color, fontSize: '0.9rem' }}>{fmt(amt)}</div>
                          <div style={{ fontSize: '0.6rem', color: T.slate }}>{expenses.filter((e) => e.cat === cat.id).length} {i.expenses}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
            <div style={{ fontSize: '0.7rem', color: T.slate, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
              {i.allExpenses} ({expenses.length})
            </div>
            {expenses.length > 0 && (
              <input type="text" placeholder={i.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.8rem 1rem', background: T.border, border: `1.5px solid ${T.border}`, borderRadius: 12, color: T.white, fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: '0.75rem' }} />
            )}
            {expenses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: T.slate, fontSize: '0.85rem' }}>
                <ET size={56} mood="sleepy" />
                <div style={{ marginTop: '0.75rem' }}>{i.noExpenses}<br />{i.tapToAdd}</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {expenses.filter((e) =>
                  e.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (e.note && e.note.toLowerCase().includes(searchTerm.toLowerCase()))
                ).map((e) => {
                  const cat = CATEGORIES.find((c) => c.id === e.cat) || CATEGORIES[8]
                  return (
                    <div key={e.id} style={{ background: T.card, borderRadius: 11, padding: '0.65rem 0.75rem', borderLeft: `3px solid ${cat.color}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ fontSize: '1rem' }}>{cat.emoji}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.desc}</div>
                          {e.note && <div style={{ fontSize: '0.65rem', color: T.lime }}>📝 {e.note}</div>}
                          <div style={{ fontSize: '0.65rem', color: T.slate }}>{fmtKey(e.date)} · {cat.label}</div>
                        </div>
                        <div style={{ fontWeight: 700, color: T.danger, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>-{fmt(e.amount)}</div>
                        <button onClick={() => setEditExp(e)} style={{ background: 'none', border: 'none', color: T.lime, cursor: 'pointer', fontSize: '0.8rem', padding: '0.1rem' }}>✏️</button>
                        <button onClick={() => delExpense(e.id)} style={{ background: 'none', border: 'none', color: T.slate, cursor: 'pointer', fontSize: '0.85rem', padding: '0.1rem' }}>✕</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {homeTab === 'savings' && (
          <div style={{ padding: '1rem 1.25rem' }}>
            {savedPeriods.length >= 1 && (
              <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, marginBottom: '1rem', overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1rem 0' }}>
                  <div style={{ fontSize: '0.7rem', color: T.slate, textTransform: 'uppercase', letterSpacing: '0.08em' }}>📈 Tendencias</div>
                </div>
                <TrendsView savedPeriods={savedPeriods} expenses={expenses} income={income} T={T} i={i} compact />
              </div>
            )}
            {(() => {
              const totalSaved = savedPeriods.reduce((s, p) => s + (p.saved > 0 ? p.saved : 0), 0)
              return (
                <div style={{ background: T.card, borderRadius: 16, padding: '1.25rem', border: `1px solid ${T.border}`, marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.65rem', color: T.slate, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>💰 Ahorro acumulado total</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: totalSaved > 0 ? T.lime : T.slate }}>{fmt(totalSaved)}</div>
                  <div style={{ fontSize: '0.7rem', color: T.slate, marginTop: 4 }}>
                    De {savedPeriods.length} {i.periodsPlural} cerrado{savedPeriods.length !== 1 ? 's' : ''}
                  </div>
                </div>
              )
            })()}
            {expenses.length > 0 && (
              <>
                <div style={{ fontSize: '0.7rem', color: T.lime, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Período actual</div>
                {(() => {
                  const isPos = remaining >= 0
                  const byCat = {}
                  expenses.forEach((e) => { byCat[e.cat] = (byCat[e.cat] || 0) + e.amount })
                  const pieItems = Object.entries(byCat).map(([catId, value]) => {
                    const cat = CATEGORIES.find((c) => c.id === catId) || CATEGORIES[8]
                    return { label: cat.label, value, color: cat.color }
                  })
                  const isOpen = selMonth === 'current'
                  return (
                    <div style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.lime}40`, borderLeft: `3px solid ${isPos ? T.lime : T.danger}`, overflow: 'hidden', marginBottom: '1rem' }}>
                      <button onClick={() => setSelMonth(isOpen ? null : 'current')} style={{ width: '100%', padding: '0.85rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <div>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: T.lime }}>
                              {(() => { const d = new Date(); return `${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}` })()}
                            </span>
                            <div style={{ fontSize: '0.6rem', color: T.slate }}>Ingreso: {fmt(totalIncome)}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: isPos ? T.lime : T.danger }}>{isPos ? '+' : '-'}{fmt(Math.abs(remaining))}</span>
                            <span style={{ color: T.slate, fontSize: '0.8rem' }}>{isOpen ? '▲' : '▼'}</span>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.65rem', color: T.slate, display: 'flex', justifyContent: 'space-between' }}>
                          <span>Gastado: <span style={{ color: T.white }}>{fmt(totalSpent)}</span></span>
                          <span>{expenses.length} {i.expenses}</span>
                        </div>
                      </button>
                      {isOpen && (
                        <div style={{ borderTop: `1px solid ${T.border}`, padding: '0.75rem 1rem' }}>
                          {pieItems.length > 1 && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '0.75rem' }}>
                              <PieChart items={pieItems} size={160} T={T} />
                            </div>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {expenses.map((e) => {
                              const cat = CATEGORIES.find((c) => c.id === e.cat) || CATEGORIES[8]
                              return (
                                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: T.elevated, borderRadius: 8, padding: '0.5rem 0.65rem', borderLeft: `2px solid ${cat.color}` }}>
                                  <span>{cat.emoji}</span>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: T.white, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.desc}</div>
                                    <div style={{ fontSize: '0.6rem', color: T.slate }}>{fmtKey(e.date)}</div>
                                  </div>
                                  <div style={{ fontWeight: 700, color: T.danger, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>-{fmt(e.amount)}</div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </>
            )}
            {savedPeriods.length > 0 && (
              <div style={{ fontSize: '0.7rem', color: T.slate, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Períodos anteriores</div>
            )}
            {savedPeriods.length === 0 && expenses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: T.slate, fontSize: '0.85rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔄</div>
                <div>Agrega {i.expenses} y cuando reinicies<br />se guardarán aquí.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {savedPeriods.map(({ id, label, income: pIncome, spent, saved, expenses: pExp }) => {
                  const isPos = saved >= 0
                  const maxSpent = Math.max(...savedPeriods.map((m) => m.spent), 1)
                  const barW = (spent / maxSpent) * 100
                  const isOpen = selMonth === id
                  return (
                    <div key={id} style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.border}`, borderLeft: `3px solid ${isPos ? T.lime : T.danger}`, overflow: 'hidden' }}>
                      <button onClick={() => setSelMonth(isOpen ? null : id)} style={{ width: '100%', padding: '0.85rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <div>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: T.white }}>{label}</span>
                            <div style={{ fontSize: '0.6rem', color: T.slate }}>Ingreso: {fmt(pIncome)}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: isPos ? T.lime : T.danger }}>{isPos ? '+' : '−'}{fmt(Math.abs(saved))}</span>
                            <span style={{ color: T.slate, fontSize: '0.8rem' }}>{isOpen ? '▲' : '▼'}</span>
                          </div>
                        </div>
                        <div style={{ height: 4, background: T.border, borderRadius: 999, overflow: 'hidden', marginBottom: '0.35rem' }}>
                          <div style={{ height: '100%', width: `${barW}%`, background: isPos ? T.lime : T.danger, borderRadius: 999 }} />
                        </div>
                        <div style={{ fontSize: '0.65rem', color: T.slate, display: 'flex', justifyContent: 'space-between' }}>
                          <span>Gastado: <span style={{ color: T.white }}>{fmt(spent)}</span></span>
                          <span>{pExp.length} {i.expenses}</span>
                        </div>
                      </button>
                      {isOpen && (
                        <div style={{ borderTop: `1px solid ${T.border}`, padding: '0.75rem 1rem' }}>
                          {(() => {
                            const byCat = {}
                            pExp.forEach((e) => { byCat[e.cat] = (byCat[e.cat] || 0) + e.amount })
                            const pieItems = Object.entries(byCat).map(([catId, value]) => {
                              const cat = CATEGORIES.find((c) => c.id === catId) || CATEGORIES[8]
                              return { label: cat.label, value, color: cat.color }
                            })
                            return pieItems.length > 1 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <PieChart items={pieItems} size={160} T={T} />
                              </div>
                            ) : null
                          })()}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {[...pExp].sort((a, b) => b.date.localeCompare(a.date)).map((e) => {
                              const cat = CATEGORIES.find((c) => c.id === e.cat) || CATEGORIES[8]
                              return (
                                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: T.elevated, borderRadius: 9, padding: '0.55rem 0.65rem', borderLeft: `2px solid ${cat.color}` }}>
                                  <span style={{ fontSize: '0.9rem' }}>{cat.emoji}</span>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.8rem', color: T.white, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.desc}</div>
                                    <div style={{ fontSize: '0.6rem', color: T.slate }}>{fmtKey(e.date)}</div>
                                  </div>
                                  <span style={{ fontWeight: 700, color: T.danger, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>-{fmt(e.amount)}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // ── BUDGET ───────────────────────────────────────────
  function BudgetView() {
    const RULES = [
      { id: '50-30-20', label: '50/30/20', desc: i.needsDesc + ' / ' + i.personalDesc, needs: 50, personal: 30, saving: 20 },
      { id: '70-20-10', label: '70/20/10', desc: 'Para deudas o ingresos bajos', needs: 70, personal: 20, saving: 10 },
      { id: '60-20-20', label: '60/20/20', desc: 'Equilibrada con buen ahorro', needs: 60, personal: 20, saving: 20 },
      { id: 'custom', label: 'Custom', desc: 'Tú decides los porcentajes', needs: 50, personal: 30, saving: 20 },
    ]
    const GROUPS = [
      { id: 'needs', label: i.needs, desc: i.needsDesc, color: '#fb7185' },
      { id: 'personal', label: i.personal, desc: i.personalDesc, color: '#f5a623' },
      { id: 'saving', label: i.saving, desc: i.savingDesc, color: T.lime },
    ]
    const spentNeeds = expenses.filter((e) => NEEDS_CATS.includes(e.cat)).reduce((s, e) => s + e.amount, 0)
    const spentPersonal = expenses.filter((e) => PERSONAL_CATS.includes(e.cat)).reduce((s, e) => s + e.amount, 0)
    const spentSaving = expenses.filter((e) => SAVING_CATS.includes(e.cat)).reduce((s, e) => s + e.amount, 0)
    const limitNeeds = totalIncome * (budgetPcts.needs / 100)
    const limitPersonal = totalIncome * (budgetPcts.personal / 100)
    const limitSaving = totalIncome * (budgetPcts.saving / 100)
    const spentMap = { needs: spentNeeds, personal: spentPersonal, saving: spentSaving }
    const limitMap = { needs: limitNeeds, personal: limitPersonal, saving: limitSaving }

    function applyRule(rule) {
      const newPcts = { needs: rule.needs, personal: rule.personal, saving: rule.saving }
      setBudgetRule(rule.id)
      setBudgetPcts(newPcts)
      persist({ budgetRule: rule.id, budgetPcts: newPcts })
    }
    function adjustPct(key, delta) {
      const keys = ['needs', 'personal', 'saving']
      const others = keys.filter((k) => k !== key)
      const newVal = Math.max(5, Math.min(90, budgetPcts[key] + delta))
      const diff = newVal - budgetPcts[key]
      const adj0 = Math.round(diff / 2)
      const adj1 = diff - adj0
      const newPcts = {
        ...budgetPcts, [key]: newVal,
        [others[0]]: Math.max(5, budgetPcts[others[0]] - adj0),
        [others[1]]: Math.max(5, budgetPcts[others[1]] - adj1),
      }
      const total = newPcts.needs + newPcts.personal + newPcts.saving
      if (total !== 100) newPcts[others[1]] += 100 - total
      setBudgetRule('custom')
      setBudgetPcts(newPcts)
      persist({ budgetRule: 'custom', budgetPcts: newPcts })
    }

    return (
      <div style={{ padding: '1rem 1.25rem', paddingBottom: '6rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: T.white }}>🎯 Presupuesto</div>
          <div style={{ fontSize: '0.75rem', color: T.slate, marginTop: 2 }}>{i.budget} — {fmt(totalIncome)}</div>
        </div>
        <div style={{ fontSize: '0.7rem', color: T.slate, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>Elige tu regla</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem' }}>
          {RULES.map((rule) => (
            <button key={rule.id} onClick={() => applyRule(rule)}
              style={{ padding: '0.75rem 1rem', border: `1.5px solid ${budgetRule === rule.id ? T.lime : T.border}`, borderRadius: 12, background: budgetRule === rule.id ? `${T.lime}15` : T.card, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: budgetRule === rule.id ? T.lime : T.white }}>{rule.label}</span>
                {budgetRule === rule.id && <span style={{ color: T.lime, fontSize: '0.8rem' }}>✓ Activa</span>}
              </div>
              <div style={{ fontSize: '0.7rem', color: T.slate, marginTop: 2 }}>{rule.desc}</div>
            </button>
          ))}
        </div>
        {budgetRule && (
          <>
            <div style={{ fontSize: '0.7rem', color: T.slate, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
              Ajusta los porcentajes — suman {budgetPcts.needs + budgetPcts.personal + budgetPcts.saving}%
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {GROUPS.map((g) => {
                const gpct = budgetPcts[g.id]
                const limit = limitMap[g.id]
                const spent = spentMap[g.id]
                const spentPct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
                const overBudget = spent > limit
                return (
                  <div key={g.id} style={{ background: T.card, borderRadius: 14, padding: '1rem', border: `1px solid ${T.border}`, borderLeft: `3px solid ${g.color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: T.white }}>{g.label}</div>
                        <div style={{ fontSize: '0.65rem', color: T.slate }}>{g.desc}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 900, fontSize: '1.1rem', color: g.color }}>{gpct}%</div>
                        <div style={{ fontSize: '0.65rem', color: T.slate }}>{fmt(limit)}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <button onClick={() => adjustPct(g.id, -5)} style={{ width: 32, height: 32, borderRadius: 8, background: T.border, border: 'none', color: T.white, fontSize: '1.1rem', cursor: 'pointer', fontFamily: 'inherit' }}>−</button>
                      <div style={{ flex: 1, height: 6, background: T.border, borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${gpct}%`, background: g.color, borderRadius: 999, transition: 'width 0.3s ease' }} />
                      </div>
                      <button onClick={() => adjustPct(g.id, 5)} style={{ width: 32, height: 32, borderRadius: 8, background: T.border, border: 'none', color: T.white, fontSize: '1.1rem', cursor: 'pointer', fontFamily: 'inherit' }}>+</button>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: T.slate, marginBottom: '0.3rem' }}>
                      Gastado: <span style={{ color: overBudget ? T.danger : T.white, fontWeight: 600 }}>{fmt(spent)}</span> / <span style={{ color: g.color }}>{fmt(limit)}</span>
                    </div>
                    <div style={{ height: 4, background: T.border, borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${spentPct}%`, background: overBudget ? T.danger : g.color, borderRadius: 999, transition: 'width 0.5s ease' }} />
                    </div>
                    {overBudget && <div style={{ fontSize: '0.65rem', color: T.danger, marginTop: '0.3rem', fontWeight: 600 }}>⚠️ Excediste por {fmt(spent - limit)}</div>}
                  </div>
                )
              })}
            </div>
          </>
        )}
        {!budgetRule && (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: T.slate, fontSize: '0.85rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎯</div>
            {i.noRuleSelected}
          </div>
        )}
      </div>
    )
  }

  // ── CALENDAR ──────────────────────────────────────────
  function CalendarView() {
    const year = calMonth.getFullYear(), month = calMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells = []
    for (let k = 0; k < firstDay; k++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    const todayStr = todayKey()
    return (
      <div style={{ padding: '1rem 1.25rem', paddingBottom: '6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <button onClick={() => setCalMonth(new Date(year, month - 1, 1))} style={{ background: T.card, border: `1px solid ${T.border}`, color: T.white, borderRadius: 8, padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '1rem' }}>‹</button>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: T.white }}>{MONTHS_ES[month]} {year}</span>
          <button onClick={() => setCalMonth(new Date(year, month + 1, 1))} style={{ background: T.card, border: `1px solid ${T.border}`, color: T.white, borderRadius: 8, padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '1rem' }}>›</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: '0.4rem' }}>
          {DAYS_ES.map((d) => <div key={d} style={{ textAlign: 'center', fontSize: '0.65rem', color: T.slate, fontWeight: 700, padding: '0.3rem 0' }}>{d}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '0.25rem' }}>
          {cells.map((d, idx) => {
            if (!d) return <div key={`e${idx}`} />
            const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            const hasExp = !!byDate[key]
            const dayTotal = hasExp ? byDate[key].reduce((s, e) => s + e.amount, 0) : 0
            const isToday = key === todayStr, isSel = key === selDay
            return (
              <button key={key} onClick={() => setSelDay(isSel ? null : key)}
                style={{ background: isSel ? T.lime : hasExp ? T.elevated : T.card, border: isToday ? `2px solid ${T.lime}` : `1px solid ${T.border}`, borderRadius: 10, padding: '0.4rem 0.2rem', cursor: hasExp ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, minHeight: 44 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: isToday ? 900 : 600, color: isSel ? T.bg : isToday ? T.lime : T.white }}>{d}</span>
                {hasExp && <span style={{ fontSize: '0.55rem', color: isSel ? T.bg : T.danger, fontWeight: 700 }}>-{fmt(dayTotal).replace('$', '')}</span>}
                {hasExp && <div style={{ width: 4, height: 4, borderRadius: '50%', background: isSel ? T.bg : T.lime }} />}
              </button>
            )
          })}
        </div>
        {selDay && byDate[selDay] && (
          <div style={{ marginTop: '1.25rem', background: T.card, borderRadius: 16, padding: '1.25rem', border: `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: T.slate, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{fmtKeyLong(selDay)}</div>
                <div style={{ fontWeight: 800, color: T.danger, fontSize: '1.1rem' }}>-{fmt(byDate[selDay].reduce((s, e) => s + e.amount, 0))}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: T.slate }}>{i.allExpenses}</div>
                <div style={{ fontWeight: 700, color: T.white }}>{byDate[selDay].length}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {byDate[selDay].map((e) => {
                const cat = CATEGORIES.find((c) => c.id === e.cat) || CATEGORIES[8]
                return (
                  <div key={e.id} style={{ background: T.elevated, borderRadius: 10, padding: '0.65rem 0.75rem', borderLeft: `3px solid ${cat.color}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>{cat.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.desc}</div>
                        <div style={{ fontSize: '0.7rem', color: T.slate }}>{cat.label}</div>
                      </div>
                      <div style={{ fontWeight: 700, color: T.danger, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>-{fmt(e.amount)}</div>
                      <button onClick={() => setEditExp(e)} style={{ background: 'none', border: 'none', color: T.lime, cursor: 'pointer', fontSize: '0.85rem', padding: '0.2rem' }}>✏️</button>
                      <button onClick={() => delExpense(e.id)} style={{ background: 'none', border: 'none', color: T.slate, cursor: 'pointer', fontSize: '0.9rem', padding: '0.2rem' }}>✕</button>
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.75rem', background: T.elevated, borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: T.slate }}>{i.remaining}</span>
              <span style={{ fontWeight: 800, color: remColor, fontSize: '0.95rem' }}>{fmt(remaining)}</span>
            </div>
          </div>
        )}
        {selDay && !byDate[selDay] && (
          <div style={{ marginTop: '1.25rem', background: T.card, borderRadius: 16, padding: '1.5rem', textAlign: 'center', color: T.slate, fontSize: '0.85rem' }}>
            Sin {i.expenses} registrados ese día.
          </div>
        )}
      </div>
    )
  }

  const navItems = [
    { id: 'home', icon: '📊', label: i.home },
    { id: 'calendar', icon: '📅', label: i.history },
    { id: 'goals', icon: '🏆', label: i.goals },
    { id: 'budget', icon: '🎯', label: i.budget },
  ]

  return (
    <div style={{ minHeight: '100svh', background: T.bg, fontFamily: "'Inter',sans-serif", color: T.white, maxWidth: 480, margin: '0 auto', position: 'relative' }}>
      {toast && (
        <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', background: T.lime, color: T.bg, padding: '0.5rem 1.25rem', borderRadius: 999, fontWeight: 700, fontSize: '0.85rem', zIndex: 999, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}

      {newMonthAlert && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}>
          <div style={{ background: T.card, borderRadius: 20, padding: '1.5rem', width: '100%', maxWidth: 340, border: `1px solid ${T.lime}40`, textAlign: 'center' }}>
            <ET size={72} mood="cool" />
            <div style={{ fontWeight: 900, color: T.lime, fontSize: '1.1rem', marginTop: '0.75rem', marginBottom: '0.25rem' }}>¡Nuevo mes!</div>
            <div style={{ fontSize: '0.85rem', color: T.slate, marginBottom: '1rem' }}>
              {i.closeMonth} <span style={{ color: T.white, fontWeight: 700 }}>{prevMonthLabel}</span> {i.andSave}
            </div>
            <div style={{ background: T.elevated, borderRadius: 12, padding: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.75rem', color: T.slate }}>{i.spent}</span>
                <span style={{ fontSize: '0.75rem', color: T.danger, fontWeight: 700 }}>{fmt(totalSpent)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: T.slate }}>{i.remaining}</span>
                <span style={{ fontSize: '0.75rem', color: remaining >= 0 ? T.lime : T.danger, fontWeight: 700 }}>{fmt(Math.abs(remaining))}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setNewMonthAlert(false)} style={{ flex: 1, padding: '0.8rem', background: T.border, border: 'none', borderRadius: 12, color: T.slate, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Después</button>
              <button onClick={() => {
                if (expenses.length > 0) {
                  const periodRecord = { id: Date.now(), label: prevMonthLabel, date: todayKey(), income: totalIncome, spent: totalSpent, saved: totalIncome - totalSpent, expenses: [...expenses] }
                  const updatedPeriods = [periodRecord, ...savedPeriods]
                  setSavedPeriods(updatedPeriods)
                  setExpenses([])
                  persist({ expenses: [], savedPeriods: updatedPeriods })
                }
                setNewMonthAlert(false)
                showToast(`${prevMonthLabel} ${i.monthSaved}`)
              }} style={{ flex: 2, padding: '0.8rem', background: T.lime, border: 'none', borderRadius: 12, color: T.bg, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' }}>Cerrar y guardar</button>
            </div>
          </div>
        </div>
      )}

      {showMenu && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex' }} onClick={() => setShowMenu(false)}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.6)' }} />
          <div style={{ width: 260, background: T.card, height: '100%', boxShadow: '-8px 0 32px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.5rem 1.25rem 1rem', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 900, color: T.white, fontSize: '1rem' }}>Easy Tracker</div>
                <div style={{ fontSize: '0.7rem', color: T.slate }}>{user.displayName || user.email}</div>
              </div>
              <button onClick={() => setShowMenu(false)} style={{ background: T.border, border: 'none', color: T.slate, borderRadius: 8, padding: '0.35rem 0.6rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0' }}>
              <div style={{ padding: '0.25rem 1.25rem 0.5rem' }}>
                <div style={{ fontSize: '0.65rem', color: T.slate, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{i.appearance}</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {THEME_ORDER.map((tid) => (
                    <button key={tid} onClick={() => { setThemeId(tid); persist({ themeId: tid }); showToast(`${THEMES[tid].icon} ${THEMES[tid].name}`); setShowMenu(false) }}
                      style={{ flex: 1, padding: '0.85rem 0.5rem', background: themeId === tid ? T.lime : T.elevated, border: `1.5px solid ${themeId === tid ? T.lime : T.border}`, borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: '1.5rem' }}>{THEMES[tid].icon}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: themeId === tid ? T.bg : T.white }}>{THEMES[tid].name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ height: 1, background: T.border, margin: '0.5rem 1.25rem' }} />
              <div style={{ padding: '0.25rem 1.25rem 0.5rem' }}>
                <div style={{ fontSize: '0.65rem', color: T.slate, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{i.data}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <button onClick={() => { setTab('trends'); setShowMenu(false) }} style={{ width: '100%', padding: '0.85rem 1rem', background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                    <span style={{ fontSize: '1.2rem' }}>📈</span>
                    <div><div style={{ fontWeight: 700, color: T.white, fontSize: '0.9rem' }}>Tendencias</div><div style={{ fontSize: '0.7rem', color: T.slate }}>Gráficas y estadísticas</div></div>
                  </button>
                  <button onClick={() => { exportCSV(expenses); setShowMenu(false) }} style={{ width: '100%', padding: '0.85rem 1rem', background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                    <span style={{ fontSize: '1.2rem' }}>📥</span>
                    <div><div style={{ fontWeight: 700, color: T.white, fontSize: '0.9rem' }}>{i.exportCSV}</div><div style={{ fontSize: '0.7rem', color: T.slate }}>{i.downloadExpenses}</div></div>
                  </button>
                  <button onClick={() => { exportBackup(expenses, income, period, budgetRule, budgetPcts, savedPeriods, goals); setShowMenu(false) }} style={{ width: '100%', padding: '0.85rem 1rem', background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                    <span style={{ fontSize: '1.2rem' }}>💾</span>
                    <div><div style={{ fontWeight: 700, color: T.white, fontSize: '0.9rem' }}>{i.backup}</div><div style={{ fontSize: '0.7rem', color: T.slate }}>{i.saveBackup}</div></div>
                  </button>
                  <label style={{ width: '100%', padding: '0.85rem 1rem', background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '1.2rem' }}>📂</span>
                    <div><div style={{ fontWeight: 700, color: T.white, fontSize: '0.9rem' }}>{i.restore}</div><div style={{ fontSize: '0.7rem', color: T.slate }}>{i.importBackup}</div></div>
                    <input type="file" accept=".json" onChange={(e) => { handleImportBackup(e); setShowMenu(false) }} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
              <div style={{ height: 1, background: T.border, margin: '0.5rem 1.25rem' }} />
              <div style={{ padding: '0.25rem 1.25rem 0.5rem' }}>
                <div style={{ fontSize: '0.65rem', color: T.slate, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{i.language}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {LANGUAGES.map((l) => (
                    <button key={l.id} onClick={() => changeLang(l.id)} style={{ padding: '0.5rem 0.75rem', borderRadius: 10, fontFamily: 'inherit', cursor: 'pointer', fontSize: '0.8rem', fontWeight: lang === l.id ? 800 : 400, background: lang === l.id ? T.lime : T.elevated, color: lang === l.id ? T.bg : T.white, border: `1px solid ${lang === l.id ? T.lime : T.border}` }}>
                      {l.flag} {l.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ height: 1, background: T.border, margin: '0.5rem 1.25rem' }} />
              <div style={{ padding: '0.25rem 1.25rem 0.5rem' }}>
                <div style={{ fontSize: '0.65rem', color: T.slate, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{i.settings}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <button onClick={() => { setScreen('setup'); setShowMenu(false) }} style={{ width: '100%', padding: '0.85rem 1rem', background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                    <span style={{ fontSize: '1.2rem' }}>✏️</span>
                    <div><div style={{ fontWeight: 700, color: T.white, fontSize: '0.9rem' }}>{i.editIncome}</div><div style={{ fontSize: '0.7rem', color: T.slate }}>{i.changeAmount}</div></div>
                  </button>
                  <button onClick={() => { setShowReset(true); setShowMenu(false) }} style={{ width: '100%', padding: '0.85rem 1rem', background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                    <span style={{ fontSize: '1.2rem' }}>🔄</span>
                    <div><div style={{ fontWeight: 700, color: T.white, fontSize: '0.9rem' }}>{i.resetPeriod}</div><div style={{ fontSize: '0.7rem', color: T.slate }}>{i.closeAndStart}</div></div>
                  </button>
                  <button onClick={() => { handleLogout(); setShowMenu(false) }} style={{ width: '100%', padding: '0.85rem 1rem', background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                    <span style={{ fontSize: '1.2rem' }}>🚪</span>
                    <div><div style={{ fontWeight: 700, color: T.white, fontSize: '0.9rem' }}>Salir</div><div style={{ fontSize: '0.7rem', color: T.slate }}>Cerrar sesión</div></div>
                  </button>
                </div>
              </div>
            </div>
            <div style={{ padding: '1rem 1.25rem', borderTop: `1px solid ${T.border}`, textAlign: 'center', fontSize: '0.7rem', color: T.slate }}>ET · Easy Tracker 🦉</div>
          </div>
        </div>
      )}

      {showReset && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}>
          <div style={{ background: T.card, borderRadius: 20, padding: '1.5rem', width: '100%', maxWidth: 340, border: `1px solid ${T.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔄</div>
            <div style={{ fontWeight: 800, color: T.white, marginBottom: '0.5rem' }}>¿Reiniciar período?</div>
            <div style={{ fontSize: '0.8rem', color: T.slate, marginBottom: '1.25rem' }}>{i.resetDesc}</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setShowReset(false)} style={{ flex: 1, padding: '0.8rem', background: T.border, border: 'none', borderRadius: 12, color: T.slate, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
              <button onClick={resetPeriod} style={{ flex: 1, padding: '0.8rem', background: T.danger, border: 'none', borderRadius: 12, color: 'white', fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' }}>Sí, reiniciar</button>
            </div>
          </div>
        </div>
      )}

      {selCat && <CategoryModal cat={selCat} expenses={expenses} onClose={() => setSelCat(null)} onDelete={(id) => delExpense(id)} onEdit={(e) => setEditExp(e)} T={T} />}
      {editExp && <EditModal expense={editExp} onSave={saveEdit} onClose={() => setEditExp(null)} T={T} i={i} />}

      <div style={{ paddingBottom: 70 }}>
        {tab === 'home' && <HomeView />}
        {tab === 'budget' && <BudgetView />}
        {tab === 'trends' && <TrendsView savedPeriods={savedPeriods} expenses={expenses} income={income} T={T} i={i} />}
        {tab === 'goals' && <GoalView goals={goals} setGoals={setGoals} persistGoals={persistGoals} showToast={showToast} T={T} />}
        {tab === 'calendar' && <CalendarView />}
        {tab === 'add' && <AddView form={form} setForm={setForm} addExpense={addExpense} etMood={etMood} remColor={remColor} remaining={remaining} i={i} T={T} />}
      </div>

      {tab !== 'add' && (
        <button onClick={() => setTab('add')}
          style={{ position: 'fixed', bottom: 80, right: 20, width: 58, height: 58, borderRadius: '50%', background: T.lime, color: T.bg, fontSize: '1.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(200,241,53,0.4)', border: 'none', zIndex: 150, cursor: 'pointer', fontFamily: 'inherit', maxWidth: 'calc(50vw + 220px)' }}>
          ＋
        </button>
      )}

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: T.card, borderTop: `1px solid ${T.border}`, display: 'flex', zIndex: 100 }}>
        {navItems.map((item) => {
          const active = tab === item.id
          return (
            <button key={item.id} onClick={() => setTab(item.id)}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.6rem 0', background: 'none', border: 'none', cursor: 'pointer', gap: 2 }}>
              <span style={{ fontSize: '1.1rem', color: active ? T.lime : T.slate, lineHeight: 1 }}>{item.icon}</span>
              <span style={{ fontSize: '0.6rem', color: active ? T.lime : T.slate, fontWeight: active ? 700 : 400 }}>{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
