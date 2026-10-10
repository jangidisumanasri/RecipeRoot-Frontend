const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
).replace(/\/$/, '')

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    const message = await response.text().catch(() => '')
    throw new Error(message || `Request failed (${response.status})`)
  }

  if (response.status === 204) return null

  const type = response.headers.get('content-type') || ''

  return type.includes('application/json')
    ? response.json()
    : response.text()
}

export const recipeApi = {
  getAll: () => request('/api/recipes'),

  getById: (id) =>
    request(`/api/recipes/${encodeURIComponent(id)}`),

  search: (query) =>
    request(`/api/recipes?search=${encodeURIComponent(query)}`),

  create: (recipe) =>
    request('/api/recipes', {
      method: 'POST',
      body: JSON.stringify(recipe),
    }),

  update: (id, recipe) =>
    request(`/api/recipes/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(recipe),
    }),

  remove: (id) =>
    request(`/api/recipes/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
}

export { API_BASE }