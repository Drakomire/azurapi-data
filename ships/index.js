const fs = require("fs");
const path = require("path");
const stringify = require("json-stringify-pretty-compact");

const RARITY = {
    2: "Common",
    3: "Rare",
    4: "Elite",
    5: "Super Rare/Priority",
    6: "Decisive"
};
const NATIONALITY = {
    0: "Universal", 1: "Eagle Union", 2: "Royal Navy",
    3: "Sakura Empire", 4: "Iron Blood", 5: "Dragon Empery",
    6: "Sardegna Empire", 7: "Northern Parliament", 8: "Iris Libre",
    9: "Vichya Dominion", 98: "Universal", 101: "Neptunia",
    104: "Kizuna AI", 105: "Hololive", 106: "Venus Vacation"
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

let TYPES = {};
let PR_calculated = false;
let META_calculated = false;
let compiled = {};
let lookup_table = {};

const HEXAGON_RANK = {
    'S': 5, 'A': 4, 'B': 3, 'C': 2, 'D': 1, 'E': 0,
};

const FAKE_SHIPS = [900042, 900045, 900046, 900162, 900913, 900914].map(i => String(i));

function readFilesFromLanguage(lang = "EN") {
    let groups = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "AzurLaneSourceJson", lang, "sharecfg", "ship_data_group.json")).toString());
    let ships = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "AzurLaneSourceJson", lang, "sharecfg", "ship_data_template.json")).toString());
    let stats = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "AzurLaneSourceJson", lang, "sharecfg", "ship_data_statistics.json")).toString());
    let ship_strengthen = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "AzurLaneSourceJson", lang, "sharecfg", "ship_data_strengthen.json")).toString());

    let ship_data_blueprint = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "AzurLaneSourceJson", lang, "sharecfg", "ship_data_blueprint.json")).toString());
    let ship_strengthen_blueprint = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "AzurLaneSourceJson", lang, "sharecfg", "ship_strengthen_blueprint.json")).toString());

    let ship_meta_repair = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "AzurLaneSourceJson", lang, "sharecfg", "ship_meta_repair.json")).toString());
    let ship_meta_repair_effect = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "AzurLaneSourceJson", lang, "sharecfg", "ship_meta_repair_effect.json")).toString());
    let ship_strengthen_meta = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "AzurLaneSourceJson", lang, "sharecfg", "ship_strengthen_meta.json")).toString());

    let types = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "AzurLaneSourceJson", lang, "sharecfg", "ship_data_by_type.json")).toString());
    let retrofit = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "AzurLaneSourceJson", lang, "sharecfg", "ship_data_trans.json")).toString());


    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 17, 18, 19].forEach(type => {
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
            slots: null,
            nationality: group.nationality,
            data: {}
        };
    }

    for (let id of Object.keys(ships)) {
        if (id === "all") continue;
        let ship = ships[id];
        let stat = stats[id];
        let strengthen = ship_strengthen[Math.floor(id/10)]

        if (!ship || !stat) continue; // ship not here / not complete

        stat.english_name = stat.english_name.trim()
            .replace('Ultra Bulin MKIII', 'Specialized Bulin Custom MKIII')
            .replace('Hiryu.META', 'Hiryuu META')
            .replace('Ark Royal.META', 'Ark Royal META')
            .replace('Große', 'Grosse');// special cases
        stat.name = stat.name.trim();
        if (stat.english_name === "simulation") continue; // simulation ship
        if (stat.english_name.length === 0) continue; // unknown ship
        if (FAKE_SHIPS.includes(id)) continue;

        //Add ship to lookup table
        lookup_table[stat.name.toLowerCase()] = (id-id%10)/10;
        lookup_table[stat.english_name.toLowerCase()] = (id-id%10)/10;

        // compiled[ship.group_type].rarity.push(rarity[stat.rarity])
        if (compiled[ship.group_type].nationality !== stat.nationality) continue; // pseudo ship
        compiled[ship.group_type].stars = ship.star_max;
        //Add skills
        compiled[ship.group_type].skill_ids = ship.buff_list_display;

        //Add retrofit info
        try{
          compiled[ship.group_type].retrofit = retrofit[ship.group_type].transform_list;
        }catch{

        }


        // https://github.com/minhducsun2002/boomer/blob/92c21b3624b539068ef3758d7f4c879fc8401952/src/db/al/models/ship_data_statistics.ts
        let [hp, fp, trp, aa, avi, rld, _, acc, eva, spd, luk, asw] = stat.attrs;


        let specificShip = compiled[ship.group_type].data[ship.id];
        if (!specificShip) compiled[ship.group_type].data[ship.id] = specificShip = {
            id: ship.id,
            tags: stat.tag_list.length > 0 ? stat.tag_list : undefined, // save space
            type: ship.type,
            rarity: stat.rarity,
            stars: ship.star,
            oil: ship.oil_at_end,
            max_level: ship.max_level,
            stats: {hp, fp, trp, aa, avi, rld, acc, eva, spd, luk, asw},
            // stats_growth: {ghp, gfp, gtrp, gaa, gav, grld, gacc, geva, gspd, gluk, gasw},
            // stats_growth_extra: {gehp, gefp, getrp, geaa, geav, gerld, geacc, geeva, gespd, geluk, geasw}

        };

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
        if (strengthen !== undefined){
          [fp,trp,_,avi,rld] = strengthen.durability;
          compiled[ship.group_type].enhancement = {fp,trp,avi,rld};
        }else{
          // console.log(stat.english_name)
        }

        if (specificShip.tags !== undefined){
          //PR limit break strengthening
          if (specificShip.tags.includes("Research") && !PR_calculated){
            //Open the PR file
            blueprints = ship_data_blueprint[ship.group_type].strengthen_effect

            for (let i = 4; i <= ((specificShip.id%10)-1)*10; i+=5){
              //Every 5 prints has a limit break
              for (j of ship_strengthen_blueprint[blueprints[i]].effect_attr){
                specificShip.stats[STAT_KEYWORDS[j[0]]] += j[1]
              }
            }
          }

          if (specificShip.tags.includes("META") && !META_calculated){
            //Meta ship enhancement was not set before
            //It is more complicated than normal ships
            compiled[ship.group_type].enhancement = {"avi":0,"trp":0,"avi":0,"rld":0,"hp":0,"aa":0,"acc":0,"eva":0}

            //Open the META reapir file
            repair_cannon = ship_strengthen_meta[ship.group_type].repair_cannon || []
            repair_torpedo = ship_strengthen_meta[ship.group_type].repair_torpedo || []
            repair_air = ship_strengthen_meta[ship.group_type].repair_air || []
            repair_reload = ship_strengthen_meta[ship.group_type].repair_reload || []

            repair_all = [...repair_cannon,...repair_torpedo,...repair_air,...repair_reload]
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


        if (specificShip.type !== ship.type) console.log("SHIP TYPE NOT MATCH ", id, ship.group_type, stat.name, lang);

        // collapse, maybe the collapse algo can be collapsed later

        let slots = [1, 2, 3, 4, 5].map(i => ship["equip_" + i]);
        if (!compiled[ship.group_type].slots) compiled[ship.group_type].slots = slots;
        if (JSON.stringify(compiled[ship.group_type].slots) !== JSON.stringify(slots)) specificShip.slots = slots;

        let armor = stat.armor_type;
        if (!compiled[ship.group_type].armor) compiled[ship.group_type].armor = armor;
        if (compiled[ship.group_type].armor !== armor) specificShip.armor = armor;

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
                console.log("CODE MISMATCH", id, ship.group_type, lang, stat.name, "|", compiled[ship.group_type].name.code, "≠", stat.english_name)
            }
        }
        compiled[ship.group_type].name.code = stat.english_name;
    }
}

function parseShips() {
    readFilesFromLanguage("EN");
    //Make sure to turn off after first version is parsed
    PR_calculated = true
    META_calculated = true
    readFilesFromLanguage("CN");
    readFilesFromLanguage("JP");
    // readFilesFromLanguage("KR");
    // readFilesFromLanguage("TW");
    fs.writeFileSync(path.join(__dirname, "../dist/ships.json"), stringify(compiled));
    fs.writeFileSync(path.join(__dirname, "../dist/types.json"), stringify(TYPES));
    fs.writeFileSync(path.join(__dirname, "../dist/lookup_table.json"), stringify(lookup_table));

}

module.exports = {parseShips};
