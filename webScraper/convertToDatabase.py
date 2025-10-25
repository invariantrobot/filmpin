import sqlite3
import polars as pl
import pickle as pk

conn = sqlite3.connect('database.db')


titlesFrame = pl.read_csv(r"../title.basics.tsv", separator = "\t", null_values="\\N", quote_char=None)

with open("cordinates.pk", "rb") as f:
    locations = pk.load(f)

cur = conn.cursor()
conn.execute("PRAGMA foreign_keys=ON")

cur.execute("CREATE TABLE IF NOT EXISTS movies(id TEXT PRIMARY KEY, title TEXT NOT NULL, genre TEXT, year TEXT, runTime TEXT)")

cur.execute("CREATE TABLE IF NOT EXISTS locations(id INTEGER PRIMARY KEY, movie_id TEXT NOT NULL, lat REAL, lon REAL, place TEXT, info TEXT, FOREIGN KEY(movie_id) REFERENCES movies(id))")
iter = 0
for id in locations:
    titleFrame = titlesFrame.filter(pl.col("tconst") == id)
    title = titleFrame.select("primaryTitle").to_series().to_list()[0]
    genre = titleFrame.select("genres").to_series().to_list()[0].split(",")[0]
    year = titleFrame.select("startYear").to_series().to_list()[0]
    runtime = titleFrame.select("runtimeMinutes").to_series().to_list()[0]
    cur.execute(
        "INSERT INTO movies (id, title, genre, year, runTime) VALUES (?, ?, ?, ?, ?)",
        (id, title, genre, year, runtime)
    )

    allLocations = locations[id]
    for location in allLocations:
        place = location[0]
        coordinates = location[-1]
        lat = coordinates[0]
        lon = coordinates[1]
        info = location[1]
        cur.execute(
            "INSERT INTO locations (movie_id, lat, lon, place, info) VALUES (?, ?, ?, ?, ?)",
            (id, lat, lon, place, info)
        )
    conn.commit()
    iter += 1
    print("Done with: " +  str(iter/len(locations)) + "%")

print("Finished")
        





