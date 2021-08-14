## Ship data template


```json
"305062": {                         //This is the ship's ID. The last number is limit break. IDs 900000-901000 are NPC ships.
    "english_name": "IJN Mutsu",    //Ship's name. /^.[A-Z]+ / will target just the ship prefix.
    "armor_type": 3,                //1 = Light, 2 = Medium, 3 = Heavy.
    "tag_list": [                   //Has class tag. Research ships have the "Plan-Class" tag. Meta ships have a tag like "HiryuMETA". Loli and muse ships have the "special" tag.
        "Nagato-Class",
        "Big Seven"
    ],
    "base_list": [                  //THIS IS A FUCKING LIE. More on this later.
        1,
        1,
        1
    ],
    "huntingrange_level": 0,        
    "oxy_cost": 0,                  //Amount of oxy subs drain per second probably.
    "cld_box": [                    
        4,
        5,
        5
    ],
    "attrs": [                      //Base Stats. Info on making them into the ingane stats later.
        1628,
        97,
        0,
        42,
        0,
        53,
        0,
        22,
        6,
        25,
        34,
        0
    ],
    "default_equip_list": [         //Think its the default equips when nothing is equipped. Not what they have when you get them.
        103,
        101,
        104
    ],
    "rarity": 4,                    //Rarity whoa
    "skin_id": 305060,              
    "raid_distance": 0,             //Sub only stat. Not sure what it is.
    "oxy_recovery": 0,              
    "equipment_proficiency": [      //Efficieny. Correct for all ships except retrofit ones.
        1.05,
        2.1,
        1
    ],
    "name": "Mutsu",                //Ingame name
    "fix_equip_list": [],           
    "attrs_growth_extra": [         //Attribute growth level 101-120. Is only not 0 for limit break 4 ships.
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
    ],
    "summon_offset": 0,             
    "scale": 100,
    "ammo": 0,                      //Amount of ammo a sub gives
    "parallel_max": [
        1,
        1,
        1
    ],
    "attrs_growth": [               //Attribute growth between level 1-100
        31915,
        772,
        0,
        676,
        0,
        266,
        0,
        324,
        96,
        0,
        0,
        0
    ],
    "hunting_range": [
        []
    ],
    "star": 3,                      //Stars
    "attack_duration": 0,
    "type": 5,                      //Hull class. `sharecfg/ship_data_type` has if the ship is vanguard, sub, or mainfleet and the ingame name. More stuff too.
    "backyard_speed": "0.3",
    "id": 305062,                   //Ship ID again. Same as what you indexed by.
    "strategy_list_ai": [],
    "oxy_max": 0,                   //Max oxy for subs
    "strategy_list": [],
    "cld_offset": [
        0,
        0,
        0
    ],
    "preload_count": [              //I think this is actually correct
        0,
        0,
        0
    ],
    "depth_charge_list": [],
    "position_offset": [
        0,
        0,
        0
    ],
    "aim_offset": [
        0,
        0,
        0
    ],
    "lock": [
        "torpedo",
        "air",
        "antisub"
    ],
    "oxy_recovery_bench": 0,
    "nationality": 3                //Im not sure where to convert this one
},
```

## Ship data template
```json
"303014": {                         //ID
    "max_level": 100,               //This is useless
    "oil_at_end": 9,
    "star_max": 4,
    "equip_id_3": 0,
    "oil_at_start": 1,
    "equip_id_2": 0,
    "can_get_proficency": 1,
    "equip_5": [                    //Equips types in slot 5, same for others.
        10
    ],
    "type": 3,                      //Ship hull class
    "hide_buff_list": [],
    "equip_4": [
        10
    ],
    "id": 303014,
    "buff_list_display": [          //I think this is the ones that show up
        2011,
        2051,
        22212
    ],
    "group_type": 30301,            //Ship's ID without the last digit
    "equip_3": [
        6
    ],
    "strengthen_id": 30301,         //Can be used in ship_data_strengthen to get how much a certain stat can increase.
    "airassist_time": [],
    "buff_list": [                  //I think this is the buffs that don't have the lock on them
        2011,
        22212
    ],
    "equip_2": [
        5
    ],
    "equip_1": [
        3
    ],
    "energy": 150,
    "equip_id_1": 0,
    "star": 4
},
```

### ship_data_group
Looks to be used in the ship encyclopedia. Can grab how to obtain, property hexagon, and wiki ID.

## PR ships
### Getting efficiency
```js
blueprints = ship_data_blueprint[ship.group_type].strengthen_effect

//Only need to check every 5 levels since other level don't have anything.
for (let i = 4; i <= ((specificShip.id%10)-1)*10; i+=5){
  if (!PR_calculated){
    proficiency = ship_strengthen_blueprint[blueprints[i]].effect_equipment_proficiency
    if (proficiency !== ""){
      specificShip.efficiency[proficiency[0]-1] += proficiency[1]
      specificShip.efficiency[proficiency[0]-1] = Number.parseFloat(Number.parseFloat(specificShip.efficiency[proficiency[0]-1]).toFixed(2))
    }
  }

  //Every 5 prints has a limit break
  for (j of ship_strengthen_blueprint[blueprints[i]].effect_attr){
    if (!PR_calculated){
      specificShip.stats[STAT_KEYWORDS[j[0]]] += j[1]
    }
  }
}
```


## META ships
### getting repair values
`ship_strengthen_meta[ship.group_type]` stores all the repair "nodes" for a meta ship.
`ship_meta_repair[node]` gives the restore value that each node gives.

## Calculate ships stats
`stat = attr + (ship.level-1)*attrs_growth/1000 + (ship.level-100)*(attrs_growth_extra/1000)`
```python
def getOilCostAtLevel(ship):
    #Submarines use a different oil cost equation than other hull classes
    max_cost = Stats.getMaxOilCost(ship)
    if (ship.team_type == "submarine"):
        return math.floor((max_cost+1)*(100+min(ship.level,99))/200)
    else:
        return math.floor(max_cost*(100+min(ship.level,99))/200)+1
```
[More advanced implementation](https://github.com/Drakomire/perseus.py/blob/main/src/perseus/_ships/stats.py)

## Base list for all ships
Ill explain this eventually. TLDR you have to look at the ship's limit breaks because the number in the game can be wrong.
```js
//Make base list dictionary
let dict = {}
compiled[ship.group_type].limit_break_text[lang.toLowerCase()] = []
;dict = (getBreakoutID = (breakout_id,dict) => {
  if (breakout_id == 0) return dict
  let temp_dict = {}
  //Add items to dict
  let this_ship = ship_data_breakout[breakout_id]
  if (this_ship == undefined) return dict
  for (weapon of this_ship.weapon_ids){
    if (temp_dict[weapon] !== undefined){
      temp_dict[weapon]++
    }else{
      temp_dict[weapon] = 1
    }
  }
  compiled[ship.group_type].limit_break_text[lang.toLowerCase()].push(this_ship.breakout_view)
  //take the highest value for the weapon in each dictionary
  dict = Object.assign({},temp_dict,dict)
  //Call function with pre id
  return getBreakoutID(this_ship.pre_id,dict)
})(ship.id-1,{})

let base_list = [
  stat.base_list[0],
  stat.base_list[1],
  stat.base_list[2],
]
```

### Skills and All Out Assaults.
Luckily they can be filtered. I 100% reccomend doing this because when the user wants to grab a skill at a certain level they won't have the issue where some go to level 2 and some go to level 10.
```js
function skillIsAoA(buff_id){
    return buff_id > 20000 && buff_id < 30000
}
```

## ship_skin_template
Index sublist like any other one. Skin name and description are here.