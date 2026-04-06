const express = require("express");
const router = express.Router();
const Destination = require("../models/Destination");

// ─── TAVILY LIVE FETCH ────────────────────────────────────────────────────────
// Fetches real travel data from the web and shapes it into our schema
async function fetchDestinationFromWeb(name) {
  const TAVILY_KEY = process.env.TAVILY_API_KEY;

  if (!TAVILY_KEY) {
    console.warn("⚠️  TAVILY_API_KEY not set in .env — skipping live fetch");
    return null;
  }

  try {
    console.log(`🌐 Fetching live data for: ${name}`);

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: TAVILY_KEY,
        query: `${name} travel destination guide highlights best time to visit`,
        search_depth: "advanced",
        max_results: 5,
        include_answer: true,
      }),
    });

    const data = await response.json();

    if (!data || !data.answer) {
      console.warn("⚠️  Tavily returned no answer for:", name);
      return null;
    }

    // Parse the answer into structured fields
    const answer = data.answer || "";
    const results = data.results || [];

    // Extract image from first result that has one
    const image =
      results.find((r) => r.images && r.images.length > 0)?.images?.[0] ||
      null;

    // Extract highlights — split answer into bullet points roughly
    const sentences = answer
      .split(/[.\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 30 && s.length < 150)
      .slice(0, 4);

    // Build a price estimate based on common knowledge (Tavily won't give exact prices)
    // We'll use a keyword-based rough estimate
    const expensive = ["paris", "tokyo", "new york", "london", "dubai", "switzerland", "maldives"];
    const moderate = ["goa", "bali", "bangkok", "prague", "istanbul", "lisbon", "rome"];
    const nameLower = name.toLowerCase();
    let price = 15000; // default
    if (expensive.some((k) => nameLower.includes(k))) price = 45000 + Math.floor(Math.random() * 20000);
    else if (moderate.some((k) => nameLower.includes(k))) price = 18000 + Math.floor(Math.random() * 10000);
    else price = 10000 + Math.floor(Math.random() * 12000);

    // Extract description — use first 2 sentences of answer
    const description = answer.split(".").slice(0, 2).join(".").trim() + ".";

    // Try to extract best time from answer text
    const bestTimeMatch = answer.match(
      /best time[^.]*?(january|february|march|april|may|june|july|august|september|october|november|december|winter|summer|monsoon|spring|autumn)[^.]*/i
    );
    const bestTime = bestTimeMatch
      ? bestTimeMatch[0].replace(/best time[^a-z]*/i, "").trim()
      : "October to March";

    return {
      name,
      description: description.length > 20 ? description : `${name} is a wonderful travel destination worth exploring.`,
      price,
      image,
      highlights: sentences,
      bestTime,
      country: name, // fallback — Tavily doesn't always return country
      lastFetched: new Date(),
    };
  } catch (err) {
    console.error("❌ Tavily fetch error:", err.message);
    return null;
  }
}

// ─── ROUTES ───────────────────────────────────────────────────────────────────

// ✅ TEST
router.get("/test", (req, res) => {
  res.send("Route working!");
});

// ✅ GET all destinations (from DB cache)
router.get("/destinations", async (req, res) => {
  try {
    const data = await Destination.find().sort({ searchCount: -1, createdAt: -1 });
    res.json(data);
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ SEARCH — core feature: check DB first, fetch from web if not found
// Usage: GET /destinations/search?q=Goa
router.get("/destinations/search", async (req, res) => {
  const query = (req.query.q || "").trim();

  if (!query) {
    return res.status(400).json({ error: "Search query is required. Use ?q=Goa" });
  }

  try {
    // 1. Check MongoDB first (case-insensitive match)
    const existing = await Destination.findOne({
      name: { $regex: new RegExp(`^${query}$`, "i") },
    });

    if (existing) {
      console.log(`✅ Cache hit for: ${query}`);
      // Increment search count
      await Destination.findByIdAndUpdate(existing._id, { $inc: { searchCount: 1 } });
      return res.json({ source: "cache", data: existing });
    }

    // 2. Not in DB — fetch live from Tavily
    console.log(`🔍 Cache miss — fetching live data for: ${query}`);
    const fetched = await fetchDestinationFromWeb(query);

    if (!fetched) {
      return res.status(404).json({
        error: `Could not find data for "${query}". Try a well-known destination name.`,
      });
    }

    // 3. Save to MongoDB so next search is instant
    const newDestination = new Destination(fetched);
    await newDestination.save();
    console.log(`💾 Saved to DB: ${query}`);

    return res.json({ source: "live", data: newDestination });
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ✅ GET single destination by ID
router.get("/destinations/:id", async (req, res) => {
  try {
    const data = await Destination.findById(req.params.id);
    if (!data) return res.status(404).json({ error: "Destination not found" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ ADD destination manually
router.post("/add-destination", async (req, res) => {
  try {
    const newDestination = new Destination(req.body);
    await newDestination.save();
    res.json({ message: "Destination added successfully", data: newDestination });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ DELETE destination
router.delete("/destinations/:id", async (req, res) => {
  try {
    await Destination.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
