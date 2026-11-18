let semuaDonasi = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (!(await requireDonatur())) return;
  await renderNavbar();
  await loadRiwayat();

  document.getElementById('cari').addEventListener('input', renderTabel);
  document.getElementById('filter-status').addEventListener('change', renderTabel);
});

async function loadRiwayat() {
  try {
    semuaDonasi = await window.api.get('/donasi.php?action=riwayat');
    renderTabel();
  } catch (err) {
    console.error('[Riwayat] Gagal memuat:', err);
    document.getElementById('riwayat-body').innerHTML =
      `<tr><td colspan="6"><p class="muted">Gagal memuat riwayat: ${escapeHtml(err.message)}</p></td></tr>`;
  }
}

function renderTabel() {
  const cari = document.getElementById('cari').value.toLowerCase().trim();
  const status = document.getElementById('filter-status').value;
  const body = document.getElementById('riwayat-body');

  let list = semuaDonasi;
  if (cari) list = list.filter(d => (d.nama_panti || '').toLowerCase().includes(cari));
  if (status) list = list.filter(d => d.status_bayar === status);

  if (!list.length) {
    body.innerHTML = `<tr><td colspan="6"><div class="empty-state">
      <div class="emoji">📦</div>
      <p>Belum ada donasi yang cocok. Yuk mulai berdonasi!</p>
      <a href="/donasi.html" class="btn btn-primary btn-sm mt-2">Donasi Sekarang</a>
    </div></td></tr>`;
    return;
  }

  body.innerHTML = list.map(d => {
    const buktiCell = d.bukti
      ? `<a href="${escapeHtml(d.bukti)}" target="_blank" class="btn btn-ghost btn-sm">Lihat</a>`
      : '<span class="muted">Belum</span>';
    const aksi = d.status_bayar === 'menunggu'
      ? `<a href="/pembayaran.html?id=${d.id}" class="btn btn-outline btn-sm">Unggah Bukti</a>`
      : '<span class="muted">Selesai</span>';
    return `<tr>
      <td>${formatTanggal(d.tanggal)}</td>
      <td>${escapeHtml(d.nama_panti || '-')}</td>
      <td><strong>${formatRupiah(d.nominal)}</strong></td>
      <td><span class="badge ${statusBadgeClass(d.status_bayar)}">${d.status_bayar}</span></td>
      <td>${buktiCell}</td>
      <td>${aksi}</td>
    </tr>`;
  }).join('');
}