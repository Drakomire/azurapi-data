from os import EX_CANTCREAT
from skill_parser.buff_parser import BuffParser
import json

#Generate list of all ship skills
f = open("../dist/ships/ships.json")
ships = json.loads(f.read())
f.close()

skills_out = {}

for _ in ships:
    ship = ships[_]
    for skill in ship["skills"]:
        b = BuffParser(skill["id"])
        try:
            skills_out[skill["id"]] = b.wrapper()
        except:
            print(skill["id"])

f = open("../dist/ships/skills.json","w")
f.write(json.dumps(skills_out,ensure_ascii=False,indent=4))
f.close()


    # "buff_list_display": [
    #   11310,
    #   11420
    # ],