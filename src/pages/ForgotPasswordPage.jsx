import { useState } from "react";
import { Link } from "react-router";

import { supabase } from "../lib/supabase";

import "./LoginPage.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(event) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    // Virker både lokalt og med /mellemrum/ på GitHub Pages
    const redirectUrl = new URL(
      `${import.meta.env.BASE_URL}nulstil-adgangskode`,
      window.location.origin,
    ).toString();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      console.error("Fejl ved nulstilling:", error);
      setErrorMessage("Der skete en fejl. Kontroller e-mailen og prøv igen.");
      setLoading(false);
      return;
    }

    setMessage(
      "Vi har sendt dig en mail med et link til at ændre din adgangskode.",
    );

    setLoading(false);
  }

  return (
    <main className="login-page">
      <h1>Glemt adgangskode?</h1>

      <form onSubmit={handleReset}>
        <label>
          E-mail
          <input
            id="reset-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="din@email.dk"
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Sender..." : "Send reset-link"}
        </button>

        {message && <p className="login-message">{message}</p>}

        {errorMessage && <p className="form-error">{errorMessage}</p>}

        <Link to="/login">← Tilbage til login</Link>
      </form>
    </main>
  );
}
