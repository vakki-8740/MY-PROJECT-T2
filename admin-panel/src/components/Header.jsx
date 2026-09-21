import React from 'react'

export default function Header({ onLogout }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand-wrap">
          <img src="/icon-192.png" alt="Lucky Admin" className="brand-logo" />
          <span className="brand-name">LUCKY ADMIN</span>
        </div>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>
    </header>
  )
}
