import time, requests
import pickle as pk

with open("locationDataset.pk", 'rb') as f:
    locationSet = pk.load(f)



session = requests.Session()
session.headers.update({
    "User-Agent": "morca-moths-locationfinder/0.1 (+mailto:Osvalds@kth.se)",
    "Referer": "https://github.com/poskusen" 
})

newLocationCoordinates = {}
iter = 0
found = 0

for title in locationSet.keys():
    locations = locationSet[title]
    newLocations = []
    for location in locations:
        q = location[0]
        r = session.get(
            "https://nominatim.openstreetmap.org/search",
            params={
                "q": q,
                "format": "json",
                "limit": 1,
                "addressdetails": 0,
                "email": "osvalds@kth.se",
            },
            timeout=15,
        )
        if r.status_code == 429:
            time.sleep(2.5)
            r = session.get(r.request.url, timeout=15)
        data = r.json()
        time.sleep(1.1)
        if not data:
            try: 
                nofound = True
                itery = 1
                components = q.split(",")
                while nofound and itery < 6:
                    newq = ','.join(components[itery:])
                    r = session.get(
                        "https://nominatim.openstreetmap.org/search",
                        params={
                            "q": newq,
                            "format": "json",
                            "limit": 1,
                            "addressdetails": 0,
                            "email": "osvalds@kth.se",
                        },
                        timeout=15,
                    )
                    time.sleep(1.1)
                    data = r.json()
                    if not data:
                        itery += 1
                    else: 
                        location.append(data[0]["display_name"])
                        location.append([float(data[0]["lat"]), float(data[0]["lon"])])
                        newLocations.append(location)
                        nofound = False
                        found += 1
            except Exception as e:
                print(e)
            if itery >= 6:
                print(f"could not find {q}")
        else:
            if found%10 == 0:
                print(f"found {found} places")
            location.append(data[0]["display_name"])
            location.append([float(data[0]["lat"]), float(data[0]["lon"])])
            newLocations.append(location)
            found += 1
    newLocationCoordinates[title] = newLocations
    iter += 1
    print(f"Done with {iter}/{len(locationSet)} titles")


with open("cordinates.pk", 'wb') as f:
    pk.dump(newLocationCoordinates, f)