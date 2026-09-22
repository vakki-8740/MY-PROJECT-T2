import { appEl } from '../state.js'
import { icons } from '../icons.js'
import { headerHTML } from './header.js'

export function renderSettings() {
  appEl.innerHTML = headerHTML() + `
    <main class="page">
      <h1 class="page-title">Settings</h1>
      <div class="card">
        <p class="form-note">Firebase project: <strong>vakkijas</strong></p>
        <p class="form-note">Database: <strong>Realtime Database</strong></p>
        <p class="form-note">Auth method: <strong>Email/Password</strong></p>
      </div>
      <div class="card">
        <h3 style="margin-bottom:10px;font-size:0.95rem">Quick Links</h3>
        <a href="https://console.firebase.google.com/project/vakkijas/authentication" target="_blank" class="btn btn-primary btn-block" style="margin-bottom:8px;text-decoration:none">${icons.externalLink} Firebase Authentication</a>
        <a href="https://console.firebase.google.com/project/vakkijas/database" target="_blank" class="btn btn-success btn-block" style="margin-bottom:8px;text-decoration:none">${icons.externalLink} Realtime Database</a>
        <a href="https://console.firebase.google.com/project/vakkijas" target="_blank" class="btn btn-block" style="background:var(--bg);color:var(--ink);border:1px solid var(--border);text-decoration:none">${icons.externalLink} Firebase Console</a>
      </div>
    </main>
  `
}
