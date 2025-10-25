import requests
import sqlite3
import time
import pathlib

conn = sqlite3.connect("database.db")
cur = conn.cursor()
cur.execute("PRAGMA foreign_keys = ON")

try:
    cur.execute("ALTER TABLE movies ADD COLUMN plot TEXT;")
except sqlite3.OperationalError:
    pass

ids = cur.execute("SELECT id FROM movies").fetchall()

with open("omdb.txt", "r") as f:
    omdb_key = f.readline().strip()

for i, (movie_id,) in enumerate(ids, start=1):
    url = "http://www.omdbapi.com/"
    params = {
        "apikey": omdb_key,
        "i": movie_id,
        "r": "json",
        "plot": "short",
    }

    try:
        r = requests.get(url, params=params, timeout=15)
        r.raise_for_status()
        data = r.json()

        if data.get("Response") == "True":
            plot = data.get("Plot", "")
            cur.execute("UPDATE movies SET plot = ? WHERE id = ?", (plot, movie_id))
            conn.commit()
            print(f"[{i}] Updated {movie_id}")
        else:
            print(f"[{i}] No plot for {movie_id}: {data.get('Error')}")

    except Exception as e:
        print(f"[{i}] Error fetching {movie_id}: {e}")

    time.sleep(10)

conn.close()
print("Done!")
