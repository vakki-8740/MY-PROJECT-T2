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

        $pdo->exec('CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
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

function get_setting(string $key, string $default = ''): string
{
    $stmt = db()->prepare('SELECT value FROM settings WHERE key = ?');
    $stmt->execute([$key]);
    $row = $stmt->fetch();
    return $row ? (string) $row['value'] : $default;
}

function set_setting(string $key, string $value): void
{
    db()->prepare('INSERT INTO settings (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value')
        ->execute([$key, $value]);
}

// Admin credentials (defaults, can be changed via settings)
function check_admin(string $user, string $pass): bool
{
    $u = get_setting('admin_user', 'admin');
    $p = get_setting('admin_pass', 'lucky123');
    return hash_equals($u, $user) && hash_equals($p, $pass);
}

function require_admin(): void
{
    $user = $_SERVER['PHP_AUTH_USER'] ?? ($_GET['admin_user'] ?? '');
    $pass = $_SERVER['PHP_AUTH_PW'] ?? ($_GET['admin_pass'] ?? '');
    if (!check_admin((string) $user, (string) $pass)) {
        respond(['error' => 'Unauthorized'], 401);
    }
}

function send_telegram(string $text): void
{
    $token = get_setting('telegram_bot_token');
    $chatId = get_setting('telegram_chat_id');
    if ($token === '' || $chatId === '') {
        return;
    }
    $url = "https://api.telegram.org/bot{$token}/sendMessage";
    $payload = json_encode(['chat_id' => $chatId, 'text' => $text]);
    $ctx = stream_context_create(['http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n",
        'content' => $payload,
        'timeout' => 5,
        'ignore_errors' => true,
    ]]);
    @file_get_contents($url, false, $ctx);
}
