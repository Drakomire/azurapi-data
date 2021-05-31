#This file downloads the required images from the Azur Lane Wiki
#In the future this will be automated by decompiling the game
#But I didn't get to that yet

import urllib.request
import json
import os
import io
from PIL import Image
from bs4 import BeautifulSoup

f = open("dist/ships.json","r");
ships = json.loads(f.read());

exists = 0
added = 0

for ship in ships:
    ship = ships[ship]
    try:
        name = ship["name"]["en"].replace(" ","_")
        #Check if file has been downloaded
        downloads = ["Icon","ShipyardIcon"]
        #Check if the ship has a retrofit
        if "retrofit" in ship:
            downloads += ["KaiIcon"]

        for download in downloads:
            if (os.path.exists(f"dist/shipIcon/{name}/{downloads}.png")):
                exists += 1
            else:
                d = urllib.request.urlopen(f"https://azurlane.koumakan.jp/File:{name}{download}.png#/media/File:{name}{download}.png")
                image = Image.open(io.BytesIO(d.read()))
                print(image.decode("utf-8"))
                image.save(f"dist/shipIcon/{name}/{downloads}.png")
                added += 1

    except KeyError:
        print("Ship has been skipped due to no EN name")
    except Exception as e:
        print(f"https://azurlane.koumakan.jp/File:{name}{download}.png#/media/File:{name}{download}.png")
        print(e)
        break


print(exists, "images unchanged")
print(added, "images downloaded")
