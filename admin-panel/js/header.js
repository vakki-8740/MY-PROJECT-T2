import { icons } from './icons.js'

export function headerHTML(activePage) {
  const pages = [
    { id: 'dashboard', label: 'Dashboard', icon: icons.dashboard, file: 'dashboard.html' },
    { id: 'tickets', label: 'Tickets', icon: icons.ticket, file: 'tickets.html' },
    { id: 'chat', label: 'User Chat', icon: icons.messageCircle, file: 'chat.html' },
    { id: 'settings', label: 'Settings', icon: icons.settings, file: 'settings.html' },
  ]

  const links = pages.map(p => {
    const active = p.id === activePage ? ' active' : ''
    return `<a href="${p.file}" class="menu-link${active}">${p.icon} ${p.label}</a>`
  }).join('')

  return `
    <header class="header">
      <div class="header-inner">
        <div class="brand-wrap">
          <img src="public/icon-192.png" alt="Admin" class="brand-logo">
          <span class="brand-name">LUCKY ADMIN</span>
        </div>
        <button class="menu-btn" onclick="document.querySelector('.menu').classList.toggle('open')">
          <span></span><span></span><span></span>
        </button>
      </div>
      <nav class="menu">${links}</nav>
    </header>
  `
}
