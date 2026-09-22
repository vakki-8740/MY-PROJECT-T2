import { db } from './firebase.js'
import { ref, onValue, update, remove } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js'
import { headerHTML } from './header.js'
import { icons } from './icons.js'
import { copyText } from './utils.js'

const appEl = document.getElementById('app')
let imageDataCache = {}
let unsubTickets = null

function detailRow(label, value, sensitive) {
  return `<div class="ticket-row">
    <span class="ticket-label">${label}:</span>
    <span class="ticket-value ${sensitive ? 'sensitive' : ''}">${value || '-'}</span>
    <button class="copy-btn" onclick="copyText('${(value || '').replace(/'/g, "\\'")}')">${icons.copy}</button>
  </div>`
}

window.showImage = (id) => {
  const data = imageDataCache[id]
  if (!data) return
  const modal = document.createElement('div')
  modal.className = 'modal-overlay'
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <span class="modal-title">Image Preview</span>
        <button class="modal-close" onclick="closeImage()">&times;</button>
      </div>
      <img src="${data}" alt="ticket image" class="modal-img">
    </div>
  `
  modal.addEventListener('click', (e) => { if (e.target === modal) closeImage() })
  document.body.appendChild(modal)
}

window.closeImage = () => {
  const modal = document.querySelector('.modal-overlay')
  if (modal) modal.remove()
}

window.changeStatus = (id, status) => {
  update(ref(db, `tickets/${id}`), { status })
}

window.deleteTicket = (id) => {
  if (confirm('Delete this ticket permanently?')) {
    remove(ref(db, `tickets/${id}`))
  }
}

window.copyText = copyText

function render() {
  appEl.innerHTML = headerHTML('tickets') + `<main class="page"><p class="empty">Loading tickets...</p></main>`
  if (unsubTickets) unsubTickets()

  unsubTickets = onValue(ref(db, 'tickets'), (snap) => {
    const val = snap.val() || {}
    const list = Object.entries(val)
      .map(([id, t]) => ({ id, ...t }))
      .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))

    let html = headerHTML('tickets') + `
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
      if (t.image_data) imageDataCache[t.id] = t.image_data
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
            ${t.image_data ? `<div class="ticket-row"><span class="ticket-label">Image:</span><button class="btn btn-primary btn-sm" onclick="showImage('${t.id}')">View</button></div>` : ''}
            ${!t.image_data && t.image_name ? `<div class="ticket-row"><span class="ticket-label">Image:</span><span class="ticket-value">${t.image_name}</span></div>` : ''}
          </div>
          <div class="ticket-footer">
            <button class="btn btn-danger btn-sm" onclick="deleteTicket('${t.id}')">${icons.trash} Delete</button>
          </div>
        </div>
      `
    })
    html += `</main>`
    appEl.innerHTML = html
  })
}

render()
