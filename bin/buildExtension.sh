#!/bin/bash
# Builds the extension and places it in the ./dist folder
source ./bin/utils.sh

# run the build
npm run build
check_return_code $?

# stamp with the build number 
if [ -z "$GIT_HUB_RUN_NUMBER"  ]; then
    GIT_HUB_RUN_NUMBER="devbuild"
fi
mv ./dist/manifest.json ./dist/manifest.json.original
check_return_code $?

sed "s/<build_number>/$GIT_HUB_RUN_NUMBER/g"  ./dist/manifest.json.original > ./dist/manifest.json 
check_return_code $?

cat ./dist/manifest.json | grep $GIT_HUB_RUN_NUMBER
check_return_code $?

rm ./dist/manifest.json.original
check_return_code $?


