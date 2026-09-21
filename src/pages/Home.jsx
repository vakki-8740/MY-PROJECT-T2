import React from 'react'
import { Link } from 'react-router-dom'

const options = [
  {
    to: '/deposit', color: 'blue', label: 'Deposit Problem',
    desc: 'Deposit pending, rejected or not received in game account?',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="13" rx="3" />
        <path d="M2 10h20" />
        <path d="M6 15h4" />
      </svg>
    ),
  },
  {
    to: '/withdrawal', color: 'green', label: 'Withdrawal Problem',
    desc: 'Withdrawal pending, rejected or not received in bank account?',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M4 21h16" />
      </svg>
    ),
  },
  {
    to: '/email-verification', color: 'orange', label: 'E-Mail ID Verification',
    desc: 'Verify your email ID with our support team.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="3" />
        <path d="m2 7 10 7 10-7" />
      </svg>
    ),
  },
  {
    to: '/chat', color: 'purple', label: 'Online Chat',
    desc: 'Talk live with our support team.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a8 8 0 0 1-8 8H4l1.5-3A8 8 0 1 1 21 12Z" />
        <path d="M9 12h.01M13 12h.01M17 12h.01" />
      </svg>
    ),
  },
]

const faqs = [
  { q: 'How long does a deposit take?', a: 'Most deposits are credited within 5-30 minutes. If your deposit is pending for more than 30 minutes, submit a Deposit Problem ticket.' },
  { q: 'Why was my withdrawal rejected?', a: 'Common reasons: wrong bank details, unmet wagering requirements, or name mismatch. Submit a Withdrawal Problem ticket and our team will check.' },
  { q: 'How do I verify my email ID?', a: 'Open the Email ID Verification page, enter your account details and upload the required screenshot. Verification usually completes within 24 hours.' },
  { q: 'Is my account information safe?', a: 'Yes. All details you submit are used only to verify that the account belongs to you and are kept strictly confidential.' },
  { q: 'Can I chat with a human?', a: 'Yes! Tap Online Chat to talk live with our support team 24x7.' },
]

export default function Home() {
  return (
    <main className="page">
      <section className="banner-wrap">
        <img src="/banner/banner.png" alt="Lucky Star Banner" className="banner" />
      </section>

      <section className="options">
        {options.map((o) => (
          <Link to={o.to} className="option-card" key={o.label}>
            <span className={`option-icon ${o.color}`}>{o.icon}</span>
            <div className="option-text">
              <h3>{o.label}</h3>
              <p>{o.desc}</p>
            </div>
            <span className="option-arrow">&#8250;</span>
          </Link>
        ))}
      </section>

      <section className="faq">
        <h2 className="section-title">A &amp; Q</h2>
        {faqs.map((f, i) => (
          <details className="faq-item" key={i}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </section>
    </main>
  )
}
