import React, { useState, useEffect } from 'react'
import { sendChatMessage, deleteChatMessage, subscribeChat } from '../lib/db.js'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeChat((list) => {
      setMessages(list)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const send = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setInput('')
    await sendChatMessage('admin', text).catch(() => {})
  }

  const del = (id) => {
    if (!window.confirm('Delete this message?')) return
    deleteChatMessage(id).catch(() => {})
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
              {m.edited && <span className="edited"> (edited)</span>}
              <span className="msg-time">{m.sender === 'user' ? 'User' : 'Admin'} · {m.created_at ? new Date(m.created_at).toLocaleString() : ''}</span>
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
