#Convert lua to json
echo "Running converter script..."
cd convert
python3 lua_converter.py
cd ..

##Prase the source lua to update perseus
echo "Updating Perseus API"
./parse.sh