document.addEventListener('DOMContentLoaded', async () => {
  await renderNavbar();
  loadStats();
  loadPantiPreview();
});

async function loadStats() {
  try {
    const r = await window.api.get('/public.php?action=stats');
    document.getElementById('stat-total').textContent = formatRupiah(r.total_donasi);
    document.getElementById('stat-donatur').textContent = Number(r.jumlah_donatur).toLocaleString('id-ID');
    document.getElementById('stat-panti').textContent = Number(r.jumlah_panti).toLocaleString('id-ID');
  } catch (err) {
    console.error('[Beranda] Gagal memuat statistik:', err);
  }
}

async function loadPantiPreview() {
  const list = document.getElementById('panti-list');
  try {
    const data = await window.api.get('/public.php?action=panti&sort=newest&limit=3');
    if (!data || !data.length) {
      list.innerHTML = '<p class="text-muted">Belum ada panti yang terdaftar.</p>';
      return;
    }

    list.innerHTML = '';
    for (const p of data) {
      const terkumpul = Number(p.terkumpul) || 0;
      const persen = p.target_dana > 0 ? Math.min(100, (terkumpul / p.target_dana) * 100) : 0;
      
      const card = document.createElement('div');
      card.className = 'card';
      card.style.overflow = 'hidden';
      card.innerHTML = `
        <div style="
          height: 160px;
          background: linear-gradient(135deg, #E8F0F8 0%, #D4E3F7 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: -20px -24px 16px -24px;
          font-size: 48px;
        ">
          ${p.foto 
            ? `<img src="${escapeHtml(p.foto)}" alt="${escapeHtml(p.nama_panti)}" style="width: 100%; height: 100%; object-fit: cover;" />`
            : '<span>🏛️</span>'}
        </div>
        <div style="font-size: 11px; font-weight: 700; color: var(--primary); margin-bottom: 8px;">
          ${escapeHtml(p.kategori || 'Panti Asuhan')}
        </div>
        <h3 class="card-title">${escapeHtml(p.nama_panti)}</h3>
        <div style="font-size: 13px; color: var(--slate-light); margin-bottom: 16px;">
          ${escapeHtml(p.kota || '-')}, Indonesia
        </div>
        <div style="margin-bottom: 12px;">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${persen}%"></div>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px;">
          <div style="font-weight: 700; color: var(--primary); font-size: 14px;">
            ${formatRupiah(terkumpul)}
          </div>
          <div style="font-size: 13px; color: var(--slate-light);">
            dari ${formatRupiah(p.target_dana)}
          </div>
        </div>
        <a href="/donasi.html?panti=${p.id}" class="btn btn-primary lg">→ Donasi</a>
      `;
      list.appendChild(card);
    }
  } catch (err) {
    console.error('[Beranda] Gagal memuat panti:', err);
    list.innerHTML = '<p class="text-muted">Gagal memuat data panti.</p>';
  }
}