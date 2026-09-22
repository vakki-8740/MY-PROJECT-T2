import { appEl } from './state.js'
import { renderDashboard } from './pages/dashboard.js'
import { renderTickets } from './pages/tickets.js'
import { renderChat } from './pages/chat.js'
import { renderSettings } from './pages/settings.js'
import { toggleMenu, closeMenu } from './pages/header.js'

let currentPage = ''

function navigate(page) {
  currentPage = page
  closeMenu()
  render()
}
window.navigate = navigate
window.toggleMenu = () => { toggleMenu(); render() }

function render() {
  if (currentPage === 'tickets') {
    renderTickets()
  } else if (currentPage === 'chat') {
    renderChat()
  } else if (currentPage === 'settings') {
    renderSettings()
  } else {
    renderDashboard()
  }
}

function showToast(msg) {
  const el = document.createElement('div')
  el.className = 'toast'
  el.textContent = msg
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 1500)
}
window.showToast = showToast

render()
