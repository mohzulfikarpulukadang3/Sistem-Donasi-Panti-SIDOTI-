# SIDOTI — Sistem Donasi Panti Asuhan Berbasis Web

**SIDOTI** adalah aplikasi web yang dirancang untuk mendigitalisasi proses pencatatan dan penyaluran donasi pada panti asuhan. Sistem ini menggantikan pencatatan manual pada buku besar dengan platform daring yang terstruktur, cepat, dan transparan bagi donatur maupun pengurus panti asuhan.

---

## Fitur Utama

### 1. Peran Donatur & Publik
* **Autentikasi Multi-Metode:** Registrasi dan masuk menggunakan email/kata sandi maupun integrasi akun Google (`auth_provider`).
* **Katalog & Progres Panti Asuhan:** Menampilkan daftar panti asuhan beserta kota, kategori kebutuhan, target dana, dan akumulasi dana terkumpul secara *real-time*.
* **Formulir Donasi Daring:** Pemilihan nominal donasi (minimal Rp10.000), opsi donasi anonim, pesan/doa, serta unggah bukti transfer pembayaran.
* **Riwayat & Transparansi Laporan:** Memantau status verifikasi transaksi pribadi (`menunggu`, `berhasil`, `gagal`) dan melihat rekap laporan penyaluran dana berkala yang dipublikasikan.

### 2. Peran Administrator (Pengurus Panti)
* **Dashboard Ringkasan:** Statistik total donasi terverifikasi, jumlah donatur unik, dan jumlah panti terdaftar.
* **Manajemen Data Panti (CRUD):** Menambah, memperbarui, dan menghapus profil panti asuhan beserta target kebutuhan dana.
* **Verifikasi Pembayaran:** Memeriksa bukti transfer pada transaksi masuk dan mengubah status verifikasi (`pending`, `verified`, `rejected`) yang otomatis memperbarui dana terkumpul.
* **Publikasi Laporan Keuangan:** Menyusun dan mempublikasikan laporan penggunaan dana periodik kepada publik.

---

## Teknologi yang Digunakan (*Tech Stack*)

* **Frontend:** HTML5, CSS3 (*Soft Glassmorphism & Bento Grid*), JavaScript ES6+ (*Fetch API*)
* **Backend:** PHP 8.1+ (*RESTful JSON API*)
* **Database:** MySQL 8.0 / MariaDB (`db_sidoti`)
* **Web Server:** Apache (Laragon — `http://sidoti.test` atau `http://localhost/sidoti`)

---

## Struktur Direktori Proyek

```text
sidoti/
├── admin/                  # Antarmuka panel administrator
│   ├── index.html          # Dashboard ringkasan admin
│   ├── login.html          # Halaman masuk administrator
│   ├── panti.html          # Manajemen data panti asuhan
│   ├── verifikasi.html     # Verifikasi bukti transfer donasi
│   └── laporan.html        # Pengelolaan laporan keuangan
├── api/                    # Endpoint REST API (PHP)
│   ├── config.php          # Konfigurasi koneksi database MySQL
│   ├── auth.php            # Autentikasi & registrasi pengguna
│   ├── panti.php           # Layanan data panti asuhan
│   ├── donasi.php          # Pemrosesan transaksi & unggah bukti
│   └── admin.php           # Logika verifikasi & laporan admin
├── assets/                 # Aset statis antarmuka
│   ├── css/style.css       # Stylesheet utama
│   ├── js/                 # Skrip interaksi frontend
│   └── img/                # Logo dan media gambar
├── database/               # Skema basis data SQL
│   └── Sidoti_2.sql        # Struktur tabel, function, dan view db_sidoti
├── uploads/                # Direktori penyimpanan bukti transfer
├── index.html              # Halaman beranda publik
├── login.html              # Halaman masuk & daftar donatur
├── panti.html              # Halaman katalog panti asuhan
├── donasi.html             # Halaman formulir donasi
├── riwayat.html            # Halaman riwayat donasi pengguna
├── laporan.html            # Halaman transparansi laporan keuangan
└── README.md               # Dokumentasi proyek