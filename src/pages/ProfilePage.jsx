import { useEffect, useState } from "react";
import { Link } from "react-router";

import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

import "./ProfilePage.css";

export default function ProfilePage() {
  const { user } = useAuth();

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Hent brugerens tilmeldinger
  useEffect(() => {
    async function getRegistrations() {
      if (!user) {
        return;
      }

      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("event_registrations")
        .select(
          `
          id,
          events (
            id,
            title,
            date,
            venueName
          )
        `,
        )
        .eq("user_id", user.id);

      if (error) {
        console.error("Fejl ved hentning af tilmeldinger:", error);
        setErrorMessage("Tilmeldingerne kunne ikke hentes.");
        setLoading(false);
        return;
      }

      setRegistrations(data || []);
      setLoading(false);
    }

    getRegistrations();
  }, [user]);

  // Afmeld et event
  async function unregister(registrationId) {
    const { error } = await supabase
      .from("event_registrations")
      .delete()
      .eq("id", registrationId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Fejl ved afmelding:", error);
      setErrorMessage("Der skete en fejl ved afmeldingen.");
      return;
    }

    // Fjern eventet fra siden med det samme
    setRegistrations((current) =>
      current.filter((registration) => registration.id !== registrationId),
    );
  }

  if (loading) {
    return (
      <main className="profile-page">
        <p>Indlæser dine tilmeldinger...</p>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <header className="profile-header">
        <p className="eyebrow dark">Min profil</p>
        <h1>Mine tilmeldinger</h1>

        {user && <p className="profile-email">Logget ind som {user.email}</p>}
      </header>

      {errorMessage && <p className="form-error">{errorMessage}</p>}

      {registrations.length === 0 ? (
        <section className="no-registrations">
          <h2>Du har ingen tilmeldinger endnu</h2>

          <p>Find et arrangement og tilmeld dig.</p>

          <Link to="/" className="profile-events-link">
            Se kommende events
          </Link>
        </section>
      ) : (
        <section className="profile-registrations">
          {registrations.map((registration) => {
            const event = registration.events;

            if (!event) {
              return null;
            }

            const eventDate = new Date(event.date);

            return (
              <article className="profile-event" key={registration.id}>
                <div>
                  <h2>{event.title}</h2>

                  <p>
                    {eventDate.toLocaleDateString("da-DK", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>

                  <p>{event.venueName}</p>
                </div>

                <div className="profile-event-actions">
                  <Link
                    to={`/events/${event.id}`}
                    className="profile-event-link"
                  >
                    Se event
                  </Link>

                  <button
                    type="button"
                    className="unregister-button"
                    onClick={() => unregister(registration.id)}
                  >
                    Afmeld
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
