import React, { useState, useEffect } from 'react'

const API = `${import.meta.env.VITE_API_URL || ''}/admin.php`

export default function Settings() {
  const [form, setForm] = useState({ admin_user: '', admin_pass: '', telegram_bot_token: '', telegram_chat_id: '' })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}?action=settings_get`)
      .then((r) => r.json())
      .then(setForm)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setSaved(false)
    await fetch(`${API}?action=settings_save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const testTelegram = async () => {
    await fetch(`${API}?action=telegram_test`, { method: 'POST' })
  }

  return (
    <main className="page admin-page">
      <h1 className="section-title" style={{ textAlign: 'left' }}>Settings</h1>
      <form className="ticket-form" onSubmit={submit}>
        <div className="form-card">
          <label>Admin Username
            <input value={form.admin_user} onChange={set('admin_user')} placeholder="Username" />
          </label>
          <label>Admin Password
            <input type="password" value={form.admin_pass} onChange={set('admin_pass')} placeholder="Password" />
          </label>
          <label>Telegram Bot Token
            <input value={form.telegram_bot_token} onChange={set('telegram_bot_token')} placeholder="123456789:ABCdef..." />
          </label>
          <label>Telegram Chat ID
            <input value={form.telegram_chat_id} onChange={set('telegram_chat_id')} placeholder="-1001234567890" />
          </label>
        </div>
        <button type="submit" className="btn submit-btn">Save Settings</button>
        {saved && <p className="form-success">Saved!</p>}
        {form.telegram_bot_token && form.telegram_chat_id && (
          <button type="button" className="btn btn-sm" onClick={testTelegram} style={{ background: '#34c759' }}>Test Telegram Alert</button>
        )}
      </form>
      <p className="login-hint">
        After saving, refresh the page to apply new admin login credentials.
      </p>
    </main>
  )
}
