const fs = require("fs");
const path = require("path");
const stringify = require("json-stringify-pretty-compact");

let TYPES = {};

let compiled = {};

function readFilesFromLanguage(lang = "EN") {
    let retrofit = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "AzurLaneSourceJson", lang, "sharecfg", "ship_data_statistics.json")).toString());
    let transform = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "AzurLaneSourceJson", lang, "sharecfg", "ship_transform.json")).toString());


    }
}

function parseShips() {
    readFilesFromLanguage("EN");
    fs.writeFileSync(path.join(__dirname, "../dist/ships/retrofit.json"), stringify(TYPES));
}

module.exports = {parseShips};
