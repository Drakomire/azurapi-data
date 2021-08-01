import json
import requests
import copy

f = open("dist/ships/ships.json")
ships = json.loads(f.read())
f.close()

res = requests.get("https://raw.githubusercontent.com/AzurAPI/azurapi-js-setup/master/ships.json")
azurapi_data = json.loads(res.content)

def getShipByID(id):
    global azurapi_data
    for i in azurapi_data:
        if id == i["_gid"]:
            return i
        else:
            continue

for ship in ships:
    skins = ships[ship]["skins"]
    api_ship = getShipByID(ships[ship]["id"])

    #Reorder the ship's skins

    new_end = {

    }

    for index,skin in enumerate(skins):
        if "_h" in skin["id"]:
            #Skin is a Retrfofit skin
            new_end["retrofit"] = copy.deepcopy(skin)
            ships[ship]["skins"].pop(index)
    for index,skin in enumerate(skins):
        if "_g" in skin["id"]:
            #Skin is a wedding skin
            new_end["wedding"] = copy.deepcopy(skin)
            ships[ship]["skins"].pop(index)

    if "retrofit" in new_end: ships[ship]["skins"] += [new_end["retrofit"]]
    if "wedding" in new_end: ships[ship]["skins"] += [new_end["wedding"]]

    try:
        for skin in api_ship["skins"]:
            if skin["name"] == "Default":
                ships[ship]["skins"][0]["image"] = skin["image"]
            else:
                for count,val in enumerate(ships[ship]["skins"]):
                    if val["name"] == skin["name"]:
                        ships[ship]["skins"][count]["image"] = skin["image"]

        #add the retrofit image
        loc_from_end = -1
        if "retrofit" in ships[ship]:
            if "image" not in ships[ship]["skins"][-1]:
                ships[ship]["skins"][-1]["image"] = f"https://raw.githubusercontent.com/AzurAPI/azurapi-js-setup/master/images/skins/{api_ship['id']}/Retrofit/image.png"
            loc_from_end = -2

        if "image" not in ships[ship]["skins"][loc_from_end]:
            ships[ship]["skins"][loc_from_end]["image"] = f"https://raw.githubusercontent.com/AzurAPI/azurapi-js-setup/master/images/skins/{api_ship['id']}/Wedding/image.png"

    except:
        pass

f = open("dist/ships/ships.json","w")
f.write(json.dumps(ships,ensure_ascii=False,indent='\t'))
f.close()