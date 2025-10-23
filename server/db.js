
import Database from "better-sqlite3";
const db = new Database("database.db");
db.pragma("foreign_keys = ON");
export default db;