import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API = `${import.meta.env.VITE_API_URL || ''}/admin.php`

export default function Login({ onLogin }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass }),
      })
      const data = await res.json()
      if (data.success) {
        onLogin()
      } else {
        setError(data.error || 'Login failed')
      }
    } catch {
      setError('Could not reach server')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (localStorage.getItem('lucky_admin_token') === '1') {
      navigate('/')
    }
  }, [navigate])

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-logo-wrap">
          <img src="/icon-192.png" alt="Lucky Admin" className="login-logo" />
        </div>
        <h1 className="login-title">LUCKY ADMIN</h1>
        <form onSubmit={submit}>
          {error && <p className="form-error">{error}</p>}
          <label>Username
            <input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="Enter username"
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
        <p className="login-hint">Default: admin / lucky123</p>
      </div>
    </main>
  )
}
