from skill_parser.buff_parser import BuffParser
import os
from pathlib import Path
import json

ships_file_path = Path("dist","ships","ships.json")
ships_file = open(ships_file_path,"r")
ships_json = json.loads(ships_file.read())

def parseAllLevels(skill_id):
    out = []
    for i in range(10):
        level = i + 1
        b = BuffParser(skill_id,level=level)
        out += [b.wrapper()]
    return out

for _ in ships_json:
    ship = ships_json[_]
    for skill in ship["skills"]:
        skill_id = skill["id"]
        # skills = parseAllLevels(skill_id)
        # print(skills)
        b = BuffParser(skill_id)
        skill["game_effect"] = b.wrapper()

ships_file = open(ships_file_path,"w")
ships_file.write(json.dumps(ships_json,ensure_ascii=False,indent=4))