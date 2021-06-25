import shutil
from pathlib import Path
import multiprocessing as mp

from lua_convert import Client, convert_lua


directory_destinations = [
    (Path("sharecfg"), "sharecfg"),
    (Path("gamecfg", "buff"),  Path("gamecfg", "buff")),
    (Path("gamecfg", "dungeon"), Path("gamecfg", "dungeon")),
    (Path("gamecfg", "skill"), Path("gamecfg", "skill")),
    (Path("gamecfg", "story"), Path("gamecfg", "story")),
    (Path("gamecfg", "backyardtheme"), Path("gamecfg", "backyardtheme")),
    (Path("gamecfg", "guide"), Path("gamecfg", "guide")),
]

def clear_json_files(client: Client):
    client_json_dir = Path("..","AzurLaneSourceJson", client.name)
    shutil.rmtree(client_json_dir, ignore_errors=True)

def convert_all_files(client: Client):
    with mp.Pool(processes=mp.cpu_count()) as pool:
        for DIR_FROM, DIR_TO in directory_destinations:
            # jp has different folder for story files
            if DIR_FROM.name == "story" and client.name == "JP":
                DIR_FROM = DIR_FROM.with_name(DIR_FROM.name+"jp")

            # set path constants
            CONVERT_FROM = Path("..","AzurLaneSourceLua", client.locale_code, DIR_FROM)
            CONVERT_TO = Path("..","AzurLaneSourceJson", client.name, DIR_TO)

            # find all files inside the folder
            for file in CONVERT_FROM.rglob("*.lua"):
                target = Path(CONVERT_TO, file.relative_to(CONVERT_FROM).with_suffix(".json"))
                pool.apply_async(convert_lua, (file, target,))
        pool.close()
        pool.join()

def reconvert_all_files(client: Client):
    clear_json_files(client)
    convert_all_files(client)


def main():
    client_input = input("Type the game version to convert: ")
    if not client_input in Client.__members__:
        print(f"Unknown client {client_input}, aborting.")
        return
    client = Client[client_input]
    reconvert_all_files(client)

def convertClients(clients):
    for c in clients:
        client = Client[c]
        reconvert_all_files(client)

if __name__ == "__main__":
    convertClients([
        "EN",
        "JP",
        "CN",
        "TW",
        "KR"
    ])