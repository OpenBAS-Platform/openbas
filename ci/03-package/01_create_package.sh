#!/bin/bash

# We need to install dependencies only for Docker
[[ ! -e /.dockerenv ]] && exit 0

set -xe

# Get current working dir
CWD=$(pwd)

# Output package file
PACKAGE_FOLDER="${CWD}/package"
PACKAGE_FILE="${PACKAGE_FOLDER}/package_openex.tar.xz"

# Ensure package folder exists
mkdir -p ${PACKAGE_FOLDER}

# Copy main app folder to temp folder
TEMP_FOLDER=$(mktemp -d)
cp -r ./api ${TEMP_FOLDER}

# Copy some generated files/folders
cp -f ./frontend/build/index.html ${TEMP_FOLDER}/api/templates/views/Default/index.html.twig
cp -rf ./frontend/build/static ${TEMP_FOLDER}/api/public/
cp -rf ./frontend/build/images ${TEMP_FOLDER}/api/public/
cp -rf ./frontend/build/ckeditor ${TEMP_FOLDER}/api/public/

# Create compressed package
cd ${TEMP_FOLDER}
tar cJf "${PACKAGE_FILE}" .

echo "Ok, package built -> ${PACKAGE_FILE}"
ls -lh "${PACKAGE_FILE}"
md5sum "${PACKAGE_FILE}"
