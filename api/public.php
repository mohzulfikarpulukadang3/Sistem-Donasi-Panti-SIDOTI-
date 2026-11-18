<?php
require_once 'db.php';

$action = $_GET['action'] ?? '';

switch ($action) {
    // Statistik Beranda (pengganti RPC ringkasan_publik)
    case 'stats':
        $stmt = $pdo->query("SELECT * FROM view_ringkasan_publik");
        $row = $stmt->fetch();
        sendJson($row ?: ['total_donasi' => 0, 'jumlah_donatur' => 0, 'jumlah_panti' => 0]);
        break;

    // Daftar Panti beserta dana terkumpul (pengganti select panti + RPC panti_terkumpul)
    case 'panti':
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 0;
        $order = ($_GET['sort'] ?? '') === 'newest' ? 'p.created_at DESC' : 'p.nama_panti ASC';
        
        $sql = "
            SELECT 
                p.id, p.nama_panti, p.deskripsi, p.kebutuhan, p.foto, p.kota, p.kategori, p.target_dana,
                COALESCE(SUM(CASE WHEN d.status_bayar = 'berhasil' THEN d.nominal ELSE 0 END), 0) AS terkumpul
            FROM panti p
            LEFT JOIN donasi d ON d.id_panti = p.id
            GROUP BY p.id
            ORDER BY $order
        ";
        if ($limit > 0) {
            $sql .= " LIMIT $limit";
        }
        $stmt = $pdo->query($sql);
        sendJson($stmt->fetchAll());
        break;

    // Laporan Keuangan yang sudah dipublikasi
    case 'laporan':
        $stmt = $pdo->query("
            SELECT id, periode, total_donasi, rincian_penggunaan, tanggal_publikasi 
            FROM laporan 
            WHERE dipublikasi = 1 
            ORDER BY tanggal_publikasi DESC
        ");
        sendJson($stmt->fetchAll());
        break;

    default:
        sendJson(['error' => 'Action tidak valid'], 400);
}