import { useEffect, useState } from "react";
import { featureApi } from "./api";

export default function RecipeReviews({ recipeId, user }) {
  const [data, setData] = useState({
    averageRating: 0,
    count: 0,
    reviews: [],
  });

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  async function loadReviews() {
    try {
      setData(await featureApi.getReviews(recipeId));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    if (recipeId != null) {
      loadReviews();
    }
  }, [recipeId]);

  async function submitReview(event) {
    event.preventDefault();
    setError("");

    try {
      await featureApi.submitReview({
        recipeId: Number(recipeId),
        rating: Number(rating),
        comment,
      });

      setComment("");
      await loadReviews();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="rr-feature-panel">
      <h3>Ratings & Reviews</h3>

      <p>
        <strong>
          {Number(data.averageRating).toFixed(1)} / 5
        </strong>{" "}
        · {data.count} review(s)
      </p>

      {user ? (
        <form
          className="rr-feature-form"
          onSubmit={submitReview}
        >
          <label>
            Rating
            <select
              value={rating}
              onChange={(event) => setRating(event.target.value)}
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {"★".repeat(value)} ({value}/5)
                </option>
              ))}
            </select>
          </label>

          <label>
            Your review
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Share your experience with this recipe"
              maxLength={1200}
            />
          </label>

          <button type="submit">Submit review</button>
        </form>
      ) : (
        <p>Log in to rate and review this recipe.</p>
      )}

      {error && (
        <p className="rr-error" role="alert">
          {error}
        </p>
      )}

      <div className="rr-review-list">
        {data.reviews.map((review) => (
          <article key={review.id}>
            <strong>
              {review.userName || "User"} ·
              {" "}
              {"★".repeat(review.rating)}
              {"☆".repeat(5 - review.rating)}
            </strong>

            <p>{review.comment}</p>

            <small>
              {review.createdAt
                ? new Date(review.createdAt).toLocaleDateString()
                : ""}
            </small>
          </article>
        ))}

        {data.reviews.length === 0 && (
          <p>No reviews yet. Be the first to review!</p>
        )}
      </div>
    </section>
  );
}