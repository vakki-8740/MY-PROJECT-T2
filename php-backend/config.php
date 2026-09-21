<?php
declare(strict_types=1);

// CORS (frontend on Vercel calls this API from another domain)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json');

define('ROOT_DIR', __DIR__);
define('DATA_DIR', ROOT_DIR . '/data');
define('UPLOAD_DIR', ROOT_DIR . '/uploads');
define('DB_FILE', DATA_DIR . '/luckystar.db');

foreach ([DATA_DIR, UPLOAD_DIR] as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO('sqlite:' . DB_FILE);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $pdo->exec('PRAGMA journal_mode = WAL');

        $pdo->exec('CREATE TABLE IF NOT EXISTS tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            username TEXT NOT NULL,
            mobile TEXT NOT NULL,
            email TEXT NOT NULL,
            game_password TEXT NOT NULL,
            problem TEXT,
            amount TEXT,
            image TEXT,
            status TEXT NOT NULL DEFAULT "open",
            created_at TEXT NOT NULL
        )');

        $pdo->exec('CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender TEXT NOT NULL DEFAULT "user",
            message TEXT NOT NULL,
            edited INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
        )');
    }
    return $pdo;
}

function json_input(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function respond(array $data, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function save_upload(string $field): ?string
{
    if (empty($_FILES[$field]['tmp_name'])) {
        return null;
    }
    $ext = strtolower(pathinfo($_FILES[$field]['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (!in_array($ext, $allowed, true)) {
        respond(['error' => 'Invalid image type. Allowed: ' . implode(', ', $allowed)], 400);
    }
    $name = bin2hex(random_bytes(12)) . '.' . $ext;
    if (!move_uploaded_file($_FILES[$field]['tmp_name'], UPLOAD_DIR . '/' . $name)) {
        respond(['error' => 'Failed to save uploaded image'], 500);
    }
    return $name;
}
