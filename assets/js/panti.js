let semuaPanti = [];

document.addEventListener('DOMContentLoaded', async () => {
  await renderNavbar();
  await loadPanti();

  document.getElementById('cari').addEventListener('input', renderPanti);
  document.getElementById('filter-kategori').addEventListener('change', renderPanti);
});

async function loadPanti() {
  try {
    semuaPanti = await window.api.get('/public.php?action=panti');

    const kategori = [...new Set(semuaPanti.map(p => p.kategori).filter(Boolean))];
    const sel = document.getElementById('filter-kategori');
    kategori.forEach(k => {
      if (![...sel.options].some(o => o.value === k)) {
        const opt = document.createElement('option');
        opt.value = k; opt.textContent = k;
        sel.appendChild(opt);
      }
    });

    renderPanti();
  } catch (err) {
    console.error('[Panti] Gagal memuat:', err);
    document.getElementById('panti-list').innerHTML = '<p class="muted">Gagal memuat data panti.</p>';
  }
}

function renderPanti() {
  const list = document.getElementById('panti-list');
  const cari = document.getElementById('cari').value.toLowerCase().trim();
  const kategori = document.getElementById('filter-kategori').value;

  let filtered = semuaPanti;
  if (cari) {
    filtered = filtered.filter(p =>
      (p.nama_panti || '').toLowerCase().includes(cari) ||
      (p.kota || '').toLowerCase().includes(cari));
  }
  if (kategori) filtered = filtered.filter(p => p.kategori === kategori);

  if (!filtered.length) {
    list.innerHTML = '<div class="empty-state"><div class="emoji">🏠</div><p>Tidak ada panti yang cocok.</p></div>';
    return;
  }

  list.innerHTML = filtered.map(p => {
    const terkumpul = Number(p.terkumpul) || 0;
    const persen = p.target_dana > 0 ? Math.min(100, (terkumpul / p.target_dana) * 100) : 0;
    return `<div class="panti-card">
      ${p.foto
        ? `<img class="panti-img" src="${escapeHtml(p.foto)}" alt="${escapeHtml(p.nama_panti)}" />`
        : `<div class="panti-img"></div>`}
      <div class="panti-body">
        <h3 class="panti-title">${escapeHtml(p.nama_panti)}</h3>
        <div class="panti-kota">${escapeHtml(p.kota || '-')} · ${escapeHtml(p.kategori || '-')}</div>
        <p class="panti-desc">${escapeHtml(p.deskripsi || '')}</p>
        ${p.kebutuhan ? `<p class="muted" style="font-size:13px"><strong>Kebutuhan:</strong> ${escapeHtml(p.kebutuhan)}</p>` : ''}
        <div class="progress"><div class="progress-bar" style="width:${persen}%"></div></div>
        <div class="progress-label"><span>${formatRupiah(terkumpul)}</span><span>${formatRupiah(p.target_dana)}</span></div>
        <a href="/donasi.html?panti=${p.id}" class="btn btn-primary btn-block mt-2">Donasi Sekarang</a>
      </div>
    </div>`;
  }).join('');
}