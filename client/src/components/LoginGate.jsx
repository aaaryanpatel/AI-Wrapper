import { useState } from "react";
import { api, setAuthToken } from "../hooks/useApi";

export default function LoginGate({ onLogin }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { user, token } = await api.login({ email, name });
      setAuthToken(token);
      onLogin(user);
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="login-shell">
      <div className="glass card login-card">
        <p className="eyebrow">STUDENT ONLY MARKETPLACE</p>
        <h1>StudentMarket</h1>
        <p>Buy, sell and message students from your campus community.</p>

        <form className="grid-form" onSubmit={handleSubmit}>
          <label>
            College Email
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@saskpolytech.ca"
            />
          </label>

          <label>
            Display Name
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Optional"
            />
          </label>

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Entering..." : "Enter StudentMarket"}
          </button>
        </form>

        <small className="muted">Only @saskpolytech.ca accounts are allowed in v1.</small>
        {error ? <p className="error">{error}</p> : null}
      </div>
    </section>
  );
}
