import { useEffect, useState } from "react";
import { Link } from "react-router";

import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

import "./RegistrationsPage.css";

export default function RegistrationsPage() {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function getData() {
      setLoading(true);
      setErrorMessage("");

      // HENT ALLE EVENTS
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select(
          `
          id,
          title,
          date,
          venueName,
          capacity
        `,
        )
        .order("date", { ascending: true });

      if (eventError) {
        console.error("Fejl ved hentning af events:", eventError);
        setErrorMessage("Arrangementerne kunne ikke hentes.");
        setLoading(false);
        return;
      }

      // HENT ANTAL TILMELDTE TIL HVERT EVENT
      const { data: countData, error: countError } = await supabase.rpc(
        "get_event_registration_counts",
      );

      if (countError) {
        console.error("Fejl ved hentning af antal tilmeldte:", countError);

        setErrorMessage("Antallet af tilmeldinger kunne ikke hentes.");

        setLoading(false);
        return;
      }

      // Lav event_id → antal
      const countMap = {};

      countData?.forEach((item) => {
        countMap[item.event_id] = Number(item.registered_count);
      });

      // Saml eventdata og antal tilmeldte
      const eventsWithCounts = (eventData || []).map((event) => ({
        ...event,
        registeredCount: countMap[event.id] || 0,
      }));

      setEvents(eventsWithCounts);

      // HVIS BRUGEREN ER LOGGET IND:
      // hent brugerens egne tilmeldinger
      if (user) {
        const { data: registrationData, error: registrationError } =
          await supabase
            .from("event_registrations")
            .select("id, event_id")
            .eq("user_id", user.id);

        if (registrationError) {
          console.error(
            "Kunne ikke hente dine tilmeldinger:",
            registrationError,
          );
        } else {
          setMyRegistrations(registrationData || []);
        }
      } else {
        setMyRegistrations([]);
      }

      setLoading(false);
    }

    getData();
  }, [user]);

  function formatDate(eventDate) {
    const date = new Date(eventDate);

    return date.toLocaleDateString("da-DK", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  }

  function isUserRegistered(eventId) {
    return myRegistrations.some(
      (registration) => Number(registration.event_id) === Number(eventId),
    );
  }

  async function handleRegistration(event) {
    if (!user) {
      return;
    }

    const capacity = Number(event.capacity) || 0;
    const registered = Number(event.registeredCount) || 0;

    // Stop hvis eventet er fyldt
    if (capacity > 0 && registered >= capacity) {
      return;
    }

    // Stop hvis brugeren allerede er tilmeldt
    if (isUserRegistered(event.id)) {
      return;
    }

    setRegisteringId(event.id);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("event_registrations")
      .insert({
        event_id: event.id,
        user_id: user.id,
      })
      .select("id, event_id")
      .single();

    if (error) {
      console.error("Fejl ved tilmelding:", error);

      if (error.code === "23505") {
        setErrorMessage("Du er allerede tilmeldt dette event.");
      } else {
        setErrorMessage("Der skete en fejl ved tilmeldingen.");
      }

      setRegisteringId(null);
      return;
    }

    // Registrer at brugeren nu er tilmeldt
    setMyRegistrations((current) => [...current, data]);

    // Opdater tallet direkte på siden
    setEvents((currentEvents) =>
      currentEvents.map((currentEvent) =>
        currentEvent.id === event.id
          ? {
              ...currentEvent,
              registeredCount: currentEvent.registeredCount + 1,
            }
          : currentEvent,
      ),
    );

    setRegisteringId(null);
  }

  if (loading) {
    return (
      <main className="registrations-page registrations-loading">
        <p>Indlæser arrangementer...</p>
      </main>
    );
  }

  return (
    <>
      <header className="admin-header">
        <p className="eyebrow">Event overblik</p>

        <h1>Tilmeldinger</h1>

        <p>Se arrangementer, ledige pladser og tilmeld dig.</p>
      </header>

      <main className="registrations-page">
        {errorMessage && <p className="form-error">{errorMessage}</p>}

        <section className="registration-list">
          {/* OVERSKRIFTER */}
          <div className="registration-row registration-labels">
            <span>Event</span>
            <span>Sted</span>
            <span>Dato</span>
            <span>Ledige pladser</span>
            <span>Tilmelding</span>
            <span>Læs mere</span>
          </div>

          {/* EVENTS */}
          {events.map((event) => {
            const registered = Number(event.registeredCount) || 0;

            const capacity = Number(event.capacity) || 0;

            const remaining =
              capacity > 0 ? Math.max(capacity - registered, 0) : null;

            const soldOut = capacity > 0 && remaining === 0;

            const registeredByUser = isUserRegistered(event.id);

            return (
              <div className="registration-row" key={event.id}>
                {/* EVENT */}
                <strong>{event.title}</strong>

                {/* STED */}
                <span>{event.venueName || "Ikke angivet"}</span>

                {/* DATO */}
                <span>{formatDate(event.date)}</span>

                {/* LEDIGE PLADSER */}
                <span
                  className={soldOut ? "spots-badge sold-out" : "spots-badge"}
                >
                  {capacity === 0 ? "Ikke angivet" : `${remaining} tilbage`}
                </span>

                {/* TILMELDING */}
                {/* TILMELDING */}
                <div className="registration-action">
                  {!user ? (
                    soldOut ? (
                      <span className="sold-out-button">Udsolgt</span>
                    ) : (
                      <Link className="registration-login-button" to="/login">
                        Log ind
                      </Link>
                    )
                  ) : registeredByUser ? (
                    <span className="registered-badge">Tilmeldt</span>
                  ) : soldOut ? (
                    <button
                      type="button"
                      className="registration-button sold-out-button"
                      disabled
                    >
                      Udsolgt
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="registration-button"
                      onClick={() => handleRegistration(event)}
                      disabled={registeringId === event.id}
                    >
                      {registeringId === event.id ? "Tilmelder..." : "Tilmeld"}
                    </button>
                  )}
                </div>

                <div className="event-link-column">
                  <Link
                    className="registration-event-link"
                    to={`/events/${event.id}`}
                  >
                    Se event
                  </Link>
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </>
  );
}
