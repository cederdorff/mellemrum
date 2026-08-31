import { useState } from "react";
import { useNavigate } from "react-router";

import { supabase } from "../lib/supabase";
import "./CreateEventPage.css";

export default function CreateEventPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [venueName, setVenueName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(eventSubmit) {
    eventSubmit.preventDefault();

    setLoading(true);
    setErrorMessage("");

    // Tjek at der er valgt et billede
    if (!image) {
      setErrorMessage("Du skal vælge et billede.");
      setLoading(false);
      return;
    }

    // Lav et unikt filnavn til billedet
    const fileExtension = image.name.split(".").pop();

    const fileName = `${crypto.randomUUID()}.${fileExtension}`;

    // 1. Upload billedet til Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("event-images")
      .upload(fileName, image);

    if (uploadError) {
      console.error("Fejl ved upload:", uploadError);

      setErrorMessage(`Billedet kunne ikke uploades: ${uploadError.message}`);

      setLoading(false);
      return;
    }

    // 2. Hent offentlig URL til billedet
    const { data: imageData } = supabase.storage
      .from("event-images")
      .getPublicUrl(fileName);

    const imageUrl = imageData.publicUrl;

    // 3. Opret eventet i Supabase
    const { data: newEvent, error: eventError } = await supabase
      .from("events")
      .insert({
        title: title,
        date: date,
        venueName: venueName,
        price: Number(price),
        image: imageUrl,
      })
      .select()
      .single();

    if (eventError) {
      console.error("Fejl ved oprettelse af event:", eventError);

      setErrorMessage(`Eventet kunne ikke oprettes: ${eventError.message}`);

      setLoading(false);
      return;
    }

    // 4. Send brugeren til det nye event
    navigate(`/events/${newEvent.id}`);
  }

  return (
    <main className="create-event-page">
      <header className="create-event-header">
        <p className="eyebrow dark">Nyt arrangement</p>

        <h1>Opret event</h1>

        <p>
          Opret et nyt arrangement, som andre brugere kan finde og tilmelde sig.
        </p>
      </header>

      <form className="create-event-form" onSubmit={handleSubmit}>
        {/* EVENT NAVN */}
        <label>
          Eventets navn
          <input
            id="event-title"
            name="event-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Fx Keramik workshop"
            required
          />
        </label>

        {/* DATO OG TID */}
        <label>
          Dato og tidspunkt
          <input
            id="event-date"
            name="event-date"
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
            id="event-location"
            name="event-location"
            type="text"
            value={venueName}
            onChange={(event) => setVenueName(event.target.value)}
            placeholder="Fx Godsbanen"
            required
          />
        </label>

        {/* PRIS */}
        <label>
          Pris
          <input
            id="event-price"
            name="event-price"
            type="number"
            min="0"
            step="1"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="Fx 120"
            required
          />
        </label>

        {/* BILLEDE */}
        <label>
          Billede
          <input
            id="event-image"
            name="event-image"
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={(event) => setImage(event.target.files[0])}
            required
          />
        </label>

        {/* VALGT BILLEDE */}
        {image && (
          <div className="image-selected">
            <p>
              Valgt billede:
              <strong> {image.name}</strong>
            </p>
          </div>
        )}

        {/* OPRET EVENT */}
        <button type="submit" disabled={loading}>
          {loading ? "Opretter event..." : "Opret event"}
        </button>

        {/* FEJLBESKED */}
        {errorMessage && <p className="create-event-error">{errorMessage}</p>}
      </form>
    </main>
  );
}
