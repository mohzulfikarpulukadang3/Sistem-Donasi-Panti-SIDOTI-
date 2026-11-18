<?php
require_once 'db.php';

if (!isset($_SESSION['user']) || $_SESSION['role'] !== 'donatur') {
    sendJson(['error' => 'Silakan login terlebih dahulu.'], 401);
}

$userId   = $_SESSION['user']['id'];
$donasiId = (int)($_POST['id_donasi'] ?? 0);

if (!$donasiId || !isset($_FILES['bukti'])) {
    sendJson(['error' => 'ID donasi atau file bukti tidak ditemukan.'], 400);
}

// Validasi kepemilikan donasi (pengganti RLS Supabase)
$stmtCek = $pdo->prepare("SELECT id FROM donasi WHERE id = ? AND id_donatur = ?");
$stmtCek->execute([$donasiId, $userId]);
if (!$stmtCek->fetch()) {
    sendJson(['error' => 'Donasi tidak valid atau bukan milik Anda.'], 403);
}

$file = $_FILES['bukti'];
if ($file['error'] !== UPLOAD_ERR_OK) {
    sendJson(['error' => 'Gagal mengunggah file ke server.'], 400);
}

// Validasi ukuran (max 5 MB) & tipe file
$maxBytes = 5 * 1024 * 1024;
$allowedMime = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'application/pdf' => 'pdf'];
$mime = mime_content_type($file['tmp_name']);

if ($file['size'] > $maxBytes) {
    sendJson(['error' => 'Ukuran file melebihi 5 MB.'], 400);
}
if (!isset($allowedMime[$mime])) {
    sendJson(['error' => 'Format tidak didukung. Gunakan JPG, PNG, atau PDF.'], 400);
}

// Buat folder lokal: /uploads/bukti-transfer/{userId}/{donasiId}/
$ext       = $allowedMime[$mime];
$relDir    = "/uploads/bukti-transfer/{$userId}/{$donasiId}";
$targetDir = dirname(__DIR__) . $relDir;

if (!is_dir($targetDir)) {
    mkdir($targetDir, 0777, true);
}

$fileName   = "bukti-" . time() . "." . $ext;
$targetPath = $targetDir . "/" . $fileName;
$publicUrl  = $relDir . "/" . $fileName;

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    sendJson(['error' => 'Gagal menyimpan file di server.'], 500);
}

// Simpan URL file ke tabel pembayaran (kolom status tetap dijaga agar tidak diubah user)
$stmtUpd = $pdo->prepare("UPDATE pembayaran SET bukti = ? WHERE id_donasi = ?");
$stmtUpd->execute([$publicUrl, $donasiId]);

sendJson(['message' => 'Bukti berhasil diunggah', 'url' => $publicUrl]);