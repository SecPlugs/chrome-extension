#!/bin/bash
# Builds the extension and places it in the ./dist folder
source ./bin/utils.sh

# Clean the build folders
rm -fr ./dist
rm -fr ./dist.production
rm -fr ./dist.development

# run the build
npm run build
check_return_code $?

# stamp with the build number 
if [ -z "$GIT_HUB_RUN_NUMBER"  ]; then
    GIT_HUB_RUN_NUMBER="000"
fi
mv ./dist/manifest.json ./dist/manifest.json.original
check_return_code $?

sed "s/<build_number>/$GIT_HUB_RUN_NUMBER/g"  ./dist/manifest.json.original > ./dist/manifest.json 
check_return_code $?

cat ./dist/manifest.json | grep $GIT_HUB_RUN_NUMBER
check_return_code $?

rm ./dist/manifest.json.original
check_return_code $?

# save that off as production
rm -fr ./dist.production
mv ./dist/ ./dist.production/

# Now make a dev build
./node_modules/.bin/webpack --config ./webpack.config.development.js
cp ./dist.production/manifest.json ./dist/manifest.json

# save that off as development
rm -fr ./dist.development
mv ./dist/ ./dist.development/

# echo ip
dig +short myip.opendns.com @resolver1.opendns.com
