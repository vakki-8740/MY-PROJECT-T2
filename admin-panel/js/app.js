import { auth } from './firebase.js'
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js'
import { currentUser, setCurrentUser, currentPage, setCurrentPage, menuOpen, setMenuOpen } from './state.js'
import { renderLogin } from './pages/login.js'
import { renderDashboard } from './pages/dashboard.js'
import { renderTickets } from './pages/tickets.js'
import { renderChat } from './pages/chat.js'
import { renderSettings } from './pages/settings.js'

// ---- Router ----
function navigate(page) {
  setCurrentPage(page)
  setMenuOpen(false)
  render()
}
window.navigate = navigate

window.handleLogout = async () => {
  await signOut(auth)
}

// ---- Auth Observer ----
onAuthStateChanged(auth, (user) => {
  setCurrentUser(user)
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

// ---- Toast ----
function showToast(msg) {
  const el = document.createElement('div')
  el.className = 'toast'
  el.textContent = msg
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 1500)
}
window.showToast = showToast

// ---- Menu Toggle ----
window.toggleMenu = () => { setMenuOpen(!menuOpen); render() }
