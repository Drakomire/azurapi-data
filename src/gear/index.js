const fs = require("fs");
const path = require("path");
const stringify = require("json-stringify-pretty-compact");

let compiled = {};
const MAX_GEAR_LEVEL = 13;

function open_sublist(file,lang){
  let file_json = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", `${file}.json`)).toString())
  let sublist_files = file_json["subList"]
  out = {}
  for (let sub_file of sublist_files){
    file_index = parseInt(sub_file.match(/[0-9]*$/))
    out[file_index] = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", `${file}_sublist`, `${sub_file}.json`)).toString())
  }
  return out
}

function readFilesFromLanguage(lang = "EN") {
  let equip_data_statistics = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", `equip_data_statistics.json`)).toString())
  let equip_data_template = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", `equip_data_template.json`)).toString())
  let weapon_property = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", `weapon_property.json`)).toString())

  let barrage_template = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", `barrage_template.json`)).toString())
  let bullet_template = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", `bullet_template.json`)).toString())

  let template_sublist = open_sublist("equip_data_template",lang)
  let statistics_sublist = open_sublist("equip_data_statistics",lang)
  let weapon_property_sublist = open_sublist("weapon_property",lang)

  function parse_weapon(id, ammo_info){
    //Open the file
    let base_id = id-id%20
    console.log(ammo_info)

    try{
      cur_weapon = weapon_property_sublist[weapon_property["indexs"][id]][id]
      base_weapon = weapon_property_sublist[weapon_property["indexs"][base_id]][base_id]
    }catch{
      return {}
    }

    out = {
      "reload" : (cur_weapon.reload_max || base_weapon.reload_max),

      "coefficient" : base_weapon.corrected,

      //Other info
      "spawn" : base_weapon.spawn_bound,

      "_debug" : `${weapon_property["indexs"][id]}/${id}`,

    }

    if (base_weapon["spawn_bound"] == "cannon"){
      //Only factoring first one rn
      barrage = barrage_template[base_weapon.barrage_ID[0]]
      shell = bullet_template[base_weapon.bullet_ID[0]]

      out.damage = cur_weapon.damage
      out.volley_time = barrage.senior_repeat*barrage.senior_delay
      out.volley_size = [barrage.senior_repeat+1,barrage.primal_repeat+1]
      out.angle = base_weapon.angle
      out.range = {
        "firing": base_weapon.range,
        "shell" : shell.range
       }
       out.velocity = shell.velocity
       out.ammo = shell.type
    }

    if (base_weapon["spawn_bound"] == "torpedo"){
      barrage = barrage_template[base_weapon.barrage_ID[0]]
      shell = bullet_template[base_weapon.bullet_ID[0]]

      out.damage = cur_weapon.damage
      shell = bullet_template[base_weapon.bullet_ID[0]]
      out.angle = base_weapon.angle
      out.ammo = shell.type
      out.range = {
        "firing": base_weapon.range,
        "shell" : shell.range
       }
       out.velocity = shell.velocity

       out._shell = shell.id
    }

    return out
  }

  function parse_gear(id){
    //Data that is part of statistics
    let this_template = []
    let this_statistics = []

    //NOTE: Gear level goes between 0 & 13. Equips start at level 0 in game.
    for (let gear_level = 0; gear_level<=MAX_GEAR_LEVEL; gear_level++){
      let val = equip_data_template["indexs"][id+gear_level]
      if (val !== undefined){
        this_template.push(template_sublist[val][id+gear_level]);
      }

      val = equip_data_statistics["indexs"][id+gear_level]
      if (val !== undefined){
        this_statistics.push(statistics_sublist[val][id+gear_level]);
      }
    }

    let out = compiled[id/10] || {}

    out.id = id
    out.attribute = this_statistics[0].attribute_2
    out.rarity = this_statistics[0].rarity
    out.nationality = this_statistics[0].nationality
    out.type = this_statistics[0].type
    out[`name_${lang}`] = this_statistics[0]["name"]
    out.image = `https://raw.githubusercontent.com/Drakomire/perseus-data/master/AzurLaneImages/assets/artresource/atlas/equips/${this_statistics[0]["icon"]}.png`

    //Weapons and damage are calculated for ships with a weapon
    if (this_statistics[0].weapon_id.length != 0){
      out.weapons = []
      for (stat of this_statistics){
        let weapons = []
        for (weapon of stat.weapon_id){
          weapons.push(parse_weapon(weapon))
        }

        out.weapons.push(weapons)
      }

      for (level of out.weapons){
        for (weapon of level){
          let this_property = []
          let val = weapon_property["indexs"][weapon]
          if (val !== undefined){
            this_property.push(weapon_property_sublist[val][weapon]);
          }
        }
      }
    }

    //Data that is part of template
    out.ship_type_forbidden = this_template[0].ship_type_forbidden
    out.equip_limit = this_template[0].equip_limit

    return out

  }

  for (let i in template_sublist){
    templates = template_sublist[i]
    for (key in templates){
      if (key % 20 == 0){
        compiled[key/10] = parse_gear(parseInt(key))
      }
    }
  }
}


function parseGear() {
  readFilesFromLanguage("EN");
  readFilesFromLanguage("CN");
  readFilesFromLanguage("JP");
  // readFilesFromLanguage("KR");

  fs.writeFileSync(path.join(__dirname, "../../dist/gear/gear.json"), stringify(compiled));

}
parseGear()

module.exports = {parseGear};

