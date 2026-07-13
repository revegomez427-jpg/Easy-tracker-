import { useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'

// ============================================================
// 1. CONFIGURACIÓN DE FIREBASE
// Las variables vienen de un archivo .env (ver .env.example)
// En Netlify: Site settings -> Environment variables
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
// 2. CATEGORÍAS FIJAS (simple por ahora, luego se personalizan)
// ============================================================
const EXPENSE_CATEGORIES = ['Comida', 'Transporte', 'Renta', 'Servicios', 'Ocio', 'Salud', 'Otro']
const INCOME_CATEGORIES = ['Sueldo', 'Freelance', 'Regalo', 'Otro']
const NEEDS_CATEGORIES = ['Comida', 'Transporte', 'Renta', 'Servicios', 'Salud']
const WANTS_CATEGORIES = ['Ocio', 'Otro']

const CATEGORY_COLORS = {
  Comida: '#fb923c',
  Transporte: '#38bdf8',
  Renta: '#a78bfa',
  Servicios: '#22d3ee',
  Ocio: '#f472b6',
  Salud: '#4ade80',
  Otro: '#94a3b8',
}

const CATEGORY_EMOJI = {
  Comida: '🛒',
  Transporte: '🚗',
  Renta: '🏠',
  Servicios: '💡',
  Ocio: '🎉',
  Salud: '💊',
  Otro: '📦',
}

const INCOME_EMOJI = {
  Sueldo: '💼',
  Freelance: '💻',
  Regalo: '🎁',
  Otro: '📦',
}

const emptyForm = {
  title: '',
  amount: '',
  type: 'expense',
  category: EXPENSE_CATEGORIES[0],
  date: new Date().toISOString().slice(0, 10),
  notes: '',
}

function OwlMascot({ mood = 'happy', size = 64 }) {
  // mood: 'happy' | 'neutral' | 'worried'
  const eyeY = mood === 'worried' ? 30 : 28
  const browPath =
    mood === 'worried'
      ? 'M18 22 Q23 26 28 22 M36 22 Q41 26 46 22'
      : mood === 'neutral'
      ? 'M18 22 Q23 19 28 22 M36 22 Q41 19 46 22'
      : 'M18 20 Q23 15 28 20 M36 20 Q41 15 46 20'
  const mouthPath =
    mood === 'worried'
      ? 'M27 46 Q32 42 37 46'
      : mood === 'neutral'
      ? 'M27 45 L37 45'
      : 'M26 42 Q32 50 38 42'

  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      {/* Cuerpo */}
      <ellipse cx="32" cy="36" rx="24" ry="22" fill="#22c55e" />
      {/* Panza */}
      <ellipse cx="32" cy="40" rx="15" ry="14" fill="#dcfce7" />
      {/* Orejas/plumas */}
      <path d="M14 18 L20 26 L10 26 Z" fill="#16a34a" />
      <path d="M50 18 L54 26 L44 26 Z" fill="#16a34a" />
      {/* Ojos */}
      <circle cx="23" cy={eyeY} r="9" fill="white" />
      <circle cx="41" cy={eyeY} r="9" fill="white" />
      <circle cx="23" cy={eyeY + 1} r="4" fill="#14532d" />
      <circle cx="41" cy={eyeY + 1} r="4" fill="#14532d" />
      {/* Cejas */}
      <path d={browPath} stroke="#14532d" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Pico */}
      <path d="M29 36 L35 36 L32 42 Z" fill="#f59e0b" />
      {/* Boca */}
      <path d={mouthPath} stroke="#14532d" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function CircleProgress({ pct, color, size = 56, centerText, sublabel, dark = false }) {
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(pct, 100) / 100) * circumference
  const trackColor = dark ? '#1e293b' : '#e5e7eb'
  const textColor = dark ? '#e2e8f0' : '#1a1a1a'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
        {centerText && (
          <text
            x={size / 2}
            y={size / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={size * 0.22}
            fontWeight="700"
            fill={textColor}
          >
            {centerText}
          </text>
        )}
      </svg>
      {sublabel && <span style={{ fontSize: 10, color: '#888', textAlign: 'center' }}>{sublabel}</span>}
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [budgets, setBudgets] = useState({})
  const [budgetDrafts, setBudgetDrafts] = useState({})
  const [goals, setGoals] = useState([])
  const [goalForm, setGoalForm] = useState({ name: '', targetAmount: '', deadline: '' })
  const [editingGoalId, setEditingGoalId] = useState(null)
  const [goalEditForm, setGoalEditForm] = useState({ name: '', targetAmount: '', deadline: '' })
  const [goalAmountDrafts, setGoalAmountDrafts] = useState({})
  const [activeTab, setActiveTab] = useState('inicio')
  const [showMenu, setShowMenu] = useState(false)

  // -------- Auth: escuchar sesión --------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setAuthLoading(false)
    })
    return () => unsub()
  }, [])

  // -------- Firestore: escuchar transacciones del usuario en tiempo real --------
  useEffect(() => {
    if (!user) {
      setTransactions([])
      return
    }
    const txRef = collection(db, 'users', user.uid, 'transactions')
    const q = query(txRef, orderBy('date', 'desc'))
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
        setTransactions(items)
      },
      (err) => {
        console.error(err)
        setError('No se pudieron cargar las transacciones.')
      }
    )
    return () => unsub()
  }, [user])

  // -------- Firestore: escuchar presupuestos del usuario --------
  useEffect(() => {
    if (!user) {
      setBudgets({})
      return
    }
    const budgetsRef = collection(db, 'users', user.uid, 'budgets')
    const unsub = onSnapshot(
      budgetsRef,
      (snapshot) => {
        const map = {}
        snapshot.docs.forEach((d) => {
          map[d.id] = d.data().limit
        })
        setBudgets(map)
      },
      (err) => {
        console.error(err)
      }
    )
    return () => unsub()
  }, [user])

  // -------- Firestore: escuchar metas de ahorro del usuario --------
  useEffect(() => {
    if (!user) {
      setGoals([])
      return
    }
    const goalsRef = collection(db, 'users', user.uid, 'goals')
    const unsub = onSnapshot(
      goalsRef,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
        setGoals(items)
      },
      (err) => {
        console.error(err)
      }
    )
    return () => unsub()
  }, [user])

  async function handleLogin() {
    setError('')
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      console.error(err)
      setError('No se pudo iniciar sesión. Intenta de nuevo.')
    }
  }

  async function handleLogout() {
    await signOut(auth)
  }

  function handleFormChange(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      // Si cambia el tipo, resetea la categoría a la primera válida
      if (field === 'type') {
        next.category = value === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]
      }
      return next
    })
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const amountNumber = parseFloat(form.amount)
    if (!form.title.trim()) {
      setError('Ponle un título a la transacción.')
      return
    }
    if (isNaN(amountNumber) || amountNumber <= 0) {
      setError('El monto debe ser un número mayor a 0.')
      return
    }

    const payload = {
      title: form.title.trim(),
      amount: amountNumber,
      type: form.type,
      category: form.category,
      date: form.date,
      notes: form.notes.trim(),
    }

    try {
      if (editingId) {
        const txDoc = doc(db, 'users', user.uid, 'transactions', editingId)
        await updateDoc(txDoc, payload)
      } else {
        const txRef = collection(db, 'users', user.uid, 'transactions')
        await addDoc(txRef, { ...payload, createdAt: serverTimestamp() })
      }
      resetForm()
    } catch (err) {
      console.error(err)
      setError('No se pudo guardar la transacción.')
    }
  }

  function handleEdit(tx) {
    setEditingId(tx.id)
    setForm({
      title: tx.title,
      amount: String(tx.amount),
      type: tx.type,
      category: tx.category,
      date: tx.date,
      notes: tx.notes || '',
    })
  }

  async function handleDelete(id) {
    const confirmDelete = window.confirm('¿Eliminar esta transacción?')
    if (!confirmDelete) return
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'transactions', id))
      if (editingId === id) resetForm()
    } catch (err) {
      console.error(err)
      setError('No se pudo eliminar la transacción.')
    }
  }

  function handleBudgetDraftChange(category, value) {
    setBudgetDrafts((prev) => ({ ...prev, [category]: value }))
  }

  async function handleSaveBudget(category) {
    const value = budgetDrafts[category]
    const limitNumber = parseFloat(value)
    if (isNaN(limitNumber) || limitNumber < 0) return
    try {
      const budgetDoc = doc(db, 'users', user.uid, 'budgets', category)
      await setDoc(budgetDoc, { category, limit: limitNumber })
      setBudgetDrafts((prev) => {
        const next = { ...prev }
        delete next[category]
        return next
      })
    } catch (err) {
      console.error(err)
      setError('No se pudo guardar el presupuesto.')
    }
  }

  // -------- Metas de ahorro --------
  function handleGoalFormChange(field, value) {
    setGoalForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleCreateGoal(e) {
    e.preventDefault()
    setError('')
    const targetNumber = parseFloat(goalForm.targetAmount)
    if (!goalForm.name.trim()) {
      setError('Ponle un nombre a la meta.')
      return
    }
    if (isNaN(targetNumber) || targetNumber <= 0) {
      setError('El monto objetivo debe ser mayor a 0.')
      return
    }
    try {
      const goalsRef = collection(db, 'users', user.uid, 'goals')
      await addDoc(goalsRef, {
        name: goalForm.name.trim(),
        targetAmount: targetNumber,
        currentAmount: 0,
        deadline: goalForm.deadline || null,
        createdAt: serverTimestamp(),
      })
      setGoalForm({ name: '', targetAmount: '', deadline: '' })
    } catch (err) {
      console.error(err)
      setError('No se pudo crear la meta.')
    }
  }

  async function handleDeleteGoal(id) {
    const confirmDelete = window.confirm('¿Eliminar esta meta de ahorro?')
    if (!confirmDelete) return
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'goals', id))
    } catch (err) {
      console.error(err)
      setError('No se pudo eliminar la meta.')
    }
  }

  function handleGoalAmountDraftChange(id, value) {
    setGoalAmountDrafts((prev) => ({ ...prev, [id]: value }))
  }

  async function handleAdjustGoalAmount(goal, direction) {
    const draftValue = goalAmountDrafts[goal.id]
    const amountNumber = parseFloat(draftValue)
    if (isNaN(amountNumber) || amountNumber <= 0) return
    const delta = direction === 'add' ? amountNumber : -amountNumber
    const newAmount = Math.max(0, (goal.currentAmount || 0) + delta)
    try {
      const goalDoc = doc(db, 'users', user.uid, 'goals', goal.id)
      await updateDoc(goalDoc, { currentAmount: newAmount })
      setGoalAmountDrafts((prev) => {
        const next = { ...prev }
        delete next[goal.id]
        return next
      })
    } catch (err) {
      console.error(err)
      setError('No se pudo actualizar la meta.')
    }
  }

  function handleStartEditGoal(goal) {
    setEditingGoalId(goal.id)
    setGoalEditForm({
      name: goal.name,
      targetAmount: String(goal.targetAmount),
      deadline: goal.deadline || '',
    })
  }

  function handleGoalEditFormChange(field, value) {
    setGoalEditForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSaveGoalEdit(id) {
    const targetNumber = parseFloat(goalEditForm.targetAmount)
    if (!goalEditForm.name.trim() || isNaN(targetNumber) || targetNumber <= 0) return
    try {
      const goalDoc = doc(db, 'users', user.uid, 'goals', id)
      await updateDoc(goalDoc, {
        name: goalEditForm.name.trim(),
        targetAmount: targetNumber,
        deadline: goalEditForm.deadline || null,
      })
      setEditingGoalId(null)
    } catch (err) {
      console.error(err)
      setError('No se pudo actualizar la meta.')
    }
  }

  function daysRemaining(deadline) {
    if (!deadline) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(deadline + 'T00:00:00')
    const diffMs = target - today
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  }

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpense
  const spentPct = totalIncome > 0 ? Math.min((totalExpense / totalIncome) * 100, 100) : 0

  // -------- Desglose de gastos por categoría (todo el tiempo, para la vista Inicio) --------
  const categoryBreakdown = {}
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      if (!categoryBreakdown[t.category]) {
        categoryBreakdown[t.category] = { amount: 0, count: 0 }
      }
      categoryBreakdown[t.category].amount += t.amount
      categoryBreakdown[t.category].count += 1
    })
  const categoryBreakdownList = Object.entries(categoryBreakdown)
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
      pct: totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)

  // -------- Gasto del mes actual por categoría (para presupuestos) --------
  const now = new Date()
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const spentByCategory = {}
  transactions
    .filter((t) => t.type === 'expense' && t.date && t.date.slice(0, 7) === currentMonthKey)
    .forEach((t) => {
      spentByCategory[t.category] = (spentByCategory[t.category] || 0) + t.amount
    })

  // -------- Datos para el gráfico de pastel del Resumen del mes --------
  const totalMonthExpense = Object.values(spentByCategory).reduce((sum, v) => sum + v, 0)
  const pieSlices = Object.entries(spentByCategory)
    .filter(([, amount]) => amount > 0)
    .map(([category, amount]) => ({
      category,
      amount,
      pct: totalMonthExpense > 0 ? (amount / totalMonthExpense) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)

  let cumulativePct = 0
  const pieGradient =
    pieSlices.length > 0
      ? `conic-gradient(${pieSlices
          .map((slice) => {
            const start = cumulativePct
            cumulativePct += slice.pct
            return `${CATEGORY_COLORS[slice.category]} ${start}% ${cumulativePct}%`
          })
          .join(', ')})`
      : '#e5e7eb'

  // -------- Regla 50/30/20 (basada en ingresos y gastos del mes actual) --------
  const monthlyIncome = transactions
    .filter((t) => t.type === 'income' && t.date && t.date.slice(0, 7) === currentMonthKey)
    .reduce((sum, t) => sum + t.amount, 0)

  const monthlyNeeds = transactions
    .filter(
      (t) =>
        t.type === 'expense' &&
        t.date &&
        t.date.slice(0, 7) === currentMonthKey &&
        NEEDS_CATEGORIES.includes(t.category)
    )
    .reduce((sum, t) => sum + t.amount, 0)

  const monthlyWants = transactions
    .filter(
      (t) =>
        t.type === 'expense' &&
        t.date &&
        t.date.slice(0, 7) === currentMonthKey &&
        WANTS_CATEGORIES.includes(t.category)
    )
    .reduce((sum, t) => sum + t.amount, 0)

  const monthlySavings = monthlyIncome - monthlyNeeds - monthlyWants

  const rule503020 = [
    {
      label: 'Necesidades',
      targetPct: 0.5,
      actual: monthlyNeeds,
      target: monthlyIncome * 0.5,
      color: '#3b82f6',
    },
    {
      label: 'Deseos',
      targetPct: 0.3,
      actual: monthlyWants,
      target: monthlyIncome * 0.3,
      color: '#f59e0b',
    },
    {
      label: 'Ahorro',
      targetPct: 0.2,
      actual: monthlySavings,
      target: monthlyIncome * 0.2,
      color: '#22c55e',
    },
  ]

  // -------- Ordenar metas: en progreso primero, completadas al final --------
  const sortedGoals = [...goals].sort((a, b) => {
    const aDone = (a.currentAmount || 0) >= a.targetAmount
    const bDone = (b.currentAmount || 0) >= b.targetAmount
    if (aDone === bDone) return 0
    return aDone ? 1 : -1
  })

  // -------- Pantallas --------
  if (authLoading) {
    return (
      <div style={styles.centerScreen}>
        <p>Cargando...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={styles.centerScreen}>
        <div style={{ marginBottom: 16 }}>
          <OwlMascot mood="happy" size={100} />
        </div>
        <h1 style={{ marginBottom: 8, color: '#a3e635' }}>EasyTracker</h1>
        <p style={{ color: '#94a3b8', marginBottom: 24 }}>Controla tus finanzas, fácil y rápido.</p>
        <button style={styles.googleButton} onClick={handleLogin}>
          Iniciar sesión con Google
        </button>
        {error && <p style={styles.errorText}>{error}</p>}
      </div>
    )
  }

  const categoryOptions = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  // -------- Estado de ánimo de ET según balance y presupuestos --------
  const anyBudgetOver = EXPENSE_CATEGORIES.some((cat) => {
    const limit = budgets[cat]
    const spent = spentByCategory[cat] || 0
    return limit && spent > limit
  })
  const owlMood = balance < 0 || anyBudgetOver ? 'worried' : balance === 0 ? 'neutral' : 'happy'

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerOwlWrap}>
            <OwlMascot mood={owlMood} size={40} />
          </div>
          <div>
            <p style={styles.headerTitle}>EASY TRACKER</p>
            <p style={styles.headerSubtitle}>ET</p>
          </div>
        </div>
        <div style={styles.headerActions}>
          <button
            style={styles.headerIconButton}
            onClick={() => setActiveTab('configuracion')}
            title="Exportar / Configuración"
          >
            📤
          </button>
          <button
            style={styles.headerIconButton}
            onClick={() => setActiveTab('presupuestos')}
            title="Presupuesto"
          >
            🔄
          </button>
          <div style={{ position: 'relative' }}>
            <button style={styles.headerIconButton} onClick={() => setShowMenu((v) => !v)}>
              ✏️
            </button>
            {showMenu && (
              <div style={styles.dropdownMenu}>
                <button
                  style={styles.dropdownItem}
                  onClick={() => {
                    setActiveTab('configuracion')
                    setShowMenu(false)
                  }}
                >
                  ⚙️ Configuración
                </button>
                <button
                  style={styles.dropdownItem}
                  onClick={() => {
                    setShowMenu(false)
                    handleLogout()
                  }}
                >
                  🚪 Salir
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {activeTab === 'inicio' && (
      <>

      <section style={styles.heroCard}>
        <p style={styles.heroLabel}>Disponible</p>
        <p style={styles.heroAmount}>${balance.toFixed(2)}</p>

        <div style={styles.heroStatsRow}>
          <div style={{ textAlign: 'left' }}>
            <p style={styles.heroStatLabel}>COBRADO</p>
            <p style={styles.heroStatValueIncome}>${totalIncome.toFixed(2)}</p>
          </div>

          <CircleProgress
            pct={spentPct}
            color="#a3e635"
            size={72}
            centerText={`${spentPct.toFixed(0)}%`}
            dark
          />

          <div style={{ textAlign: 'right' }}>
            <p style={styles.heroStatLabel}>GASTADO</p>
            <p style={styles.heroStatValueExpense}>${totalExpense.toFixed(2)}</p>
          </div>
        </div>

        <div style={styles.heroBarTrack}>
          <div style={{ ...styles.heroBarFill, width: `${spentPct}%` }} />
        </div>
      </section>

      <section style={styles.budgetsSection}>
        <h2 style={styles.formTitle}>Por categoría</h2>
        {categoryBreakdownList.length === 0 ? (
          <p style={{ color: '#64748b' }}>Todavía no tienes gastos registrados.</p>
        ) : (
          <div style={styles.categoryGrid}>
            {categoryBreakdownList.map((c) => (
              <div key={c.category} style={styles.categoryGridCard}>
                <CircleProgress
                  pct={c.pct}
                  color={CATEGORY_COLORS[c.category]}
                  size={44}
                  centerText={`${c.pct.toFixed(0)}%`}
                  dark
                />
                <div>
                  <p style={styles.categoryGridName}>
                    {CATEGORY_EMOJI[c.category]} {c.category}
                  </p>
                  <p style={styles.categoryGridAmount}>${c.amount.toFixed(2)}</p>
                  <p style={styles.categoryGridCount}>
                    {c.count} gasto{c.count === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={styles.budgetsSection}>
        <h2 style={styles.formTitle}>Todos los gastos ({transactions.filter((t) => t.type === 'expense').length})</h2>
        <ul style={styles.list}>
          {transactions
            .filter((t) => t.type === 'expense')
            .map((tx) => (
              <li
                key={tx.id}
                style={{ ...styles.darkListItem, borderLeftColor: CATEGORY_COLORS[tx.category] }}
              >
                <div style={styles.darkListItemIcon}>{CATEGORY_EMOJI[tx.category]}</div>
                <div style={{ flex: 1 }}>
                  <p style={styles.darkListItemTitle}>{tx.title}</p>
                  <p style={styles.darkListItemMeta}>
                    {tx.date} · {tx.category}
                  </p>
                </div>
                <span style={styles.darkListItemAmount}>-${tx.amount.toFixed(2)}</span>
                <button style={styles.darkIconButton} onClick={() => handleEdit(tx)}>
                  ✏️
                </button>
                <button style={styles.darkIconButton} onClick={() => handleDelete(tx.id)}>
                  ✕
                </button>
              </li>
            ))}
        </ul>
      </section>
      </>
      )}

      {activeTab === 'presupuestos' && (
      <>

      <section style={styles.budgetsSection}>
        <h2 style={styles.formTitle}>Presupuestos mensuales</h2>
        <div style={styles.budgetsList}>
          {EXPENSE_CATEGORIES.map((cat) => {
            const limit = budgets[cat]
            const spent = spentByCategory[cat] || 0
            const pct = limit ? Math.min((spent / limit) * 100, 100) : 0
            const isOver = limit && spent > limit
            const isClose = limit && !isOver && spent / limit >= 0.8
            const barColor = isOver ? '#ef4444' : isClose ? '#f59e0b' : '#22c55e'

            return (
              <div key={cat} style={styles.budgetRow}>
                <div style={styles.budgetCircleRow}>
                  <CircleProgress
                    pct={pct}
                    color={barColor}
                    size={56}
                    centerText={limit ? `${pct.toFixed(0)}%` : '–'}
                  />
                  <div style={styles.budgetCircleInfo}>
                    <span style={styles.budgetCategory}>{cat}</span>
                    {limit ? (
                      <span style={styles.budgetAmounts}>
                        ${spent.toFixed(2)} / ${limit.toFixed(2)}
                      </span>
                    ) : (
                      <span style={{ ...styles.budgetAmounts, color: '#aaa' }}>Sin límite</span>
                    )}
                  </div>
                </div>

                <div style={styles.budgetEditRow}>
                  <input
                    style={styles.budgetInput}
                    type="number"
                    step="0.01"
                    placeholder={limit ? `Cambiar límite ($${limit})` : 'Poner límite ($)'}
                    value={budgetDrafts[cat] ?? ''}
                    onChange={(e) => handleBudgetDraftChange(cat, e.target.value)}
                  />
                  <button
                    type="button"
                    style={styles.budgetSaveButton}
                    onClick={() => handleSaveBudget(cat)}
                    disabled={!budgetDrafts[cat]}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section style={styles.budgetsSection}>
        <h2 style={styles.formTitle}>Metas de ahorro</h2>

        <form style={styles.goalCreateForm} onSubmit={handleCreateGoal}>
          <input
            style={styles.input}
            type="text"
            placeholder="Nombre de la meta (ej. Laptop)"
            value={goalForm.name}
            onChange={(e) => handleGoalFormChange('name', e.target.value)}
          />
          <input
            style={styles.input}
            type="number"
            step="0.01"
            placeholder="Monto objetivo ($)"
            value={goalForm.targetAmount}
            onChange={(e) => handleGoalFormChange('targetAmount', e.target.value)}
          />
          <input
            style={styles.input}
            type="date"
            placeholder="Fecha límite (opcional)"
            value={goalForm.deadline}
            onChange={(e) => handleGoalFormChange('deadline', e.target.value)}
          />
          <button type="submit" style={styles.saveButton}>
            Crear meta
          </button>
        </form>

        <div style={styles.budgetsList}>
          {sortedGoals.length === 0 && (
            <p style={{ color: '#888' }}>Todavía no tienes metas de ahorro.</p>
          )}
          {sortedGoals.map((goal) => {
            const current = goal.currentAmount || 0
            const isDone = current >= goal.targetAmount
            const pct = Math.min((current / goal.targetAmount) * 100, 100)
            const remaining = daysRemaining(goal.deadline)
            const isEditing = editingGoalId === goal.id

            if (isEditing) {
              return (
                <div key={goal.id} style={styles.goalCard}>
                  <input
                    style={styles.input}
                    type="text"
                    value={goalEditForm.name}
                    onChange={(e) => handleGoalEditFormChange('name', e.target.value)}
                  />
                  <input
                    style={styles.input}
                    type="number"
                    step="0.01"
                    value={goalEditForm.targetAmount}
                    onChange={(e) => handleGoalEditFormChange('targetAmount', e.target.value)}
                  />
                  <input
                    style={styles.input}
                    type="date"
                    value={goalEditForm.deadline}
                    onChange={(e) => handleGoalEditFormChange('deadline', e.target.value)}
                  />
                  <div style={styles.formButtons}>
                    <button
                      type="button"
                      style={styles.saveButton}
                      onClick={() => handleSaveGoalEdit(goal.id)}
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      style={styles.cancelButton}
                      onClick={() => setEditingGoalId(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={goal.id}
                style={{ ...styles.goalCard, opacity: isDone ? 0.7 : 1 }}
              >
                <div style={styles.budgetRowHeader}>
                  <span style={styles.budgetCategory}>
                    {isDone ? '✅ ' : ''}
                    {goal.name}
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={styles.iconButton} onClick={() => handleStartEditGoal(goal)}>
                      ✏️
                    </button>
                    <button style={styles.iconButton} onClick={() => handleDeleteGoal(goal.id)}>
                      🗑️
                    </button>
                  </div>
                </div>

                <span style={styles.budgetAmounts}>
                  ${current.toFixed(2)} / ${goal.targetAmount.toFixed(2)} ({pct.toFixed(0)}%)
                </span>

                <div style={styles.budgetBarTrack}>
                  <div
                    style={{
                      ...styles.budgetBarFill,
                      width: `${pct}%`,
                      background: isDone ? '#22c55e' : '#3b82f6',
                    }}
                  />
                </div>

                {goal.deadline && remaining !== null && (
                  <span style={styles.goalDeadline}>
                    {remaining >= 0
                      ? `Quedan ${remaining} día${remaining === 1 ? '' : 's'}`
                      : `Venció hace ${Math.abs(remaining)} día${Math.abs(remaining) === 1 ? '' : 's'}`}
                  </span>
                )}

                {isDone ? (
                  <span style={{ color: '#22c55e', fontWeight: 600, fontSize: 13 }}>
                    ¡Meta completada! 🎉
                  </span>
                ) : (
                  <div style={styles.budgetEditRow}>
                    <input
                      style={styles.budgetInput}
                      type="number"
                      step="0.01"
                      placeholder="Monto"
                      value={goalAmountDrafts[goal.id] ?? ''}
                      onChange={(e) => handleGoalAmountDraftChange(goal.id, e.target.value)}
                    />
                    <button
                      type="button"
                      style={styles.budgetSaveButton}
                      onClick={() => handleAdjustGoalAmount(goal, 'add')}
                      disabled={!goalAmountDrafts[goal.id]}
                    >
                      + Agregar
                    </button>
                    <button
                      type="button"
                      style={{ ...styles.budgetSaveButton, background: '#ef4444' }}
                      onClick={() => handleAdjustGoalAmount(goal, 'subtract')}
                      disabled={!goalAmountDrafts[goal.id]}
                    >
                      - Restar
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
      </>
      )}

      {activeTab === 'presupuestos' && (
      <>

      <section style={styles.budgetsSection}>
        <h2 style={styles.formTitle}>Resumen del mes</h2>
        <p style={{ color: '#94a3b8', fontSize: 12, margin: '0 0 16px 0' }}>
          Total gastado: ${totalMonthExpense.toFixed(2)}
        </p>

        {totalMonthExpense === 0 ? (
          <p style={{ color: '#64748b' }}>Todavía no tienes gastos registrados este mes.</p>
        ) : (
          <>
            <div style={styles.pieWrapper}>
              <div style={{ ...styles.pieChart, background: pieGradient }} />
            </div>
            <div style={styles.pieLegend}>
              {pieSlices.map((slice) => (
                <div key={slice.category} style={styles.pieLegendRow}>
                  <span
                    style={{ ...styles.pieLegendDot, background: CATEGORY_COLORS[slice.category] }}
                  />
                  <span style={styles.pieLegendLabel}>{slice.category}</span>
                  <span style={styles.pieLegendValue}>
                    ${slice.amount.toFixed(2)} ({slice.pct.toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
      </>
      )}

      {false && (
      <section style={styles.budgetsSection}>
        <h2 style={styles.formTitle}>Regla 50/30/20</h2>
        <p style={{ color: '#888', fontSize: 12, margin: '0 0 12px 0' }}>
          Basado en tus ingresos de este mes: ${monthlyIncome.toFixed(2)}
        </p>

        {monthlyIncome === 0 ? (
          <p style={{ color: '#888' }}>
            Agrega tus ingresos de este mes para ver esta comparación.
          </p>
        ) : (
          <div style={styles.budgetsList}>
            {rule503020.map((row) => {
              const pctOfTarget = row.target > 0 ? Math.min((Math.max(row.actual, 0) / row.target) * 100, 100) : 0
              const isSavings = row.label === 'Ahorro'
              const isOver = !isSavings && row.actual > row.target
              const isUnder = isSavings && row.actual < row.target

              return (
                <div key={row.label} style={styles.budgetRow}>
                  <div style={styles.budgetRowHeader}>
                    <span style={styles.budgetCategory}>
                      {row.label} ({(row.targetPct * 100).toFixed(0)}%)
                    </span>
                    <span
                      style={{
                        ...styles.budgetAmounts,
                        color: isOver || isUnder ? '#ef4444' : '#555',
                      }}
                    >
                      ${row.actual.toFixed(2)} / ${row.target.toFixed(2)}
                    </span>
                  </div>
                  <div style={styles.budgetBarTrack}>
                    <div
                      style={{
                        ...styles.budgetBarFill,
                        width: `${pctOfTarget}%`,
                        background: isOver || isUnder ? '#ef4444' : row.color,
                      }}
                    />
                  </div>
                  {isOver && (
                    <span style={{ color: '#ef4444', fontSize: 12 }}>
                      Te pasaste ${(row.actual - row.target).toFixed(2)} de lo recomendado
                    </span>
                  )}
                  {isUnder && (
                    <span style={{ color: '#ef4444', fontSize: 12 }}>
                      Estás ahorrando ${(row.target - row.actual).toFixed(2)} menos de lo ideal
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
      )}

      {activeTab === 'transacciones' && (
      <>

      <form style={styles.form} onSubmit={handleSubmit}>
        <h2 style={styles.formTitle}>{editingId ? 'Editar transacción' : 'Nueva transacción'}</h2>

        <div style={styles.typeToggle}>
          <button
            type="button"
            onClick={() => handleFormChange('type', 'expense')}
            style={{
              ...styles.typeButton,
              ...(form.type === 'expense' ? styles.typeButtonActiveExpense : {}),
            }}
          >
            Gasto
          </button>
          <button
            type="button"
            onClick={() => handleFormChange('type', 'income')}
            style={{
              ...styles.typeButton,
              ...(form.type === 'income' ? styles.typeButtonActiveIncome : {}),
            }}
          >
            Ingreso
          </button>
        </div>

        <input
          style={styles.input}
          type="text"
          placeholder="Título (ej. Supermercado)"
          value={form.title}
          onChange={(e) => handleFormChange('title', e.target.value)}
        />

        <input
          style={styles.input}
          type="number"
          step="0.01"
          placeholder="Monto"
          value={form.amount}
          onChange={(e) => handleFormChange('amount', e.target.value)}
        />

        <select
          style={styles.input}
          value={form.category}
          onChange={(e) => handleFormChange('category', e.target.value)}
        >
          {categoryOptions.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          style={styles.input}
          type="date"
          value={form.date}
          onChange={(e) => handleFormChange('date', e.target.value)}
        />

        <textarea
          style={{ ...styles.input, minHeight: 60 }}
          placeholder="Notas (opcional)"
          value={form.notes}
          onChange={(e) => handleFormChange('notes', e.target.value)}
        />

        {error && <p style={styles.errorText}>{error}</p>}

        <div style={styles.formButtons}>
          <button type="submit" style={styles.saveButton}>
            {editingId ? 'Guardar cambios' : 'Agregar'}
          </button>
          {editingId && (
            <button type="button" style={styles.cancelButton} onClick={resetForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>
      </>
      )}

      {activeTab === 'historial' && (
      <>

      <section style={styles.budgetsSection}>
        <h2 style={styles.formTitle}>Historial ({transactions.length})</h2>
        {transactions.length === 0 && (
          <p style={{ color: '#64748b' }}>Todavía no tienes transacciones.</p>
        )}
        <ul style={styles.list}>
          {transactions.map((tx) => (
            <li
              key={tx.id}
              style={{
                ...styles.darkListItem,
                borderLeftColor:
                  tx.type === 'income' ? '#a3e635' : CATEGORY_COLORS[tx.category] || '#64748b',
              }}
            >
              <div style={styles.darkListItemIcon}>
                {tx.type === 'income'
                  ? INCOME_EMOJI[tx.category] || '💰'
                  : CATEGORY_EMOJI[tx.category] || '📦'}
              </div>
              <div style={{ flex: 1 }}>
                <p style={styles.darkListItemTitle}>{tx.title}</p>
                <p style={styles.darkListItemMeta}>
                  {tx.date} · {tx.category}
                </p>
              </div>
              <span
                style={{
                  ...styles.darkListItemAmount,
                  color: tx.type === 'income' ? '#a3e635' : '#fb7185',
                }}
              >
                {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
              </span>
              <button style={styles.darkIconButton} onClick={() => handleEdit(tx)}>
                ✏️
              </button>
              <button style={styles.darkIconButton} onClick={() => handleDelete(tx.id)}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      </section>
      </>
      )}

      {activeTab === 'configuracion' && (
        <section style={styles.budgetsSection}>
          <h2 style={styles.formTitle}>Configuración</h2>
          <p style={{ color: '#888' }}>
            Aquí van a vivir el idioma, exportar a CSV y el respaldo de tus datos. Próximamente.
          </p>
        </section>
      )}

      <nav style={styles.tabBar}>
        <button
          style={{ ...styles.tabButton, ...(activeTab === 'inicio' ? styles.tabButtonActive : {}) }}
          onClick={() => setActiveTab('inicio')}
        >
          🏠<span style={styles.tabLabel}>Inicio</span>
        </button>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === 'historial' ? styles.tabButtonActive : {}),
          }}
          onClick={() => setActiveTab('historial')}
        >
          📅<span style={styles.tabLabel}>Historial</span>
        </button>
        <button
          style={styles.addTabButton}
          onClick={() => {
            resetForm()
            setActiveTab('transacciones')
          }}
        >
          +
        </button>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === 'presupuestos' || activeTab === 'resumen' ? styles.tabButtonActive : {}),
          }}
          onClick={() => setActiveTab('presupuestos')}
        >
          🎯<span style={styles.tabLabel}>Presupuesto</span>
        </button>
      </nav>
    </div>
  )
}

// ============================================================
// ESTILOS (inline para mantener todo en un solo archivo)
// ============================================================
const styles = {
  app: {
    maxWidth: 480,
    margin: '0 auto',
    padding: 16,
    paddingBottom: 96,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#e2e8f0',
    background: '#0b1120',
    minHeight: '100vh',
  },
  centerScreen: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: 24,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    background: '#0b1120',
    color: '#e2e8f0',
  },
  googleButton: {
    padding: '14px 28px',
    borderRadius: 999,
    border: 'none',
    background: 'linear-gradient(135deg, #a3e635, #65a30d)',
    color: '#0b1120',
    fontSize: 16,
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 6px 16px rgba(163,230,53,0.35)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  headerOwlWrap: {
    background: '#141d2e',
    borderRadius: '50%',
    padding: 4,
    display: 'flex',
  },
  headerTitle: { margin: 0, fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: 2 },
  headerSubtitle: { margin: 0, color: '#a3e635', fontSize: 18, fontWeight: 800 },
  headerActions: { display: 'flex', gap: 8 },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    border: 'none',
    background: '#141d2e',
    color: '#e2e8f0',
    cursor: 'pointer',
    fontSize: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    padding: '8px 14px',
    borderRadius: 10,
    border: '1px solid #1e293b',
    background: '#141d2e',
    color: '#e2e8f0',
    cursor: 'pointer',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    border: 'none',
    background: '#141d2e',
    color: '#e2e8f0',
    cursor: 'pointer',
    fontSize: 20,
    lineHeight: 1,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 46,
    right: 0,
    background: '#141d2e',
    borderRadius: 12,
    border: '1px solid #1e293b',
    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
    overflow: 'hidden',
    zIndex: 10,
    minWidth: 170,
  },
  dropdownItem: {
    display: 'block',
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    background: '#141d2e',
    color: '#e2e8f0',
    textAlign: 'left',
    fontSize: 14,
    cursor: 'pointer',
  },
  heroCard: {
    background: '#0f1729',
    borderRadius: 24,
    padding: '24px 20px',
    marginBottom: 20,
    textAlign: 'center',
  },
  heroLabel: {
    margin: 0,
    fontSize: 11,
    letterSpacing: 2,
    color: '#64748b',
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  heroAmount: {
    margin: '6px 0 20px 0',
    fontSize: 44,
    fontWeight: 800,
    color: '#a3e635',
    lineHeight: 1,
  },
  heroStatsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroStatLabel: { margin: 0, fontSize: 10, letterSpacing: 1, color: '#64748b', fontWeight: 700 },
  heroStatValueIncome: { margin: '4px 0 0 0', fontSize: 18, fontWeight: 800, color: '#e2e8f0' },
  heroStatValueExpense: { margin: '4px 0 0 0', fontSize: 18, fontWeight: 800, color: '#fb7185' },
  heroBarTrack: {
    height: 6,
    borderRadius: 999,
    background: '#1e293b',
    overflow: 'hidden',
  },
  heroBarFill: {
    height: '100%',
    borderRadius: 999,
    background: '#a3e635',
    transition: 'width 0.3s ease',
  },
  summaryRow: { display: 'flex', gap: 10, marginBottom: 24 },
  summaryCard: {
    flex: 1,
    border: 'none',
    borderRadius: 18,
    padding: '14px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    background: '#141d2e',
    borderTop: '3px solid',
  },
  summaryLabel: { fontSize: 12, color: '#64748b', fontWeight: 600 },
  summaryValue: { fontSize: 17, fontWeight: 800, color: '#e2e8f0' },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    background: '#141d2e',
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
  },
  formTitle: { margin: '0 0 4px 0', fontSize: 17, color: '#e2e8f0', fontWeight: 800 },
  typeToggle: { display: 'flex', gap: 8, marginBottom: 4 },
  typeButton: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: '1px solid #1e293b',
    background: '#0b1120',
    color: '#e2e8f0',
    cursor: 'pointer',
    fontWeight: 600,
  },
  typeButtonActiveExpense: { background: '#fb7185', color: '#0b1120', border: '1px solid #fb7185' },
  typeButtonActiveIncome: { background: '#a3e635', color: '#0b1120', border: '1px solid #a3e635' },
  input: {
    padding: 12,
    borderRadius: 10,
    border: '1px solid #1e293b',
    background: '#0b1120',
    color: '#e2e8f0',
    fontSize: 15,
    fontFamily: 'inherit',
  },
  formButtons: { display: 'flex', gap: 8, marginTop: 4 },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #a3e635, #65a30d)',
    color: '#0b1120',
    fontWeight: 800,
    cursor: 'pointer',
  },
  cancelButton: {
    padding: 12,
    borderRadius: 10,
    border: '1px solid #1e293b',
    background: '#0b1120',
    color: '#e2e8f0',
    cursor: 'pointer',
  },
  list: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    background: '#141d2e',
  },
  listItemTitle: { margin: 0, fontWeight: 700, fontSize: 14, color: '#e2e8f0' },
  listItemMeta: { margin: 0, color: '#64748b', fontSize: 12 },
  listItemAmount: { fontWeight: 700, fontSize: 14 },
  iconButton: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 16,
  },
  errorText: { color: '#fb7185', fontSize: 13, margin: 0 },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    marginTop: 8,
  },
  categoryGridCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#0b1120',
    borderRadius: 16,
    padding: 12,
  },
  categoryGridName: { margin: 0, fontSize: 12, fontWeight: 700, color: '#e2e8f0' },
  categoryGridAmount: { margin: '2px 0 0 0', fontSize: 14, fontWeight: 800, color: '#e2e8f0' },
  categoryGridCount: { margin: '2px 0 0 0', fontSize: 10, color: '#64748b' },
  darkListItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    background: '#141d2e',
    borderLeft: '4px solid',
  },
  darkListItemIcon: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: '#0b1120',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    flexShrink: 0,
  },
  darkListItemTitle: { margin: 0, fontWeight: 700, fontSize: 14, color: '#e2e8f0' },
  darkListItemMeta: { margin: 0, color: '#64748b', fontSize: 11 },
  darkListItemAmount: { fontWeight: 800, fontSize: 14, color: '#fb7185', whiteSpace: 'nowrap' },
  darkIconButton: {
    border: 'none',
    background: 'transparent',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: 14,
  },
  budgetsSection: {
    background: '#141d2e',
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
  },
  budgetsList: { display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 },
  budgetRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    background: '#0b1120',
    borderRadius: 14,
    padding: 12,
  },
  budgetRowHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  budgetCircleRow: { display: 'flex', alignItems: 'center', gap: 12 },
  budgetCircleInfo: { display: 'flex', flexDirection: 'column', gap: 2 },
  budgetCategory: { fontWeight: 700, fontSize: 14, color: '#e2e8f0' },
  budgetAmounts: { fontSize: 13, color: '#94a3b8' },
  budgetBarTrack: {
    height: 8,
    borderRadius: 999,
    background: '#1e293b',
    overflow: 'hidden',
  },
  budgetBarFill: {
    height: '100%',
    borderRadius: 999,
    transition: 'width 0.3s ease',
  },
  budgetEditRow: { display: 'flex', gap: 8 },
  budgetInput: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: '1px solid #1e293b',
    background: '#141d2e',
    color: '#e2e8f0',
    fontSize: 13,
    fontFamily: 'inherit',
  },
  budgetSaveButton: {
    padding: '10px 14px',
    borderRadius: 10,
    border: 'none',
    background: '#38bdf8',
    color: '#0b1120',
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
  },
  goalCreateForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottom: '1px solid #1e293b',
  },
  goalCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    background: '#0b1120',
    borderRadius: 16,
    padding: 14,
  },
  goalDeadline: { fontSize: 12, color: '#64748b' },
  pieWrapper: { display: 'flex', justifyContent: 'center', marginBottom: 20 },
  pieChart: {
    width: 180,
    height: 180,
    borderRadius: '50%',
  },
  pieLegend: { display: 'flex', flexDirection: 'column', gap: 8 },
  pieLegendRow: { display: 'flex', alignItems: 'center', gap: 8 },
  pieLegendDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  pieLegendLabel: { flex: 1, fontSize: 13, fontWeight: 600, color: '#e2e8f0' },
  pieLegendValue: { fontSize: 13, color: '#94a3b8' },
  tabBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    maxWidth: 480,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    background: '#0f1729',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: '10px 0',
    boxShadow: '0 -6px 20px rgba(0,0,0,0.4)',
  },
  tabButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 20,
    padding: '6px 14px',
    borderRadius: 14,
    color: '#64748b',
    transition: 'background 0.2s ease, color 0.2s ease',
  },
  tabButtonActive: {
    color: '#a3e635',
  },
  tabLabel: { fontSize: 10, fontWeight: 700 },
  addTabButton: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    border: 'none',
    background: 'linear-gradient(135deg, #a3e635, #65a30d)',
    color: '#0b1120',
    fontSize: 26,
    fontWeight: 800,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
    boxShadow: '0 6px 16px rgba(163,230,53,0.4)',
  },
}
