#!/bin/bash

# will run only in a docker env
[[ ! -e /.dockerenv ]] && exit 0

# Display debug in console
if [ -n "${DEBUG}" ]; then
    set -xe
fi

# Known hosts
DEPLOY_HOST_QUALIF="10.0.0.164"
DEPLOY_USER="adminuser"
APACHE_USER="www-data"

# Wanted host, should be passed as $1 (QUALIF)
# default: QUALIF
WANTED_HOST="$1"

# SSH_PRIVATE_KEY_* should be generated with someting like:
#     ssh-keygen -t ed25519 -C "ANSSI/HMIUC/QUALIF"
#     cat ~/.ssh/id_ed25519
# and pasted in gitlab-ci variables

# /!\ ensure key is correctly added to authorized keys with
# (command to run on server itself)
#     ssh-copy-id -i ~/.ssh/id_ed25519.pub ${DEPLOY_USER}@${DEPLOY_HOST}

# Define per env variables
if [ "${WANTED_HOST}" == "QUALIF" ]; then
  echo "TARGET: QUALIF"
  DEPLOY_HOST="${DEPLOY_HOST_QUALIF}"
  SSH_PRIVATE_KEY="${SSH_PRIVATE_KEY_QUALIF}"
fi

# Default / unknown value
if [ "${DEPLOY_HOST}" == "" ]; then
  echo "TARGET: QUALIF (DEFAULT)"
  DEPLOY_HOST="${DEPLOY_HOST_QUALIF}"
  SSH_PRIVATE_KEY="${SSH_PRIVATE_KEY_QUALIF}"
fi

echo "DEPLOY_HOST: ${DEPLOY_HOST}"

# Script variables
CWD=$(pwd)
NOW="$(date '+%Y-%m-%d_%H-%M-%S')"

# Files and folders
PACKAGE_FOLDER="${CWD}/package"
PACKAGE_FILE="${PACKAGE_FOLDER}/package_openex.tar.xz"
REMOTE_PACKAGE_NAME="package_openex_${NOW}.tar.xz"
REMOTE_TEMP_FOLDER="/tmp/deploy_openex_${NOW}"
REMOTE_DEPLOY_FOLDER="/home/adminuser/www/openex"

## Configuration files
#SYMFONY_CONFIG_FILE=${LOCAL_APP_FOLDER}/.env.local

# Setup SSH deploy keys
which ssh-agent || ( apt-get update && apt-get install -qq openssh-client )
eval $(ssh-agent -s)
ssh-add <(echo "$SSH_PRIVATE_KEY")
ssh-add -l
mkdir -p /root/.ssh ; chmod 700 /root/.ssh
echo -e "Host *\n\tPubkeyAuthentication yes\n\tStrictHostKeyChecking no\n\n" > /root/.ssh/config

echo "Send to host ${DEPLOY_HOST}"
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "mkdir -p ${REMOTE_TEMP_FOLDER} ; exit"
scp -C ${PACKAGE_FILE} ${DEPLOY_USER}@${DEPLOY_HOST}:${REMOTE_TEMP_FOLDER}/${REMOTE_PACKAGE_NAME}

echo "Deploy remotely"
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${REMOTE_TEMP_FOLDER} && tar xf ${REMOTE_PACKAGE_NAME} ; exit"      # extract
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "mkdir -p ${REMOTE_DEPLOY_FOLDER} ; exit"                               # ensure target folder exists
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "mv -vf ${REMOTE_DEPLOY_FOLDER} ${REMOTE_DEPLOY_FOLDER}_${NOW} ; exit"  # backup existing app
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${REMOTE_TEMP_FOLDER} && rm ${REMOTE_PACKAGE_NAME} ; exit"          # delete package
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "mv ${REMOTE_TEMP_FOLDER} ${REMOTE_DEPLOY_FOLDER} ; exit"               # move extracted files to target folder

echo "Restore configuration file"
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cp -vf ${REMOTE_DEPLOY_FOLDER}_${NOW}/api/.env.local ${REMOTE_DEPLOY_FOLDER}/api/.env.local ; exit"  # restore configuration file

echo "Restore uploaded files"
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cp -vf ${REMOTE_DEPLOY_FOLDER}_${NOW}/api/var/files/* ${REMOTE_DEPLOY_FOLDER}/api/var/files/ ; exit"  # restore uploaded files

echo "Clear cache"
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${REMOTE_DEPLOY_FOLDER}/api ; php bin/console cache:clear --env=dev ; exit"
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${REMOTE_DEPLOY_FOLDER}/api ; php bin/console cache:clear --env=prod ; exit"

echo "Run database migrations"
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${REMOTE_DEPLOY_FOLDER}/api ; php bin/console doctrine:schema:update --force ; exit"

echo "Fix rights on folders"
RWX_FOLDERS="
  ${REMOTE_DEPLOY_FOLDER}/api/var/cache
  ${REMOTE_DEPLOY_FOLDER}/api/var/log
"
for RWX_FOLDER in ${RWX_FOLDERS}
do
    ssh ${DEPLOY_USER}@${DEPLOY_HOST} "mkdir -p ${RWX_FOLDER} ; chmod ugo+rwx -Rf ${RWX_FOLDER} ; exit"
done
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${REMOTE_DEPLOY_FOLDER} ; find . -type d -exec chmod ugo+x -f {} \; ; exit"  # folders
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${REMOTE_DEPLOY_FOLDER} ; find . -type f -exec chmod ugo+r -f {} \; ; exit"  # files
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "chmod ugo+rwx -f ${REMOTE_DEPLOY_FOLDER}/api/var/files ; exit"                  # uploaded files

echo ""
echo "OK, done"
