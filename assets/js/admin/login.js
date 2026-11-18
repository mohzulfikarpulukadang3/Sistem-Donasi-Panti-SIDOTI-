// =====================================================
// SIDOTI - Login Admin (assets/js/admin/login.js)
// =====================================================
document.addEventListener('DOMContentLoaded', async () => {
  await renderNavbar();

  document.getElementById('form-admin-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const btn = document.getElementById('btn-login');
    btn.disabled = true; btn.textContent = 'Memproses...';

    try {
      await window.api.post('/auth.php?action=login_admin', { email, password });
      window.location.href = '/admin/index.html';
    } catch (err) {
      showAlert('error', 'Login gagal: ' + err.message);
    } finally {
      btn.disabled = false; btn.textContent = 'Masuk';
    }
  });
});

function showAlert(type, msg) {
  document.getElementById('alert-box').innerHTML = `<div class="alert alert-${type}">${escapeHtml(msg)}</div>`;
}
function clearAlert() {
  document.getElementById('alert-box').innerHTML = '';
}