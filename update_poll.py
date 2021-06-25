import subprocess
import os
import time
from git import Repo

source_lua = Repo("AzurLaneSourceLua")
perseus = Repo(".")

while True:
    #Poll source JSON
    res = source_lua.git.pull("https://github.com/Dimbreath/AzurLaneData","master")
    if (res == "Already up to date."):
        print(f"Repo is up to date as of {int(time.time())}")
        pass
    else:
        #Update everything
        print("Repo is not up to date. Updating!")
        os.system("./run.sh")
        perseus.git.add("dist")
        perseus.git.commit("-m", "Distribution data update", "--allow-empty")
        perseus.git.add("AzurLaneSourceJson")
        perseus.index.commit("JSON data update")
        print("Changes commit")
        perseus.remotes.origin.push()
        print("Repo pushed to orgin!")

    time.sleep(300)
