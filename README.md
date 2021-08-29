REPO IS DEPRECATED
Im redoing the entire system in rust

# perseus-data
This is the main data collection for my API.
- The ship stats extractor is forked from AzurAPI.
- The Lua to JSON converter is modified from [Nobbyfix's Azur Lane Tools](https://github.com/nobbyfix/AzurLaneTools). Sorry it isn't forked but I didn't want another submodule.

## Azur Lane Asset Dump
This repo has an asset dump of all the azur lane files in `AzurLangeImages` .

## Running the code
`./convert_and_parse.sh`<br>
WARNING: THIS CAN TAKE A VERY LONG TIME (~3 minutes on my PC, ~10 minutes on my RPI)

`./parse.sh`<br>
This only generates the distribution files so it goes much quicker.

## Dependencies
```
Python 3.8
  pip install requests
Lua 5.1
  sudo luarocks install lua-cjson
Nodejs
  npm install json-stringify-pretty-compact
```
