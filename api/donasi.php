<?php
require_once 'db.php';

// Pastikan user sudah login sebagai donatur
if (!isset($_SESSION['user']) || $_SESSION['role'] !== 'donatur') {
    sendJson(['error' => 'Silakan login terlebih dahulu.'], 401);
}

$userId = $_SESSION['user']['id'];
$action = $_GET['action'] ?? '';
$input  = getJsonInput();

switch ($action) {
    // 1. Buat Donasi Baru + Baris Pembayaran
    case 'create':
        $idPanti = (int)($input['id_panti'] ?? 0);
        $nominal = (float)($input['nominal'] ?? 0);
        $nama    = trim($input['nama'] ?? '');
        $noHp    = trim($input['no_hp'] ?? '');
        $pesan   = trim($input['pesan'] ?? '');
        $anonim  = !empty($input['anonim']) ? 1 : 0;

        if (!$idPanti || $nominal < 10000 || !$nama || !$noHp) {
            sendJson(['error' => 'Data donasi tidak lengkap atau nominal kurang dari Rp10.000.'], 400);
        }

        try {
            $pdo->beginTransaction();

            // Update profil donatur
            $stmtUpd = $pdo->prepare("UPDATE donatur SET nama = ?, no_hp = ? WHERE id = ?");
            $stmtUpd->execute([$nama, $noHp, $userId]);
            $_SESSION['user']['nama'] = $nama;

            // Insert donasi
            $stmtDon = $pdo->prepare("
                INSERT INTO donasi (id_donatur, id_panti, nominal, pesan, anonim, status_bayar) 
                VALUES (?, ?, ?, ?, ?, 'menunggu')
            ");
            $stmtDon->execute([$userId, $idPanti, $nominal, $pesan ?: null, $anonim]);
            $donasiId = $pdo->lastInsertId();

            // Insert pembayaran awal (pending)
            $stmtBayar = $pdo->prepare("
                INSERT INTO pembayaran (id_donasi, metode, status) 
                VALUES (?, 'transfer_bank', 'pending')
            ");
            $stmtBayar->execute([$donasiId]);

            $pdo->commit();
            sendJson(['id' => $donasiId, 'message' => 'Donasi berhasil dibuat']);
        } catch (Exception $e) {
            $pdo->rollBack();
            sendJson(['error' => 'Gagal menyimpan donasi: ' . $e->getMessage()], 500);
        }
        break;

    // 2. Ambil Detail 1 Donasi untuk Halaman Pembayaran
    case 'detail':
        $id = (int)($_GET['id'] ?? 0);
        $stmt = $pdo->prepare("
            SELECT 
                d.id, d.nominal, d.status_bayar, d.tanggal, d.pesan, d.anonim, d.id_panti,
                p.nama_panti, p.kota,
                pb.id AS pembayaran_id, pb.status AS status_pembayaran, pb.bukti, pb.metode
            FROM donasi d
            JOIN panti p ON p.id = d.id_panti
            LEFT JOIN pembayaran pb ON pb.id_donasi = d.id
            WHERE d.id = ? AND d.id_donatur = ?
        ");
        $stmt->execute([$id, $userId]);
        $row = $stmt->fetch();

        if (!$row) {
            sendJson(['error' => 'Donasi tidak ditemukan atau bukan milik Anda.'], 404);
        }
        sendJson($row);
        break;

    // 3. Ambil Riwayat Semua Donasi Milik Donatur
    case 'riwayat':
        $stmt = $pdo->prepare("
            SELECT 
                d.id, d.nominal, d.status_bayar, d.tanggal, d.pesan,
                p.nama_panti,
                pb.id AS pembayaran_id, pb.status AS status_pembayaran, pb.bukti
            FROM donasi d
            JOIN panti p ON p.id = d.id_panti
            LEFT JOIN pembayaran pb ON pb.id_donasi = d.id
            WHERE d.id_donatur = ?
            ORDER BY d.tanggal DESC
        ");
        $stmt->execute([$userId]);
        sendJson($stmt->fetchAll());
        break;

    default:
        sendJson(['error' => 'Action tidak valid'], 400);
}