<?php
require_once 'db.php';

$action = $_GET['action'] ?? '';
$input  = getJsonInput();

switch ($action) {
    // 1. Cek user yang sedang login (pengganti getCurrentUser & is_admin)
    case 'me':
        if (!isset($_SESSION['user'])) {
            sendJson(['user' => null, 'role' => null, 'profile' => null]);
        }
        $user = $_SESSION['user'];
        $role = $_SESSION['role']; // 'donatur' atau 'admin'
        
        if ($role === 'admin') {
            $stmt = $pdo->prepare("SELECT id, nama, email, role FROM admin WHERE id = ?");
        } else {
            $stmt = $pdo->prepare("SELECT id, nama, email, no_hp, auth_provider, foto_profil FROM donatur WHERE id = ?");
        }
        $stmt->execute([$user['id']]);
        $profile = $stmt->fetch();

        sendJson([
            'user'    => $user,
            'role'    => $role,
            'profile' => $profile ?: null
        ]);
        break;

    // 2. Registrasi Donatur Baru
    case 'register':
        $nama     = trim($input['nama'] ?? '');
        $email    = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

        if (!$nama || !$email || strlen($password) < 6) {
            sendJson(['error' => 'Nama, email, dan password (min 6 karakter) wajib diisi.'], 400);
        }

        // Cek apakah email sudah terdaftar
        $stmt = $pdo->prepare("SELECT id FROM donatur WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            sendJson(['error' => 'Email sudah terdaftar. Silakan masuk.'], 400);
        }

        $id   = generateUuid();
        $hash = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $pdo->prepare("INSERT INTO donatur (id, nama, email, password_hash, auth_provider) VALUES (?, ?, ?, ?, 'email')");
        $stmt->execute([$id, $nama, $email, $hash]);

        // Otomatis login setelah daftar
        $_SESSION['user'] = ['id' => $id, 'email' => $email, 'nama' => $nama];
        $_SESSION['role'] = 'donatur';

        sendJson(['message' => 'Pendaftaran berhasil', 'user' => $_SESSION['user']]);
        break;

    // 3. Login Donatur
    case 'login':
        $email    = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

        $stmt = $pdo->prepare("SELECT * FROM donatur WHERE email = ?");
        $stmt->execute([$email]);
        $donatur = $stmt->fetch();

        if (!$donatur || !password_verify($password, $donatur['password_hash'])) {
            sendJson(['error' => 'Email atau password salah.'], 401);
        }

        $_SESSION['user'] = ['id' => $donatur['id'], 'email' => $donatur['email'], 'nama' => $donatur['nama']];
        $_SESSION['role'] = 'donatur';

        sendJson(['message' => 'Login berhasil', 'user' => $_SESSION['user']]);
        break;

    // 4. Login Admin
    case 'login_admin':
        $email    = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

        $stmt = $pdo->prepare("SELECT * FROM admin WHERE email = ?");
        $stmt->execute([$email]);
        $admin = $stmt->fetch();

        if (!$admin || !password_verify($password, $admin['password_hash'])) {
            sendJson(['error' => 'Email atau password admin salah.'], 401);
        }

        $_SESSION['user'] = ['id' => $admin['id'], 'email' => $admin['email'], 'nama' => $admin['nama']];
        $_SESSION['role'] = 'admin';

        sendJson(['message' => 'Login admin berhasil', 'user' => $_SESSION['user']]);
        break;

    // 5. Logout
    case 'logout':
        session_destroy();
        sendJson(['message' => 'Logout berhasil']);
        break;

    default:
        sendJson(['error' => 'Action tidak valid'], 400);
}