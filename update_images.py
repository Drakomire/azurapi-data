import os
import UnityPy

#adb pull /storage/emulated/0/Android/obb/com.YoStarEN.AzurLane AzurLane.obb

def unpack_all_assets(source_folder : str, destination_folder : str):
    item_number = 1
    # iterate over all files in source folder
    for root, dirs, files in os.walk(source_folder):
        for file_name in files:
            # generate file_path
            file_path = os.path.join(root, file_name)
            # load that file via UnityPy.load
            env = UnityPy.load(file_path)

            # alternative way which keeps the original path
            for path,obj in env.container.items():
                if obj.type in ["Texture2D", "Sprite"]:
                    try:
                        # create dest based on original path
                        dest = os.path.join(destination_folder, *path.split("/"))
                        if os.path.isfile(dest + ".png"):
                            continue
                        # make sure that the dir of that path exists
                        os.makedirs(os.path.dirname(dest), exist_ok = True)
                        data = obj.read()
                        # correct extension
                        dest, ext = os.path.splitext(dest)


                        dest = dest + ".png"
                        if not os.path.isfile(dest):
                            print(f"New file: {dest}")

                        data.image.save(dest)
                        # print(f"{item_number=}")
                        item_number+=1
                    except:
                        dest = os.path.join(destination_folder, *path.split("/"))
                        print(f"{item_number=} Failed")
                        print(dest)
                        item_number+=1

# unpack_all_assets("com.YoStarEN.AzurLane/main.51010.com.YoStarEN.AzurLane/assets/AssetBundles", "AzurLaneImages")
unpack_all_assets("AzurLane/AssetBundles", "AzurLaneImages")

# unpack_all_assets("com.YoStarEN.AzurLane/main.51010.com.YoStarEN.AzurLane/assets/bin/Data","AzurLaneImagesV2")