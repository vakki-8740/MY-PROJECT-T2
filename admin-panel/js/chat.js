import { db } from './firebase.js'
import { ref, push, remove, onValue, get, update } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js'
import { headerHTML } from './header.js'
import { icons } from './icons.js'

const appEl = document.getElementById('app')
let activeUserId = null
let activeUserName = ''
let unsubUsers = null
let unsubMessages = null

window.goBack = () => {
  activeUserId = null
  activeUserName = ''
  if (unsubMessages) { unsubMessages(); unsubMessages = null }
  renderUserList()
}

window.openChat = (userId, userName) => {
  activeUserId = userId
  activeUserName = userName || userId
  if (unsubUsers) { unsubUsers(); unsubUsers = null }
  renderChatWindow()
}

window.sendMsg = async (e) => {
  e.preventDefault()
  const input = document.getElementById('chat-input')
  const text = input.value.trim()
  if (!text || !activeUserId) return
  input.value = ''
  await push(ref(db, `chat_messages`), {
    sender: 'admin',
    userId: activeUserId,
    message: text,
    type: 'text',
    created_at: new Date().toISOString(),
  })
}

window.sendImage = async () => {
  const fileInput = document.getElementById('image-input')
  const file = fileInput.files[0]
  if (!file || !activeUserId) return

  const reader = new FileReader()
  reader.onload = async () => {
    const base64 = reader.result
    await push(ref(db, `chat_messages`), {
      sender: 'admin',
      userId: activeUserId,
      message: base64,
      type: 'image',
      created_at: new Date().toISOString(),
    })
    fileInput.value = ''
  }
  reader.readAsDataURL(file)
}

window.deleteMsg = (id) => {
  if (confirm('Delete this message?')) {
    remove(ref(db, `chat_messages/${id}`))
  }
}

window.previewImage = (src) => {
  const modal = document.createElement('div')
  modal.className = 'modal-overlay'
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <span class="modal-title">Image</span>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
      </div>
      <img src="${src}" class="modal-img">
    </div>
  `
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove() })
  document.body.appendChild(modal)
}

// ---- User List View ----
async function renderUserList() {
  appEl.innerHTML = headerHTML('chat') + `<main class="page"><p class="empty">Loading users...</p></main>`

  let usersData = {}
  try {
    const userSnap = await get(ref(db, 'users'))
    usersData = userSnap.val() || {}
  } catch {}

  if (unsubUsers) unsubUsers()
  unsubUsers = onValue(ref(db, 'chat_messages'), (msgSnap) => {
    const messages = msgSnap.val() || {}
    const userMap = {}

    Object.values(messages).forEach(m => {
      const uid = m.userId || 'unknown'
      if (!userMap[uid]) {
        userMap[uid] = { userId: uid, lastMsg: '', lastTime: '', online: false, name: '' }
      }
      userMap[uid].lastMsg = m.message || ''
      userMap[uid].lastTime = m.created_at || ''
    })

    Object.keys(userMap).forEach(uid => {
      if (usersData[uid]) {
        userMap[uid].online = usersData[uid].online === true
        userMap[uid].name = usersData[uid].name || ''
        userMap[uid].mobile = usersData[uid].mobile || ''
        userMap[uid].email = usersData[uid].email || ''
      }
    })

    const userList = Object.values(userMap).sort((a, b) =>
      (b.lastTime || '').localeCompare(a.lastTime || '')
    )

    let html = headerHTML('chat') + `
      <main class="page">
        <h1 class="page-title">User Chats</h1>
    `

    if (userList.length === 0) {
      html += `<p class="empty">No conversations yet</p>`
    } else {
      userList.forEach(u => {
        const name = u.name || u.userId.slice(0, 12) + '...'
        const lastMsgText = u.lastMsg.length > 30 ? u.lastMsg.slice(0, 30) + '...' : u.lastMsg
        const dot = u.online ? 'online-dot' : 'offline-dot'
        const statusText = u.online ? 'Online' : 'Offline'
        const escapedName = name.replace(/'/g, "\\'")
        html += `
          <div class="user-card" onclick="openChat('${u.userId}', '${escapedName}')">
            <div class="user-avatar">
              <div class="avatar-circle">${icons.user}</div>
              <span class="${dot}"></span>
            </div>
            <div class="user-info">
              <div class="user-name">${name}</div>
              <div class="user-last-msg">${lastMsgText}</div>
            </div>
            <div class="user-meta">
              <div class="user-status-text ${u.online ? 'status-online' : 'status-offline'}">${statusText}</div>
            </div>
          </div>
        `
      })
    }

    html += `</main>`
    appEl.innerHTML = html
  })
}

// ---- Chat Window View ----
function renderChatWindow() {
  if (!activeUserId) return renderUserList()

  appEl.innerHTML = headerHTML('chat') + `
    <main class="page">
      <div class="chat-header-bar">
        <button class="back-btn" onclick="goBack()">${icons.arrowLeft}</button>
        <span class="chat-user-name">${activeUserName}</span>
      </div>
      <div class="chat-box" id="chat-box"></div>
      <form class="chat-input" onsubmit="sendMsg(event)">
        <label class="img-btn" for="image-input">${icons.image}</label>
        <input type="file" id="image-input" accept="image/*" style="display:none" onchange="sendImage()">
        <input id="chat-input" placeholder="Type a message..." autocomplete="off">
        <button type="submit" class="send-btn">${icons.send}</button>
      </form>
    </main>
  `

  const chatBox = document.getElementById('chat-box')

  unsubMessages = onValue(ref(db, 'chat_messages'), (snap) => {
    const val = snap.val() || {}
    const list = Object.entries(val)
      .map(([id, m]) => ({ id, ...m }))
      .filter(m => m.userId === activeUserId)
      .sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''))

    if (list.length === 0) {
      chatBox.innerHTML = `<p class="chat-empty">No messages yet</p>`
      return
    }

    let html = ''
    list.forEach(m => {
      const isUser = m.sender === 'user'
      const isImage = m.type === 'image'
      const content = isImage
        ? `<img src="${m.message}" class="chat-img" onclick="previewImage('${m.message.slice(0, 50)}...')" alt="image">`
        : m.message
      const time = m.created_at ? new Date(m.created_at).toLocaleString() : ''
      html += `
        <div class="msg-row ${isUser ? 'user' : ''}">
          <div class="msg">
            ${content}
            <span class="msg-time">${isUser ? 'User' : 'Admin'} &middot; ${time}</span>
          </div>
          <button class="msg-del" onclick="deleteMsg('${m.id}')" title="Delete">${icons.trash}</button>
        </div>
      `
    })
    chatBox.innerHTML = html
    chatBox.scrollTop = chatBox.scrollHeight
  })
}

renderUserList()
