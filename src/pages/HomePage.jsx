import { useEffect, useState } from "react";
import { Link } from "react-router";
import { supabase } from "../lib/supabase";
import "./HomePage.css";



// Sørger for at både lokale billeder og Supabase-billeder virker
function getImageUrl(image) {
  if (!image) {
    return "";
  }

  // Nye billeder fra Supabase Storage
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  // Gamle billeder fra public-mappen
  const cleanImage = image.replace(/^\/+/, "");

  return `${import.meta.env.BASE_URL}${cleanImage}`;
}

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Alle");

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

useEffect(() => {
  async function getEvents() {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("events")
      .select(
        `
        id,
        title,
        summary,
        date,
        venueName,
        category,
        image
      `,
      )
      .order("date", { ascending: true });

    if (error) {
      console.error("Fejl ved hentning af events:", error);
      setErrorMessage("Events kunne ikke hentes. Prøv igen senere.");
      setLoading(false);
      return;
    }

    setEvents(data || []);
    setLoading(false);
  }

  getEvents();
}, []);

  // FIND ALLE KATEGORIER
  // filter(Boolean) fjerner tomme kategorier
  const categories = [
    "Alle",
    ...new Set(events.map((event) => event.category).filter(Boolean)),
  ];

  // SØGNING + KATEGORI-FILTER
  const filteredEvents = events.filter((event) => {
    const searchText = `
      ${event.title || ""}
      ${event.summary || ""}
      ${event.venueName || ""}
    `.toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());

    const matchesCategory = category === "Alle" || event.category === category;

    return matchesSearch && matchesCategory;
  });

  // FORMATÉR DATO
  function formatEventDate(eventDate) {
    const date = new Date(eventDate);

    const formattedDate = date.toLocaleDateString("da-DK", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  }

  return (
    <>
      {/* HERO */}
      <header className="hero">
        <img
          className="hero-image"
          src={`${import.meta.env.BASE_URL}hero.webP`}
          alt=""
          fetchPriority="high"
        />

        <div className="hero-overlay"></div>

        <div className="hero-content">
          <p className="eyebrow">Kultur i Aarhus</p>

          <h1>Find plads til noget nyt.</h1>

          <p className="hero-copy">
            Koncerter, talks og workshops samlet ét sted. Find dit næste event,
            og tilmeld dig på få minutter.
          </p>

          <a className="hero-link" href="#events">
            Se kommende events ↓
          </a>
        </div>
      </header>

      {/* EVENTS */}
      <main id="events">
        <section className="section-heading">
          <div>
            <p className="eyebrow dark">Det sker</p>

            <h2>Kommende events</h2>
          </div>

          <p>Kuraterede oplevelser i byen – fra små scener til store idéer.</p>
        </section>

        {/* FILTER */}
        <section className="filters">
          <label>
            Søg
            <input
              id="event-search"
              name="event-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Søg efter titel eller sted"
            />
          </label>

          <label>
            Kategori
            <select
              id="event-category"
              name="event-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </section>

        {/* LOADING */}
        {loading && (
          <section className="events-loading">
            <p>Indlæser events...</p>
          </section>
        )}

        {/* FEJL */}
        {!loading && errorMessage && (
          <section className="no-results">
            <h3>Der skete en fejl</h3>

            <p>{errorMessage}</p>
          </section>
        )}

        {/* INGEN RESULTATER */}
        {!loading && !errorMessage && filteredEvents.length === 0 && (
          <section className="no-results">
            <h3>Ingen events fundet</h3>

            <p>
              Vi kunne ikke finde nogen events, der matcher din søgning. Prøv et
              andet søgeord eller en anden kategori.
            </p>
          </section>
        )}

        {/* EVENT-KORT */}
        {!loading && !errorMessage && filteredEvents.length > 0 && (
          <section className="event-grid">
            {filteredEvents.map((event) => (
              <article className="event-card" key={event.id}>
                {event.image && (
                  <img
                    src={getImageUrl(event.image)}
                    alt={event.title}
                    loading="lazy"
                    decoding="async"
                  />
                )}

                <div className="event-card-content">
                  {event.category && (
                    <p className="event-category">{event.category}</p>
                  )}

                  <h3>{event.title}</h3>

                  {event.summary && <p>{event.summary}</p>}

                  <div className="event-meta">
                    <span>{formatEventDate(event.date)}</span>

                    <span>{event.venueName}</span>
                  </div>

                  <Link className="card-link" to={`/events/${event.id}`}>
                    Læs mere
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </>
  );
}
