import React, { useState, useRef, useEffect } from 'react'

let idCounter = 1
const now = () => {
  const d = new Date()
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function Chat() {
  const [messages, setMessages] = useState([
    { id: 0, text: 'Welcome to Lucky Star Support! How can we help you today?', mine: false, time: now(), edited: false },
  ])
  const [input, setInput] = useState('')
  const [popup, setPopup] = useState(null)
  const [menuFor, setMenuFor] = useState(null)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    setMessages([...messages, { id: idCounter++, text: input.trim(), mine: true, time: now(), edited: false }])
    setInput('')
    setTimeout(() => {
      setMessages((m) => [...m, { id: idCounter++, text: 'Thanks for your message! Our agent will reply shortly.', mine: false, time: now(), edited: false }])
    }, 800)
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
      setMessages(messages.map((m) => m.id === msg.id ? { ...m, text: t.trim(), edited: true } : m))
    }
    setMenuFor(null)
  }

  const deleteMsg = (msg) => {
    setMessages(messages.filter((m) => m.id !== msg.id))
    setMenuFor(null)
  }

  const replyMsg = (msg) => {
    setInput('> ' + msg.text + ' ')
    setMenuFor(null)
  }

  return (
    <main className="page chat-page">
      <div className="chat-box">
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
