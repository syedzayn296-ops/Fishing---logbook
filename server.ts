import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware for parsing JSON with generous limit for base64 fish photos
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Lazy initialization of Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    geminiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Species Identification & Regulation Checker
app.post("/api/identify-fish", async (req, res) => {
  try {
    const { imageBase64, mimeType, description, userLengthCm, locationName } = req.body;

    if (!imageBase64 && !description) {
      return res.status(400).json({
        error: "Please provide either an image of the fish or a physical description.",
      });
    }

    const ai = getGemini();

    const systemInstruction = `You are the ultimate South African Marine Fishing and Ichthyology expert.
You have comprehensive knowledge of all fish species inhabiting South African coastal waters (Atlantic and Indian Oceans, West Coast, South Coast, Wild Coast, and KwaZulu-Natal).
You strictly follow the official South African recreational fishing regulations set by the Department of Forestry, Fisheries and the Environment (DFFE / DAFF), as well as the WWF South African Sustainable Seafood Initiative (SASSI) list (Green, Orange, Red).

When identifying a fish:
1. Identify the most probable species (Common SA name, scientific name, and local names like Afrikaans/colloquial e.g. "Kabeljou", "Leerie", "Galjoen", "Elf", "Poenskop", "Geelbek", "Baardman", "Steenbras").
2. State the key identification features that confirm this ID.
3. Specify the current South African legal recreational regulations:
   - Minimum legal size (fork length / total length in cm, or "None")
   - Daily bag limit per angler per permit (or "Unlimited", "No take", etc.)
   - Closed seasons if applicable (e.g., Galjoen: 15 Oct to last day of Feb in WC/EC; Shad/Elf: 1 Oct to 30 Nov in KZN)
   - SASSI Status: "Green", "Orange", or "Red"
4. If the user provided length (${userLengthCm ? `${userLengthCm} cm` : "not provided"}), explicitly state whether this specimen would be legal to keep under South African law.
5. Provide top bait & tackle tips for this species in South African waters.
6. Provide handling & conservation advice (e.g. barotrauma, sharp spines, catch-and-release recommendation).`;

    const contentsParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

    if (imageBase64) {
      // Clean base64 data if data URL prefix exists
      const cleanBase64 = imageBase64.replace(/^data:[a-zA-Z0-9\/\-\+]+;base64,/, "");
      contentsParts.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: cleanBase64,
        },
      });
    }

    let promptText = `Please analyze this fish for an angler in South Africa.`;
    if (locationName) {
      promptText += ` Caught or spotted at/near: ${locationName}.`;
    }
    if (userLengthCm) {
      promptText += ` Measured length: ${userLengthCm} cm.`;
    }
    if (description) {
      promptText += ` Angler description: "${description}".`;
    }

    contentsParts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: { parts: contentsParts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            speciesName: {
              type: Type.STRING,
              description: "Primary South African common name (e.g. 'Galjoen', 'Dusky Kob', 'Garrick (Leervis)', 'Yellowtail')",
            },
            scientificName: {
              type: Type.STRING,
              description: "Scientific binomial name (e.g. 'Dichistius capensis', 'Argyrosomus japonicus')",
            },
            localNames: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Local South African names (Afrikaans, Zulu, Xhosa, colloquial)",
            },
            confidence: {
              type: Type.STRING,
              description: "High, Medium, or Low with brief justification",
            },
            keyFeatures: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 to 4 distinct anatomical identifying markers observed or described",
            },
            southAfricanRegulations: {
              type: Type.OBJECT,
              properties: {
                minimumSizeCm: {
                  type: Type.STRING,
                  description: "Minimum legal size in cm, or 'No minimum size', or 'Prohibited / No take'",
                },
                dailyBagLimit: {
                  type: Type.STRING,
                  description: "Daily bag limit per angler per day (e.g. '2 per day', '1 per day', '10 per day')",
                },
                closedSeason: {
                  type: Type.STRING,
                  description: "Closed season details or 'None'",
                },
                sassiStatus: {
                  type: Type.STRING,
                  description: "'Green (Best Choice)', 'Orange (Think Twice)', or 'Red (Avoid / Vulnerable / Prohibited)'",
                },
                isLegalSizeForUser: {
                  type: Type.STRING,
                  description: "Assessment if the user's catch length is legal to retain, or advice if length was not provided",
                },
              },
              required: ["minimumSizeCm", "dailyBagLimit", "closedSeason", "sassiStatus", "isLegalSizeForUser"],
            },
            habitatAndRange: {
              type: Type.STRING,
              description: "Where this species is typically found along the SA coastline (e.g. West Coast kelp beds, surf zone, estuaries, offshore)",
            },
            bestBaitsAndTactics: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Top 3-4 recommended baits or lures in South Africa (e.g. Red bait, chokka, mud prawn, paddle tails)",
            },
            handlingAndConservation: {
              type: Type.STRING,
              description: "Handling advice (spines, teeth), release tips, or culinary note if legal",
            },
            summary: {
              type: Type.STRING,
              description: "A concise 2-sentence summary for the angler on the beach or boat",
            },
          },
          required: [
            "speciesName",
            "scientificName",
            "confidence",
            "keyFeatures",
            "southAfricanRegulations",
            "habitatAndRange",
            "bestBaitsAndTactics",
            "handlingAndConservation",
            "summary",
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response returned from identification model.");
    }

    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error("Fish identification error:", error);
    return res.status(500).json({
      error: error.message || "Failed to identify fish species. Please try again.",
    });
  }
});

// Open Waters harmonic tide prediction proxy.\n// The client only uses this as a live prediction source when the response passes validation;\n// the existing local model remains the fallback. Open Waters predictions are not for navigation.\napp.get("/api/tides", async (req, res) => {\n  try {\n    const lat = Number(req.query.lat);\n    const lon = Number(req.query.lon);\n    const start = String(req.query.start || new Date().toISOString());\n    const end = String(req.query.end || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());\n\n    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {\n      return res.status(400).json({ error: "Valid latitude and longitude are required." });\n    }\n\n    const url = new URL("https://api.openwaters.io/tides/extremes");\n    url.searchParams.set("latitude", String(lat));\n    url.searchParams.set("longitude", String(lon));\n    url.searchParams.set("start", start);\n    url.searchParams.set("end", end);\n    url.searchParams.set("units", "meters");\n\n    const response = await fetch(url);\n    const data = await response.json();\n\n    if (!response.ok) {\n      return res.status(response.status).json({ error: "Live tide provider unavailable.", provider: "openwaters" });\n    }\n\n    const timelineUrl = new URL("https://api.openwaters.io/tides/timeline");\n    timelineUrl.search = url.search;\n    const timelineResponse = await fetch(timelineUrl);\n    const timeline = timelineResponse.ok ? await timelineResponse.json() : null;\n\n    return res.json({ provider: "openwaters", fetchedAt: new Date().toISOString(), data, timeline });\n  } catch (error) {\n    console.error("Live tide provider error:", error);\n    return res.status(502).json({ error: "Live tide provider unavailable.", provider: "openwaters" });\n  }\n});\n\n// Open-Meteo Marine & Weather Proxy / Cache
app.get("/api/marine-weather", async (req, res) => {
  try {
    const lat = req.query.lat || "-33.9249";
    const lon = req.query.lon || "18.4241";

    // 1. Fetch marine data (wave height, wave direction, wave period, swell wave height, swell wave period)
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period&hourly=wave_height,swell_wave_height,wave_period&timezone=Africa%2FJohannesburg`;

    // 2. Fetch atmospheric weather (temperature, wind speed, wind direction, wind gusts, pressure, rain)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,surface_pressure,wind_speed_10m,wind_direction_10m&daily=sunrise,sunset,uv_index_max&timezone=Africa%2FJohannesburg`;

    const [marineRes, weatherRes] = await Promise.all([
      fetch(marineUrl).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch(weatherUrl).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]);

    res.json({
      marine: marineRes,
      weather: weatherRes,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Marine weather error:", error);
    res.status(500).json({ error: "Failed to fetch marine weather" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`South Africa Fishing App server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
