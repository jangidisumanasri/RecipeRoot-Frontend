
const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
).replace(/\/+$/, '');

async function request(path, options = {}) {
  const token = localStorage.getItem('reciperoot_token');

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    let errorMessage = message || `Request failed (${response.status})`;

    try {
      const parsed = JSON.parse(message);
      errorMessage = parsed.message || errorMessage;
    } catch {
      // Keep the original message if the response isn't JSON.
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) return null;

  const type = response.headers.get('content-type') || '';

  return type.includes('application/json')
    ? response.json()
    : response.text();
}

// Existing recipe APIs
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
};

// Registration, login, and logout
export const authApi = {
  register: (data) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    request('/api/auth/logout', {
      method: 'POST',
    }),
};

// Weekly meal planner APIs
export const mealPlanApi = {
  getWeek: (startDate) => {
    const query = startDate
      ? `?start=${encodeURIComponent(startDate)}`
      : '';

    return request(`/api/meal-plans/week${query}`);
  },

  add: (meal) =>
    request('/api/meal-plans', {
      method: 'POST',
      body: JSON.stringify({
        recipeId: Number(meal.recipeId),
        planDate: meal.planDate,
        mealType: meal.mealType,
      }),
    }),

  remove: (id) =>
    request(`/api/meal-plans/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
};

// Ratings and reviews APIs
export const reviewApi = {
  getByRecipe: (recipeId) =>
    request(
      `/api/recipes/${encodeURIComponent(recipeId)}/reviews`
    ),

  submit: (recipeId, review) =>
    request(
      `/api/recipes/${encodeURIComponent(recipeId)}/reviews`,
      {
        method: 'POST',
        body: JSON.stringify({
          rating: Number(review.rating),
          comment: review.comment || '',
        }),
      }
    ),
};

// Admin dashboard APIs
export const adminApi = {
  getDashboard: () =>
    request('/api/admin/dashboard'),

  getUsers: () =>
    request('/api/admin/users'),

  deleteRecipe: (id) =>
    request(`/api/admin/recipes/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  deleteReview: (id) =>
    request(`/api/admin/reviews/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
};

// Authentication helpers
export function getToken() {
  return localStorage.getItem('reciperoot_token');
}

export function getCurrentUser() {
  try {
    return JSON.parse(
      localStorage.getItem('reciperoot_user')
    );
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function isAdmin() {
  return getCurrentUser()?.role === 'ADMIN';
}

export { API_BASE };
