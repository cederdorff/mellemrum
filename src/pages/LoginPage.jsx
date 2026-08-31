import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { supabase } from "../lib/supabase";

import "./LoginPage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // LOG IND
  async function handleLogin(event) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login-fejl:", error);

      setMessage("E-mail eller adgangskode er forkert.");

      setLoading(false);
      return;
    }

    setLoading(false);

    // Send brugeren til profilen
    navigate("/profil");
  }

  // OPRET BRUGER
  async function handleSignUp() {
    setLoading(true);
    setMessage("");

    // Tjek at begge felter er udfyldt
    if (!email || !password) {
      setMessage("Indtast både e-mail og adgangskode.");

      setLoading(false);
      return;
    }

    // Minimumslængde på adgangskode
    if (password.length < 6) {
      setMessage("Adgangskoden skal være mindst 6 tegn.");

      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Fejl ved oprettelse:", error);

      setMessage(error.message);

      setLoading(false);
      return;
    }

    setLoading(false);

    // Hvis mailbekræftelse er slået fra i Supabase,
    // bliver brugeren automatisk logget ind.
    if (data.session) {
      navigate("/profil");
      return;
    }

    // Fallback hvis mailbekræftelse stadig er slået til
    setMessage(
      "Din bruger er oprettet. Tjek din e-mail for at bekræfte din konto.",
    );
  }

  return (
    <main className="login-page">
      <h1>Log ind</h1>

      <form onSubmit={handleLogin}>
        {/* E-MAIL */}
        <label>
          E-mail
          <input
            id="login-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        {/* ADGANGSKODE */}
        <label>
          Adgangskode
          <input
            id="login-password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            minLength="6"
            required
          />
        </label>

        {/* GLEMT ADGANGSKODE */}
        <Link className="forgot-password-link" to="/glemt-adgangskode">
          Glemt adgangskode?
        </Link>

        {/* LOG IND */}
        <button type="submit" disabled={loading}>
          {loading ? "Arbejder..." : "Log ind"}
        </button>

        {/* OPRET BRUGER */}
        <button type="button" onClick={handleSignUp} disabled={loading}>
          {loading ? "Arbejder..." : "Opret bruger"}
        </button>

        {/* BESKED */}
        {message && <p className="login-message">{message}</p>}
      </form>
    </main>
  );
}
