import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import "./EventPage.css";


const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const headers = {
  apikey: import.meta.env.VITE_SUPABASE_APIKEY,
  "Content-Type": "application/json"
};

export default function EventPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  

  useEffect(() => {
    async function getEvent() {
      const response = await fetch(`${SUPABASE_URL}/events?id=eq.${eventId}`, { headers });
      const data = await response.json();
      setEvent(data[0]);
    }

    getEvent();
  }, [eventId]);

 async function handleSubmit(eventSubmit) {
  eventSubmit.preventDefault();

  setSubmitError("");

  const response = await fetch(
    `${SUPABASE_URL}/event_registrations`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        event_id: event.id,
        name: name,
        email: email
      })
    }
  );

  if (!response.ok) {
    setSubmitError("Der skete en fejl. Prøv venligst igen.");
    return;
  }

  setName("");
  setEmail("");
  setSubmitted(true);


   // Find eventet i tilmeldingsoversigten
   const overviewResponse = await fetch(
     `${SUPABASE_URL}/registrations?eventTitle=eq.${encodeURIComponent(event.title)}`,
     { headers },
   );

   const overviewData = await overviewResponse.json();
   const overviewEvent = overviewData[0];

   if (overviewEvent) {
     const currentRegistered = parseInt(overviewEvent.tilmeldte, 10);

     const totalMatch = overviewEvent.tilmeldte.match(/ud af\s+(\d+)/);
     const totalSpots = totalMatch ? parseInt(totalMatch[1], 10) : 0;

     const currentRemaining = parseInt(overviewEvent.ledigePladser, 10);

     await fetch(`${SUPABASE_URL}/registrations?id=eq.${overviewEvent.id}`, {
       method: "PATCH",
       headers,
       body: JSON.stringify({
         tilmeldte: `${currentRegistered + 1} ud af ${totalSpots}`,
         ledigePladser: `${Math.max(currentRemaining - 1, 0)} tilbage`,
       }),
     });
   }

   // Husk at brugeren har tilmeldt sig dette event
   localStorage.setItem(`tilmeldt-${event.title}`, "true");

   // Ryd formularen
   setName("");
   setEmail("");

   setSubmitted(true);

   setName("");
   setEmail("");
   setSubmitted(true);
 }

  if (!event) {
    return <p>Indlæser event...</p>;
  }

  const date = new Date(event.date);

  return (
    <>
      <main className="event-page">
        <Link className="back-link" to="/">
          ← Alle events
        </Link>

        <section className="event-detail">
          <img src={event.image} alt="" />
          <div className="event-detail-content">
            <p className="event-category">{event.category}</p>
            <h1>{event.title}</h1>
            <p className="lead">{event.summary}</p>
            <div className="detail-list">
              <p>
                <strong>Dato</strong>
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
              </p>
              <p>
                <strong>Sted</strong>
                <span>
                  {event.venueName}
                  <br />
                  {event.venueAddress}, {event.venuePostalCode}{" "}
                  {event.venueCity}
                  {event.venueWebsite && (
                    <>
                      <br />
                      <a href={event.venueWebsite}>Besøg venue</a>
                    </>
                  )}
                </span>
              </p>
              <p>
                <strong>Pris</strong>
                {event.price === 0 ? "Gratis" : `${event.price} kr.`}
              </p>
            </div>
            <p>{event.description}</p>
          </div>
        </section>

        <section className="signup-panel">
          {submitted ? (
            <div className="signup-success">
              <p className="eyebrow dark">Tilmeldt</p>

              <h2>Tak for din tilmelding!</h2>

              <p>Du vil få en mail fra arrangøren.</p>

              <Link className="signup-success-link" to="/tilmeldinger">
                Se tilmeldinger
              </Link>
            </div>
          ) : (
            <>
              <div>
                <p className="eyebrow dark">Tilmelding</p>

                <h2>Reserver din plads</h2>

                <p>
                  Udfyld formularen, så sender vi din tilmelding til arrangøren.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <label>
                  Navn
                  <input
                    value={name}
                    onChange={(inputEvent) => setName(inputEvent.target.value)}
                    required
                  />
                </label>

                <label>
                  E-mail
                  <input
                    type="email"
                    value={email}
                    onChange={(inputEvent) => setEmail(inputEvent.target.value)}
                    placeholder="dig@example.com"
                    required
                  />
                </label>

                <button type="submit">Tilmeld mig</button>

                {submitError && <p className="form-error">{submitError}</p>}
              </form>
            </>
          )}
        </section>
      </main>
    </>
  );
}
