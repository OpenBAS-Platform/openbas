# Deploy OPENEX application from a full featured package

Package should be downloaded from GitLab CI artefact:
http://git-sam.open-groupe.com/sam/anssi/openex/-/jobs/artifacts/master/download?job=build%3Aapp

## Scripted deployment

A script is available to automatically deploy application:
`deploy_from_package.sh $BASE_APP_DIR $PACKAGE_FILE`

```bash
deploy_from_package.sh /home/user/www/openex /home/user/tmp/application_package.zip
```

It should be run once as a normal user (to extract / copy application code) and then once as root user (to fix permissions).

## Documentation, manual deployment

Folders:

- Temporary folder, known as `TEMP_DIR` in following scripts, containing downloaded package. Can be `/tmp/openex` for example.
- Application base folder, known as `BASE_APP_DIR` in following scripts

This script should be run as a normal user:

```bash
BASE_APP_DIR="path/to/application"
TEMP_DIR="/tmp/openex"

echo "Ensure base app folder exists"
mkdir -p ${BASE_APP_DIR}

echo "Backup existing config file"
cp -v ${BASE_APP_DIR}/api/.env.local ${BASE_APP_DIR}/.env.local.backup

echo "Extract package in ${TEMP_DIR}"
cd ${TEMP_DIR}
unzip ./application_package.zip
tar xf ./package/package.tar.xz

echo "Move extracted folder api to base app folder ${BASE_APP_DIR}"
cd ${TEMP_DIR}
mv ./api ${BASE_APP_DIR}

echo "Restore local conf file to ${BASE_APP_DIR}/api/.env.local"
cp -v ${BASE_APP_DIR}/.env.local.backup ${BASE_APP_DIR}/api/.env.local

echo "Restore uploaded files to ${BASE_APP_DIR}/api/var/files/"
cp -v ${BASE_BACKUP_DIR}/api/var/files/* ${BASE_APP_DIR}/api/var/files/

echo "Run database migrations scripts"
cd ${BASE_APP_DIR}/api
php bin/console doctrine:schema:update --force
```

This script should then be run as `root` user:

```bash
BASE_APP_DIR="path/to/application"

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
```

Apache sample configuration, please be sure to replace / check host and paths:

```
<VirtualHost *:80>
        ServerName host.domain.tld
        ServerAdmin webmaster@localhost

        DocumentRoot #BASE_APP_DIR/api/public#
        <Directory #BASE_APP_DIR/api/public#/>
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
```
