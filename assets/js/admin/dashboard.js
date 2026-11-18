document.addEventListener('DOMContentLoaded', async () => {
  try {
    const user = await requireAdmin();
    if (!user) return;
    
    await renderNavbar();
    
    const welcomeEl = document.getElementById('welcome');
    if (welcomeEl) {
      welcomeEl.textContent = 'Halo, ' + (user.nama || user.email || 'Admin');
    }
    
    const btnLogout = document.getElementById('btn-logout-sidebar');
    if (btnLogout) {
      btnLogout.onclick = () => logout();
    }
    
    await loadStats();
    await loadRecent();
  } catch (err) {
    console.error('[Dashboard Error]', err);
  }
});

// ... (fungsi loadStats, loadRecent, handleDashboardFilter, dan filterAndRenderRecent tetap sama persis seperti kode Anda sebelumnya)