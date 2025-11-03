import sqlite3

conn = sqlite3.connect('database.db')

cur = conn.cursor()
conn.execute("PRAGMA foreign_keys=ON")


lat, lon = 59.3468917, 18.073541

cur.execute("INSERT INTO movies (id, title, genre, year, runtime, plot) VALUES (?, ?, ?, ?, ?, ?)", ("tt1337", "Absolute Cinema: VICtorius", "Action", "2025", "90","A group of students work late nights trying make their deadlines"))

cur.execute("INSERT INTO locations (id, movie_id, lat, lon, place, info) VALUES (?, ?, ?, ?, ?, ?)", (13371337, "tt1337", lat, lon, "Lindstedtsvägen 5 Stockholm", "Where the headscratching began"))
conn.commit()
