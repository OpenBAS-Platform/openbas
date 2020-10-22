# Manual installation

*Prerequisites*:

- PHP (>= 5.6)
- PostgreSQL (>= 9.2)
- JAVA (== 8)

*Installation of dependencies (Ubuntu 18.04)*:
```bash
$ sudo apt-get install apache2 libapache2-mod-php7.2 postgresql openjdk-8-jre
$ sudo apt-get install php7.2-xml php7.2-mbstring php7.2-ldap php7.2-json php7.2-curl php7.2-pgsql
```

*Creation of the user and the database with extension*:
```bash
$ su postgres
$ psql
CREATE USER "openex"
CREATE DATABASE "openex" OWNER "openex";
ALTER USER "openex" WITH ENCRYPTED PASSWORD "user password";
\c openex
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

*Download the application files*:
```bash
$ mkdir /path/to/your/app && cd /path/to/your/app
$ wget https://github.com/LuatixHQ/openex/releases/download/v1.0.3/openex-release-1.0.3.tar.gz
$ tar xvfz openex-release-1.0.3.tar.gz
```

The OpenEx main application is based on Symfony, you have to configure your virtualhost against the *openex-app/web* directory.

*Install the main application and create the database schema*:
```bash
$ cd openex-app
$ composer install
$ php bin/console doctrine:schema:create
$ php bin/console app:db-init
```

During the database initialization, the administrator token will be displayed.

*Configure the worker*:
```bash
$ cd openex-worker/openex
```

*File openex.properties*:
```bash
# Openex
openex.api=http://url_of_the_application/api
openex.token=administrator_token
```

To get administrator token, please run this SQL query:
```
SELECT u.user_login, t.token_value FROM tokens t LEFT JOIN users u ON u.user_id = t.token_user WHERE u.user_admin = true;
```

You have to configure the file *openex_email.properties* with your own parameters. The file *openex_ovh_sms.properties* is for using the [OVH API](https://www.ovh.com) to send SMS.

*Launch the worker*:
```bash
$ cd openex-worker/bin
$ ./start
```
