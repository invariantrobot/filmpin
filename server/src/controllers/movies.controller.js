import { Router } from "express";
import values from "../../db.js";
const {db, OMDB_KEY, posterCache, plotCache} = values;

const mapRouter = Router();

mapRouter.get("/getAllTitles", (req, res) => {
  const allMovies = db.prepare("SELECT * FROM movies").all();
  return res.json({ success: true, allMovies });
});

mapRouter.get("/getAllLocations", (req, res) => {
  const allMovies = db.prepare("SELECT * FROM locations").all();
  return res.json({ success: true, allMovies });
});

mapRouter.get("/getLocationsByID", (req, res) => {
  const IDS = Array.isArray(req.query.id) ? req.query.id : [req.query.id];
  const locations = {};
  for (const id of IDS) {
    const locationsTitle = db
      .prepare("SELECT * FROM locations WHERE movie_id = ?")
      .all(id);
    locations[id] = locationsTitle;
  }
  return res.json({ success: true, locations });
});

mapRouter.get("/getTitleByGenre", (req, res) => {
  const { genre } = req.query;
  const allMovies = db
    .prepare("SELECT * FROM movies WHERE genre = ?")
    .all(genre);
  return res.json({ success: true, allMovies });
});

mapRouter.get("/getGenres", (req, res) => {
  const genres = db.prepare("SELECT DISTINCT genre FROM movies").all();
  return res.json({ success: true, genres });
});

mapRouter.get("/getClose", (req, res) => {
  const location = req.query.coordinates;
  const distance = req.query.distance;
  const places = db
    .prepare(
      "SELECT * FROM locations WHERE lat BETWEEN ? AND ? AND lon BETWEEN ? AND ?",
    )
    .all(
      location[0] - distance,
      location[0] + distance,
      location[1] - distance,
      location[1] + distance,
    );
  if (places) {
    return res.json({ success: true, places });
  } else {
    return res.json({ success: false });
  }
});

mapRouter.get("/getByTitle", (req, res) => {
  const title = req.query.title;
  if (!title) {
    return res.json({ success: false });
  }
  const allTitles = db
    .prepare(
      "SELECT * FROM movies WHERE title LIKE '%' || ? || '%' COLLATE NOCASE",
    )
    .all(title);
  if (allTitles) {
    return res.json({ success: true, allTitles });
  } else {
    return res.json({ success: false });
  }
});

mapRouter.get("/getByLocation", (req, res) => {
  const location = req.query.place;
  if (!location) {
    return res.json({ success: false });
  }
  const allLocations = db
    .prepare(
      "SELECT * FROM locations WHERE place LIKE '%' || ? || '%' COLLATE NOCASE",
    )
    .all(location);
  if (allLocations) {
    return res.json({ success: true, allLocations });
  } else {
    return res.json({ success: false });
  }
});

mapRouter.get("/posterById", async (req, res) => {
  const id = req.query.id;
  // Check if its in memory
  const poster = posterCache.get(id);

  if (poster) {
    res.setHeader("Content-Type", poster.type || "image/jpeg");
    return res.end(poster.bytes);
  }

  const url = new URL("http://img.omdbapi.com/");
  url.searchParams.set("apikey", OMDB_KEY);
  url.searchParams.set("i", id);
  const response = await fetch(url);

  if (!response.ok) throw new Error(`OMDb poster get failed: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const type = response.headers.get("content-type") || "image/jpeg";

  posterCache.set(id, {bytes, type});

  res.setHeader("Content-Type", type);
  res.end(bytes);

});

mapRouter.get("/plotById", async (req, res) => {
  const id = req.query.id;
  // Check if its in memory
  const poster = plotCache.get(id);

  if (poster) {
    const plot = poster.plot;
    return res.json({success: true, plot});
  }

  const url = new URL("http://www.omdbapi.com/");
  url.searchParams.set("apikey", OMDB_KEY);
  url.searchParams.set("i", id);
  url.searchParams.set("plot", "short");
  url.searchParams.set("r", "json");
  const response = await fetch(url);

  if (!response.ok) throw new Error(`OMDb poster get failed: ${response.status}`);
  const data = await response.json()
  const plot = data.Plot;

  plotCache.set(id, {plot});

  return res.json({success: true, plot});

});

export default mapRouter;
