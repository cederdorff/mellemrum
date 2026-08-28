import { useEffect, useState } from "react";
import { Link } from "react-router";
import "./HomePage.css";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const headers = {
  apikey: import.meta.env.VITE_SUPABASE_APIKEY,
  "Content-Type": "application/json"
};

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Alle");

  useEffect(() => {
    async function getEvents() {
      const response = await fetch(`${SUPABASE_URL}/events?order=date.asc`, { headers });
      const data = await response.json();
      setEvents(data);
    }

    getEvents();
  }, []);

  const categories = ["Alle", ...new Set(events.map((event) => event.category))];

const filteredEvents = events.filter((event) => {
  const searchText =
    `${event.title} ${event.summary} ${event.venueName}`.toLowerCase();
  const matchesSearch = searchText.includes(search.toLowerCase());
  const matchesCategory = category === "Alle" || event.category === category;

  return matchesSearch && matchesCategory;
});

function getImageSize(imageUrl, width) {
  const url = new URL(imageUrl);

  url.searchParams.set("w", width);
  url.searchParams.set("q", "70");
  url.searchParams.set("auto", "format");

  return url.toString();
}

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
      <header className="hero">
        <img
          className="hero-image"
          src="/hero.webP"
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

      <main id="events">
        <section className="section-heading">
          <div>
            <p className="eyebrow dark">Det sker</p>
            <h2>Kommende events</h2>
          </div>
          <p>Kuraterede oplevelser i byen – fra små scener til store idéer.</p>
        </section>

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
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </section>

        {filteredEvents.length === 0 ? (
          <section className="no-results">
            <h3>Ingen events fundet</h3>

            <p>
              Vi kunne ikke finde nogen events, der matcher din søgning. Prøv et
              andet søgeord eller en anden kategori.
            </p>
          </section>
        ) : (
          <section className="event-grid">
            {filteredEvents.map((event) => (
              <article className="event-card" key={event.id}>
                <img
                  src={getImageSize(event.image, 800)}
                  srcSet={`
                  ${getImageSize(event.image, 500)} 500w,
                  ${getImageSize(event.image, 800)} 800w,
                  ${getImageSize(event.image, 1200)} 1200w
                  `}
                  sizes="(max-width: 620px) 100vw, (max-width: 900px) 50vw, 33vw"
                  alt={event.title}
                  loading="lazy"
                />

                <div className="event-card-content">
                  <p className="event-category">{event.category}</p>

                  <h3>{event.title}</h3>

                  <p>{event.summary}</p>

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