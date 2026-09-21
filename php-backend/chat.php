<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $rows = db()->query('SELECT * FROM chat_messages ORDER BY id ASC')->fetchAll();
    respond(['messages' => $rows]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = $_POST ?: json_input();
    $message = trim((string) ($data['message'] ?? ''));
    if ($message === '') {
        respond(['error' => 'Message is required'], 400);
    }
    $sender = ($data['sender'] ?? 'user') === 'admin' ? 'admin' : 'user';

    $stmt = db()->prepare('INSERT INTO chat_messages (sender, message, created_at) VALUES (?, ?, ?)');
    $stmt->execute([$sender, $message, date('Y-m-d H:i:s')]);

    if ($sender === 'user') {
        send_telegram("💬 New user chat message:\n" . $message);
    }

    $stmt = db()->prepare('SELECT * FROM chat_messages WHERE id = ?');
    $stmt->execute([db()->lastInsertId()]);
    respond(['message' => $stmt->fetch()], 201);
}

if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
    if ($id <= 0) {
        respond(['error' => 'id is required'], 400);
    }
    $data = json_input();
    $message = trim((string) ($data['message'] ?? ''));
    if ($message === '') {
        respond(['error' => 'Message is required'], 400);
    }
    db()->prepare('UPDATE chat_messages SET message = ?, edited = 1 WHERE id = ?')
        ->execute([$message, $id]);
    respond(['success' => true]);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if ($id <= 0) {
        respond(['error' => 'id is required'], 400);
    }
    db()->prepare('DELETE FROM chat_messages WHERE id = ?')->execute([$id]);
    respond(['success' => true]);
}

respond(['error' => 'Method not allowed'], 405);
