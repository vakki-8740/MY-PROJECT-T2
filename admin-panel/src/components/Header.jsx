import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Header({ email, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand-wrap">
          <img src="/icon-192.png" alt="Lucky Admin" className="brand-logo" />
          <span className="brand-name">LUCKY ADMIN</span>
        </div>
        <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </div>
      <nav className={`menu ${menuOpen ? 'open' : ''}`}>
        <Link to="/" onClick={() => setMenuOpen(false)}>Dashboard</Link>
        <Link to="/tickets" onClick={() => setMenuOpen(false)}>Tickets</Link>
        <Link to="/chat" onClick={() => setMenuOpen(false)}>User Chat</Link>
        <Link to="/settings" onClick={() => setMenuOpen(false)}>Settings</Link>
      </nav>
      {email && (
        <div style={{ padding: '0 16px 8px', fontSize: '0.72rem', color: '#8e8e93' }}>{email}</div>
      )}
    </header>
  )
}
