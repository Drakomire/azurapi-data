import subprocess
import os
import time
from git import Repo

source_lua = Repo("AzurLaneSourceLua")
perseus = Repo(".")

perseus.git.add("dist")
perseus.git.commit("-m", "Distribution data update", "--allow-empty")
perseus.git.add("AzurLaneSourceJson")
perseus.index.commit("JSON data update")
perseus.remotes.origin.push()

# while True:
#     #Poll source JSON
#     res = source_lua.git.pull()
#     if (res == "Already up to date."):
#         pass
#     else:
#         #Update everything
#         print("Repo is not up to date. Updating!")
#         os.system("./run.sh")
#         perseus.git.add("dist")
#         perseus.git.commit("-m", "data update", "--allow-empty")
#         perseus.git.add("AzurLaneSourceJson")
#         perseus.index.commit("JSON data update")
#         perseus.remotes.origin.push("master")



#     time.sleep(300)