import { useState } from "react";
import { featureApi } from "./api";

export default function AuthPanel({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function updateForm(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      if (mode === "register") {
        await featureApi.register(form);
      }

      const user = await featureApi.login({
        email: form.email,
        password: form.password,
      });
      console.log("Login response:", user);
      localStorage.setItem("reciperoot_token", user.token);
      console.log(
          "Token saved:",
          Boolean(localStorage.getItem("reciperoot_token"))
        );
    onAuthenticated?.(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rr-feature-panel">
      <h2>
        {mode === "login"
          ? "Welcome back"
          : "Create your RecipeRoot account"}
      </h2>

      <form
        className="rr-feature-form"
        onSubmit={handleSubmit}
      >
        {mode === "register" && (
          <input
            name="name"
            placeholder="Full name"
            value={form.name}
            onChange={updateForm}
            maxLength={100}
            required
          />
        )}

        <input
          name="email"
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={updateForm}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password (minimum 8 characters)"
          value={form.password}
          onChange={updateForm}
          minLength={8}
          required
        />

        {error && (
          <p className="rr-error" role="alert">
            {error}
          </p>
        )}

        <button disabled={busy}>
          {busy
            ? "Please wait..."
            : mode === "login"
              ? "Log in"
              : "Register"}
        </button>
      </form>

      <button
        type="button"
        className="rr-link-button"
        onClick={() => {
          setMode(mode === "login" ? "register" : "login");
          setError("");
        }}
      >
        {mode === "login"
          ? "Need an account? Register"
          : "Already registered? Log in"}
      </button>
    </section>
  );
}