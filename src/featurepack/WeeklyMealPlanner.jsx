import { useEffect, useState } from "react";
import { featureApi } from "./api";

const MEALS = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

export default function WeeklyMealPlanner({ recipes = [] }) {
  const [weekStart, setWeekStart] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const [plans, setPlans] = useState([]);
  const [recipeId, setRecipeId] = useState("");
  const [planDate, setPlanDate] = useState(formatDate(new Date()));
  const [mealType, setMealType] = useState("BREAKFAST");
  const [error, setError] = useState("");

  async function loadPlans() {
    try {
      setPlans(await featureApi.getWeek(formatDate(weekStart)));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadPlans();
  }, [weekStart]);

  async function addMeal(event) {
    event.preventDefault();

    try {
      await featureApi.addMeal({
        recipeId: Number(recipeId),
        planDate,
        mealType,
      });

      await loadPlans();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeMeal(id) {
    try {
      await featureApi.removeMeal(id);
      await loadPlans();
    } catch (err) {
      setError(err.message);
    }
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
        <button
          onClick={() =>
            setWeekStart((current) => {
              const next = new Date(current);
              next.setDate(next.getDate() - 7);
              return next;
            })
          }
        >
          ← Previous
        </button>

        <strong>Week of {formatDate(weekStart)}</strong>

        <button
          onClick={() =>
            setWeekStart((current) => {
              const next = new Date(current);
              next.setDate(next.getDate() + 7);
              return next;
            })
          }
        >
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

        <button type="submit">Add meal</button>
      </form>

      {error && <p className="rr-error">{error}</p>}

      <div className="rr-week-grid">
        {days.map((day) => {
          const dateKey = formatDate(day);

          return (
            <article className="rr-day-card" key={dateKey}>
              <h3>
                {day.toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </h3>

              {MEALS.map((meal) => (
                <div className="rr-meal-slot" key={meal}>
                  <strong>{meal}</strong>

                  {plans
                    .filter(
                      (plan) =>
                        plan.planDate === dateKey &&
                        plan.mealType === meal
                    )
                    .map((plan) => (
                      <div
                        className="rr-planned-item"
                        key={plan.id}
                      >
                        <span>{recipeName(plan.recipeId)}</span>
                        <button
                          type="button"
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
    </section>
  );
}