import os
import hashlib
import glob
import json
import sys

os.system("node .")
print("Parsing data complete!")
os.system("python3 ships/ship_images.py")
print("Parsing ship skins complete!")
os.system("python3 ships/skill_parse_wrapper.py")
print("Parsing ship skills complete!")

checksums = {}

for filepath in glob.glob("./dist/**/*.json"):
    file = open(filepath, "rb")
    checksums[filepath.replace("./dist/","")] = hashlib.md5(file.read()).hexdigest()
    file.close()

f = open("./dist/checksums.json","w")
f.write(json.dumps(checksums,indent=4,sort_keys=True))
f.close()

f = open("./dist/version","w")
f.write(hashlib.md5(open("./dist/checksums.json","rb").read()).hexdigest())
f.close()

print("Checksums written!")