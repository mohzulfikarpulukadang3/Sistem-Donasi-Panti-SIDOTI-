let daftarPanti = [];

document.addEventListener('DOMContentLoaded', async () => {
  await initAdminPage(async () => {
    bindForm();
    await loadPanti();
  });
});

function showAlert(type, msg) {
  document.getElementById('alert-box').innerHTML = `<div class="alert alert-${type}">${escapeHtml(msg)}</div>`;
}

function bindForm() {
  document.getElementById('btn-tambah').addEventListener('click', bukaFormTambah);
  document.getElementById('btn-batal').addEventListener('click', tutupForm);
  document.getElementById('form-panti').addEventListener('submit', onSubmitPanti);
}

async function loadPanti() {
  const body = document.getElementById('panti-body');
  try {
    daftarPanti = await window.api.get('/admin.php?action=panti_list');
    renderTabel();
  } catch (err) {
    console.error('[KelolaPanti] Gagal memuat:', err);
    body.innerHTML = `<tr><td colspan="6"><p class="muted">Gagal memuat: ${escapeHtml(err.message)}</p></td></tr>`;
  }
}

function renderTabel() {
  const body = document.getElementById('panti-body');
  if (!daftarPanti.length) {
    body.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="emoji">🏠</div><p>Belum ada panti. Klik "Tambah Panti".</p></div></td></tr>';
    return;
  }

  body.innerHTML = daftarPanti.map(p => `<tr>
    <td><strong>${escapeHtml(p.nama_panti)}</strong></td>
    <td>${escapeHtml(p.kota || '-')}</td>
    <td>${escapeHtml(p.kategori || '-')}</td>
    <td>${formatRupiah(p.target_dana)}</td>
    <td>${formatRupiah(p.terkumpul || 0)}</td>
    <td>
      <button class="btn btn-outline btn-sm" onclick="editPanti(${p.id})">Edit</button>
      <button class="btn btn-danger btn-sm" onclick="hapusPanti(${p.id})">Hapus</button>
    </td>
  </tr>`).join('');
}

function bukaFormTambah() {
  document.getElementById('form-title').textContent = 'Tambah Panti';
  document.getElementById('form-panti').reset();
  document.getElementById('panti-id').value = '';
  document.getElementById('form-card').style.display = 'block';
  document.getElementById('btn-simpan').textContent = 'Simpan';
  document.getElementById('form-card').scrollIntoView({ behavior: 'smooth' });
}

function tutupForm() {
  document.getElementById('form-card').style.display = 'none';
}

function editPanti(id) {
  const p = daftarPanti.find(x => Number(x.id) === Number(id));
  if (!p) return;
  document.getElementById('form-title').textContent = 'Edit Panti';
  document.getElementById('panti-id').value = p.id;
  document.getElementById('nama_panti').value = p.nama_panti || '';
  document.getElementById('kota').value = p.kota || '';
  document.getElementById('kategori').value = p.kategori || '';
  document.getElementById('target_dana').value = p.target_dana || 0;
  document.getElementById('deskripsi').value = p.deskripsi || '';
  document.getElementById('kebutuhan').value = p.kebutuhan || '';
  document.getElementById('foto').value = p.foto || '';
  document.getElementById('form-card').style.display = 'block';
  document.getElementById('btn-simpan').textContent = 'Perbarui';
  document.getElementById('form-card').scrollIntoView({ behavior: 'smooth' });
}

async function hapusPanti(id) {
  if (!confirm('Yakin menghapus panti ini?')) return;
  try {
    await window.api.post('/admin.php?action=panti_delete', { id });
    showAlert('success', 'Panti dihapus.');
    await loadPanti();
  } catch (err) {
    showAlert('error', 'Gagal menghapus: ' + err.message);
  }
}

async function onSubmitPanti(e) {
  e.preventDefault();
  const id = document.getElementById('panti-id').value;
  const payload = {
    id: id ? Number(id) : 0,
    nama_panti: document.getElementById('nama_panti').value.trim(),
    kota: document.getElementById('kota').value.trim() || null,
    kategori: document.getElementById('kategori').value.trim() || null,
    target_dana: Number(document.getElementById('target_dana').value) || 0,
    deskripsi: document.getElementById('deskripsi').value.trim() || null,
    kebutuhan: document.getElementById('kebutuhan').value.trim() || null,
    foto: document.getElementById('foto').value.trim() || null,
  };
  if (!payload.nama_panti) { showAlert('error', 'Nama panti wajib diisi.'); return; }

  const btn = document.getElementById('btn-simpan');
  btn.disabled = true; btn.textContent = 'Menyimpan...';
  try {
    await window.api.post('/admin.php?action=panti_save', payload);
    showAlert('success', id ? 'Panti diperbarui.' : 'Panti ditambahkan.');
    tutupForm();
    await loadPanti();
  } catch (err) {
    showAlert('error', 'Gagal menyimpan: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = id ? 'Perbarui' : 'Simpan';
  }
}

window.editPanti = editPanti;
window.hapusPanti = hapusPanti;