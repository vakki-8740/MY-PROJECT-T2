import React, { useState, useEffect } from 'react'

const API = `${import.meta.env.VITE_API_URL || ''}/chat.php`

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    fetch(API)
      .then((r) => r.json())
      .then((res) => setMessages(res.messages || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const send = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setInput('')
    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, sender: 'admin' }),
    })
    load()
  }

  const del = (id) => {
    if (!window.confirm('Delete this message?')) return
    fetch(`${API}?id=${id}`, { method: 'DELETE' }).then(load).catch(() => {})
  }

  return (
    <main className="page admin-page">
      <h1 className="section-title" style={{ textAlign: 'left' }}>User Chats</h1>
      {loading && <p className="admin-empty">Loading...</p>}
      {messages.length === 0 && !loading && <p className="admin-empty">No messages yet</p>}
      <div className="chat-box">
        {messages.map((m) => (
          <div key={m.id} className={`msg-row ${m.sender === 'user' ? 'mine' : ''}`}>
            <div className="msg" onClick={() => {}}>
              {m.message}
              <span className="msg-time">{m.sender === 'user' ? 'User' : 'Admin'} · {m.created_at}</span>
            </div>
            {m.sender === 'user' && (
              <button className="msg-menu-btn" onClick={() => del(m.id)} title="Delete">🗑</button>
            )}
          </div>
        ))}
      </div>
      <form className="chat-input" onSubmit={send}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Reply to user..."
        />
        <button type="submit" className="btn send-btn">Send</button>
      </form>
    </main>
  )
}
