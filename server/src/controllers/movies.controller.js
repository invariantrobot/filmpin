import { Router } from "express";
import db from "../../db.js";

const mapRouter = Router();

mapRouter.get("/getAllTitles", (req, res) => {
  const allMovies = db.prepare('SELECT * FROM movies').all()
  return res.json({ success: true, allMovies });
});

mapRouter.get("/getAllLocations", (req, res) => {
  const allMovies = db.prepare('SELECT * FROM locations').all()
  return res.json({ success: true, allMovies });
});

mapRouter.get("/getLocationsByID", (req, res) => {
  const IDS = req.query.id;
  const locations = {};
  for (const id of IDS) {
    locationsTitle = db.prepare('SELECT * FROM locations WHERE movieid = ?').all(id);
    locations[id] = locationsTitle;
  };
  return res.json({ success: true, locations });
});

mapRouter.get("/getTitleByGenre", (req, res) => {
  const {genre} = req.query;
  const allMovies = db.prepare('SELECT * FROM movies WHERE genre = ?').all(genre)
  return res.json({ success: true, allMovies });
});

mapRouter.get("/getGenres", (req, res) => {
  const genres = db.prepare('SELECT DINSTINCT genre FROM movies').all()
  return res.json({ success: true, genres });
});

mapRouter.get("/getClose", (req, res) => {
  const location = req.query.coordinates;
  const distance = req.query.distance;
  const places = db.prepare('SELECT * FROM locations WHERE lat BETWEEN ? AND ? AND lon BETWEEN ? AND ?').all(location[0] - distance, location[0] + distance, location[1] - distance, location[1] + distance)
  if (places) {
    return res.json({ success: true, places });
  } else {
    return res.json({success : false});
  }
  
});

mapRouter.get("/getByTitle", (req, res) => {
  const title = req.query.title;
  if (!title) {
    return res.json({success : false});
  }
  const allTitles = db.prepare("SELECT * FROM movies WHERE title LIKE '%' || ? || '%' COLLATE NOCASE").all(title);
  if (allTitles) {
    return res.json({ success: true, allTitles});
  } else {
    return res.json({success : false});
  }
  
});

mapRouter.get("/getByLocation", (req, res) => {
  const location = req.query.place;
  if (!location) {
    return res.json({success : false});
  }
  const allLocations = db.prepare("SELECT * FROM locations WHERE place LIKE '%' || ? || '%' COLLATE NOCASE").all(location);
  if (allLocations) {
    return res.json({ success: true, allLocations});
  } else {
    return res.json({success : false});
  }
});

export default mapRouter;