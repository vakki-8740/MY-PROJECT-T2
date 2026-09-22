import { currentUser, menuOpen } from '../state.js'
import { icons } from '../icons.js'

export function headerHTML() {
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
        <a href="#" onclick="navigate('dashboard');return false">${icons.dashboard} Dashboard</a>
        <a href="#" onclick="navigate('tickets');return false">${icons.ticket} Tickets</a>
        <a href="#" onclick="navigate('chat');return false">${icons.messageCircle} User Chat</a>
        <a href="#" onclick="navigate('settings');return false">${icons.settings} Settings</a>
      </nav>
      <div class="admin-email">${email}</div>
    </header>
  `
}
