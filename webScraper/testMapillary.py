import requests, os


lat, lon = 59.334591, 18.063240

seqs = requests.get(
    "https://kartaview.org/api/0.1/sequence/nearby",
    params={"lat": lat, "lng": lon, "distance": 100}
)
print(seqs)

for seq in seqs.get("sequences", []):
    print("Sequence:", seq["id"], "photos:", seq["photoCount"])

    photos = requests.get(
        f"https://kartaview.org/api/0.1/sequence/{seq['id']}/photos"
    )

    for p in photos[:5]:  # limit for demo
        print(p["id"], p["thumbnail_url"])
        img = requests.get(p["thumbnail_url"])
        with open(f"photo_{p['id']}.jpg", "wb") as f:
            f.write(img.content)
