async function loadDonasiFromDatabase() {
  try {
    return await window.api.get('/admin.php?action=donasi_list');
  } catch (err) {
    console.error('[SharedDonasi] Error loading donasi:', err);
    throw err;
  }
}
window.loadDonasiFromDatabase = loadDonasiFromDatabase;