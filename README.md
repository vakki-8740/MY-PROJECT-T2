# Lucky Star Help Center

Mobile-first support/help-center for Lucky Star: ticket submission (deposit / withdrawal / email verification) and live chat with support.

**Backend: Firebase Realtime Database** — no PHP/server needed.

## Structure
- `src/` — Customer-facing site (React 18 + Vite + React Router)
- `admin-panel/` — Admin dashboard (React 18 + Vite PWA) with Firebase Authentication login
- `public/` — Banner, icons, logo

## Firebase Setup (project: `vakkijas`)

Firebase config lives in:
- `src/lib/db.js` (main site)
- `admin-panel/src/lib/db.js` (admin panel)

### 1. Realtime Database rules

In Firebase Console → Realtime Database → Rules, use:

```json
{
  "rules": {
    "tickets": {
      ".read": false,
      ".write": "auth != null",
      ".indexOn": ["created_at"]
    },
    "chat_messages": {
      ".read": true,
      ".write": true,
      ".indexOn": ["created_at"]
    }
  }
}
```

- Anyone can submit tickets and use chat (public write).
- Only Firebase-authenticated admins can read/update/delete tickets.
- For production, lock `chat_messages` writes with validation.

### 2. Admin account

In Firebase Console → Authentication → Sign-in method, enable **Email/Password**.
Then add your admin user (e.g. `admin@luckystar.com`) under Users.

Admin panel login uses that email + password.

### 3. Data paths

- `/tickets` — support tickets (`type`, `username`, `mobile`, `email`, `game_password`, `problem`, `amount`, `image_name`, `status`, `created_at`)
- `/chat_messages` — chat (`sender`: `user` | `admin`, `message`, `edited`, `created_at`)

## Note about images

Ticket image **file uploads** are not stored in the Realtime Database (only the file name is saved).
If you need the actual images, wire up Firebase Storage later or re-add an upload endpoint.

## Run

```bash
# main site
npm install
npm run dev

# admin panel
cd admin-panel
npm install
npm run dev
```

Both deploy as static sites (e.g. Vercel) — no `VITE_API_URL` needed anymore.
