import React from 'react'
import { Link } from 'react-router-dom'

export default function Header({ menuOpen, setMenuOpen }) {
  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo-wrap" onClick={() => setMenuOpen(false)}>
          <img
            src="/small-logo/Screenshot-2026-06-08-110811-removebg-preview.png"
            alt="Lucky Star"
            className="logo"
          />
          <span className="brand">LUCKY STAR</span>
        </Link>
        <button
          className={`menu-btn ${menuOpen ? 'x' : ''}`}
          aria-label="Menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span /><span /><span />
        </button>
      </div>
      <nav className={`menu ${menuOpen ? 'open' : ''}`}>
        <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/deposit" onClick={() => setMenuOpen(false)}>Deposit Problem</Link>
        <Link to="/withdrawal" onClick={() => setMenuOpen(false)}>Withdrawal Problem</Link>
        <Link to="/email-verification" onClick={() => setMenuOpen(false)}>Email ID Verification</Link>
        <Link to="/chat" onClick={() => setMenuOpen(false)}>Online Chat</Link>
      </nav>
    </header>
  )
}

