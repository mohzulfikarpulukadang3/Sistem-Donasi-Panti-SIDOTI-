-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versi server:                 8.0.30 - MySQL Community Server - GPL
-- OS Server:                    Win64
-- HeidiSQL Versi:               12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Membuang struktur basisdata untuk db_sidoti
CREATE DATABASE IF NOT EXISTS `db_sidoti` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `db_sidoti`;

-- membuang struktur untuk table db_sidoti.admin
CREATE TABLE IF NOT EXISTS `admin` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'admin',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengeluaran data tidak dipilih.

-- membuang struktur untuk table db_sidoti.donasi
CREATE TABLE IF NOT EXISTS `donasi` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_donatur` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_panti` bigint unsigned NOT NULL,
  `nominal` decimal(14,2) NOT NULL,
  `pesan` text COLLATE utf8mb4_unicode_ci,
  `anonim` tinyint(1) NOT NULL DEFAULT '0',
  `status_bayar` enum('menunggu','berhasil','gagal') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'menunggu',
  `tanggal` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `donasi_id_donatur_idx` (`id_donatur`),
  KEY `donasi_id_panti_idx` (`id_panti`),
  KEY `donasi_status_idx` (`status_bayar`),
  CONSTRAINT `fk_donasi_donatur` FOREIGN KEY (`id_donatur`) REFERENCES `donatur` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_donasi_panti` FOREIGN KEY (`id_panti`) REFERENCES `panti` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_donasi_nominal` CHECK ((`nominal` >= 10000))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengeluaran data tidak dipilih.

-- membuang struktur untuk table db_sidoti.donatur
CREATE TABLE IF NOT EXISTS `donatur` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `no_hp` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `auth_provider` enum('email','google') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'email',
  `foto_profil` text COLLATE utf8mb4_unicode_ci,
  `tanggal_daftar` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengeluaran data tidak dipilih.

-- membuang struktur untuk table db_sidoti.laporan
CREATE TABLE IF NOT EXISTS `laporan` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `periode` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_donasi` decimal(14,2) NOT NULL DEFAULT '0.00',
  `rincian_penggunaan` text COLLATE utf8mb4_unicode_ci,
  `dipublikasi` tinyint(1) NOT NULL DEFAULT '0',
  `tanggal_publikasi` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengeluaran data tidak dipilih.

-- membuang struktur untuk table db_sidoti.panti
CREATE TABLE IF NOT EXISTS `panti` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nama_panti` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `kebutuhan` text COLLATE utf8mb4_unicode_ci,
  `foto` text COLLATE utf8mb4_unicode_ci,
  `kota` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kategori` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target_dana` decimal(14,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengeluaran data tidak dipilih.

-- membuang struktur untuk function db_sidoti.panti_terkumpul
DELIMITER //
CREATE FUNCTION `panti_terkumpul`(p_panti_id BIGINT UNSIGNED) RETURNS decimal(14,2)
    READS SQL DATA
    DETERMINISTIC
BEGIN
  DECLARE v_total DECIMAL(14,2);
  SELECT COALESCE(SUM(nominal), 0.00) INTO v_total
  FROM donasi
  WHERE id_panti = p_panti_id AND status_bayar = 'berhasil';
  RETURN v_total;
END//
DELIMITER ;

-- membuang struktur untuk table db_sidoti.pembayaran
CREATE TABLE IF NOT EXISTS `pembayaran` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_donasi` bigint unsigned NOT NULL,
  `metode` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'transfer_bank',
  `id_transaksi_gateway` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','verified','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `bukti` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_donasi` (`id_donasi`),
  CONSTRAINT `fk_pembayaran_donasi` FOREIGN KEY (`id_donasi`) REFERENCES `donasi` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengeluaran data tidak dipilih.

-- membuang struktur untuk view db_sidoti.view_ringkasan_publik
-- Membuat tabel sementara untuk menangani kesalahan ketergantungan VIEW
CREATE TABLE `view_ringkasan_publik` (
	`total_donasi` DECIMAL(36,2) NOT NULL,
	`jumlah_donatur` BIGINT(19) NOT NULL,
	`jumlah_panti` BIGINT(19) NULL
) ENGINE=MyISAM;

-- membuang struktur untuk view db_sidoti.view_ringkasan_publik
-- Menghapus tabel sementara dan menciptakan struktur VIEW terakhir
DROP TABLE IF EXISTS `view_ringkasan_publik`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `view_ringkasan_publik` AS select coalesce(sum((case when (`d`.`status_bayar` = 'berhasil') then `d`.`nominal` else 0 end)),0) AS `total_donasi`,count(distinct (case when (`d`.`status_bayar` = 'berhasil') then `d`.`id_donatur` end)) AS `jumlah_donatur`,(select count(0) from `panti`) AS `jumlah_panti` from `donasi` `d`;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
