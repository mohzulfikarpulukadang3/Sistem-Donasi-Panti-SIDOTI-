<?php
require_once 'db.php';

// Guard keamanan: Wajib login sebagai Admin (pengganti RLS is_admin())
if (!isset($_SESSION['user']) || $_SESSION['role'] !== 'admin') {
    sendJson(['error' => 'Akses ditolak. Hanya admin yang diizinkan.'], 403);
}

$action = $_GET['action'] ?? '';
$input  = getJsonInput();

switch ($action) {
    // -----------------------------------------------------
    // 1. DONASI & VERIFIKASI (dashboard.js & verifikasi.js)
    // -----------------------------------------------------
    case 'donasi_list':
        $stmt = $pdo->query("
            SELECT 
                d.id, d.nominal, d.status_bayar, d.tanggal, d.pesan, d.anonim, d.id_donatur, d.id_panti,
                don.nama AS donatur_nama, don.email AS donatur_email, don.no_hp AS donatur_no_hp,
                p.nama_panti,
                pb.id AS pembayaran_id, pb.status AS pembayaran_status, pb.bukti AS pembayaran_bukti
            FROM donasi d
            LEFT JOIN donatur don ON don.id = d.id_donatur
            LEFT JOIN panti p ON p.id = d.id_panti
            LEFT JOIN pembayaran pb ON pb.id_donasi = d.id
            ORDER BY d.tanggal DESC
        ");
        $rows = $stmt->fetchAll();

        // Format ulang agar kompatibel 100% dengan struktur objek JS yang sudah ada
        $result = array_map(function($r) {
            return [
                'id'           => (int)$r['id'],
                'nominal'      => (float)$r['nominal'],
                'status_bayar' => $r['status_bayar'],
                'tanggal'      => $r['tanggal'],
                'pesan'        => $r['pesan'],
                'anonim'       => (bool)$r['anonim'],
                'id_donatur'   => $r['id_donatur'],
                'id_panti'     => (int)$r['id_panti'],
                'donatur'      => $r['id_donatur'] ? [
                    'nama'  => $r['donatur_nama'],
                    'email' => $r['donatur_email'],
                    'no_hp' => $r['donatur_no_hp']
                ] : null,
                'panti'        => ['nama_panti' => $r['nama_panti']],
                'pembayaran'   => $r['pembayaran_id'] ? [[
                    'id'     => (int)$r['pembayaran_id'],
                    'status' => $r['pembayaran_status'],
                    'bukti'  => $r['pembayaran_bukti']
                ]] : []
            ];
        }, $rows);

        sendJson($result);
        break;

    case 'donasi_verifikasi':
        $donasiId    = (int)($input['id'] ?? 0);
        $statusAkhir = $input['status_bayar'] ?? '';

        if (!$donasiId || !in_array($statusAkhir, ['berhasil', 'gagal'])) {
            sendJson(['error' => 'Data verifikasi tidak valid.'], 400);
        }

        $statusBayar = ($statusAkhir === 'berhasil') ? 'verified' : 'rejected';

        try {
            $pdo->beginTransaction();

            $stmt1 = $pdo->prepare("UPDATE donasi SET status_bayar = ? WHERE id = ?");
            $stmt1->execute([$statusAkhir, $donasiId]);

            $stmt2 = $pdo->prepare("UPDATE pembayaran SET status = ? WHERE id_donasi = ?");
            $stmt2->execute([$statusBayar, $donasiId]);

            $pdo->commit();
            sendJson(['message' => 'Status donasi berhasil diperbarui.']);
        } catch (Exception $e) {
            $pdo->rollBack();
            sendJson(['error' => 'Gagal memperbarui status: ' . $e->getMessage()], 500);
        }
        break;

    // -----------------------------------------------------
    // 2. KELOLA PANTI (kelola-panti.js)
    // -----------------------------------------------------
    case 'panti_list':
        $stmt = $pdo->query("
            SELECT 
                p.id, p.nama_panti, p.kota, p.kategori, p.target_dana, p.deskripsi, p.kebutuhan, p.foto,
                COALESCE(SUM(CASE WHEN d.status_bayar = 'berhasil' THEN d.nominal ELSE 0 END), 0) AS terkumpul
            FROM panti p
            LEFT JOIN donasi d ON d.id_panti = p.id
            GROUP BY p.id
            ORDER BY p.nama_panti ASC
        ");
        sendJson($stmt->fetchAll());
        break;

    case 'panti_save':
        $id         = (int)($input['id'] ?? 0);
        $namaPanti  = trim($input['nama_panti'] ?? '');
        $kota       = trim($input['kota'] ?? '') ?: null;
        $kategori   = trim($input['kategori'] ?? '') ?: null;
        $targetDana = (float)($input['target_dana'] ?? 0);
        $deskripsi  = trim($input['deskripsi'] ?? '') ?: null;
        $kebutuhan  = trim($input['kebutuhan'] ?? '') ?: null;
        $foto       = trim($input['foto'] ?? '') ?: null;

        if (!$namaPanti) {
            sendJson(['error' => 'Nama panti wajib diisi.'], 400);
        }

        if ($id > 0) {
            $stmt = $pdo->prepare("
                UPDATE panti 
                SET nama_panti = ?, kota = ?, kategori = ?, target_dana = ?, deskripsi = ?, kebutuhan = ?, foto = ?
                WHERE id = ?
            ");
            $stmt->execute([$namaPanti, $kota, $kategori, $targetDana, $deskripsi, $kebutuhan, $foto, $id]);
            sendJson(['message' => 'Panti diperbarui.']);
        } else {
            $stmt = $pdo->prepare("
                INSERT INTO panti (nama_panti, kota, kategori, target_dana, deskripsi, kebutuhan, foto)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$namaPanti, $kota, $kategori, $targetDana, $deskripsi, $kebutuhan, $foto]);
            sendJson(['message' => 'Panti ditambahkan.']);
        }
        break;

    case 'panti_delete':
        $id = (int)($input['id'] ?? 0);
        try {
            $stmt = $pdo->prepare("DELETE FROM panti WHERE id = ?");
            $stmt->execute([$id]);
            sendJson(['message' => 'Panti dihapus.']);
        } catch (PDOException $e) {
            // Foreign key RESTRICT jika panti sudah memiliki riwayat donasi
            sendJson(['error' => 'Panti tidak bisa dihapus karena sudah memiliki data donasi terkait.'], 400);
        }
        break;

    // -----------------------------------------------------
    // 3. KELOLA LAPORAN (kelola-laporan.js)
    // -----------------------------------------------------
    case 'laporan_list':
        $stmt = $pdo->query("
            SELECT id, periode, total_donasi, rincian_penggunaan, dipublikasi, tanggal_publikasi, created_at
            FROM laporan
            ORDER BY created_at DESC
        ");
        sendJson($stmt->fetchAll());
        break;

    case 'laporan_save':
        $id          = (int)($input['id'] ?? 0);
        $periode     = trim($input['periode'] ?? '');
        $totalDonasi = (float)($input['total_donasi'] ?? 0);
        $rincian     = trim($input['rincian_penggunaan'] ?? '') ?: null;

        if (!$periode) {
            sendJson(['error' => 'Periode wajib diisi.'], 400);
        }

        if ($id > 0) {
            $stmt = $pdo->prepare("
                UPDATE laporan SET periode = ?, total_donasi = ?, rincian_penggunaan = ? WHERE id = ?
            ");
            $stmt->execute([$periode, $totalDonasi, $rincian, $id]);
            sendJson(['message' => 'Laporan diperbarui.']);
        } else {
            $stmt = $pdo->prepare("
                INSERT INTO laporan (periode, total_donasi, rincian_penggunaan, dipublikasi)
                VALUES (?, ?, ?, 0)
            ");
            $stmt->execute([$periode, $totalDonasi, $rincian]);
            sendJson(['message' => 'Laporan dibuat sebagai draft.']);
        }
        break;

    case 'laporan_publish':
        $id      = (int)($input['id'] ?? 0);
        $publish = !empty($input['dipublikasi']) ? 1 : 0;
        $tgl     = $publish ? date('Y-m-d H:i:s') : null;

        $stmt = $pdo->prepare("UPDATE laporan SET dipublikasi = ?, tanggal_publikasi = ? WHERE id = ?");
        $stmt->execute([$publish, $tgl, $id]);
        sendJson(['message' => $publish ? 'Laporan dipublikasikan.' : 'Laporan disembunyikan.']);
        break;

    case 'laporan_delete':
        $id   = (int)($input['id'] ?? 0);
        $stmt = $pdo->prepare("DELETE FROM laporan WHERE id = ?");
        $stmt->execute([$id]);
        sendJson(['message' => 'Laporan dihapus.']);
        break;

    default:
        sendJson(['error' => 'Action admin tidak valid.'], 400);
}