import { db } from './firebase.js'
import { ref, get } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js'
import { headerHTML } from './header.js'
import { icons } from './icons.js'

const appEl = document.getElementById('app')

async function render() {
  appEl.innerHTML = headerHTML('dashboard') + `<main class="page"><p class="empty">Loading...</p></main>`
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
    appEl.innerHTML = headerHTML('dashboard') + `
      <main class="page">
        <h1 class="page-title">Dashboard</h1>
        <div class="stats-grid">
          <a href="tickets.html" class="stat-card">
            <div class="stat-icon" style="background:#eff6ff;color:#3b82f6">${icons.clipboard}</div>
            <div><div class="stat-value">${stats.total}</div><div class="stat-label">Total Tickets</div></div>
          </a>
          <a href="tickets.html" class="stat-card">
            <div class="stat-icon" style="background:#fff7ed;color:#f97316">${icons.clock}</div>
            <div><div class="stat-value">${stats.open}</div><div class="stat-label">Open</div></div>
          </a>
          <a href="tickets.html" class="stat-card">
            <div class="stat-icon" style="background:#f0fdf4;color:#22c55e">${icons.creditCard}</div>
            <div><div class="stat-value">${stats.deposit}</div><div class="stat-label">Deposit</div></div>
          </a>
          <a href="tickets.html" class="stat-card">
            <div class="stat-icon" style="background:#f5f3ff;color:#8b5cf6">${icons.arrowDown}</div>
            <div><div class="stat-value">${stats.withdrawal}</div><div class="stat-label">Withdrawal</div></div>
          </a>
          <a href="tickets.html" class="stat-card">
            <div class="stat-icon" style="background:#fef2f2;color:#ef4444">${icons.mail}</div>
            <div><div class="stat-value">${stats.email}</div><div class="stat-label">Email Verify</div></div>
          </a>
          <a href="chat.html" class="stat-card">
            <div class="stat-icon" style="background:#eff6ff;color:#3b82f6">${icons.chat}</div>
            <div><div class="stat-value">${stats.messages}</div><div class="stat-label">Chats</div></div>
          </a>
        </div>
      </main>
    `
  } catch {
    appEl.innerHTML = headerHTML('dashboard') + `<main class="page"><p class="empty">Could not load stats</p></main>`
  }
}

render()
