import { icons } from '../icons.js'

let menuOpen = false

export function toggleMenu() {
  menuOpen = !menuOpen
}

export function isMenuOpen() {
  return menuOpen
}

export function closeMenu() {
  menuOpen = false
}

export function headerHTML() {
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
    </header>
  `
}
