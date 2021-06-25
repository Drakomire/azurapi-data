#Convert lua to json
cd convert
python3 lua_converter.py
cd ..

##Prase the source lua to update perseus
python3 run.py