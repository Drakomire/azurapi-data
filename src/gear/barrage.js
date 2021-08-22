const fs = require("fs");
const path = require("path");
const stringify = require("json-stringify-pretty-compact");

let compiled = {};
const MAX_GEAR_LEVEL = 13;

function open_sublist(file, lang) {
  let file_json = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", `${file}.json`)).toString())
  let sublist_files = file_json["subList"]
  out = {}
  for (let sub_file of sublist_files) {
    file_index = parseInt(sub_file.match(/[0-9]*$/))
    out[file_index] = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", `${file}_sublist`, `${sub_file}.json`)).toString())
  }
  return out
}

function reload_to_seconds(rld) {
  MAGIC_NUMBER = 150.359569 //Same number that AL wiki uses
  return rld / MAGIC_NUMBER
}

function zip(callback, ...args) {
  for (let i = 0; i < args[0].length; i++) {
    let out = []
    for (let arg of args) {
      out.push(arg[i])
    }
    callback(
      ...out
    )
  }
}

//https://stackoverflow.com/questions/2283566/how-can-i-round-a-number-in-javascript-tofixed-returns-a-string
function toFixedNumber(num, digits, base) {
  var pow = Math.pow(base || 10, digits);
  return Math.round(num * pow) / pow;
}

function readFilesFromLanguage(lang = "EN") {
  let aircraft_template = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", `aircraft_template.json`)).toString())
  let weapon_property = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", `weapon_property.json`)).toString())


  let barrage_template = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", `barrage_template.json`)).toString())
  let bullet_template = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", `bullet_template.json`)).toString())

  let aircraft_template_sublist = open_sublist("aircraft_template", lang)
  let weapon_property_sublist = open_sublist("weapon_property", lang)



  function parse_barrage(id) {
    let base_weapon, cur_weapon

    try {
      cur_weapon = weapon_property_sublist[weapon_property["indexs"][id]][id]
      let base_id = cur_weapon.base || id
      base_weapon = weapon_property_sublist[weapon_property["indexs"][base_id]][base_id]
    } catch {
      return {}
    }

    let out = {
      reload: toFixedNumber(reload_to_seconds(cur_weapon.reload_max || base_weapon.reload_max), 2, 10),
      damage: cur_weapon.damage,
      coefficient: base_weapon.corrected,
      firing_angle: base_weapon.angle,

      //Other info
      spawn_bound: base_weapon.spawn_bound,
      spawn: parse_weapons(base_weapon, cur_weapon),

      _debug: `${weapon_property["indexs"][id]}/${id}`,

    }

    if (compiled[id] !== undefined) {
      out.name = compiled[id].name
    } else {
      out.name = {}
    }

    out.name[lang.toLowerCase()] = base_weapon.name.replace(/((?<=[0-9])\ ?x\ ?)/," x ") //Makes sure x after number has space before it and after it

    return out
  }

  function parse_weapons(base_weapon, cur_weapon) {

    let out = []
    zip((barrage_id, bullet_id) => {
      let barrage = barrage_template[barrage_id] || {}
      let bullet = bullet_template[bullet_id] || {}

      if (base_weapon.spawn_bound == "cannon") {
        out.push({
          angle: barrage.angle,
          firing_range: base_weapon.range,
          shell_range: bullet.range,
          size: [barrage.senior_repeat + 1, barrage.primal_repeat + 1],
          volley_time: toFixedNumber(barrage.senior_delay * (barrage.senior_repeat + 1), 2, 10),
          armor_mods: bullet.damage_type
        })

      } else if (base_weapon.spawn_bound == "torpedo") {
        out.push({
          angle: Math.abs(barrage.angle) * 2,
          firing_range: barrage.range,
          shell_range: bullet.range,
          size: barrage.primal_repeat + 1,
          armor_mods: bullet.damage_type
        })

      } else if (base_weapon.spawn_bound == "plane") {

        if (!aircraft_template["all"].includes(cur_weapon.id)) {
          //Certain enemy planes are marked as a plane spawn
          //They seem to be missing information so im skipping them
          return []
        }

        let plane = aircraft_template_sublist[aircraft_template["indexs"][cur_weapon.id]][cur_weapon.id]
        let plane_base_id = plane.base || cur_weapon.id
        let base_plane = aircraft_template_sublist[aircraft_template["indexs"][plane_base_id]][plane_base_id]

        out.push({
          hp: plane.max_hp,
          id: plane_base_id,
          speed: base_plane.speed,
          dodge_limit: base_plane.dodge_limit,
          crash_damage: base_plane.crash_DMG,

          weapons: parse_plane(base_plane, plane),
          // weapons: base_plane.weapon_ID

        })



      } else if (base_weapon.spawn_bound == "antiaircraft") {
        out.push({
          range: bullet.range,
          size: [barrage.senior_repeat + 1, barrage.primal_repeat + 1],
          volley_time: toFixedNumber(barrage.senior_delay * (barrage.senior_repeat + 1), 2, 10),
          armor_mods: bullet.damage_type
        })
      }
    }, base_weapon.barrage_ID, base_weapon.bullet_ID)

    return out
  }

  function parse_plane(base_plane, plane) {
    let out = []

    let weapon_ids = plane.weapon_ID || base_plane.weapon_ID

    for (id of weapon_ids) {
      out.push(parse_barrage(id))
    }
    return out

  }


  for (index of weapon_property["all"]) {
    compiled[index] = parse_barrage(index)
  }


}


function parseBarrages() {
  readFilesFromLanguage("EN");
  readFilesFromLanguage("CN");
  readFilesFromLanguage("JP");
  // readFilesFromLanguage("KR");

  fs.writeFileSync(path.join(__dirname, "../../dist/gear/barrage.json"), stringify(compiled));

}
parseBarrages()

module.exports = { parseBarrages };

