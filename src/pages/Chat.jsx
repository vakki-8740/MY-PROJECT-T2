import React, { useState, useRef, useEffect } from 'react'

const API = `${import.meta.env.VITE_API_URL || ''}/chat.php`

const fmt = (serverTime) => {
  const d = serverTime ? new Date(serverTime.replace(' ', 'T')) : new Date()
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [popup, setPopup] = useState(null)
  const [menuFor, setMenuFor] = useState(null)
  const endRef = useRef(null)

  const load = () => {
    fetch(API)
      .then((r) => r.json())
      .then((res) => {
        setMessages((res.messages || []).map((m) => ({
          id: m.id,
          text: m.message,
          mine: m.sender === 'user',
          time: fmt(m.created_at),
          edited: !!m.edited,
        })))
      })
      .catch(() => {})
  }

  useEffect(() => { load() }, [])
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setInput('')
    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, sender: 'user' }),
    })
      .then(load)
      .catch(() => {})
  }

  const openMenu = (msg) => {
    setMenuFor(menuFor === msg.id ? null : msg.id)
  }

  const copyMsg = (msg) => {
    navigator.clipboard?.writeText(msg.text)
    setMenuFor(null)
  }

  const editMsg = (msg) => {
    const t = window.prompt('Edit your message:', msg.text)
    if (t !== null && t.trim()) {
      fetch(`${API}?id=${msg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: t.trim() }),
      }).then(load).catch(() => {})
    }
    setMenuFor(null)
  }

  const deleteMsg = (msg) => {
    fetch(`${API}?id=${msg.id}`, { method: 'DELETE' }).then(load).catch(() => {})
    setMenuFor(null)
  }

  const replyMsg = (msg) => {
    setInput('> ' + msg.text + ' ')
    setMenuFor(null)
  }

  return (
    <main className="page chat-page">
      <div className="chat-box">
        {messages.length === 0 && (
          <p className="chat-empty">Welcome to Lucky Star Support! How can we help you today?</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`msg-row ${m.mine ? 'mine' : ''}`}>
            <div className="msg" onClick={() => setPopup(m)}>
              {m.text}
              {m.edited && <span className="edited"> (edited)</span>}
              <span className="msg-time">{m.time}</span>
            </div>
            {m.mine && (
              <div className="msg-menu-wrap">
                <button className="msg-menu-btn" onClick={(e) => { e.stopPropagation(); openMenu(m) }}>&#8942;</button>
                {menuFor === m.id && (
                  <div className="msg-menu">
                    <button onClick={() => replyMsg(m)}>Reply</button>
                    <button onClick={() => editMsg(m)}>Edit</button>
                    <button onClick={() => copyMsg(m)}>Copy</button>
                    <button className="danger" onClick={() => deleteMsg(m)}>Delete</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form className="chat-input" onSubmit={send}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message..." />
        <button type="submit" className="btn send-btn">Send</button>
      </form>

      {popup && (
        <div className="popup-overlay" onClick={() => setPopup(null)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h3>Message Details</h3>
            <p><strong>Message:</strong> {popup.text}</p>
            <p><strong>From:</strong> {popup.mine ? 'You' : 'Support'}</p>
            <p><strong>Date + Time:</strong> {popup.time}</p>
            <button className="btn" onClick={() => setPopup(null)}>Close</button>
          </div>
        </div>
      )}
    </main>
  )
}
