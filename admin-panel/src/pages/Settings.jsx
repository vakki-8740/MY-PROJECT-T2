import React, { useState, useEffect } from 'react'
import { auth } from '../lib/db.js'

export default function Settings() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u))
    return () => unsub()
  }, [])

  return (
    <main className="page admin-page">
      <h1 className="section-title" style={{ textAlign: 'left' }}>Settings</h1>
      <div className="form-card">
        <p className="ticket-detail"><strong>Backend:</strong> Firebase Realtime Database</p>
        <p className="ticket-detail"><strong>Project:</strong> vakkijas</p>
        <p className="ticket-detail"><strong>Logged in as:</strong> {user?.email || '-'}</p>
        <p className="ticket-detail"><strong>Tickets path:</strong> /tickets</p>
        <p className="ticket-detail"><strong>Chat path:</strong> /chat_messages</p>
      </div>
      <div className="admin-note" style={{ marginTop: 14 }}>
        With Firebase there are no backend settings to manage. Admin accounts are managed in
        Firebase Console &rarr; Authentication. Data lives in Realtime Database under
        <code> /tickets</code> and <code>/chat_messages</code>.
      </div>
    </main>
  )
}
