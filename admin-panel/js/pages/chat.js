import { db } from '../firebase.js'
import { ref, push, remove, onValue } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js'
import { appEl, $ } from '../state.js'
import { icons } from '../icons.js'
import { headerHTML } from './header.js'

let unsubChat = null

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

export function renderChat() {
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
            <span class="msg-time">${isUser ? 'User' : 'Admin'} &middot; ${m.created_at ? new Date(m.created_at).toLocaleString() : ''}</span>
          </div>
          ${isUser ? `<button class="msg-del" onclick="deleteMsg('${m.id}')" title="Delete">${icons.trash}</button>` : ''}
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
