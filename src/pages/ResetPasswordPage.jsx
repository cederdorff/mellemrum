import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import { supabase } from "../lib/supabase";

import "./LoginPage.css";

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Når brugeren kommer tilbage fra reset-linket,
    // opretter Supabase en recovery-session.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // Hvis recovery-sessionen allerede er oprettet,
    // når siden mountes
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleNewPassword(event) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");

    if (password.length < 6) {
      setErrorMessage("Adgangskoden skal være mindst 6 tegn.");
      return;
    }

    if (password !== repeatPassword) {
      setErrorMessage("De to adgangskoder er ikke ens.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.error("Fejl ved ændring af adgangskode:", error);

      setErrorMessage(
        "Adgangskoden kunne ikke ændres. Prøv at åbne reset-linket igen.",
      );

      setLoading(false);
      return;
    }

    setMessage("Din adgangskode er blevet ændret.");
    setPassword("");
    setRepeatPassword("");
    setLoading(false);

    setTimeout(() => {
      navigate("/profil");
    }, 1500);
  }

  return (
    <main className="login-page">
      <h1>Ny adgangskode</h1>

      {!ready ? (
        <div>
          <p>Kontrollerer dit reset-link...</p>

          <Link to="/glemt-adgangskode">Send et nyt reset-link</Link>
        </div>
      ) : (
        <form onSubmit={handleNewPassword}>
          <label>
            Ny adgangskode
            <input
              id="new-password"
              name="new-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <label>
            Gentag adgangskode
            <input
              id="repeat-password"
              name="repeat-password"
              type="password"
              value={repeatPassword}
              onChange={(event) => setRepeatPassword(event.target.value)}
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Gemmer..." : "Gem ny adgangskode"}
          </button>

          {message && <p className="login-message">{message}</p>}

          {errorMessage && <p className="form-error">{errorMessage}</p>}
        </form>
      )}
    </main>
  );
}
