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

let TYPES = {};

let compiled = {};

const HEXAGON_RANK = {
    'S': 5, 'A': 4, 'B': 3, 'C': 2, 'D': 1, 'E': 0,
};

const FAKE_SHIPS = [900042, 900045, 900046, 900162, 900913, 900914].map(i => String(i));

function readFilesFromLanguage(lang = "EN") {
    let groups = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "AzurLaneSourceJson", lang, "sharecfg", "ship_data_group.json")).toString());
    let ships = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "AzurLaneSourceJson", lang, "sharecfg", "ship_data_template.json")).toString());
    let stats = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "AzurLaneSourceJson", lang, "sharecfg", "ship_data_statistics.json")).toString());
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
        let [hp, fp, trp, aa, av, rld, _, acc, eva, spd, luk, asw] = stat.attrs;

        let specificShip = compiled[ship.group_type].data[ship.id];
        if (!specificShip) compiled[ship.group_type].data[ship.id] = specificShip = {
            id: ship.id,
            tags: stat.tag_list.length > 0 ? stat.tag_list : undefined, // save space
            type: ship.type,
            rarity: stat.rarity,
            stars: ship.star,
            oil: ship.oil_at_end,
            max_level: ship.max_level,
            stats: {hp, fp, trp, aa, av, rld, acc, eva, spd, luk, asw}
        };
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
    readFilesFromLanguage("CN");
    readFilesFromLanguage("JP");
    readFilesFromLanguage("KR");
    readFilesFromLanguage("TW");
    fs.writeFileSync(path.join(__dirname, "../dist/ships.json"), stringify(compiled));
    fs.writeFileSync(path.join(__dirname, "../dist/types.json"), stringify(TYPES));
}

module.exports = {parseShips};
