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

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpense

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
}
