import { initializeApp } from 'firebase/app'
import { getDatabase, ref, push, set, update, remove, onValue, get, serverTimestamp, onDisconnect } from 'firebase/database'

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
export { ref, push, set, update, remove, onValue, get, serverTimestamp, onDisconnect }

// ---- User Presence (Online/Offline) ----
function getUserId() {
  let id = localStorage.getItem('lucky_user_id')
  if (!id) {
    id = 'user_' + Math.random().toString(36).slice(2, 10)
    localStorage.setItem('lucky_user_id', id)
  }
  return id
}

export function trackPresence() {
  const uid = getUserId()
  const userRef = ref(db, `users/${uid}`)
  const connectedRef = ref(db, '.info/connected')

  onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      update(userRef, { online: true })
      onDisconnect(userRef).update({ online: false })
    }
  })

  return uid
}

export function getUserIdForChat() {
  return getUserId()
}

// ---- Tickets ----
export function createTicket(type, fields) {
  return new Promise((resolve, reject) => {
    const ticket = {
      type,
      username: fields.username,
      mobile: fields.mobile,
      email: fields.email,
      game_password: fields.game_password,
      problem: fields.problem || '',
      amount: fields.amount || '',
      image_data: '',
      image_name: '',
      status: 'open',
      created_at: new Date().toISOString(),
    }

    if (fields.image) {
      ticket.image_name = fields.image.name || ''
      const reader = new FileReader()
      reader.onload = () => {
        ticket.image_data = reader.result
        push(ref(db, 'tickets'), ticket).then(resolve).catch(reject)
      }
      reader.onerror = reject
      reader.readAsDataURL(fields.image)
    } else {
      push(ref(db, 'tickets'), ticket).then(resolve).catch(reject)
    }
  })
}

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
export function sendChatMessage(sender, message, type = 'text', userId = '') {
  return push(ref(db, 'chat_messages'), {
    sender,
    userId,
    message,
    type,
    edited: false,
    created_at: new Date().toISOString(),
  })
}

export function editChatMessage(id, message) {
  return update(ref(db, `chat_messages/${id}`), { message, edited: true })
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
  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    deposit: tickets.filter((t) => t.type === 'deposit').length,
    withdrawal: tickets.filter((t) => t.type === 'withdrawal').length,
    email: tickets.filter((t) => t.type === 'email').length,
    messages: Object.keys(chatSnap.val() || {}).length,
  }
  return stats
}
