const fs = require("fs");
const path = require("path");
const stringify = require("json-stringify-pretty-compact");

let compiled = {};
let MAX_GEAR_LEVEL = 13;

function readFilesFromLanguage(lang = "EN") {
    let equip_data_statistics = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", "equip_data_statistics.json")).toString());
    let equip_data_template = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", "equip_data_template.json")).toString());

    let all = equip_data_template["subList"];


    for (let i of all){
      //Open the file for the gear
      let templates = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", "equip_data_template_sublist", `${i}.json`)).toString());


      for (key in templates){
        if (key % 20 == 0){
          current_template = templates[key]
          
          key = parseInt(key)

          if (compiled[key/10] == undefined) compiled[key/10] = {}
          compiled[key/10].id = key

          //Data that is part of statistics
          let current_statistics = []
          let weapon_property = []

          for (let g = 0; g<MAX_GEAR_LEVEL; g++){
            let val = equip_data_statistics["indexs"][key+g]
            if (val !== undefined)
            current_statistics.push(JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", "equip_data_statistics_sublist", `equip_data_statistics_${val}.json`)).toString())[key+g]);
          }

          let damage = []
          for (i of current_statistics)
            if (i.damage !== undefined) damage.push(i.damage)
            
          compiled[key/10].attribute = current_statistics[0].attribute_2
          compiled[key/10].damage = damage
          compiled[key/10].rarity = current_statistics[0].rarity
          compiled[key/10].nationality = current_statistics[0].nationality
          compiled[key/10].type = current_statistics[0].type
          compiled[key/10][`name_${lang}`] = current_statistics[0]["name"]
          compiled[key/10].image = `https://raw.githubusercontent.com/Drakomire/perseus-data/master/AzurLaneImages/assets/artresource/atlas/equips/${current_statistics[0]["icon"]}.png`

          //Data that is part of template
          compiled[key/10].ship_type_forbidden = current_template.ship_type_forbidden
          compiled[key/10].equip_limit = current_template.equip_limit


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

module.exports = {parseGear};
