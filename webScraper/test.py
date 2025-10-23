import pickle as pk

with open("cordinates.pk", 'rb') as f:
    locationSet = pk.load(f)
print(locationSet)