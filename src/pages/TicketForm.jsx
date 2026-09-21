import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const config = {
  deposit: {
    title: 'Deposit Problem',
    problemOptions: ['Pending', 'Reject', 'Processing', 'Not Received in Game Account'],
    amountLabel: 'Enter Deposit Amount',
    amountPlaceholder: 'e.g. 500',
    uploadLabel: 'Upload Payment Image',
    api: `${import.meta.env.VITE_API_URL || ''}/tickets.php?type=deposit`,
  },
  withdrawal: {
    title: 'Withdrawal Problem',
    problemOptions: ['Pending', 'Reject', 'Processing', 'Not Received in Bank Account'],
    amountLabel: 'Enter Withdrawal Amount',
    amountPlaceholder: 'e.g. 1000',
    uploadLabel: 'Upload Withdrawal Issue Image',
    api: `${import.meta.env.VITE_API_URL || ''}/tickets.php?type=withdrawal`,
  },
  email: {
    title: 'E-Mail ID Verification',
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

        <label>{cfg.uploadLabel}
          <input required type="file" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files[0] })} />
        </label>

        <button type="submit" className="btn submit-btn">Submit Request</button>
        {error && <p className="form-error">{error}</p>}
      </form>
    </main>
  )
}
