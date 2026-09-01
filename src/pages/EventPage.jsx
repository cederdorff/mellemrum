import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

import "./EventPage.css";

export default function EventPage() {
  const { eventId } = useParams();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);

  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // HENT DET VALGTE EVENT
  useEffect(() => {
    async function getEvent() {
      setLoading(true);

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (error) {
        console.error("Kunne ikke hente event:", error);
        setLoading(false);
        return;
      }

      setEvent(data);
      setLoading(false);
    }

    getEvent();
  }, [eventId]);

  // SKIFT TITEL I BROWSERFANEN
  useEffect(() => {
    if (event) {
      document.title = `${event.title} | Mellemrum`;
    }
  }, [event]);

  // TJEK OM BRUGEREN ALLEREDE ER TILMELDT
  useEffect(() => {
    async function checkRegistration() {
      if (!user || !eventId) {
        setIsRegistered(false);
        return;
      }

      const { data, error } = await supabase
        .from("event_registrations")
        .select("id")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Kunne ikke kontrollere tilmelding:", error);
        return;
      }

      setIsRegistered(Boolean(data));
    }

    checkRegistration();
  }, [user, eventId]);

  // TILMELD BRUGEREN
  async function handleRegistration() {
    if (!user) {
      return;
    }

    setRegistering(true);
    setSubmitError("");

    const { error } = await supabase.from("event_registrations").insert({
      event_id: event.id,
      user_id: user.id,
    });

    if (error) {
      console.error("Fejl ved tilmelding:", error);

      setSubmitError("Der skete en fejl ved tilmeldingen. Prøv venligst igen.");

      setRegistering(false);
      return;
    }

    setIsRegistered(true);
    setSubmitted(true);
    setRegistering(false);
  }

  // LOADING
  if (loading) {
    return (
      <main className="event-page">
        <p>Indlæser event...</p>
      </main>
    );
  }

  // EVENT FINDES IKKE
  if (!event) {
    return (
      <main className="event-page">
        <p>Eventet kunne ikke findes.</p>

        <Link className="back-link" to="/">
          ← Tilbage til alle events
        </Link>
      </main>
    );
  }

  const date = new Date(event.date);

  return (
    <main className="event-page">
      <Link className="back-link" to="/">
        ← Alle events
      </Link>

      {/* EVENT INFORMATION */}
      <section className="event-detail">
        <img src={event.image} alt={event.title} />

        <div className="event-detail-content">
          {event.category && <p className="event-category">{event.category}</p>}

          <h1>{event.title}</h1>

          {user && event.created_by === user.id && (
            <Link
              className="edit-event-link"
              to={`/events/${event.id}/rediger`}
            >
              Rediger event
            </Link>
          )}

          {event.summary && <p className="lead">{event.summary}</p>}

          <div className="detail-list">
            {/* DATO */}
            <p>
              <strong>Dato</strong>

              <span>
                {date.toLocaleDateString("da-DK", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}{" "}
                kl.{" "}
                {date.toLocaleTimeString("da-DK", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>

            {/* STED */}
            <p>
              <strong>Sted</strong>

              <span>
                {event.venueName}

                {(event.venueAddress ||
                  event.venuePostalCode ||
                  event.venueCity) && (
                  <>
                    <br />

                    {event.venueAddress}

                    {event.venueAddress && event.venuePostalCode && ", "}

                    {event.venuePostalCode}

                    {event.venuePostalCode && event.venueCity && " "}

                    {event.venueCity}
                  </>
                )}

                {event.venueWebsite && (
                  <>
                    <br />

                    <a
                      href={event.venueWebsite}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Besøg venue
                    </a>
                  </>
                )}
              </span>
            </p>

            {/* PRIS */}
            <p>
              <strong>Pris</strong>

              <span>
                {Number(event.price) === 0 ? "Gratis" : `${event.price} kr.`}
              </span>
            </p>
          </div>

          {event.description && <p>{event.description}</p>}
        </div>
      </section>

      {/* TILMELDING */}
      <section className="signup-panel">
        {/* BRUGEREN HAR NETOP TILMELDT SIG */}
        {submitted ? (
          <div className="signup-success">
            <p className="eyebrow dark">Tilmeldt</p>

            <h2>Tak for din tilmelding!</h2>

            <p>Du er nu tilmeldt {event.title}.</p>

            <Link className="signup-success-link" to="/profil">
              Se mine tilmeldinger
            </Link>
          </div>
        ) : !user ? (
          /* IKKE LOGGET IND */
          <>
            <div>
              <p className="eyebrow dark">Tilmelding</p>

              <h2>Vil du med?</h2>

              <p>
                Log ind eller opret en bruger for at tilmelde dig arrangementet.
              </p>
            </div>

            <div className="signup-login">
              <Link className="signup-login-button" to="/login">
                Log ind for at tilmelde dig
              </Link>
            </div>
          </>
        ) : isRegistered ? (
          /* ALLEREDE TILMELDT */
          <div className="signup-success">
            <p className="eyebrow dark">Tilmeldt</p>

            <h2>Du er allerede tilmeldt</h2>

            <p>Dette arrangement ligger allerede under dine tilmeldinger.</p>

            <Link className="signup-success-link" to="/profil">
              Se mine tilmeldinger
            </Link>
          </div>
        ) : (
          /* LOGGET IND OG IKKE TILMELDT */
          <>
            <div>
              <p className="eyebrow dark">Tilmelding</p>

              <h2>Reserver din plads</h2>

              <p>
                Du er logget ind og kan tilmelde dig arrangementet med ét klik.
              </p>
            </div>

            <div className="signup-action">
              <button
                type="button"
                onClick={handleRegistration}
                disabled={registering}
              >
                {registering ? "Tilmelder..." : "Tilmeld mig"}
              </button>

              {submitError && <p className="form-error">{submitError}</p>}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
