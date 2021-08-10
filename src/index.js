/*
Entry point!
 */
const ships = require("./ships");
// const {parseSkills} = require("./ships/parseSkills.js");


const gear = require("./gear");
const items = require("./items");


items.parseItems();
ships.parseShips();
gear.parseGear();

// parseSkills();
// gear.parseShips();
