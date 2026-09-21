import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const config = {
  deposit: {
    title: 'Create Deposit Problem Ticket',
    problemOptions: ['Pending', 'Reject', 'Processing', 'Not Received in Game Account'],
    amountLabel: 'Enter Deposit Amount',
    amountPlaceholder: 'e.g. 500',
    uploadLabel: 'Upload Payment Image',
    api: `${import.meta.env.VITE_API_URL || ''}/tickets.php?type=deposit`,
  },
  withdrawal: {
    title: 'Create Withdrawal Problem Ticket',
    problemOptions: ['Pending', 'Reject', 'Processing', 'Not Received in Bank Account'],
    amountLabel: 'Enter Withdrawal Amount',
    amountPlaceholder: 'e.g. 1000',
    uploadLabel: 'Upload Withdrawal Issue Image',
    api: `${import.meta.env.VITE_API_URL || ''}/tickets.php?type=withdrawal`,
  },
  email: {
    title: 'Create Email ID Verification Ticket',
    problemOptions: null,
    amountLabel: 'Enter Your Email ID (For Verification)',
    amountPlaceholder: 'you@example.com',
    uploadLabel: 'Upload Issue Image',
    api: `${import.meta.env.VITE_API_URL || ''}/tickets.php?type=email`,
  },
}

export default function TicketForm({ type = 'deposit' }) {
  const navigate = useNavigate()
  const cfg = config[type] || config.deposit
  const [form, setForm] = useState({
    username: '', mobile: '', email: '', password: '',
    problem: '', amount: '', issueEmail: '', image: null,
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [imageName, setImageName] = useState('')

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const onSubmit = (e) => {
    e.preventDefault()
    const data = new FormData()
    data.append('username', form.username)
    data.append('mobile', form.mobile)
    data.append('email', form.email)
    data.append('game_password', form.password)
    data.append('problem', form.problem)
    data.append('amount', type === 'email' ? form.issueEmail : form.amount)
    data.append('image', form.image)

    fetch(cfg.api, { method: 'POST', body: data })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setSubmitted(true)
        } else {
          setError(res.error || 'Something went wrong. Please try again.')
        }
      })
      .catch(() => setError('Could not reach the server. Please try again.'))
  }

  if (submitted) {
    return (
      <main className="page center">
        <div className="success-card">
          <div className="success-icon">&#10004;</div>
          <h2>Request Submitted!</h2>
          <p>Our team will review your {cfg.title.toLowerCase()} request and contact you soon.</p>
          <button className="btn" onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </main>
    )
  }

  return (
    <main className="page">
      <h2 className="section-title">{cfg.title}</h2>
      <p className="form-note">Please enter your correct account details. We use this information only to verify that the account belongs to you.</p>
      <form className="ticket-form" onSubmit={onSubmit}>
        <div className="form-card">
          <label>User Name
            <input required value={form.username} onChange={set('username')} placeholder="Enter your user name" />
          </label>
          <label>Enter Mobile Number
            <input required type="tel" pattern="[0-9]{10}" value={form.mobile} onChange={set('mobile')} placeholder="10 digit mobile number" />
          </label>
          <label>Enter Email ID
            <input required type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
          </label>
          <label>Enter Game Account Password
            <input required type="password" value={form.password} onChange={set('password')} placeholder="Game account password" />
          </label>

          {cfg.problemOptions && (
            <label>Select Your Problem
              <select required value={form.problem} onChange={set('problem')}>
                <option value="">-- Select --</option>
                {cfg.problemOptions.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
          )}

          <label>{cfg.amountLabel}
            <input
              required
              type={type === 'email' ? 'email' : 'number'}
              value={type === 'email' ? form.issueEmail : form.amount}
              onChange={type === 'email' ? set('issueEmail') : set('amount')}
              placeholder={cfg.amountPlaceholder}
            />
          </label>
        </div>

        <div className="upload-box" onClick={() => document.getElementById('ticket-image').click()}>
          <input
            id="ticket-image"
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files[0]
              setForm({ ...form, image: f })
              setImageName(f ? f.name : '')
            }}
          />
          {form.image ? (
            <div className="upload-preview">
              <img src={URL.createObjectURL(form.image)} alt="preview" />
              <span className="upload-name">{imageName}</span>
              <span className="upload-change">Tap to change</span>
            </div>
          ) : (
            <div className="upload-empty">
              <span className="upload-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-4.5-4.5L7 20" />
                </svg>
              </span>
              <span className="upload-title">{cfg.uploadLabel}</span>
              <span className="upload-hint">Tap to select an image (JPG, PNG)</span>
            </div>
          )}
        </div>

        <button type="submit" className="btn submit-btn">Submit Request</button>
        {error && <p className="form-error">{error}</p>}
      </form>
    </main>
  )
}
