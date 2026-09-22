import React, { useState, useRef, useEffect } from 'react'
import { sendChatMessage, editChatMessage, deleteChatMessage, subscribeChat, trackPresence, getUserIdForChat } from '../lib/db.js'

const fmt = (iso) => {
  const d = iso ? new Date(iso) : new Date()
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [popup, setPopup] = useState(null)
  const [menuFor, setMenuFor] = useState(null)
  const endRef = useRef(null)
  const userIdRef = useRef(null)

  useEffect(() => {
    userIdRef.current = trackPresence()
  }, [])

  useEffect(() => {
    const unsub = subscribeChat(setMessages)
    return () => unsub()
  }, [])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setInput('')
    sendChatMessage('user', text, 'text', userIdRef.current).catch(() => {})
  }

  const sendImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      sendChatMessage('user', reader.result, 'image', userIdRef.current).catch(() => {})
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const openMenu = (msg) => {
    setMenuFor(menuFor === msg.id ? null : msg.id)
  }

  const copyMsg = (msg) => {
    navigator.clipboard?.writeText(msg.message)
    setMenuFor(null)
  }

  const editMsg = (msg) => {
    const t = window.prompt('Edit your message:', msg.message)
    if (t !== null && t.trim()) {
      editChatMessage(msg.id, t.trim()).catch(() => {})
    }
    setMenuFor(null)
  }

  const deleteMsg = (msg) => {
    deleteChatMessage(msg.id).catch(() => {})
    setMenuFor(null)
  }

  const replyMsg = (msg) => {
    setInput('> ' + msg.message + ' ')
    setMenuFor(null)
  }

  return (
    <main className="page chat-page">
      <div className="chat-box">
        {messages.length === 0 && (
          <p className="chat-empty">Welcome to Lucky Star Support! How can we help you today?</p>
        )}
        {messages.map((m) => ({
          id: m.id,
          text: m.message,
          type: m.type || 'text',
          mine: m.sender === 'user',
          time: fmt(m.created_at),
          edited: !!m.edited,
        })).map((m) => (
          <div key={m.id} className={`msg-row ${m.mine ? 'mine' : ''}`}>
            <div className="msg" onClick={() => setPopup(m)}>
              {m.type === 'image' ? (
                <img src={m.text} alt="shared" className="chat-image" />
              ) : (
                m.text
              )}
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
        <label className="img-upload-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <input type="file" accept="image/*" onChange={sendImage} hidden />
        </label>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message..." />
        <button type="submit" className="btn send-btn">Send</button>
      </form>

      {popup && (
        <div className="popup-overlay" onClick={() => setPopup(null)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h3>Message Details</h3>
            {popup.type === 'image' ? (
              <img src={popup.text} alt="shared" style={{ maxWidth: '100%', borderRadius: 8 }} />
            ) : (
              <p><strong>Message:</strong> {popup.text}</p>
            )}
            <p><strong>From:</strong> {popup.mine ? 'You' : 'Support'}</p>
            <p><strong>Date + Time:</strong> {popup.time}</p>
            <button className="btn" onClick={() => setPopup(null)}>Close</button>
          </div>
        </div>
      )}
    </main>
  )
}
