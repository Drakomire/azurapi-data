inc=1
for dir in AzurLaneImages/assets/artresource/atlas/paintings/*; do
    let "inc++"
    echo $inc
    git add $dir
    git commit $dir -m "image update $dir"
    if [ $(($inc%30)) == 0 ]; then
        git push
    fi
done
echo "done"
git push