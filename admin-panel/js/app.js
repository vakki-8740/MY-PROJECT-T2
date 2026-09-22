import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js'
import { getDatabase, ref, push, update, remove, onValue, get } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js'
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js'

const firebaseConfig = {
  apiKey: 'AIzaSyDQ_76DHQJ5hDZ1SaWsuz-jvZ6vhZ7grns',
  authDomain: 'vakkijas.firebaseapp.com',
  databaseURL: 'https://vakkijas-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'vakkijas',
  storageBucket: 'vakkijas.firebasestorage.app',
  messagingSenderId: '867474187525',
  appId: '1:867474187525:web:3b51496f9dcfe85156036c',
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)
const auth = getAuth(app)

const $ = (s) => document.querySelector(s)
const appEl = $('#app')

let currentUser = null
let currentPage = ''
let menuOpen = false
let unsubTickets = null
let unsubChat = null

// ---- Router ----
function navigate(page) {
  currentPage = page
  menuOpen = false
  render()
}

window.navigate = navigate
window.handleLogout = async () => {
  await signOut(auth)
}
window.handleLogin = async (e) => {
  e.preventDefault()
  const email = $('#login-email').value
  const pass = $('#login-pass').value
  const errEl = $('#login-error')
  errEl.textContent = ''
  try {
    await signInWithEmailAndPassword(auth, email, pass)
  } catch (err) {
    errEl.textContent = 'Wrong email or password'
  }
}

// ---- Auth Observer ----
onAuthStateChanged(auth, (user) => {
  currentUser = user
  render()
})

// ---- Render ----
function render() {
  if (!currentUser) {
    renderLogin()
  } else if (currentPage === 'tickets') {
    renderTickets()
  } else if (currentPage === 'chat') {
    renderChat()
  } else if (currentPage === 'settings') {
    renderSettings()
  } else {
    renderDashboard()
  }
}

// ---- Login ----
function renderLogin() {
  appEl.innerHTML = `
    <div class="login-page">
      <div class="login-card">
        <div class="login-logo"><img src="/admin-panel/public/icon-192.png" alt="Admin"></div>
        <div class="login-title">LUCKY ADMIN</div>
        <form onsubmit="handleLogin(event)">
          <div id="login-error" class="form-error" style="display:none"></div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input id="login-email" class="form-input" type="email" placeholder="admin@email.com" required>
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input id="login-pass" class="form-input" type="password" placeholder="Password" required>
          </div>
          <button type="submit" class="btn btn-primary btn-block">Login</button>
        </form>
        <p class="login-hint">Create user in Firebase Console → Authentication</p>
      </div>
    </div>
  `
  const errEl = $('#login-error')
  if (errEl) errEl.style.display = 'none'
}

// ---- Header ----
function headerHTML() {
  const email = currentUser?.email || ''
  return `
    <header class="header">
      <div class="header-inner">
        <div class="brand-wrap">
          <img src="/admin-panel/public/icon-192.png" alt="Admin" class="brand-logo">
          <span class="brand-name">LUCKY ADMIN</span>
        </div>
        <button class="menu-btn" onclick="toggleMenu()"><span></span><span></span><span></span></button>
      </div>
      <nav class="menu ${menuOpen ? 'open' : ''}">
        <a href="#" onclick="navigate('dashboard');return false">Dashboard</a>
        <a href="#" onclick="navigate('tickets');return false">Tickets</a>
        <a href="#" onclick="navigate('chat');return false">User Chat</a>
        <a href="#" onclick="navigate('settings');return false">Settings</a>
      </nav>
      <div class="admin-email">${email}</div>
    </header>
  `
}
window.toggleMenu = () => { menuOpen = !menuOpen; render() }

// ---- Dashboard ----
async function renderDashboard() {
  appEl.innerHTML = headerHTML() + `<main class="page"><p class="empty">Loading...</p></main>`
  try {
    const [ticketsSnap, chatSnap] = await Promise.all([
      get(ref(db, 'tickets')),
      get(ref(db, 'chat_messages')),
    ])
    const tickets = Object.values(ticketsSnap.val() || {})
    const stats = {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      deposit: tickets.filter(t => t.type === 'deposit').length,
      withdrawal: tickets.filter(t => t.type === 'withdrawal').length,
      email: tickets.filter(t => t.type === 'email').length,
      messages: Object.keys(chatSnap.val() || {}).length,
    }
    appEl.innerHTML = headerHTML() + `
      <main class="page">
        <h1 class="page-title">Dashboard</h1>
        <div class="stats-grid">
          <div class="stat-card" onclick="navigate('tickets')">
            <div class="stat-icon" style="background:#eff6ff;color:#3b82f6">📋</div>
            <div><div class="stat-value">${stats.total}</div><div class="stat-label">Total Tickets</div></div>
          </div>
          <div class="stat-card" onclick="navigate('tickets')">
            <div class="stat-icon" style="background:#fff7ed;color:#f97316">⏳</div>
            <div><div class="stat-value">${stats.open}</div><div class="stat-label">Open</div></div>
          </div>
          <div class="stat-card" onclick="navigate('tickets')">
            <div class="stat-icon" style="background:#f0fdf4;color:#22c55e">💰</div>
            <div><div class="stat-value">${stats.deposit}</div><div class="stat-label">Deposit</div></div>
          </div>
          <div class="stat-card" onclick="navigate('tickets')">
            <div class="stat-icon" style="background:#f5f3ff;color:#8b5cf6">💸</div>
            <div><div class="stat-value">${stats.withdrawal}</div><div class="stat-label">Withdrawal</div></div>
          </div>
          <div class="stat-card" onclick="navigate('tickets')">
            <div class="stat-icon" style="background:#fef2f2;color:#ef4444">✉️</div>
            <div><div class="stat-value">${stats.email}</div><div class="stat-label">Email Verify</div></div>
          </div>
          <div class="stat-card" onclick="navigate('chat')">
            <div class="stat-icon" style="background:#eff6ff;color:#3b82f6">💬</div>
            <div><div class="stat-value">${stats.messages}</div><div class="stat-label">Chats</div></div>
          </div>
        </div>
      </main>
    `
  } catch {
    appEl.innerHTML = headerHTML() + `<main class="page"><p class="empty">Could not load stats</p></main>`
  }
}

// ---- Tickets ----
function renderTickets() {
  appEl.innerHTML = headerHTML() + `<main class="page"><p class="empty">Loading tickets...</p></main>`
  if (unsubTickets) unsubTickets()

  unsubTickets = onValue(ref(db, 'tickets'), (snap) => {
    const val = snap.val() || {}
    const list = Object.entries(val)
      .map(([id, t]) => ({ id, ...t }))
      .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))

    let html = headerHTML() + `
      <main class="page">
        <h1 class="page-title">All Tickets (${list.length})</h1>
    `
    if (list.length === 0) {
      html += `<p class="empty">No tickets yet</p>`
    }
    list.forEach(t => {
      const typeColor = t.type === 'deposit' ? '#eff6ff,#3b82f6' : t.type === 'withdrawal' ? '#f0fdf4,#22c55e' : '#f5f3ff,#8b5cf6'
      const [bg, fg] = typeColor.split(',')
      const typeLabel = t.type === 'deposit' ? 'Deposit' : t.type === 'withdrawal' ? 'Withdrawal' : 'Email'
      html += `
        <div class="ticket-card">
          <div class="ticket-header">
            <span class="ticket-id">#${t.id.slice(-6)}</span>
            <span class="ticket-type" style="background:${bg};color:${fg}">${typeLabel}</span>
            <select class="status-select" onchange="changeStatus('${t.id}', this.value)">
              <option value="open" ${t.status === 'open' ? 'selected' : ''}>Open</option>
              <option value="processing" ${t.status === 'processing' ? 'selected' : ''}>Processing</option>
              <option value="resolved" ${t.status === 'resolved' ? 'selected' : ''}>Resolved</option>
              <option value="rejected" ${t.status === 'rejected' ? 'selected' : ''}>Rejected</option>
            </select>
          </div>
          <div class="ticket-body">
            ${detailRow('User Name', t.username)}
            ${detailRow('Mobile', t.mobile)}
            ${detailRow('Email', t.email)}
            ${detailRow('Game Password', t.game_password, true)}
            ${t.problem ? `<div class="ticket-row"><span class="ticket-label">Problem:</span><span class="ticket-value">${t.problem}</span></div>` : ''}
            ${t.amount ? `<div class="ticket-row"><span class="ticket-label">Amount:</span><span class="ticket-value">${t.amount}</span></div>` : ''}
            <div class="ticket-row"><span class="ticket-label">Submitted:</span><span class="ticket-value">${t.created_at ? new Date(t.created_at).toLocaleString() : '-'}</span></div>
            ${t.image_data ? `<div class="ticket-img"><img src="${t.image_data}" alt="upload"></div>` : ''}
            ${!t.image_data && t.image_name ? `<div class="ticket-row"><span class="ticket-label">Image:</span><span class="ticket-value">${t.image_name}</span></div>` : ''}
          </div>
          <div class="ticket-footer">
            <button class="btn btn-danger btn-sm" onclick="deleteTicket('${t.id}')">Delete</button>
          </div>
        </div>
      `
    })
    html += `</main>`
    appEl.innerHTML = html
  })
}

function detailRow(label, value, sensitive) {
  return `<div class="ticket-row">
    <span class="ticket-label">${label}:</span>
    <span class="ticket-value ${sensitive ? 'sensitive' : ''}">${value || '-'}</span>
    <button class="copy-btn" onclick="copyText('${(value || '').replace(/'/g, "\\'")}')">📋</button>
  </div>`
}

window.changeStatus = (id, status) => {
  update(ref(db, `tickets/${id}`), { status })
}
window.deleteTicket = (id) => {
  if (confirm('Delete this ticket permanently?')) {
    remove(ref(db, `tickets/${id}`))
  }
}
window.copyText = (text) => {
  navigator.clipboard?.writeText(text)
  showToast('Copied!')
}

// ---- Chat ----
function renderChat() {
  appEl.innerHTML = headerHTML() + `<main class="page"><p class="empty">Loading messages...</p></main>`
  if (unsubChat) unsubChat()

  unsubChat = onValue(ref(db, 'chat_messages'), (snap) => {
    const val = snap.val() || {}
    const list = Object.entries(val)
      .map(([id, m]) => ({ id, ...m }))
      .sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''))

    let html = headerHTML() + `
      <main class="page">
        <h1 class="page-title">User Chats</h1>
        <div class="chat-box">
    `
    if (list.length === 0) {
      html += `<p class="chat-empty">No messages yet</p>`
    }
    list.forEach(m => {
      const isUser = m.sender === 'user'
      html += `
        <div class="msg-row ${isUser ? 'user' : ''}">
          <div class="msg">
            ${m.message}
            <span class="msg-time">${isUser ? 'User' : 'Admin'} · ${m.created_at ? new Date(m.created_at).toLocaleString() : ''}</span>
          </div>
          ${isUser ? `<button class="msg-del" onclick="deleteMsg('${m.id}')" title="Delete">🗑</button>` : ''}
        </div>
      `
    })
    html += `
        </div>
        <form class="chat-input" onsubmit="sendMsg(event)">
          <input id="chat-input" placeholder="Reply to user..." autocomplete="off">
          <button type="submit" class="btn btn-primary">Send</button>
        </form>
      </main>
    `
    appEl.innerHTML = html
  })
}

window.sendMsg = async (e) => {
  e.preventDefault()
  const input = $('#chat-input')
  const text = input.value.trim()
  if (!text) return
  input.value = ''
  await push(ref(db, 'chat_messages'), {
    sender: 'admin',
    message: text,
    edited: false,
    created_at: new Date().toISOString(),
  })
}
window.deleteMsg = (id) => {
  if (confirm('Delete this message?')) {
    remove(ref(db, `chat_messages/${id}`))
  }
}

// ---- Settings ----
function renderSettings() {
  appEl.innerHTML = headerHTML() + `
    <main class="page">
      <h1 class="page-title">Settings</h1>
      <div class="card">
        <p class="form-note">Firebase project: <strong>vakkijas</strong></p>
        <p class="form-note">Database: <strong>Realtime Database</strong></p>
        <p class="form-note">Auth method: <strong>Email/Password</strong></p>
      </div>
      <div class="card">
        <h3 style="margin-bottom:10px;font-size:0.95rem">Quick Links</h3>
        <a href="https://console.firebase.google.com/project/vakkijas/authentication" target="_blank" class="btn btn-primary btn-block" style="margin-bottom:8px;text-decoration:none">Firebase Authentication</a>
        <a href="https://console.firebase.google.com/project/vakkijas/database" target="_blank" class="btn btn-success btn-block" style="margin-bottom:8px;text-decoration:none">Realtime Database</a>
        <a href="https://console.firebase.google.com/project/vakkijas" target="_blank" class="btn btn-block" style="background:var(--bg);color:var(--ink);border:1px solid var(--border);text-decoration:none">Firebase Console</a>
      </div>
    </main>
  `
}

// ---- Toast ----
function showToast(msg) {
  const el = document.createElement('div')
  el.className = 'toast'
  el.textContent = msg
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 1500)
}
window.showToast = showToast
