document.addEventListener('DOMContentLoaded', async () => {
  await renderNavbar();

  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  
  tabLogin.addEventListener('click', () => setTab('login'));
  tabRegister.addEventListener('click', () => setTab('register'));
  
  document.getElementById('switch-tab').addEventListener('click', (e) => {
    e.preventDefault();
    const isLogin = document.getElementById('form-login').style.display !== 'none';
    setTab(isLogin ? 'register' : 'login');
  });

  formLogin.addEventListener('submit', onLogin);
  formRegister.addEventListener('submit', onRegister);
  
  const btnGoogle = document.getElementById('btn-google');
  if (btnGoogle) {
    btnGoogle.addEventListener('click', () => {
      showAlert('info', 'Login Google OAuth hanya tersedia saat menggunakan Supabase. Silakan masuk dengan Email & Password.');
    });
  }
  
  document.getElementById('toggle-password').addEventListener('click', (e) => {
    e.preventDefault();
    const input = document.getElementById('login-password');
    input.type = input.type === 'password' ? 'text' : 'password';
  });
});

function setTab(which) {
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const switchTab = document.getElementById('switch-tab');
  const switchText = document.getElementById('switch-text');
  const isLogin = which === 'login';
  
  tabLogin.style.background = isLogin ? 'var(--surface)' : 'transparent';
  tabLogin.style.color = isLogin ? 'var(--primary)' : 'var(--slate)';
  tabLogin.style.boxShadow = isLogin ? '0 1px 3px rgba(0, 0, 0, 0.05)' : 'none';
  
  tabRegister.style.background = !isLogin ? 'var(--surface)' : 'transparent';
  tabRegister.style.color = !isLogin ? 'var(--primary)' : 'var(--slate)';
  tabRegister.style.boxShadow = !isLogin ? '0 1px 3px rgba(0, 0, 0, 0.05)' : 'none';
  
  formLogin.style.display = isLogin ? 'block' : 'none';
  formRegister.style.display = isLogin ? 'none' : 'block';
  
  switchText.textContent = isLogin ? 'Belum punya akun?' : 'Sudah punya akun?';
  switchTab.textContent = isLogin ? 'Daftar sekarang' : 'Masuk di sini';
  clearAlert();
}

function showAlert(type, msg) {
  document.getElementById('alert-box').innerHTML = `<div class="alert alert-${type}">${escapeHtml(msg)}</div>`;
}
function clearAlert() {
  document.getElementById('alert-box').innerHTML = '';
}

function redirectAfterAuth() {
  const params = new URLSearchParams(window.location.search);
  const target = params.get('redirect');
  window.location.href = target || '/riwayat.html';
}

async function onLogin(e) {
  e.preventDefault();
  clearAlert();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const btn = document.getElementById('btn-login');
  btn.disabled = true;
  btn.textContent = 'Memproses...';
  try {
    await window.api.post('/auth.php?action=login', { email, password });
    redirectAfterAuth();
  } catch (err) {
    showAlert('error', 'Login gagal: ' + err.message);
    btn.disabled = false;
    btn.textContent = 'Masuk';
  }
}

async function onRegister(e) {
  e.preventDefault();
  clearAlert();
  const nama = document.getElementById('reg-nama').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const btn = document.getElementById('btn-register');
  btn.disabled = true;
  btn.textContent = 'Memproses...';
  try {
    await window.api.post('/auth.php?action=register', { nama, email, password });
    redirectAfterAuth();
  } catch (err) {
    showAlert('error', 'Pendaftaran gagal: ' + err.message);
    btn.disabled = false;
    btn.textContent = 'Daftar';
  }
}