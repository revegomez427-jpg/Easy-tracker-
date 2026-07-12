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

const emptyForm = {
  title: '',
  amount: '',
  type: 'expense',
  category: EXPENSE_CATEGORIES[0],
  date: new Date().toISOString().slice(0, 10),
  notes: '',
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

  // -------- Gasto del mes actual por categoría (para presupuestos) --------
  const now = new Date()
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const spentByCategory = {}
  transactions
    .filter((t) => t.type === 'expense' && t.date && t.date.slice(0, 7) === currentMonthKey)
    .forEach((t) => {
      spentByCategory[t.category] = (spentByCategory[t.category] || 0) + t.amount
    })

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
        <h1 style={{ marginBottom: 8 }}>EasyTracker</h1>
        <p style={{ color: '#888', marginBottom: 24 }}>Controla tus finanzas, fácil y rápido.</p>
        <button style={styles.googleButton} onClick={handleLogin}>
          Iniciar sesión con Google
        </button>
        {error && <p style={styles.errorText}>{error}</p>}
      </div>
    )
  }

  const categoryOptions = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>EasyTracker</h1>
          <p style={styles.headerSubtitle}>{user.displayName || user.email}</p>
        </div>
        <button style={styles.logoutButton} onClick={handleLogout}>
          Salir
        </button>
      </header>

      <section style={styles.summaryRow}>
        <div style={{ ...styles.summaryCard, borderColor: '#22c55e' }}>
          <span style={styles.summaryLabel}>Ingresos</span>
          <span style={{ ...styles.summaryValue, color: '#22c55e' }}>
            ${totalIncome.toFixed(2)}
          </span>
        </div>
        <div style={{ ...styles.summaryCard, borderColor: '#ef4444' }}>
          <span style={styles.summaryLabel}>Gastos</span>
          <span style={{ ...styles.summaryValue, color: '#ef4444' }}>
            ${totalExpense.toFixed(2)}
          </span>
        </div>
        <div style={{ ...styles.summaryCard, borderColor: '#3b82f6' }}>
          <span style={styles.summaryLabel}>Balance</span>
          <span style={{ ...styles.summaryValue, color: '#3b82f6' }}>${balance.toFixed(2)}</span>
        </div>
      </section>

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
                <div style={styles.budgetRowHeader}>
                  <span style={styles.budgetCategory}>{cat}</span>
                  {limit ? (
                    <span style={styles.budgetAmounts}>
                      ${spent.toFixed(2)} / ${limit.toFixed(2)}
                    </span>
                  ) : (
                    <span style={{ ...styles.budgetAmounts, color: '#aaa' }}>Sin límite</span>
                  )}
                </div>

                {limit ? (
                  <div style={styles.budgetBarTrack}>
                    <div
                      style={{
                        ...styles.budgetBarFill,
                        width: `${pct}%`,
                        background: barColor,
                      }}
                    />
                  </div>
                ) : null}

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

      <section>
        <h2 style={styles.formTitle}>Movimientos</h2>
        {transactions.length === 0 && (
          <p style={{ color: '#888' }}>Todavía no tienes transacciones.</p>
        )}
        <ul style={styles.list}>
          {transactions.map((tx) => (
            <li key={tx.id} style={styles.listItem}>
              <div>
                <p style={styles.listItemTitle}>{tx.title}</p>
                <p style={styles.listItemMeta}>
                  {tx.category} · {tx.date}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    ...styles.listItemAmount,
                    color: tx.type === 'income' ? '#22c55e' : '#ef4444',
                  }}
                >
                  {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                </span>
                <button style={styles.iconButton} onClick={() => handleEdit(tx)}>
                  ✏️
                </button>
                <button style={styles.iconButton} onClick={() => handleDelete(tx.id)}>
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
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
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#1a1a1a',
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
  },
  googleButton: {
    padding: '12px 24px',
    borderRadius: 12,
    border: 'none',
    background: '#22c55e',
    color: 'white',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: { margin: 0, fontSize: 22 },
  headerSubtitle: { margin: 0, color: '#888', fontSize: 13 },
  logoutButton: {
    padding: '8px 14px',
    borderRadius: 10,
    border: '1px solid #ddd',
    background: 'white',
    cursor: 'pointer',
  },
  summaryRow: { display: 'flex', gap: 10, marginBottom: 24 },
  summaryCard: {
    flex: 1,
    border: '2px solid',
    borderRadius: 14,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  summaryLabel: { fontSize: 12, color: '#888' },
  summaryValue: { fontSize: 16, fontWeight: 700 },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    background: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  formTitle: { margin: '0 0 4px 0', fontSize: 17 },
  typeToggle: { display: 'flex', gap: 8, marginBottom: 4 },
  typeButton: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: '1px solid #ddd',
    background: 'white',
    cursor: 'pointer',
    fontWeight: 600,
  },
  typeButtonActiveExpense: { background: '#ef4444', color: 'white', border: '1px solid #ef4444' },
  typeButtonActiveIncome: { background: '#22c55e', color: 'white', border: '1px solid #22c55e' },
  input: {
    padding: 12,
    borderRadius: 10,
    border: '1px solid #ddd',
    fontSize: 15,
    fontFamily: 'inherit',
  },
  formButtons: { display: 'flex', gap: 8, marginTop: 4 },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    border: 'none',
    background: '#22c55e',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer',
  },
  cancelButton: {
    padding: 12,
    borderRadius: 10,
    border: '1px solid #ddd',
    background: 'white',
    cursor: 'pointer',
  },
  list: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    background: '#f9fafb',
  },
  listItemTitle: { margin: 0, fontWeight: 600, fontSize: 14 },
  listItemMeta: { margin: 0, color: '#888', fontSize: 12 },
  listItemAmount: { fontWeight: 700, fontSize: 14 },
  iconButton: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 16,
  },
  errorText: { color: '#ef4444', fontSize: 13, margin: 0 },
  budgetsSection: {
    background: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  budgetsList: { display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 },
  budgetRow: { display: 'flex', flexDirection: 'column', gap: 6 },
  budgetRowHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  budgetCategory: { fontWeight: 600, fontSize: 14 },
  budgetAmounts: { fontSize: 13, color: '#555' },
  budgetBarTrack: {
    height: 8,
    borderRadius: 999,
    background: '#e5e7eb',
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
    border: '1px solid #ddd',
    fontSize: 13,
    fontFamily: 'inherit',
  },
  budgetSaveButton: {
    padding: '10px 14px',
    borderRadius: 10,
    border: 'none',
    background: '#3b82f6',
    color: 'white',
    fontWeight: 600,
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
    borderBottom: '1px solid #e5e7eb',
  },
  goalCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    background: 'white',
    borderRadius: 12,
    padding: 12,
    border: '1px solid #e5e7eb',
  },
  goalDeadline: { fontSize: 12, color: '#888' },
}
