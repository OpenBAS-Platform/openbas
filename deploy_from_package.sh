#!/usr/bin/env bash

# Usage: deploy_from_package.sh $BASE_APP_DIR $PACKAGE_FILE
# example: deploy_from_package.sh /home/user/www/openex /home/user/tmp/application_package.zip

APP_CODE="openex"
SERVERNAME="${APP_CODE}.anssi-qualif.open"

NORMAL_USER="adminuser"
ROOT_USER="root"

BASE_SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
TEMP_DIR=$(mktemp -d)
TIMESTAMP=$(date +'%Y%m%d_%H%M%S')

BASE_APP_DIR="$1"
if [ -z "${BASE_APP_DIR}" ]
then
    echo "Missing application base directory."
    exit 1
fi

PACKAGE_FILE="$2"
if [ -z "${PACKAGE_FILE}" ]
then
    echo "Missing package file to extract."
    exit 1
fi
if [ ! -f "${PACKAGE_FILE}" ]
then
    echo "Package file ${PACKAGE_FILE} not found."
    exit 1
fi

echo ""
echo "Deploying ${APP_CODE} app..."
echo ""

if [ "$USER" = "${NORMAL_USER}" ]
then
    # create base application folder or archive existing folder
    if [ ! -d "${BASE_APP_DIR}" ]
    then
        echo "Create base application folder ${BASE_APP_DIR}"
        mkdir -p ${BASE_APP_DIR}
    else
        echo "Backup existing config file"
        cp -v ${BASE_APP_DIR}/api/.env.local ${BASE_APP_DIR}/.env.local.backup

        echo "Archive existing application folder"
        mv -v ${BASE_APP_DIR}/api ${BASE_APP_DIR}/api.bak_${TIMESTAMP}
    fi

    echo "Extract package in ${TEMP_DIR}"
    cp -v "${PACKAGE_FILE}" ${TEMP_DIR}/application_package.zip
    cd ${TEMP_DIR}
    unzip ./application_package.zip
    tar xf ./package/package.tar.xz

    echo "Move extracted folder api to base app folder ${BASE_APP_DIR}"
    cd ${TEMP_DIR}
    mv ./api ${BASE_APP_DIR}

    echo "Restore local conf file to ${BASE_APP_DIR}/api/.env.local"
    if [ -f "${BASE_APP_DIR}/.env.local.backup" ]
    then
        cp -v ${BASE_APP_DIR}/.env.local.backup ${BASE_APP_DIR}/api/.env.local
    else
        echo "Backup not found"
    fi

    echo "Restore uploaded files to ${BASE_APP_DIR}/api/var/files/"
    mv -v ${BASE_APP_DIR}/api.bak_${TIMESTAMP}/var/files/* ${BASE_APP_DIR}/api/var/files/

    echo "Run database migrations scripts"
    cd ${BASE_APP_DIR}/api
    php bin/console doctrine:schema:update --force

    echo "Application is deployed. Please run again as ${ROOT_USER} to clean cache and check permissions."
fi

if [ "$USER" = "${ROOT_USER}" ]
then
    # check application base folder
    if [ ! -d "${BASE_APP_DIR}" ]
    then
        echo "${BASE_APP_DIR} not found. Should be run as ${NORMAL_USER} to clone application."
        exit 1
    fi

    echo "Clear cache"
    cd ${BASE_APP_DIR}/api
    php bin/console cache:clear --env=dev
    php bin/console cache:clear --env=prod

    echo "Fix permissions"
    chmod ugo+rwx -R ${BASE_APP_DIR}/api/var/cache
    chmod ugo+rwx -R ${BASE_APP_DIR}/api/var/files
    chmod ugo+rwx    ${BASE_APP_DIR}/api/var/log
    chmod ugo+rw     ${BASE_APP_DIR}/api/var/log/*.log
    chmod ugo+rwx -R ${BASE_APP_DIR}/api/var/sessions

    echo "Install apache virtualhost config"
    APACHE_CONFIG="
<VirtualHost *:80>
        ServerName #SERVERNAME#
        ServerAdmin webmaster@localhost

        DocumentRoot #DOCUMENTROOT#
        <Directory #DOCUMENTROOT#/>
                Options Indexes FollowSymLinks MultiViews
                AllowOverride All
                Require all granted
                Allow from all
        </Directory>

        <Directory />
                Options FollowSymLinks
                AllowOverride None
        </Directory>
</VirtualHost>
"
    echo "${APACHE_CONFIG}" > /etc/apache2/sites-available/anssi_${APP_CODE}.conf
    sed -i "s|#SERVERNAME#|${SERVERNAME}|g" /etc/apache2/sites-available/anssi_${APP_CODE}.conf
    sed -i "s|#DOCUMENTROOT#|${BASE_APP_DIR}/api/public|g" /etc/apache2/sites-available/anssi_${APP_CODE}.conf
    a2ensite anssi_${APP_CODE}.conf
    service apache2 restart
fi
