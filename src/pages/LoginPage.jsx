import { useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../lib/supabase";
import "./LoginPage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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
    navigate("/profil");
  }

  async function handleSignUp() {
    setLoading(true);
    setMessage("");

    if (!email || !password) {
      setMessage("Indtast både e-mail og adgangskode.");
      setLoading(false);
      return;
    }

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

    if (data.session) {
      setMessage("Din bruger er oprettet!");
      navigate("/profil");
    } else {
      setMessage(
        "Din bruger er oprettet. Tjek din e-mail for at bekræfte din konto.",
      );
    }
  }

  return (
    <main className="login-page">
      <h1>Log ind</h1>

      <form onSubmit={handleLogin}>
        <label>
          E-mail
          <input
            id="login-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label>
          Adgangskode
          <input
            id="login-password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Arbejder..." : "Log ind"}
        </button>

        <button type="button" onClick={handleSignUp} disabled={loading}>
          Opret bruger
        </button>

        {message && <p className="login-message">{message}</p>}
      </form>
    </main>
  );
}
