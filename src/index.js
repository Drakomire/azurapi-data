/*
Entry point!
 */
const ships = require("./ships")
const gear = require("./gear")
const barrage = require("./gear/barrage")
const items = require("./items")

items.parseItems()
ships.parseShips()
gear.parseGear()
barrage.parseBarrages()