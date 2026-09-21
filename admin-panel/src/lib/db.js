import { initializeApp } from 'firebase/app'
import { getDatabase, ref, push, update, remove, onValue, get } from 'firebase/database'
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyDQ_76DHQJ5hDZ1SaWsuz-jvZ6vhZ7grns',
  authDomain: 'vakkijas.firebaseapp.com',
  databaseURL: 'https://vakkijas-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'vakkijas',
  storageBucket: 'vakkijas.firebasestorage.app',
  messagingSenderId: '867474187525',
  appId: '1:867474187525:web:3b51496f9dcfe85156036c',
  measurementId: 'G-KB0W5L8WNL',
}

export const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
export const auth = getAuth(app)
export { ref, push, update, remove, onValue, get }

// ---- Auth ----
export const adminLogin = (email, password) => signInWithEmailAndPassword(auth, email, password)
export const adminLogout = () => signOut(auth)
export const watchAuth = (cb) => onAuthStateChanged(auth, cb)

// ---- Tickets ----
export function subscribeTickets(cb) {
  return onValue(ref(db, 'tickets'), (snap) => {
    const val = snap.val() || {}
    const list = Object.entries(val)
      .map(([id, t]) => ({ id, ...t }))
      .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    cb(list)
  })
}

export function updateTicketStatus(id, status) {
  return update(ref(db, `tickets/${id}`), { status })
}

export function deleteTicket(id) {
  return remove(ref(db, `tickets/${id}`))
}

// ---- Chat ----
export function sendChatMessage(sender, message) {
  return push(ref(db, 'chat_messages'), {
    sender,
    message,
    edited: false,
    created_at: new Date().toISOString(),
  })
}

export function deleteChatMessage(id) {
  return remove(ref(db, `chat_messages/${id}`))
}

export function subscribeChat(cb) {
  return onValue(ref(db, 'chat_messages'), (snap) => {
    const val = snap.val() || {}
    const list = Object.entries(val)
      .map(([id, m]) => ({ id, ...m }))
      .sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''))
    cb(list)
  })
}

// ---- Stats ----
export async function fetchStats() {
  const [ticketsSnap, chatSnap] = await Promise.all([
    get(ref(db, 'tickets')),
    get(ref(db, 'chat_messages')),
  ])
  const tickets = Object.values(ticketsSnap.val() || {})
  return {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    deposit: tickets.filter((t) => t.type === 'deposit').length,
    withdrawal: tickets.filter((t) => t.type === 'withdrawal').length,
    email: tickets.filter((t) => t.type === 'email').length,
    messages: Object.keys(chatSnap.val() || {}).length,
  }
}
