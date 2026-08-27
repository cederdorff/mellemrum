import { useEffect, useState } from "react";
import { Link } from "react-router";
import "./RegistrationsPage.css";



const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const headers = {
  apikey: import.meta.env.VITE_SUPABASE_APIKEY,
  "Content-Type": "application/json",
};

export default function RegistrationsPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function getRegistrations() {
      const response = await fetch(
        `${SUPABASE_URL}/registrations?order=eventDate.asc`,
        { headers },
      );

      const data = await response.json();
      setEvents(data);
    }

    getRegistrations();
  }, []);

  function formatEventDate(eventDate) {
    const date = new Date(eventDate);

    return date.toLocaleDateString("da-DK", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  }

  return (
    <>
      <header className="admin-header">
        <p className="eyebrow">Event overblik</p>
        <h1>Tilmeldinger</h1>
        <p>Overblik over tilmeldinger og ledige pladser</p>
      </header>

      <main className="registrations-page">
        <section className="registration-list">
          <div className="registration-row registration-labels">
            <span>Event</span>
            <span>Sted</span>
            <span>Dato</span>
            <span>Tilmeldte</span>
            <span>Ledige pladser</span>
          </div>

          {events.map((event) => {
            const remainingSpots = parseInt(event.ledigePladser, 10);
            const hasAvailableSpots = remainingSpots > 0;

            return (
              <div className="registration-row" key={event.id}>
                <strong>{event.eventTitle}</strong>

                <span>{event.eventLocation}</span>

                <span>{formatEventDate(event.eventDate)}</span>

                <span>{event.tilmeldte}</span>

                <span
                  className={`status ${hasAvailableSpots ? "available-status" : "sold-out-status"}`}
                >
                  {event.ledigePladser}
                </span>

                {hasAvailableSpots ? (
                  <Link
                    className="registration-button available"
                    to={`/events/${event.id}`}
                  >
                    Tilmeld
                  </Link>
                ) : (
                  <span className="registration-button sold-out">Udsolgt</span>
                )}
              </div>
            );
          })}
        </section>
      </main>
    </>
  );
}