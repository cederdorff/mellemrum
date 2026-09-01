import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

import "./CreateEventPage.css";

export default function EditEventPage() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [venueName, setVenueName] = useState("");
  const [price, setPrice] = useState("");
  const [capacity, setCapacity] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function getEvent() {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (error) {
        console.error("Fejl ved hentning af event:", error);
        setErrorMessage("Eventet kunne ikke hentes.");
        setLoading(false);
        return;
      }

      // Kun den bruger, der har oprettet eventet, må redigere det
      if (data.created_by !== user.id) {
        setErrorMessage("Du har ikke adgang til at redigere dette event.");
        setLoading(false);
        return;
      }

      setTitle(data.title || "");

      setDate(data.date ? new Date(data.date).toISOString().slice(0, 16) : "");

      setVenueName(data.venueName || "");
      setPrice(data.price ?? "");
      setCapacity(data.capacity ?? "");
      setSummary(data.summary || "");
      setDescription(data.description || "");

      setLoading(false);
    }

    if (user) {
      getEvent();
    }
  }, [eventId, user]);

  async function handleUpdate(eventSubmit) {
    eventSubmit.preventDefault();

    setSaving(true);
    setErrorMessage("");

    // Find antal personer der allerede er tilmeldt
    const { count, error: countError } = await supabase
      .from("event_registrations")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("event_id", eventId);

    if (countError) {
      console.error("Fejl ved optælling af tilmeldinger:", countError);

      setErrorMessage("Kunne ikke kontrollere antal tilmeldinger.");

      setSaving(false);
      return;
    }

    // Antal pladser må ikke sættes lavere end antal tilmeldte
    if (Number(capacity) < count) {
      setErrorMessage(
        `Der er allerede ${count} tilmeldte. Antal pladser kan derfor ikke sættes lavere end ${count}.`,
      );

      setSaving(false);
      return;
    }

    // Opdater eventet
    const { error } = await supabase
      .from("events")
      .update({
        title,
        date,
        venueName,
        price: Number(price),
        capacity: Number(capacity),
        summary,
        description,
      })
      .eq("id", eventId)
      .eq("created_by", user.id);

    if (error) {
      console.error("Fejl ved opdatering:", error);

      setErrorMessage("Eventet kunne ikke gemmes.");

      setSaving(false);
      return;
    }

    setSaving(false);

    // Tilbage til eventet
    navigate(`/events/${eventId}`);
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Er du sikker på, at du vil slette eventet? Det kan ikke fortrydes.",
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId)
      .eq("created_by", user.id);

    if (error) {
      console.error("Fejl ved sletning:", error);

      setErrorMessage("Eventet kunne ikke slettes.");

      return;
    }

    navigate("/");
  }

  if (loading) {
    return (
      <main className="create-event-page">
        <p>Indlæser event...</p>
      </main>
    );
  }

  if (errorMessage && !title) {
    return (
      <main className="create-event-page">
        <p className="create-event-error">{errorMessage}</p>

        <Link to="/">← Tilbage til events</Link>
      </main>
    );
  }

  return (
    <main className="create-event-page">
      <header className="create-event-header">
        <p className="eyebrow dark">Dit arrangement</p>

        <h1>Rediger event</h1>

        <p>Her kan du ændre informationerne eller slette dit event.</p>
      </header>

      <form className="create-event-form" onSubmit={handleUpdate}>
        {/* EVENTETS NAVN */}
        <label>
          Eventets navn
          <input
            id="edit-event-title"
            name="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </label>

        {/* DATO OG TID */}
        <label>
          Dato og tidspunkt
          <input
            id="edit-event-date"
            name="date"
            type="datetime-local"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </label>

        {/* STED */}
        <label>
          Sted
          <input
            id="edit-event-location"
            name="venueName"
            type="text"
            value={venueName}
            onChange={(event) => setVenueName(event.target.value)}
            required
          />
        </label>

        {/* PRIS */}
        <label>
          Pris
          <input
            id="edit-event-price"
            name="price"
            type="number"
            min="0"
            step="1"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            required
          />
        </label>

        {/* ANTAL PLADSER */}
        <label>
          Antal pladser
          <input
            id="edit-event-capacity"
            name="capacity"
            type="number"
            min="1"
            step="1"
            value={capacity}
            onChange={(event) => setCapacity(event.target.value)}
            required
          />
        </label>

        {/* KORT BESKRIVELSE */}
        <label>
          Kort beskrivelse
          <textarea
            id="edit-event-summary"
            name="summary"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            rows="3"
            maxLength="180"
            placeholder="Kort tekst som vises på eventkortet..."
            required
          />
        </label>

        {/* LANG BESKRIVELSE */}
        <label>
          Beskrivelse
          <textarea
            id="edit-event-description"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows="6"
            placeholder="Beskriv eventet mere detaljeret..."
            required
          />
        </label>

        {/* GEM */}
        <button type="submit" disabled={saving}>
          {saving ? "Gemmer..." : "Gem ændringer"}
        </button>

        {/* SLET */}
        <button
          type="button"
          className="delete-event-button"
          onClick={handleDelete}
        >
          Slet event
        </button>

        {errorMessage && <p className="create-event-error">{errorMessage}</p>}
      </form>
    </main>
  );
}
