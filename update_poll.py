import subprocess
import os
import time
from git import Repo

source_lua = Repo("AzurLaneSourceLua")
perseus = Repo(".")

while True:
    #Poll source JSON
    res = source_lua.git.diff()
    if (len(res) == 0):
        print(f"Repo is up to date as of {int(time.time())}")
        pass
    else:
        #Update everything
        print("Repo is not up to date. Updating!")
        source_lua.git.reset("--hard")
        print("Making sure local repo is up to date")
        perseus.git.pull()
        print("Data pulled from origin")
        os.system("./run.sh")
        perseus.git.add("dist")
        perseus.git.commit("-m", "Distribution data update", "--allow-empty")
        perseus.git.add("AzurLaneSourceJson")
        perseus.index.commit("JSON data update")
        print("Changes commit")
        perseus.remotes.origin.push()
        print("Repo pushed to orgin!")

    print("Waiting 300 seconds")
    time.sleep(300)
