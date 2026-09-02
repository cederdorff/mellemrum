import fs from "fs";
import path from "path";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_APIKEY = process.env.VITE_SUPABASE_APIKEY;

const outputFolder = "./public/events";

// Opret mappen hvis den ikke findes
fs.mkdirSync(outputFolder, { recursive: true });

const headers = {
  apikey: SUPABASE_APIKEY,
  "Content-Type": "application/json",
};

// Hent events fra Supabase
const response = await fetch(`${SUPABASE_URL}/events?select=id,title,image`, {
  headers,
});

const events = await response.json();

for (const event of events) {
  if (!event.image) continue;

  // Gør titlen egnet som filnavn
  const fileName = event.title
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Optimer Unsplash-billedet
  const imageUrl = new URL(event.image);

  imageUrl.searchParams.set("w", "1200");
  imageUrl.searchParams.set("q", "70");
  imageUrl.searchParams.set("fm", "webp");

  console.log(`Downloader: ${event.title}`);

  const imageResponse = await fetch(imageUrl);

  const buffer = Buffer.from(await imageResponse.arrayBuffer());

  const filePath = path.join(outputFolder, `${fileName}.webp`);

  fs.writeFileSync(filePath, buffer);

  console.log(`✓ ${filePath}`);
}

console.log("Alle billeder er downloadet!");
