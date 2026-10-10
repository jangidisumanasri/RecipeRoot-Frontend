const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
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

  return response.json();
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
    request("/api/auth/logout", { method: "POST" }),

  me: () => request("/api/auth/me"),

  getWeek: (startDate) =>
    request(`/api/meal-plans/week?startDate=${startDate}`),

  addMeal: (data) =>
    request("/api/meal-plans", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  removeMeal: (id) =>
    request(`/api/meal-plans/${id}`, { method: "DELETE" }),

  getReviews: (recipeId) =>
    request(`/api/reviews/recipe/${recipeId}`),

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
    request(`/api/admin/users/${id}`, { method: "DELETE" }),

  deleteAdminReview: (id) =>
    request(`/api/admin/reviews/${id}`, { method: "DELETE" }),

  deleteAdminRecipe: (id) =>
    request(`/api/admin/recipes/${id}`, { method: "DELETE" }),
};