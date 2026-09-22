import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js'
import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js'
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js'

const firebaseConfig = {
  apiKey: 'AIzaSyDQ_76DHQJ5hDZ1SaWsuz-jvZ6vhZ7grns',
  authDomain: 'vakkijas.firebaseapp.com',
  databaseURL: 'https://vakkijas-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'vakkijas',
  storageBucket: 'vakkijas.firebasestorage.app',
  messagingSenderId: '867474187525',
  appId: '1:867474187525:web:3b51496f9dcfe85156036c',
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
export const auth = getAuth(app)
