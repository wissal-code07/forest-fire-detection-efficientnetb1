const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.error || 'Erreur API');
  return data;
}

export const api = {
  // POST /api/predict/
  predict: async (imageFile, meta = {}) => {
    const form = new FormData();
    form.append('image', imageFile);
    if (meta.wilaya)        form.append('wilaya', meta.wilaya);
    if (meta.location_note) form.append('location_note', meta.location_note);
    if (meta.notes)         form.append('notes', meta.notes);

    const res = await fetch(`${BASE_URL}/predict/`, { method: 'POST', body: form });
    return handleResponse(res);
  },

  // GET /api/history/
  history: async (params = {}) => {
    const q = new URLSearchParams();
    if (params.page)   q.set('page',   params.page);
    if (params.limit)  q.set('limit',  params.limit);
    if (params.label)  q.set('label',  params.label);
    if (params.wilaya) q.set('wilaya', params.wilaya);
    if (params.alert !== undefined) q.set('alert', params.alert);

    const res = await fetch(`${BASE_URL}/history/?${q}`);
    return handleResponse(res);
  },

  // GET /api/history/:id/
  predictionDetail: async (id) => {
    const res = await fetch(`${BASE_URL}/history/${id}/`);
    return handleResponse(res);
  },

  // DELETE /api/history/:id/
  deletePrediction: async (id) => {
    const res = await fetch(`${BASE_URL}/history/${id}/`, { method: 'DELETE' });
    if (res.status === 204) return true;
    return handleResponse(res);
  },

  // GET /api/stats/
  stats: async () => {
    const res = await fetch(`${BASE_URL}/stats/`);
    return handleResponse(res);
  },

  // GET /api/health/
  health: async () => {
    const res = await fetch(`${BASE_URL}/health/`);
    return handleResponse(res);
  },
};
