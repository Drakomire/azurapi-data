import os
import hashlib
import glob
import json

os.system("node .")
print("Parsing complete!")

checksums = {}

for filepath in glob.glob("./dist/**/*.json"):
    file = open(filepath, "rb")
    checksums[filepath.replace("./dist/","")] = hashlib.md5(file.read()).hexdigest()
    file.close()

f = open("./dist/checksums.json","w")
f.write(json.dumps(checksums,indent=4,sort_keys=True))
f.close()

print("Checksums written!")
