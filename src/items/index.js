const fs = require("fs");
const path = require("path");
const stringify = require("json-stringify-pretty-compact");
const { error } = require("console");

let compiled = {};



function readFilesFromLanguage(lang = "EN") {
    let item_data_statistics = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "AzurLaneSourceJson", lang, "sharecfg", "item_data_statistics.json")).toString());

    for (let key in item_data_statistics){
        item = item_data_statistics[key]
        id = item.id

        if (item.icon == undefined) continue

        if (!compiled[id]){
            compiled[id] = {}
            compiled[id].names = {}
            compiled[id].display = {}
            let icon = item.icon
            compiled[id].icon = "https://raw.githubusercontent.com/Drakomire/perseus-data/master/AzurLaneImages/assets/artresource/atlas/" + icon.toLowerCase() + ".png"
            compiled[id].rarity = item.rarity
        }


        compiled[id].names[lang.toLowerCase()] = item.name
        compiled[id].display[lang.toLowerCase()] = item.name





    }
     


}

function parseItems() {
    readFilesFromLanguage("EN");
    readFilesFromLanguage("CN");
    readFilesFromLanguage("JP");


    fs.writeFileSync(path.join(__dirname, "../../dist/items/items.json"), stringify(compiled));

}

module.exports = {parseItems};
