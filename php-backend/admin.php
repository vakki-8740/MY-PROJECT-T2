<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

$action = $_GET['action'] ?? '';

if ($action === 'tickets_list') {
    require_admin();
    $type = $_GET['type'] ?? '';
    if ($type !== '') {
        $stmt = db()->prepare('SELECT * FROM tickets WHERE type = ? ORDER BY id DESC');
        $stmt->execute([$type]);
    } else {
        $stmt = db()->query('SELECT * FROM tickets ORDER BY id DESC');
    }
    respond(['tickets' => $stmt->fetchAll()]);
}

if ($action === 'login') {
    $data = json_input();
    if (check_admin((string) ($data['username'] ?? ''), (string) ($data['password'] ?? ''))) {
        respond(['success' => true]);
    }
    respond(['error' => 'Wrong username or password'], 401);
}

require_admin();

if ($action === 'settings_get') {
    respond([
        'admin_user' => get_setting('admin_user', 'admin'),
        'telegram_bot_token' => get_setting('telegram_bot_token'),
        'telegram_chat_id' => get_setting('telegram_chat_id'),
    ]);
}

if ($action === 'settings_save') {
    $data = json_input();
    foreach (['admin_user', 'admin_pass', 'telegram_bot_token', 'telegram_chat_id'] as $key) {
        if (isset($data[$key]) && trim((string) $data[$key]) !== '') {
            set_setting($key, trim((string) $data[$key]));
        }
    }
    respond(['success' => true]);
}

if ($action === 'telegram_test') {
    send_telegram('✅ Lucky Admin: Telegram test message. Alerts are working!');
    respond(['success' => true]);
}

if ($action === 'stats') {
    $total = (int) db()->query('SELECT COUNT(*) FROM tickets')->fetchColumn();
    $open = (int) db()->query('SELECT COUNT(*) FROM tickets WHERE status = "open"')->fetchColumn();
    $deposit = (int) db()->query('SELECT COUNT(*) FROM tickets WHERE type = "deposit"')->fetchColumn();
    $withdrawal = (int) db()->query('SELECT COUNT(*) FROM tickets WHERE type = "withdrawal"')->fetchColumn();
    $email = (int) db()->query('SELECT COUNT(*) FROM tickets WHERE type = "email"')->fetchColumn();
    $messages = (int) db()->query('SELECT COUNT(*) FROM chat_messages')->fetchColumn();
    respond(['total' => $total, 'open' => $open, 'deposit' => $deposit, 'withdrawal' => $withdrawal, 'email' => $email, 'messages' => $messages]);
}

if ($action === 'ticket_status') {
    $data = json_input();
    $id = (int) ($data['id'] ?? 0);
    $status = in_array($data['status'] ?? '', ['open', 'processing', 'resolved', 'rejected'], true) ? $data['status'] : 'open';
    if ($id <= 0) {
        respond(['error' => 'id required'], 400);
    }
    db()->prepare('UPDATE tickets SET status = ? WHERE id = ?')->execute([$status, $id]);
    respond(['success' => true]);
}

if ($action === 'ticket_delete') {
    $id = (int) ($_GET['id'] ?? 0);
    if ($id <= 0) {
        respond(['error' => 'id required'], 400);
    }
    db()->prepare('DELETE FROM tickets WHERE id = ?')->execute([$id]);
    respond(['success' => true]);
}

respond(['error' => 'Unknown action'], 400);
