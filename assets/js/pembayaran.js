let donasiId = null;
let donasiData = null;

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ['image/jpeg', 'image/png', 'application/pdf'];

document.addEventListener('DOMContentLoaded', async () => {
  if (!(await requireDonatur())) return;
  await renderNavbar();

  const params = new URLSearchParams(location.search);
  donasiId = Number(params.get('id'));
  if (!donasiId) { showAlert('error', 'ID donasi tidak ditemukan. Kembali ke form donasi.'); return; }

  await loadDonasi();
  bindFileEvents();
});

function showAlert(type, msg) {
  document.getElementById('alert-box').innerHTML = `<div class="alert alert-${type}">${escapeHtml(msg)}</div>`;
}

async function loadDonasi() {
  const box = document.getElementById('detail-donasi');
  try {
    donasiData = await window.api.get(`/donasi.php?action=detail&id=${donasiId}`);
    renderDetail();
  } catch (err) {
    console.error('[Pembayaran] Gagal memuat:', err);
    showAlert('error', err.message || 'Gagal memuat data donasi.');
    box.innerHTML = '';
  }
}

function renderDetail() {
  const d = donasiData;
  document.getElementById('detail-donasi').innerHTML = `
    <div style="text-align: left;">
      <div style="font-weight: 600; color: var(--navy); font-size: 15px; margin-bottom: 2px;">
        ${escapeHtml(d.nama_panti || '-')}
      </div>
      <div style="font-size: 12px; color: var(--slate-light); margin-bottom: 8px;">
        ${escapeHtml(d.kota || '-')}, Indonesia
      </div>
      ${d.pesan ? `<div style="font-size: 12px; color: var(--primary); font-weight: 600; margin-bottom: 8px;">Pesan: ${escapeHtml(d.pesan)}</div>` : ''}
    </div>
  `;
  document.getElementById('payment-nominal').textContent = formatRupiah(d.nominal);
}

function bindFileEvents() {
  const input = document.getElementById('file-bukti');
  if (!input) return;
  
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) {
      document.getElementById('file-preview').style.display = 'none';
      document.getElementById('upload-zone').style.display = 'flex';
      return;
    }
    document.getElementById('preview-filename').textContent = file.name;
    document.getElementById('preview-filesize').textContent = (file.size / 1024).toFixed(0) + ' KB • Siap dikirim';
    document.getElementById('file-preview').style.display = 'block';
    document.getElementById('upload-zone').style.display = 'none';
  });
}

async function onUploadBukti(e) {
  e.preventDefault();
  const file = document.getElementById('file-bukti').files[0];
  if (!file) { showAlert('error', 'Pilih file bukti terlebih dahulu.'); return; }
  if (!ALLOWED.includes(file.type)) {
    showAlert('error', 'Format tidak didukung. Gunakan JPG, PNG, atau PDF.'); return;
  }
  if (file.size > MAX_BYTES) {
    showAlert('error', 'Ukuran file melebihi 5 MB.'); return;
  }

  const btn = document.getElementById('btn-upload');
  btn.disabled = true; 
  btn.textContent = 'Mengunggah...';
  
  try {
    const formData = new FormData();
    formData.append('id_donasi', donasiId);
    formData.append('bukti', file);

    await window.api.upload('/upload_bukti.php', formData);

    showAlert('success', 'Bukti transfer berhasil diunggah. Menunggu verifikasi admin.');
    await loadDonasi();
  } catch (err) {
    console.error('[Pembayaran] Error detail:', err);
    showAlert('error', 'Gagal mengunggah bukti: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = donasiData && donasiData.bukti ? 'Unggah Ulang Bukti' : 'Kirim Bukti';
  }
}