node .
echo "Parsing ship data complete!"
python3 src/ships/ship_images.py
echo "Parsing ship skins complete!"
python3 src/checksums.py
echo "Checksums written!"