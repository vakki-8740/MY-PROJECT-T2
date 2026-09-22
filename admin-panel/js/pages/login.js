import { auth } from '../firebase.js'
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js'
import { $, appEl } from '../state.js'

export function renderLogin() {
  appEl.innerHTML = `
    <div class="login-page">
      <div class="login-card">
        <div class="login-logo"><img src="/admin-panel/public/icon-192.png" alt="Admin"></div>
        <div class="login-title">LUCKY ADMIN</div>
        <form onsubmit="handleLogin(event)">
          <div id="login-error" class="form-error" style="display:none"></div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input id="login-email" class="form-input" type="email" placeholder="admin@email.com" required>
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input id="login-pass" class="form-input" type="password" placeholder="Password" required>
          </div>
          <button type="submit" class="btn btn-primary btn-block">Login</button>
        </form>
        <p class="login-hint">Create user in Firebase Console &rarr; Authentication</p>
      </div>
    </div>
  `
  const errEl = $('#login-error')
  if (errEl) errEl.style.display = 'none'
}

window.handleLogin = async (e) => {
  e.preventDefault()
  const email = $('#login-email').value
  const pass = $('#login-pass').value
  const errEl = $('#login-error')
  errEl.textContent = ''
  try {
    await signInWithEmailAndPassword(auth, email, pass)
  } catch {
    errEl.textContent = 'Wrong email or password'
  }
}
