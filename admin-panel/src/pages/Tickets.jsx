import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const API = `${import.meta.env.VITE_API_URL || ''}/admin.php`

const statusColors = { open: '#ff9500', processing: '#007aff', resolved: '#34c759', rejected: '#ff3b30' }

export default function Tickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAlert, setShowAlert] = useState(false)

  const load = () => {
    setLoading(true)
    fetch(`${API}?action=tickets_list`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); setTickets([]) }
        else { setTickets(data.tickets || []) }
      })
      .catch(() => { setError('Server error'); setTickets([]) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const copy = (text) => {
    navigator.clipboard?.writeText(text)
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 1200)
  }

  const changeStatus = (id, status) => {
    fetch(`${API}?action=ticket_status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    }).then(load).catch(() => {})
  }

  const remove = (id) => {
    if (!window.confirm('Delete this ticket permanently?')) return
    fetch(`${API}?action=ticket_delete&id=${id}`, { method: 'GET' })
      .then(load).catch(() => {})
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
              <span className="ticket-id">#{t.id}</span>
              <span className="ticket-type" style={{ background: t.type === 'deposit' ? '#eaf3ff' : t.type === 'withdrawal' ? '#e8f9ed' : '#f1ecff', color: t.type === 'deposit' ? '#007aff' : t.type === 'withdrawal' ? '#34c759' : '#5856d6' }}>
                {t.type === 'deposit' ? 'Deposit' : t.type === 'withdrawal' ? 'Withdrawal' : 'Email'}
              </span>
              <select
                value={t.status}
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
              <p className="ticket-detail"><strong>Submitted:</strong> {t.created_at}</p>
              {t.image && (
                <a href={`${import.meta.env.VITE_API_URL || ''}/uploads/${t.image}`} target="_blank" rel="noreferrer" className="ticket-img-link">
                  View Image &#8599;
                </a>
              )}
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
