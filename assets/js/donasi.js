let daftarPanti = [];
let userSekarang = null;

document.addEventListener('DOMContentLoaded', async () => {
  userSekarang = await requireDonatur();
  if (!userSekarang) return;

  await renderNavbar();
  await isiDataAwalDonatur();
  await loadPantiOptions();
  bindEvents();
});

async function isiDataAwalDonatur() {
  const profil = await getCurrentDonatur();
  if (profil) {
    if (profil.nama) document.getElementById('nama').value = profil.nama;
    if (profil.no_hp) document.getElementById('no_hp').value = profil.no_hp;
  }
}

async function loadPantiOptions() {
  const sel = document.getElementById('panti');
  try {
    daftarPanti = await window.api.get('/public.php?action=panti');
    sel.innerHTML = daftarPanti.length
      ? daftarPanti.map(p => `<option value="${p.id}">${escapeHtml(p.nama_panti)} — ${escapeHtml(p.kota || '-')}</option>`).join('')
      : '<option value="">Belum ada panti</option>';

    const params = new URLSearchParams(location.search);
    const pantiId = params.get('panti');
    if (pantiId) sel.value = pantiId;

    updateRingkasanPanti();
  } catch (err) {
    console.error('[Donasi] Gagal memuat panti:', err);
    sel.innerHTML = '<option value="">Gagal memuat panti</option>';
  }
}

function bindEvents() {
  document.querySelectorAll('.nominal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const nominal = btn.dataset.nominal;
      document.querySelectorAll('.nominal-btn').forEach(b => b.classList.remove('selected'));
      
      if (nominal === 'custom') {
        document.getElementById('nominal').style.display = 'block';
        document.getElementById('nominal').focus();
      } else {
        document.getElementById('nominal').value = nominal;
        document.getElementById('nominal').style.display = 'none';
        btn.classList.add('selected');
        updateRingkasanNominal();
      }
    });
  });

  document.getElementById('nominal').addEventListener('focus', () => {
    document.querySelectorAll('.nominal-btn').forEach(b => b.classList.remove('selected'));
  });

  document.getElementById('nominal').addEventListener('input', updateRingkasanNominal);
  document.getElementById('panti').addEventListener('change', updateRingkasanPanti);
  document.getElementById('form-donasi').addEventListener('submit', onSubmitDonasi);
}

function updateRingkasanPanti() {
  const id = Number(document.getElementById('panti').value);
  const panti = daftarPanti.find(p => Number(p.id) === id);
  const box = document.getElementById('ringkasan-panti');
  
  if (!panti) {
    box.innerHTML = '<p style="color: var(--slate-light); font-size: 13px;">Pilih panti terlebih dahulu</p>';
    return;
  }
  
  box.innerHTML = `
    <div style="text-align: left;">
      <div style="font-weight: 600; color: var(--navy); font-size: 15px; margin-bottom: 2px;">
        ${escapeHtml(panti.nama_panti)}
      </div>
      <div style="font-size: 12px; color: var(--slate-light); margin-bottom: 8px;">
        ${escapeHtml(panti.kota || '-')}, Indonesia
      </div>
      <div style="font-size: 12px; color: var(--primary); font-weight: 600;">
        ${escapeHtml(panti.kategori || 'Panti Asuhan')}
      </div>
    </div>
  `;
}

function updateRingkasanNominal() {
  const n = Number(document.getElementById('nominal').value) || 0;
  document.getElementById('ringkasan-nominal').textContent = formatRupiah(n);
  document.getElementById('ringkasan-biaya').textContent = formatRupiah(0);
  document.getElementById('ringkasan-total').textContent = formatRupiah(n);
}

function showAlert(type, msg) {
  document.getElementById('alert-box').innerHTML = `<div class="alert alert-${type}">${escapeHtml(msg)}</div>`;
}
function clearAlert() {
  document.getElementById('alert-box').innerHTML = '';
}

async function onSubmitDonasi(e) {
  e.preventDefault();
  clearAlert();

  const id_panti = Number(document.getElementById('panti').value);
  const nominal  = Number(document.getElementById('nominal').value);
  const nama     = document.getElementById('nama').value.trim();
  const no_hp    = document.getElementById('no_hp').value.trim();
  const pesan    = document.getElementById('pesan').value.trim();
  const anonim   = document.getElementById('anonim').checked;

  if (!id_panti) { showAlert('error', 'Pilih panti tujuan terlebih dahulu.'); return; }
  if (nominal < 10000) { showAlert('error', 'Nominal minimal Rp10.000.'); return; }
  if (!nama) { showAlert('error', 'Nama lengkap wajib diisi.'); return; }
  if (!no_hp) { showAlert('error', 'No. HP wajib diisi.'); return; }

  const btn = document.getElementById('btn-submit');
  btn.disabled = true; btn.textContent = 'Menyimpan...';

  try {
    const res = await window.api.post('/donasi.php?action=create', {
      id_panti, nominal, nama, no_hp, pesan, anonim
    });
    window.location.href = '/pembayaran.html?id=' + res.id;
  } catch (err) {
    console.error('[Donasi] Gagal menyimpan:', err);
    showAlert('error', 'Gagal menyimpan donasi: ' + err.message);
  } finally {
    btn.disabled = false; btn.textContent = 'Lanjut Pembayaran';
  }
}