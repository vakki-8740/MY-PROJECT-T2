export function showToast(msg) {
  const el = document.createElement('div')
  el.className = 'toast'
  el.textContent = msg
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 1500)
}

export function copyText(text) {
  navigator.clipboard?.writeText(text)
  showToast('Copied!')
}
