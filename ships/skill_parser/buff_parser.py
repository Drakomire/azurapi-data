import os
import json
from pathlib import Path

buff_identifier = lambda x: f"buff_{x}"
skill_identifier = lambda x: f"skill_{x}"


class BuffParser():
    def __init__(self,id,level=10,frm=[]):
        self.id = id
        self.level = level
        self.frm = frm
        self.valid = True
        try:
            f = open(Path("AzurLaneSourceJson","CN","gamecfg","buff",f"buff_{id}.json"))
            self.data = json.loads(f.read())
            f.close()
        except:
            self.data = {}
            print(f"buff id={id}")

    def wrapper(self):
        if not self.data or buff_identifier(self.id) in self.frm:
            return []
        self.frm += [buff_identifier(self.id)]
        parsed = self.parse()
        return parsed

    def parse(self):
        out = []
        try:
            effect_array = self.data[str(self.level)]
            if type(effect_array) == dict: effect_array = effect_array["effect_list"]
            if len(effect_array) == 0: raise
            if type(effect_array) != list: raise
        except:
            effect_array = self.data["effect_list"]

        for effects in effect_array:
            triggers = effects["trigger"]
            _type = effects["type"]
            arg_list = effects["arg_list"]

            end = None
            if _type == "BattleBuffCastSkill":
                b = SkillParser(arg_list["skill_id"],level=self.level,frm=self.frm)
                end = b.wrapper()
            elif _type == "BattleBuffAddBuff":
                b = BuffParser(arg_list["buff_id"],level=self.level,frm=self.frm)
                end = b.wrapper()
            elif _type == "BattleBuffField":
                b = BuffParser(arg_list["buff_id"],level=self.level,frm=self.frm)
                end = b.wrapper()

            out += [triggers,_type,arg_list,end]

        return out

class SkillParser():
    def __init__(self,id,level=10,frm=[]):
        self.id = id
        self.frm = frm
        self.level = level
        try:
            f = open(Path("AzurLaneSourceJson","CN","gamecfg","skill",f"skill_{id}.json"))
            self.data = json.loads(f.read())
            f.close()
        except:
            self.data = {}
            print(f"skill id={id}")
            pass

    def wrapper(self):
        if not self.data or skill_identifier(self.id) in self.frm:
            return []
        self.frm += [skill_identifier(self.id)]
        parsed = self.parse()
        return parsed

    def parse(self):
        out = []

        try:
            effect_array = self.data[str(self.level)]
            if len(effect_array) == 0: raise
            if type(effect_array) != list: raise
        except:
            effect_array = self.data["effect_list"]

        for effects in effect_array:
            _type = effects["type"]
            arg_list = effects["arg_list"]

            end = None

            if _type == "BattleSkillAddBuff":
                s = BuffParser(arg_list["buff_id"],level=self.level,frm=self.frm)
                end = s.wrapper()

            out += [_type,arg_list,end]

        return out