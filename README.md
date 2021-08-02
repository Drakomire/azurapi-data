# perseus-data
This is the main data collection for my API.
- The ship stats extractor is forked from AzurAPI.
- The Lua to JSON converter is modified from [Nobbyfix's Azur Lane Tools](https://github.com/nobbyfix/AzurLaneTools). Sorry it isn't forked but I didn't want another submodule.

Currently doesn't work<br>
~~The Repo polls [Dimbreath's Azur Lane Lua Code](https://github.com/Dimbreath/AzurLaneData) every 5 minutes. It takes a little over 10 to generate the JSON files and Perseus distribution files on the device im running it on. That should give a good idea of how quick updates will be.
Images still have to be done manually but Im working on automating it.~~


## Running the code
`./run.sh`<br>
WARNING: THIS CAN TAKE A VERY LONG TIME (~3 minutes on my PC, ~10 minutes on my RPI)

`python run.py` will run only the distribution file generator. Its kinda a pepega workflow.

## Dependencies
```
Python 3.8
  pip install requests
  pip install GitPython
Lua 5.1
  sudo luarocks install lua-cjson
Nodejs
  npm install json-stringify-pretty-compact
```
