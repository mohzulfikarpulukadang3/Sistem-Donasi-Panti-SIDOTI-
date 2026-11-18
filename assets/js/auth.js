// Cache status sesi sementara di halaman agar tidak fetch berulang kali
let _cachedSession = null;

async function getSessionData(forceRefresh = false) {
  if (_cachedSession && !forceRefresh) return _cachedSession;
  try {
    _cachedSession = await window.api.get('/auth.php?action=me');
    return _cachedSession;
  } catch (err) {
    console.error('[SIDOTI] Gagal mengambil sesi:', err);
    return { user: null, role: null, profile: null };
  }
}

// Ambil user yang sedang login (atau null bila belum login)
async function getCurrentUser() {
  const session = await getSessionData();
  return session.user || null;
}

// Ambil profil donatur untuk user yang login
async function getCurrentDonatur() {
  const session = await getSessionData();
  if (session.role !== 'donatur') return null;
  return session.profile || null;
}

// Wajib login donatur. Alihkan ke /login.html bila belum.
async function requireDonatur() {
  const session = await getSessionData();
  if (!session.user || session.role !== 'donatur') {
    window.location.href = '/login.html?redirect=' +
      encodeURIComponent(window.location.pathname + window.location.search);
    return null;
  }
  return session.user;
}

// Wajib admin. Alihkan bila bukan admin.
async function requireAdmin() {
  const session = await getSessionData();
  if (!session.user) {
    window.location.href = '/admin/login.html';
    return null;
  }
  if (session.role !== 'admin') {
    alert('Akses ditolak. Halaman ini hanya untuk admin.');
    window.location.href = '/';
    return null;
  }
  return session.user;
}

// Logout dan kembali ke beranda
async function logout() {
  try {
    await window.api.post('/auth.php?action=logout');
  } catch (err) {
    console.error('[SIDOTI] Gagal logout:', err);
  }
  _cachedSession = null;
  window.location.href = '/';
}

// =====================================================
// Util format (Tetap sama seperti aslinya)
// =====================================================
function formatRupiah(num) {
  const n = Number(num) || 0;
  return 'Rp' + n.toLocaleString('id-ID');
}

function formatTanggal(iso) {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  } catch (e) {
    return iso;
  }
}

function formatTanggalWaktu(iso) {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch (e) {
    return iso;
  }
}

function statusBadgeClass(status) {
  switch ((status || '').toLowerCase()) {
    case 'berhasil': case 'verified': return 'badge-success';
    case 'gagal': case 'rejected':    return 'badge-danger';
    case 'menunggu': case 'pending':   return 'badge-warning';
    default: return 'badge-muted';
  }
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getInitials(fullName) {
  if (!fullName) return 'U';
  const parts = fullName.trim().split(' ');
  return parts.slice(0, 2).map(p => p[0].toUpperCase()).join('');
}

// =====================================================
// Navbar dinamis
// ===================================================== 
async function renderNavbar() {
  const el = document.getElementById('navbar');
  if (!el) return;
  
  const session = await getSessionData();
  const user    = session.user;
  const admin   = session.role === 'admin';
  const donatur = session.profile;

  const pubLinks = `
    <a href="/panti.html" class="nav-link">Info Panti</a>
    <a href="/laporan.html" class="nav-link">Laporan</a>`;

  let akunLink = '';
  if (!user) {
    akunLink = `<a href="/login.html" class="btn btn-primary btn-sm">Masuk</a>`;
  } else if (admin) {
    akunLink = `
      <a href="/admin/" class="nav-link">Admin</a>
      <button id="btn-logout" class="btn btn-ghost btn-sm">Keluar</button>`;
  } else {
    const userName = donatur?.nama || user.nama || user.email?.split('@')[0] || 'Donatur';
    const initials = getInitials(userName);
    akunLink = `
      <a href="/riwayat.html" class="nav-link">Riwayat Donasi</a>
      <a href="/donasi.html" class="btn btn-primary btn-sm">+ Donasi</a>
      <div class="nav-avatar">
        <div class="avatar-circle">${escapeHtml(initials)}</div>
        <div class="avatar-text">
          <div class="avatar-name">${escapeHtml(userName)}</div>
          <div class="avatar-role">Donatur</div>
        </div>
      </div>
      <button id="btn-logout" class="btn btn-ghost btn-sm">Keluar</button>`;
  }
const path = window.location.pathname;
  el.innerHTML = `
    <div class="nav-brand">
      <a href="/">
        <img src="/assets/img/logo-sidoti.png" alt="Logo SIDOTI" class="brand-logo-img" />
        <div class="brand-mark-text">
          <div>SIDOTI</div>
          <div class="brand-sub">SISTEM DONASI PANTI</div>
        </div>
      </a>
    </div>
    <nav class="nav-links">
      <a href="/" class="nav-link ${path === '/' || path === '/index.html' ? 'active' : ''}">Beranda</a>
      <a href="/panti.html" class="nav-link ${path.includes('panti') ? 'active' : ''}">Panti Asuhan</a>
      <a href="/laporan.html" class="nav-link ${path.includes('laporan') ? 'active' : ''}">Laporan</a>
      ${user ? `
        <a href="/riwayat.html" class="nav-link ${path.includes('riwayat') ? 'active' : ''}">Riwayat</a>
        <a href="/donasi.html" class="btn btn-primary btn-sm">Donasi</a>
        <button id="btn-logout" class="btn btn-ghost btn-sm" type="button">Keluar</button>
      ` : `
        <a href="/login.html" class="btn btn-outline btn-sm">Masuk</a>
        <a href="/donasi.html" class="btn btn-primary btn-sm">Donasi Sekarang</a>
      `}
    </nav>
  `;

  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) btnLogout.addEventListener('click', logout);
}