import { Router } from "express";
import values from "../../db.js";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { fail } from "assert";
const {db, OMDB_KEY, MAPILLARY_KEY, posterCache, plotCache} = values;

const mapRouter = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const POSTERS_DIR = path.resolve(__dirname, "..", "posters");

mapRouter.get("/getAllTitles", (req, res) => {
  const allMovies = db.prepare("SELECT * FROM movies").all();
  return res.json({ success: true, allMovies });
});

mapRouter.get("/getAllLocations", (req, res) => {
  const rows = db.prepare(`
    SELECT
      l.*,
      m.title AS movieTitle
    FROM locations l
    LEFT JOIN movies m ON m.id = l.movie_id
  `).all();

  console.log(rows);


  return res.json({ success: true, allLocations: rows });
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
    return res.json({ success: true, allTitl4es });
  } else {
    return res.json({ success: false });
  }
});


mapRouter.get("/locationPictureById", async (req, res) => {
  const id = req.query.id;

  if (!id) {
    return res.json({ success: false });
  }
  const place = db.prepare("SELECT lat, lon FROM locations WHERE id = ?").get(id);
  console.log(place);
  var foundImage = false;
  var radius = 10;

  var img = null;
  var increase = 10;

  var maxIter = 20;

  var iter = 0;

  while ((!foundImage)&&(maxIter > iter)) {
    // Draw a box where an image might be, might have to add radius (30) if too small
    const dLat = radius / 111_320;
    const dLon = radius / (111_320 * Math.cos((place.lat * Math.PI) / 180));
    const minLon = place.lon - dLon;
    const minLat = place.lat - dLat;
    const maxLon = place.lon + dLon;
    const maxLat = place.lat + dLat;

    const box = `${minLon},${minLat},${maxLon},${maxLat}`;

    console.log(box);

    const u = new URL("https://graph.mapillary.com/images");
    u.searchParams.set("access_token", MAPILLARY_KEY);
    u.searchParams.set("fields", "id,thumb_1024_url,computed_geometry");
    u.searchParams.set("bbox", box);
    u.searchParams.set("limit", "1");

    const response = await fetch(u);

    const sleep = (ms) => new Promise(res => setTimeout(res, ms));

    console.log(response)

    if (!response.ok) {
      console.log("something wrong", response.status);
      return res.status(404).json({success: false});
    }
    const dataAll = await response.json();
    const imgTemp = dataAll.data?.[0];

    if (!imgTemp?.thumb_1024_url) {
      console.log("Found no image, increasing radius");
    } else {
      console.log("Found image")
      foundImage = true;
      img = imgTemp;  
    }
    radius += increase;
    increase += 10;
    iter += 1;
    await sleep(increase/100);
  }

  if (iter > 19) {
    return res.status(404);
  }

  const imgResp = await fetch(img.thumb_1024_url);

  const buf = Buffer.from(await imgResp.arrayBuffer());
  res.setHeader("Content-Type", imgResp.headers.get("content-type") || "image/jpeg");

  return res.end(buf);


});

mapRouter.get("/getByLocation", (req, res) => {
  const location = req.query.place;
  if (!location) {
    return res.json({ success: false });
  }
  const allLocations = db.prepare(`
      SELECT l.*, m.title AS movieTitle
      FROM locations l
      LEFT JOIN movies m ON m.id = l.movie_id
      WHERE l.place LIKE '%' || ? || '%' COLLATE NOCASE
    `)
    .all(location);
  if (allLocations) {
    return res.json({ success: true, allLocations: allLocations });
  } else {
    return res.json({ success: false });
  }
});



mapRouter.get("/getPosterById", async (req, res) => {
  const id = req.query.id;
  const p = path.join(POSTERS_DIR, `${id}.${"jpg"}`);

  res.set("Content-Type", "image/jpeg");
  res.set("Cache-Control", "public, max-age=604800, immutable");

  await fs.access(p);
  res.status(200);
  return res.sendFile(p);
});


export default mapRouter;
