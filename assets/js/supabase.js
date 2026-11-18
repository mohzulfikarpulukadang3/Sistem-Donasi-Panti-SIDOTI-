window.api = {
  async get(endpoint) {
    const res = await fetch(`${window.SIDOTI_CONFIG.API_BASE_URL}${endpoint}`, {
      credentials: 'same-origin'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan pada server');
    return data;
  },

  async post(endpoint, body = {}) {
    const res = await fetch(`${window.SIDOTI_CONFIG.API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan pada server');
    return data;
  },

  async upload(endpoint, formData) {
    const res = await fetch(`${window.SIDOTI_CONFIG.API_BASE_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'same-origin',
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal mengunggah file');
    return data;
  }
};