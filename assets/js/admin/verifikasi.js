let semuaDonasi = [];

document.addEventListener('DOMContentLoaded', async () => {
  await initAdminPage(async () => {
    document.getElementById('filter-status').addEventListener('change', renderTabel);
    await loadDonasi();
  });
});

function showAlert(type, msg) {
  document.getElementById('alert-box').innerHTML = `<div class="alert alert-${type}">${escapeHtml(msg)}</div>`;
}

async function loadDonasi() {
  try {
    semuaDonasi = await loadDonasiFromDatabase();
    renderTabel();
  } catch (err) {
    console.error('[Verifikasi] Gagal memuat:', err);
    showAlert('error', 'Gagal memuat donasi: ' + err.message);
  }
}

function renderTabel() {
  const body = document.getElementById('verifikasi-body');
  const status = document.getElementById('filter-status').value;
  let list = semuaDonasi;
  
  if (status) list = list.filter(d => d.status_bayar === status);

  if (!list.length) {
    body.innerHTML = `<tr><td colspan="7"><div class="empty-state">
      <div class="emoji">✅</div><p>Tidak ada donasi dengan status ini.</p>
    </div></td></tr>`;
    return;
  }

  body.innerHTML = list.map(d => {
    const donatur = d.donatur || {};
    const namaDonatur = d.anonim ? 'Anonim' : (donatur.nama || '-');
    const panti = d.panti?.nama_panti || '-';
    const bayar = (d.pembayaran && d.pembayaran[0]) || null;
    
    const buktiCell = bayar && bayar.bukti && bayar.bukti.trim()
      ? `<button class="btn btn-ghost btn-sm" onclick="previewBukti('${escapeHtml(bayar.bukti)}')">Lihat</button>`
      : '<span class="muted">Belum</span>';

    let aksi;
    if (d.status_bayar === 'menunggu') {
      aksi = `
        <button class="btn btn-success btn-sm" onclick="verifikasi(${d.id}, 'berhasil')">Verifikasi</button>
        <button class="btn btn-danger btn-sm" onclick="verifikasi(${d.id}, 'gagal')">Tolak</button>`;
    } else {
      aksi = '<span class="muted">Sudah diproses</span>';
    }
    return `<tr>
      <td>${escapeHtml(namaDonatur)}<br><span class="muted" style="font-size:12px">${escapeHtml(donatur.email || '')}</span></td>
      <td>${formatTanggal(d.tanggal)}</td>
      <td>${escapeHtml(panti)}</td>
      <td><strong>${formatRupiah(d.nominal)}</strong></td>
      <td>${buktiCell}</td>
      <td><span class="badge ${statusBadgeClass(d.status_bayar)}">${d.status_bayar}</span></td>
      <td>${aksi}</td>
    </tr>`;
  }).join('');
}

async function verifikasi(donasiId, statusAkhir) {
  if (!confirm(`Yakin ingin menandai donasi ini sebagai "${statusAkhir}"?`)) return;
  try {
    await window.api.post('/admin.php?action=donasi_verifikasi', {
      id: donasiId,
      status_bayar: statusAkhir
    });

    showAlert('success', `Donasi #${donasiId} ditandai sebagai "${statusAkhir}".`);
    
    const idx = semuaDonasi.findIndex(d => Number(d.id) === Number(donasiId));
    if (idx >= 0) {
      semuaDonasi[idx].status_bayar = statusAkhir;
      if (semuaDonasi[idx].pembayaran[0]) {
        semuaDonasi[idx].pembayaran[0].status = statusAkhir === 'berhasil' ? 'verified' : 'rejected';
      }
    }
    renderTabel();
  } catch (err) {
    console.error('[Verifikasi] CATCH ERROR:', err);
    showAlert('error', 'Gagal memperbarui status: ' + err.message);
  }
}

window.verifikasi = verifikasi;

let currentBuktiUrl = null;

function previewBukti(url) {
  const modal = document.getElementById('modal-bukti');
  const filename = document.getElementById('modal-bukti-filename');
  const urlObj = new URL(url, window.location.origin);
  const parts = urlObj.pathname.split('/');
  const name = parts[parts.length - 1] || 'bukti_transfer';
  
  filename.textContent = decodeURIComponent(name);
  currentBuktiUrl = url;
  modal.style.display = 'flex';
  
  modal.onclick = (e) => {
    if (e.target === modal) modal.style.display = 'none';
  };
}

function downloadBukti() {
  if (!currentBuktiUrl) {
    alert('URL file tidak ditemukan');
    return;
  }
  const link = document.createElement('a');
  link.href = currentBuktiUrl;
  link.download = 'bukti_transfer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

window.previewBukti = previewBukti;
window.downloadBukti = downloadBukti;