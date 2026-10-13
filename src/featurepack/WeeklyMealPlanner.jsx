import { useEffect, useState } from "react";
import { featureApi } from "./api";

const MEALS = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

// Format dates using local calendar values instead of UTC.
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Parse YYYY-MM-DD as a local date to avoid timezone shifts.
function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

function getMonday(date = new Date()) {
  const monday = new Date(date);
  monday.setHours(12, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

export default function WeeklyMealPlanner({ recipes = [] }) {
  const [weekStart, setWeekStart] = useState(() => getMonday());

  const [plans, setPlans] = useState([]);
  const [recipeId, setRecipeId] = useState("");
  const [planDate, setPlanDate] = useState(() => formatDate(new Date()));
  const [mealType, setMealType] = useState("BREAKFAST");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadPlans() {
    setLoading(true);

    try {
      const result = await featureApi.getWeek(formatDate(weekStart));

      setPlans(Array.isArray(result) ? result : []);
      setError("");
    } catch (err) {
      setError(err?.message || "Unable to load meal plans.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlans();
    // loadPlans is intentionally called when the displayed week changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  async function addMeal(event) {
    event.preventDefault();

    if (!recipeId || !planDate || !mealType) {
      setError("Please select a recipe, date, and meal type.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await featureApi.addMeal({
        recipeId: Number(recipeId),
        // Keep the selected YYYY-MM-DD value unchanged.
        planDate,
        mealType,
      });

      setRecipeId("");
      setMessage("Meal added successfully!");

      // Refresh the week containing the selected date.
      const selectedDate = parseLocalDate(planDate);
      const selectedMonday = getMonday(selectedDate);

      if (formatDate(selectedMonday) !== formatDate(weekStart)) {
        setWeekStart(selectedMonday);
      } else {
        await loadPlans();
      }
    } catch (err) {
      setError(err?.message || "Unable to add the meal.");
    } finally {
      setSaving(false);
    }
  }

  async function removeMeal(id) {
    setError("");
    setMessage("");

    try {
      await featureApi.removeMeal(id);
      setMessage("Meal removed successfully!");
      await loadPlans();
    } catch (err) {
      setError(err?.message || "Unable to remove the meal.");
    }
  }

  function changeWeek(amount) {
    setWeekStart((current) => {
      const next = new Date(current);
      next.setDate(next.getDate() + amount * 7);
      return next;
    });
  }

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    return date;
  });

  function recipeName(id) {
    const recipe = recipes.find(
      (item) => Number(item.id) === Number(id)
    );

    return recipe?.name || recipe?.title || `Recipe #${id}`;
  }

  return (
    <section className="rr-feature-panel">
      <h2>Weekly Meal Planner</h2>

      <div className="rr-week-controls">
        <button type="button" onClick={() => changeWeek(-1)}>
          ← Previous
        </button>

        <strong>Week of {formatDate(weekStart)}</strong>

        <button type="button" onClick={() => changeWeek(1)}>
          Next →
        </button>
      </div>

      <form className="rr-feature-form rr-planner-form" onSubmit={addMeal}>
        <label>
          Recipe
          <select
            value={recipeId}
            onChange={(event) => setRecipeId(event.target.value)}
            required
          >
            <option value="">Choose a recipe</option>

            {recipes.map((recipe) => (
              <option key={recipe.id} value={recipe.id}>
                {recipe.name || recipe.title}
              </option>
            ))}
          </select>
        </label>

        <label>
          Date
          <input
            type="date"
            value={planDate}
            onChange={(event) => setPlanDate(event.target.value)}
            required
          />
        </label>

        <label>
          Meal
          <select
            value={mealType}
            onChange={(event) => setMealType(event.target.value)}
          >
            {MEALS.map((meal) => (
              <option key={meal} value={meal}>
                {meal}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" disabled={saving}>
          {saving ? "Adding..." : "Add meal"}
        </button>
      </form>

      {error && <p className="rr-error">{error}</p>}
      {message && <p role="status">{message}</p>}

      {loading ? (
        <p>Loading meal plans...</p>
      ) : (
        <div className="rr-week-grid">
          {days.map((day) => {
            const dateKey = formatDate(day);
            const isToday = dateKey === formatDate(new Date());

            return (
              <article
                className={`rr-day-card${isToday ? " rr-today" : ""}`}
                key={dateKey}
              >
                <h3>
                  {day.toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                  {isToday && " · Today"}
                </h3>

                {MEALS.map((meal) => (
                  <div className="rr-meal-slot" key={meal}>
                    <strong>{meal}</strong>

                    {plans
                      .filter(
                        (plan) =>
                          String(plan.planDate).slice(0, 10) === dateKey &&
                          String(plan.mealType).toUpperCase() === meal
                      )
                      .map((plan) => (
                        <div className="rr-planned-item" key={plan.id}>
                          <span>{recipeName(plan.recipeId)}</span>

                          <button
                            type="button"
                            aria-label={`Remove ${recipeName(plan.recipeId)}`}
                            onClick={() => removeMeal(plan.id)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                  </div>
                ))}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}