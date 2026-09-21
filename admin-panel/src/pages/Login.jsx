import React, { useState } from 'react'
import { adminLogin } from '../lib/db.js'

export default function Login({ onLogin }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await adminLogin(user.trim(), pass)
      onLogin()
    } catch (err) {
      const code = err?.code || ''
      if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
        setError('Wrong email or password')
      } else if (code.includes('too-many-requests')) {
        setError('Too many attempts. Try again later.')
      } else if (code.includes('invalid-email')) {
        setError('Please enter a valid admin email')
      } else {
        setError('Login failed. Please try again.')
      }
    }
    setLoading(false)
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-logo-wrap">
          <img src="/icon-192.png" alt="Lucky Admin" className="login-logo" />
        </div>
        <h1 className="login-title">LUCKY ADMIN</h1>
        <form onSubmit={submit}>
          {error && <p className="form-error">{error}</p>}
          <label>Admin Email
            <input
              type="email"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="username"
            />
          </label>
          <label>Password
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </label>
          <button type="submit" className="btn submit-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="login-hint">Login with your Firebase admin account</p>
      </div>
    </main>
  )
}
