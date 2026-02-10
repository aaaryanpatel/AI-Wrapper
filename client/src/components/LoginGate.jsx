import { useState } from "react";
import { api } from "../hooks/useApi";

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
      const { user } = await api.login({ email, name });
      onLogin(user);
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="card login-card">
      <h1>StudentMarket MVP</h1>
      <p>Campus-only marketplace for Sask Polytech students.</p>
      <form onSubmit={handleSubmit}>
        <label>
          College Email (@saskpolytech.ca)
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
          {isLoading ? "Signing in..." : "Enter marketplace"}
        </button>
      </form>
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
