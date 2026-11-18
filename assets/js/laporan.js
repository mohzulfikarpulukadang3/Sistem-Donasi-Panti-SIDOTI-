document.addEventListener('DOMContentLoaded', async () => {
  await renderNavbar();
  await loadLaporan();
});

async function loadLaporan() {
  const list = document.getElementById('laporan-list');
  try {
    const data = await window.api.get('/public.php?action=laporan');

    if (!data || !data.length) {
      list.innerHTML = `<div class="card empty-state">
        <div class="emoji">📄</div>
        <p>Belum ada laporan yang dipublikasikan.</p>
        <p class="muted">Laporan akan muncul di sini setelah admin mempublikasikannya.</p>
      </div>`;
      return;
    }

    list.innerHTML = data.map(l => `
      <div class="card mb-0" style="margin-bottom:20px">
        <div class="flex between wrap gap-1">
          <div>
            <h3 style="margin:0">Periode ${escapeHtml(l.periode)}</h3>
            <p class="muted" style="margin:4px 0 0">Dipublikasikan ${formatTanggal(l.tanggal_publikasi)}</p>
          </div>
          <div class="stat-card" style="padding:14px;box-shadow:none;border:1px solid var(--c-border)">
            <div class="stat-value" style="font-size:22px">${formatRupiah(l.total_donasi)}</div>
            <div class="stat-label">Total Donasi Periode Ini</div>
          </div>
        </div>
        <hr style="border:none;border-top:1px solid var(--c-border);margin:16px 0" />
        <div><strong>Rincian Penggunaan Dana:</strong></div>
        <div style="white-space:pre-wrap;margin-top:8px">${escapeHtml(l.rincian_penggunaan || '-')}</div>
      </div>
    `).join('');
  } catch (err) {
    console.error('[Laporan] Gagal memuat:', err);
    list.innerHTML = '<p class="muted">Gagal memuat laporan.</p>';
  }
}