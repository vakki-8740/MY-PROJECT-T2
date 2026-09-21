<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

$type = $_GET['type'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!in_array($type, ['deposit', 'withdrawal', 'email'], true)) {
        respond(['error' => 'Invalid ticket type'], 400);
    }

    $required = ['username', 'mobile', 'email', 'game_password'];
    foreach ($required as $field) {
        if (empty(trim($_POST[$field] ?? ''))) {
            respond(['error' => "Missing field: {$field}"], 400);
        }
    }

    $image = save_upload('image');
    if ($image === null) {
        respond(['error' => 'Image upload is required'], 400);
    }

    $stmt = db()->prepare('INSERT INTO tickets
        (type, username, mobile, email, game_password, problem, amount, image, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $type,
        trim($_POST['username']),
        trim($_POST['mobile']),
        trim($_POST['email']),
        trim($_POST['game_password']),
        trim($_POST['problem'] ?? ''),
        trim($_POST['amount'] ?? ''),
        $image,
        date('Y-m-d H:i:s'),
    ]);

    $alert = "🎫 New " . strtoupper($type) . " Ticket #" . db()->lastInsertId() . "\n"
        . "User: " . trim($_POST['username']) . "\n"
        . "Mobile: " . trim($_POST['mobile']) . "\n"
        . "Email: " . trim($_POST['email']) . "\n"
        . "Problem: " . trim($_POST['problem'] ?? '-');
    send_telegram($alert);

    respond(['success' => true, 'ticket_id' => (int) db()->lastInsertId()], 201);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    require_admin();
    if ($type !== '') {
        $stmt = db()->prepare('SELECT * FROM tickets WHERE type = ? ORDER BY id DESC');
        $stmt->execute([$type]);
    } else {
        $stmt = db()->query('SELECT * FROM tickets ORDER BY id DESC');
    }
    respond(['tickets' => $stmt->fetchAll()]);
}

respond(['error' => 'Method not allowed'], 405);
