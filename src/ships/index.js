const fs = require("fs");
const path = require("path");
const stringify = require("json-stringify-pretty-compact");
const { error } = require("console");
const { getHeapSpaceStatistics } = require("v8");

const RARITY = {
    2: "Common",
    3: "Rare",
    4: "Elite",
    5: "Super Rare",
    6: "Ultra Rare",
    7: "DNE"
};

const RESEARCH_RARITY = {
  5: "Priority",
  6: "Decisive"
}

const NATIONALITY = {
    0: "Universal", 1: "Eagle Union", 2: "Royal Navy",
    3: "Sakura Empire", 4: "Iron Blood", 5: "Dragon Empery",
    6: "Sardegna Empire", 7: "Northern Parliament", 8: "Iris Libre",
    9: "Vichya Dominion", 98: "Universal", 101: "Neptunia",
    104: "Kizuna AI", 105: "Hololive", 106: "DOAX11",
    107: "IMAS"
};

const STAT_KEYWORDS = {
  "durability": "hp",
  "cannon" : "fp",
  "antiaircraft" : "aa",
  "torpedo" : "trp",
  "air" : "avi",
  "reload" : "rld",
  "dodge" : "eva",
  "hit" : "acc"
}

const ARMOR_TYPES = {
  1 : "Light",
  2 : "Medium",
  3 : "Heavy"

}

const EQUIP_TYPE_NAMES = {
  1 : "DD Gun",
  2 : "CL Gun",
  3 : "CA Gun",
  4 : "BB Gun",
  5 : "Torpedo",
  6 : "AA Gun",
  7 : "Fighter",
  8 : "Torpedo Bomber",
  9 : "Dive Bomber",
  10 : "Auxiliary",
  11 : "CB Gun",
  12 : "Seaplane",
  13 : "Submarine Torpedo",
  14 : "ASW Gear",
  15 : "ASW Bomber",
  18 : "Cargo"
}

let TYPES = {};
let PR_calculated = false;
let META_calculated = false;
let compiled = {};
let lookup_table = {};
let retrofit_id_lookup_table = {};
//Ships show up 4 times as actual ships then one or more times as a NPC if they are one
let ship_reccurence = {};

const HEXAGON_RANK = {
    'S': 5, 'A': 4, 'B': 3, 'C': 2, 'D': 1, 'E': 0,
};

const FAKE_SHIPS = [900042, 900045, 900046, 900162, 900913, 900914].map(i => String(i));

function makeArray(w, h, val) {
  var arr = [];
  for(let i = 0; i < h; i++) {
      arr[i] = [];
      for(let j = 0; j < w; j++) {
          arr[i][j] = val;
      }
  }
  return arr;
}

let TYPES_EN = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", "EN", "sharecfg", "ship_data_by_type.json")).toString());
let TYPES_JP = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", "JP", "sharecfg", "ship_data_by_type.json")).toString());
let TYPES_CN = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", "CN", "sharecfg", "ship_data_by_type.json")).toString());



function readFilesFromLanguage(lang = "EN") {
    let groups = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", "ship_data_group.json")).toString());
    let ships = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", "ship_data_template.json")).toString());
    let stats = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", "ship_data_statistics.json")).toString());
    let ship_strengthen = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", "ship_data_strengthen.json")).toString());

    let ship_data_blueprint = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", "ship_data_blueprint.json")).toString());
    let ship_strengthen_blueprint = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", "ship_strengthen_blueprint.json")).toString());
    let ship_data_breakout = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", "ship_data_breakout.json")).toString());


    let ship_meta_repair = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", "ship_meta_repair.json")).toString());
    let ship_meta_repair_effect = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", "ship_meta_repair_effect.json")).toString());
    let ship_strengthen_meta = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", "ship_strengthen_meta.json")).toString());

    let types = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", "ship_data_by_type.json")).toString());
    let retrofit = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", "ship_data_trans.json")).toString());
    let transform_data_template = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", "transform_data_template.json")).toString());

    let skill_data_display = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", "skill_data_display.json")).toString());
    let skill_data_template = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", "skill_data_template.json")).toString());
    let ship_skin_template = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", "ship_skin_template.json")).toString());

    let equip_data_statistics = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", "equip_data_statistics.json")).toString());
    files = fs.readdirSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", "equip_data_statistics_sublist"))
    let equip_data_statistics_sublist = Array(files.length)

    files.forEach((file) => {
      // Do whatever you want to do with the file
      let index = file.split("_")[3].split(".")[0]-1
      equip_data_statistics_sublist[index] = (JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", "equip_data_statistics_sublist", file)).toString()))
    })
    


    ;[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 17, 18, 19].forEach(type => {
        if (!TYPES[type]) TYPES[type] = {};
        if (!TYPES[type][lang.toLowerCase()]) TYPES[type][lang.toLowerCase()] = types[type].type_name.trim();
    })
    for (let id of Object.keys(groups)) {
      if (id === "all") continue;
        let group = groups[id];
        let ship = compiled[group.group_type];
        if (!ship) compiled[group.group_type] = ship = {
          id: group.group_type,
          code: group.code,
          
          name: {},
          property_hexagon: group.property_hexagon.map(char => HEXAGON_RANK[char]),
          
          type: group.type,
          armor: null,
          armor_name: null,
          nationality: group.nationality,
          nationality_name: NATIONALITY[group.nationality] || "Unknown",
          data: {},
          limit_break_text: {},
          skills: [],
          all_out_assaults: [],
        };

      }
      
      for (let id of Object.keys(ships)) {

        if (id === "all") continue;
        let ship = ships[id];
        let stat = stats[id];
        let strengthen = ship_strengthen[Math.floor(id/10)]

        if (!ship || !stat) continue; // ship not here / not complete

        //Attempt to remove NPCs
        if (id > 900000 && id < 901000) continue

        stat.english_name = stat.english_name.trim()
            .replace('Ultra Bulin MKIII', 'Specialized Bulin Custom MKIII')
            .replace('.META', ' META')
            .replace('Große', 'Grosse');// special cases
        stat.name = stat.name.trim();
        if (stat.english_name === "simulation") continue; // simulation ship
        if (stat.english_name.length === 0) continue; // unknown ship
        if (FAKE_SHIPS.includes(id)) continue;

        //Fuck Kasumi DOA. She makes me do this weird thing to change her name.
        if (stat.name == "Kasumi" && stat.tag_list.includes("DOAXVV")){
          stat.name = "Kasumi (DOA)"
        }
        
        let code_name_to_english_name = ""
        //Add ship to lookup table. Only use first occurance.
        if (lookup_table[stat.name.toLowerCase()] === undefined){
          //Remove the faction text from the code
          lookup_table[stat.name.toLowerCase()] = (id-id%10)/10;

          code_name_to_english_name = stat.english_name.replace(/^.[A-Z]+ /,'')

          if (!stat.tag_list.includes("special") && lookup_table[code_name_to_english_name] == undefined){
            lookup_table[code_name_to_english_name.toLowerCase()] = (id-id%10)/10;
          }
        }

        // compiled[ship.group_type].rarity.push(rarity[stat.rarity])
        if (compiled[ship.group_type].nationality !== stat.nationality) continue; // pseudo ship
        compiled[ship.group_type].stars = ship.star_max
        //Add skills
        skillIsAoA = (buff_id) =>{
          return buff_id > 20000 && buff_id < 30000
        }

        aoaIncludesID = (list, id) =>{
          for (i of list){
            if (i.id == id){
              return true
            }
          }
          return false
        }

        for (let i = compiled[ship.group_type].skills.length; i<ship.buff_list_display.length; i++){
          //AoAs will be added to a different list to make parsing easier
          buff_id = ship.buff_list_display[i]
          let icon = `https://raw.githubusercontent.com/Lunarmagpie/AzurLaneAssetDump/master/assets/artresource/atlas/skillicon/${Math.floor(buff_id/10)*10}.png`
          if (skillIsAoA(buff_id)){
            //Skill is an AoA
            if (!aoaIncludesID(compiled[ship.group_type].all_out_assaults, buff_id)){
              compiled[ship.group_type].all_out_assaults.push(
                {
                  id: buff_id,
                  icon: icon,
                  name: {},
                  desc: {}
                }
              )
            }
          }else{
            //Skill is not an AoA
            compiled[ship.group_type].skills.push(
              {
                id: buff_id,
                icon: icon,
                name: {},
                desc: {},
                desc_add: []
              }
            )
          }
        }

        for (i in ship.buff_list_display){
          buff_id = ship.buff_list_display[i]
          if (!skillIsAoA(buff_id)){
            compiled[ship.group_type].skills[i].name[lang.toLowerCase()] = skill_data_template[buff_id].name
            compiled[ship.group_type].skills[i].desc[lang.toLowerCase()] = skill_data_template[buff_id].desc
            compiled[ship.group_type].skills[i].desc_add = skill_data_template[buff_id].desc_add
          }
        }

        for (i in compiled[ship.group_type].all_out_assaults){
          buff_id = compiled[ship.group_type].all_out_assaults[i].id
          compiled[ship.group_type].all_out_assaults[i].name[lang.toLowerCase()] = skill_data_template[buff_id].name
          compiled[ship.group_type].all_out_assaults[i].desc[lang.toLowerCase()] = skill_data_template[buff_id].desc

        }
        

        //Add retrofit info
        if (retrofit[ship.group_type] !== undefined){
          //Only generates list once to prevent overwriting names
          if (compiled[ship.group_type].retrofit === undefined){
            let l = retrofit[ship.group_type].transform_list;
            let o = []
            for (i in l){
              for (j in l[i]){
                node = l[i][j][1]
                this_node = transform_data_template[node]

                o.push({
                    "node" : node,
                    "x" : parseInt(i),
                    "y" :  l[i][j][0]-2,
                    "recurrence" : this_node.effect.length,
                    "icon" : `https://raw.githubusercontent.com/Lunarmagpie/AzurLaneAssetDump/master/assets/artresource/atlas/modicon/${transform_data_template[l[i][j][1]].icon.toLowerCase()}.png`,
                    "next_nodes" : [],
                    "required_nodes" : this_node.condition_id,
                    "letter" : String.fromCharCode(l[i][j][1]%100 + 64), //Convert number to ascii code for the letter

                    //Built in info
                    "max_level" : this_node.max_level,
                    "use_ship"  : this_node.use_ship,
                    "gear_score": this_node.gear_score,
                    "use_gold": this_node.use_gold,
                    "skin_id": this_node.skin_id,
                    "description": {"en": "","jp":"","cn":""},
                    "use_item": this_node.use_item,
                    "skill_id": this_node.skill_id,
                    "effect": this_node.effect,
                    "ship_id": this_node.ship_id,
                    "name": {"en": "","jp":"","cn":""},
                    "condition_id": this_node.condition_id,
                    "star_limit": this_node.star_limit,
                    "level_limit": this_node.level_limit
                })
              }
            }

            //Calculate the next nodes
            for (i in o){
              nodes = o[i].required_nodes
              for (n of nodes){
                o[n%100-1].next_nodes.push(o[i].node)
              }
            }

            compiled[ship.group_type].retrofit = o;
            let retroArr = o;

            //Get ships retrofit ID
            for (i of o){
              let t_data = transform_data_template[i.node];
              
              if (t_data.ship_id.length != 0){
                let retrofit_id = compiled[ship.group_type].retrofit_id = t_data.ship_id[0][1];
                let old_id = t_data.ship_id[0][0];

                retrofit_id_lookup_table[(retrofit_id-retrofit_id%10)/10] = (old_id-old_id%10)/10;
              }

            }
          }

          //Add the name and description to retrofit nodes
          let l = retrofit[ship.group_type].transform_list;
          for (i in l){
            for (j in l[i]){
            n = l[i][j][1]
            this_node = transform_data_template[n]

            compiled[ship.group_type].retrofit[n%100-1].name[lang.toLowerCase()] = this_node.name
            compiled[ship.group_type].retrofit[n%100-1].description[lang.toLowerCase()] = this_node.descrip


            }
          }
        }



        // https://github.com/minhducsun2002/boomer/blob/92c21b3624b539068ef3758d7f4c879fc8401952/src/db/al/models/ship_data_statistics.ts
        let [hp, fp, trp, aa, avi, rld, _, acc, eva, spd, luk, asw] = stat.attrs;

        let specificShip = compiled[ship.group_type].data[ship.id];
        //The game does not automatically increase a ship's rarity by one when its retrofitted
        // let real_ratity = stat.rarity + ((compiled[ship.group_type].retrofit_id == stat.id)? 1:0)
        if (!specificShip) compiled[ship.group_type].data[ship.id] = specificShip = {
            id: ship.id,
            tags: stat.tag_list.length > 0 ? stat.tag_list : undefined, // save space
            type: ship.type,
            type_name: {},
            team_type: types[ship.type].team_type,
            rarity: stat.rarity,
            rarity_name: (stat.tag_list.includes("Plan-Class"))? RESEARCH_RARITY[stat.rarity] : RARITY[stat.rarity],
            retrofit_rarity: stat.rarity + 1,
            retrofit_rarity_name: RARITY[stat.rarity + 1],
            stars: ship.star,
            slots: [1, 2, 3, 4, 5].map(i => ship["equip_" + i]),
            slot_names: [1, 2, 3, 4, 5].map(i => ship["equip_" + i].map(number => EQUIP_TYPE_NAMES[number])),
            oil: ship.oil_at_end,
            max_level: ship.max_level,
            stats: {hp, fp, trp, aa, avi, rld, acc, eva, spd, luk, asw},
            efficiency : stat.equipment_proficiency,
            preloads : stat.preload_count
        }

        //For some reason BBVs have incorrect slot 2s on retrofit
        //It has to be changed to Seaplane only manually
        if (specificShip.type == 10){
          specificShip.slots[1] = [12]
        }

        compiled[ship.group_type].data[ship.id].type_name["en"] = TYPES_EN[ship.type].type_name
        compiled[ship.group_type].data[ship.id].type_name["jp"] = TYPES_JP[ship.type].type_name
        compiled[ship.group_type].data[ship.id].type_name["cn"] = TYPES_CN[ship.type].type_name


        //Gets the amount of baes from either the statistic list or limit break list depending on if it is defined correctly
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

        for (let weapon in dict){
          let sublist_index = equip_data_statistics.indexs[weapon] - 1
          let type = equip_data_statistics_sublist[sublist_index][weapon].type
          //Undefined weapons are barrages
          if (type !== undefined){
            for (i in specificShip.slots){
              if (specificShip.slots[i].includes(type)){
                base_list[i] = Math.max(dict[weapon],base_list[i])
              }
            }
          }
        }

        // console.log(base_list)
        compiled[ship.group_type].data[ship.id].base_list = base_list
        compiled[ship.group_type].data[ship.id].stats.oxy = stat.oxy_max

        if (stat.hunting_range.length > 1){
          hunting_range = makeArray(7,7,-1)
          stat.hunting_range.forEach((val, index)=>{
            for (coordnates of val){
              hunting_range[coordnates[0]+3][coordnates[1]+3] = index+1
            }
          })
          hunting_range[3][3] = 0


          compiled[ship.group_type].hunting_range = hunting_range
        }else{
          compiled[ship.group_type].hunting_range = null
        }

        //Add custom PR and META tags
        //These make indexing easier
        if (specificShip.tags !== undefined){
          if (specificShip.tags.includes("Plan-Class") && !specificShip.tags.includes("Research")){
            specificShip.tags.push("Research");
          }
          if (specificShip.tags.join(" ").includes("META") && !specificShip.tags.includes("META")){
            specificShip.tags.push("META");
          }
        }

        [hp, fp, trp, aa, avi, rld, _, acc, eva, spd, luk, asw] = stat.attrs_growth;
        specificShip.stats_growth = {hp, fp, trp, aa, avi, rld, acc, eva, spd, luk, asw};
        [hp, fp, trp, aa, avi, rld, _, acc, eva, spd, luk, asw] = stat.attrs_growth_extra;
        specificShip.stats_growth_extra = {hp, fp, trp, aa, avi, rld, acc, eva, spd, luk, asw};
        //Normal ship and PR blueprint strengthening

        if (strengthen !== undefined && compiled[ship.group_type].enhancement === undefined){
          [fp,trp,_,avi,rld] = strengthen.durability;
          compiled[ship.group_type].enhancement = {fp,trp,avi,rld};
        }else{
          // console.log(stat.english_name)
        }

        if (specificShip.tags !== undefined){
          //PR limit break strengthening
          if (specificShip.tags.includes("Research")){
            //Open the PR file
            blueprints = ship_data_blueprint[ship.group_type].strengthen_effect

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
          }

          if (specificShip.tags.includes("META") && !META_calculated){
            //Meta ship enhancement was not set before
            //It is more complicated than normal ships
            compiled[ship.group_type].enhancement = {"fp":0,"avi":0,"trp":0,"avi":0,"rld":0,"hp":0,"aa":0,"acc":0,"eva":0}

            //Open the META reapair file
            repair_cannon = ship_strengthen_meta[ship.group_type].repair_cannon || []
            repair_torpedo = ship_strengthen_meta[ship.group_type].repair_torpedo || []
            repair_air = ship_strengthen_meta[ship.group_type].repair_air || []
            repair_reload = ship_strengthen_meta[ship.group_type].repair_reload || []

            repair_all = []
            
            for (i of [repair_cannon,repair_torpedo,repair_air,repair_reload]){
              try{
                repair_all.concat(i)
              }catch{
                //can be dict if empty
              }
            }

            for (effect of repair_all){
                j = ship_meta_repair[effect].effect_attr
                compiled[ship.group_type].enhancement[STAT_KEYWORDS[j[0]]] += j[1]

            }

            //Get repair effects array
            repair_effects = ship_strengthen_meta[ship.group_type].repair_effect
            for (effect of repair_effects){
              for (j of ship_meta_repair_effect[effect[1]].effect_attr){
                compiled[ship.group_type].enhancement[STAT_KEYWORDS[j[0]]] += j[1]
              }
            }
          }
        }

        //Add ship images
        if (compiled[ship.group_type].skins === undefined){
          let skin_ids = ship_skin_template["get_id_list_by_ship_group"][(id - id % 10)/10]
          let skin_portaits = []

          if (skin_ids !== undefined)
          for (skin_id of skin_ids){
            //Open the sublist
            let sublist = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", "ship_skin_template_sublist",`ship_skin_template_${ship_skin_template.indexs[skin_id]}.json`)).toString());
            let skin = sublist[skin_id]
            skin_portaits.push({
              "id" : skin.painting,
              "name" : skin.name,
              "description" : skin.desc,
              "image" : undefined,
              "thumbnail" : `https://raw.githubusercontent.com/Lunarmagpie/AzurLaneAssetDump/master/assets/artresource/atlas/squareicon/${skin.painting.toLowerCase()}.png`,
              "chibi" : `https://raw.githubusercontent.com/Lunarmagpie/AzurLaneAssetDump/master/assets/artresource/atlas/shipmodels/${skin.painting.toLowerCase()}.png`
            })
          }
          compiled[ship.group_type].skins = skin_portaits
        }

        if (specificShip.type !== ship.type) console.log("SHIP TYPE NOT MATCH ", id, ship.group_type, stat.name, lang);

        let armor = stat.armor_type;
        if (!compiled[ship.group_type].armor) compiled[ship.group_type].armor = armor;
        if (compiled[ship.group_type].armor !== armor) specificShip.armor = armor;
        compiled[ship.group_type].armor_name = ARMOR_TYPES[armor]

        stat.name = stat.name.trim();
        if (!compiled[ship.group_type].name[lang.toLowerCase()]) compiled[ship.group_type].name[lang.toLowerCase()] = stat.name.trim();
        if (compiled[ship.group_type].name[lang.toLowerCase()] !== stat.name.trim()) { // name not matching, probably retrofit
            if (!specificShip.name) specificShip.name = {};
            specificShip.name[lang.toLowerCase()] = stat.name.trim();
        }
        if (compiled[ship.group_type].name.code && compiled[ship.group_type].name.code.toLowerCase() !== stat.english_name.toLowerCase()) {
            // override
            if (stat.name === stat.english_name || stat.english_name.includes(stat.name)) compiled[ship.group_type].name.code = stat.english_name;
            else {

            }
        }
        compiled[ship.group_type].name.code = stat.english_name;
        if (compiled[ship.group_type].name.en == undefined) compiled[ship.group_type].name.en = code_name_to_english_name
    }
}

function parseShips() {
    readFilesFromLanguage("EN");
    //Make sure to turn off after first version is parsed
    PR_calculated = true
    META_calculated = true
    readFilesFromLanguage("JP");
    readFilesFromLanguage("CN");
    // readFilesFromLanguage("KR");
    // readFilesFromLanguage("TW");


    fs.writeFileSync(path.join(__dirname, "../../dist/ships/ships.json"), stringify(compiled));
    fs.writeFileSync(path.join(__dirname, "../../dist/ships/types.json"), stringify(TYPES));
    fs.writeFileSync(path.join(__dirname, "../../dist/ships/lookup_table.json"), stringify(lookup_table));
    fs.writeFileSync(path.join(__dirname, "../../dist/ships/retrofit_id_lookup_table.json"), stringify(retrofit_id_lookup_table));


    let retrofit = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", "CN", "sharecfg", "transform_data_template.json")).toString());
    fs.writeFileSync(path.join(__dirname, "../../dist/ships/retrofit.json"), stringify(retrofit));

    let equip_data_by_type = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", "EN", "sharecfg", "equip_data_by_type.json")).toString());
    fs.writeFileSync(path.join(__dirname, "../../dist/ships/equip_types.json"), stringify(equip_data_by_type));

}

module.exports = {parseShips};
