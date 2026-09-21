# Lucky Star Help Center - PHP Backend

SQLite database + PHP API for tickets and chat. Deploy on any PHP 8+ host.

## Setup
1. Upload this folder to your PHP hosting (e.g. `public_html/api`).
2. Make sure the `data/` and `uploads/` folders are writable (chmod 755 or 775).
3. On first request the SQLite database is created automatically at `data/luckystar.db`.

## Endpoints
- `POST /tickets.php?type=deposit|withdrawal|email` - create a ticket (multipart form: username, mobile, email, password, problem, amount, image). Sends Telegram alert to admin.
- `GET /tickets.php` - list all tickets (admin auth required: `?admin_user=&admin_pass=` or HTTP Basic Auth)
- `GET /chat.php` - get chat messages
- `POST /chat.php` - send message (JSON: {message, sender})
- `DELETE /chat.php?id=<id>` - delete message
- `PATCH /chat.php?id=<id>` - edit message (JSON: {message})
- `POST /admin.php?action=login` - admin login (JSON: {username, password})
- `GET /admin.php?action=stats` - dashboard stats (admin)
- `POST /admin.php?action=ticket_status` - update ticket status (JSON: {id, status})
- `GET /admin.php?action=ticket_delete&id=<id>` - delete ticket (admin)
- `GET /admin.php?action=settings_get` / `POST /admin.php?action=settings_save` - admin user/pass + Telegram bot token & chat id
- `POST /admin.php?action=telegram_test` - send test Telegram alert

## Default Admin Login
- Username: `admin` / Password: `lucky123` (change it from Admin Panel > Settings)

## Security Notes
- Uploaded images are stored in `uploads/` with random names.
- All inputs are escaped via prepared statements (PDO).
- For production, add admin authentication before using the GET ticket list.
