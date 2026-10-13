const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://reciperoot-backend.onrender.com"
).replace(/\/+$/, "");

async function request(path, options = {}) {
  const token = localStorage.getItem("reciperoot_token");

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const data = await response.json();
      message = data.message || data.error || message;
    } catch {
      // Keep the fallback error message.
    }

    throw new Error(message);
  }

  if (response.status === 204) return null;

  if (response.status === 205) return null;

  const contentType = response.headers.get("content-type") || "";

  return contentType.includes("application/json")
    ? response.json()
    : response.text();
}

export const featureApi = {
  register: (data) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () =>
    request("/api/auth/logout", {
      method: "POST",
    }),

  me: () => request("/api/auth/me"),

  getWeek: (startDate) =>
    request(
      `/api/meal-plans/week?startDate=${encodeURIComponent(startDate)}`
    ),

  addMeal: (data) =>
    request("/api/meal-plans", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  removeMeal: (id) =>
    request(`/api/meal-plans/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),

  getReviews: (recipeId) =>
    request(`/api/reviews/recipe/${encodeURIComponent(recipeId)}`),

  submitReview: (data) =>
    request("/api/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  adminDashboard: () =>
    request("/api/admin/dashboard"),

  adminUsers: () =>
    request("/api/admin/users"),

  deleteAdminUser: (id) =>
    request(`/api/admin/users/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),

  deleteAdminReview: (id) =>
    request(`/api/admin/reviews/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),

  deleteAdminRecipe: (id) =>
    request(`/api/admin/recipes/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
};