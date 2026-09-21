import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchStats } from '../lib/db.js'

export default function Dashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchStats().then(setStats).catch(() => setStats({}))
    const t = setInterval(() => fetchStats().then(setStats).catch(() => {}), 15000)
    return () => clearInterval(t)
  }, [])

  const cards = stats ? [
    { label: 'Total Tickets', value: stats.total, color: '#007aff', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9 9h6v6H9z" />
      </svg>
    ) },
    { label: 'Open', value: stats.open, color: '#ff9500', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 2" />
      </svg>
    ) },
    { label: 'Deposit', value: stats.deposit, color: '#34c759', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="13" rx="2" /><path d="M2 10h20" /><path d="M6 15h4" />
      </svg>
    ) },
    { label: 'Withdrawal', value: stats.withdrawal, color: '#5856d6', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M4 21h16" />
      </svg>
    ) },
    { label: 'Email Verify', value: stats.email, color: '#ff3b30', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 7 10-7" />
      </svg>
    ) },
    { label: 'Chats', value: stats.messages, color: '#007aff', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a8 8 0 0 1-8 8H4l1.5-3A8 8 0 1 1 21 12Z" /><path d="M9 12h.01M13 12h.01M17 12h.01" />
      </svg>
    ) },
  ] : []

  return (
    <main className="page admin-page">
      <div className="admin-header">
        <h1 className="section-title" style={{ textAlign: 'left', margin: 0 }}>Dashboard</h1>
        <Link to="/tickets" className="btn nav-btn">View All Tickets</Link>
      </div>
      <div className="stats-grid">
        {cards.map((c) => (
          <Link to="/tickets" key={c.label} className="stat-card">
            <span className="stat-icon" style={{ background: `${c.color}18`, color: c.color }}>{c.icon}</span>
            <div className="stat-text">
              <h3 className="stat-value">{stats ? c.value : '...'}</h3>
              <p className="stat-label">{c.label}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="admin-note">
        Live data from Firebase. Ticket details are stored securely.
      </div>
    </main>
  )
}
