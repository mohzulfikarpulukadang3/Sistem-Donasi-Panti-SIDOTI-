## Cara Instalasi & Menjalankan Proyek Secara Lokal (Laragon / XAMPP)

### 1. Prasyarat Sistem
Pastikan perangkat Anda sudah terpasang:
* **Laragon** (atau XAMPP) dengan **PHP 8.1+** dan **MySQL 8.0 / MariaDB**
* **Browser modern** (Google Chrome, Microsoft Edge, atau Mozilla Firefox)

### 2. Langkah Instalasi

1. **Kloning atau Unduh Repositori**
   * Menggunakan Git:
     ```bash
     git clone [https://github.com/mohzulfikarpulukadang3/Sistem-Donasi-Panti-SIDOTI-.git](https://github.com/mohzulfikarpulukadang3/Sistem-Donasi-Panti-SIDOTI-.git)
     ```
   * Atau klik tombol hijau **`<> Code`** $\rightarrow$ **`Download ZIP`**, lalu ekstrak foldernya.
   * Pindahkan folder proyek ke dalam direktori root web server:
     * **Laragon:** `C:\laragon\www\sidoti` *(atau sesuai lokasi instalasi Laragon Anda, misalnya `D:\...\laragon\www\sidoti`)*
     * **XAMPP:** `C:\xampp\htdocs\sidoti`

2. **Jalankan Layanan Server**
   * Buka aplikasi **Laragon** (atau **XAMPP Control Panel**).
   * Klik **Start All** untuk mengaktifkan layanan **Apache** dan **MySQL**.

3. **Impor Basis Data (`db_sidoti`)**
   * Buka **HeidiSQL** (melalui tombol *Database* di Laragon) atau buka `http://localhost/phpmyadmin` di browser.
   * Pilih menu **File** $\rightarrow$ **Muat berkas SQL...** *(atau tab **Import** di phpMyAdmin)*, lalu pilih berkas **`Database/Sidoti_2.sql`** dari dalam folder proyek.
   * Jalankan (*Execute* / *Go*) hingga database `db_sidoti` beserta seluruh tabel (`admin`, `donatur`, `panti`, `donasi`, `pembayaran`, `laporan`), *Stored Function* `panti_terkumpul`, dan *View* `view_ringkasan_publik` berhasil dibuat.

4. **Periksa Konfigurasi Koneksi Database**
   Buka berkas konfigurasi koneksi database pada folder `api/` (misalnya `api/config.php`) dan pastikan pengaturannya sesuai dengan server lokal Anda:
   ```php
   $host = "127.0.0.1";
   $user = "root";
   $pass = "";
   $db   = "db_sidoti";