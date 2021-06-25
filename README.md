# perseus-data
This is the main data collection for my API. The ship stats and stuff are forked from AzurAPI.

The Repo polls [Dimbreath's Azur Lane Lua Code](https://github.com/Dimbreath/AzurLaneData) every 5 minutes. It takes a little over 10 to generate the JSON files and Perseus distribution files on the device im running it on. That should give a good idea of how quick updates will be.
Images still have to be done manually but Im working on automating it.

## Running the code
`node index.js`<br>
The code will update but skills will not parse correctly. Still wip.

## Dependencies
```
Python 3.9
  git-python
Lua 5.1
  CJson
Nodejs
  json-stringify-pretty-compact
```
