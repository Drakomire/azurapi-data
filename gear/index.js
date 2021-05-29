const fs = require("fs");
const path = require("path");
const stringify = require("json-stringify-pretty-compact");

let compiled = {};

function readFilesFromLanguage(lang = "EN") {
    let equipTemplateAll = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "AzurLaneSourceJson", lang, "sharecfg", "equip_data_statistics.json")).toString());
    let equipStatsAll = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "AzurLaneSourceJson", lang, "sharecfg", "equip_data_template.json")).toString());
    let weaponPropertyAll = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "AzurLaneSourceJson", lang, "sharecfg", "weapon_property.json")).toString());

    let all = equipStatsAll["all"];


    for (let i of all){
      const newID = equipStatsAll["indexs"][`${i}`];
      //Open the file for the gear
      let equipDataStatistics = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "AzurLaneSourceJson", lang, "sharecfg", "equip_data_statistics_sublist", `${equipTemplateAll["subList"][newID-1]}.json`)).toString());
      let equipDataTemplate = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "AzurLaneSourceJson", lang, "sharecfg", "equip_data_template_sublist", `${equipStatsAll["subList"][newID-1]}.json`)).toString());

      try{
        //Sanity check to see if gear is real. This is a trash way of doing it.
        if (i%20 == 0){
          // const name = `${i}: `+equipDataStatistics[`${i-(i%20)}`]["name"];
          // const weaponSublistID = weaponPropertyAll['indexs'][`${i}`];
          // const weaponSublist = weaponPropertyAll['subList'][weaponSublistID];
          //Only proc on first instance of gear of tier
          //Get the weapon property
          // var weaponProperty = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "AzurLaneSourceJson", lang, "sharecfg", "weapon_property_sublist", `${weaponSublist}.json`)).toString());

          console.log(`${i}`)
          console.log(equipDataStatistics[`${i-(i%20)}`]["name"]);
          for (i in weaponProperty){
            console.log(i);
            break;
          }
          console.log('\n');

          compiled[`${i}`] = {
            'name' : equipDataStatistics[`${i}`]["name"],
            'damage' : weaponProperty[`${i}`]['damage'],



          }
        }
      }catch{

      }

    }


    // //Find all the weapons
    // for (i of weaponPropertyAll['subList']){
    //    var weaponProperty = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "AzurLaneSourceJson", lang, "sharecfg", "weapon_property_sublist", `${i}.json`)).toString());
    //
    //
    //    key = Object.keys(weaponProperty)[0];
    //    id = weaponProperty[key]['id'];
    //    console.log(id);
    //
    //
    //     compiled[`${id}`] = {
    //       'name' : weaponProperty[`${id}`]["name"],
    //       'damage' : weaponProperty[`${id}`]['damage'],
    //
    //
    //
    //     }
    //
    //
    // }







}


function parseShips() {
  readFilesFromLanguage("EN");
  fs.writeFileSync(path.join(__dirname, "../dist/gear.json"), stringify(compiled));

}

module.exports = {parseShips};
