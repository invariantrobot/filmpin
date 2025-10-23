import "dotenv/config";
import Database from "better-sqlite3";


const posterCache = new Map();
const plotCache = new Map();
const db = new Database("database.db");
db.pragma("foreign_keys = ON");
const OMDB_KEY = process.env.OMDB_KEY;
console.log(OMDB_KEY);
export default {db, OMDB_KEY, posterCache, plotCache};