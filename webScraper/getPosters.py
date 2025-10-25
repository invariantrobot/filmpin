import requests
import sqlite3
import time
import pathlib

conn = sqlite3.connect('database.db')

cur = conn.cursor()
conn.execute("PRAGMA foreign_keys=ON")

ids = conn.execute("SELECT id FROM movies")


omdb_key = ''
with open("omdb.txt", 'r') as f:
    omdb_key = f.readline()
iter = 0

for id in ids:
    id = id[0]

    out = pathlib.Path("posters")
    out.mkdir(parents=True, exist_ok=True)

    path = out / f"{id}.jpg"
    if path.exists():
        print("skipping")
        continue
    url = "http://img.omdbapi.com/"
    params = {"apikey": omdb_key, "i": id} 
    r = requests.get(url, params=params, timeout=15)
    try:
        r.raise_for_status()
        
    except:
        print("error")

    ctype = (r.headers.get("content-type") or "").lower()
    if "png" in ctype:
        ext = ".png"
    elif "webp" in ctype:
        ext = ".webp"
    else:
        ext = ".jpg"  # default

    

    
    path.write_bytes(r.content)
    iter += 1
    print("Done with", iter)

    time.sleep(3)