import subprocess
import os
import time
from git import Repo, Actor

source_json = Repo("AzurLaneSourceJson")
perseus = Repo(".")


index = perseus.index
new_file_path = os.path.join(perseus.working_tree_dir, 'new-file-name')
index.add([new_file_path])
index.commit("Test commit", author=author, committer=author)

# while True:
#     out = subprocess.check_output(["git","pull"],cwd="AzurLaneSourceLua")
#     if (out == b'Already up to date.\n'):
#         print("Up to date")
#     else:
#         #Update
#         os.system("./run.sh")

#     time.sleep(300)