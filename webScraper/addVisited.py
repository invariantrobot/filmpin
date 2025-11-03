import sqlite3
import random


db = sqlite3.connect("database.db")

cur = db.cursor()

cur.execute("PRAGMA foreign_keys = ON")

try:
    cur.execute("ALTER TABLE locations ADD COLUMN visited INT;")
except sqlite3.OperationalError:
    pass

ids = cur.execute("SELECT id FROM locations").fetchall()

for id in ids:
    number = random.randint(0, 500)
    cur.execute("UPDATE locations SET visited = ? WHERE id = ?", (number, id[0]))
    db.commit()

cur.close()


