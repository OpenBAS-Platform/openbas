# Development installation

*Prerequisites*:

- PHP (>= 5.6)
- PostgreSQL (>= 9.6)
- JDK (== 8)

*Installation of dependencies (Ubuntu 18.04)*:
```bash
$ sudo apt-get install apache2 libapache2-mod-php7.2 postgresql openjdk-8-jre
$ sudo apt-get install php7.2-xml php7.2-mbstring php7.2-ldap php7.2-json php7.2-curl php7.2-pgsql
```

*Dev dependencies*
- [composer](https://getcomposer.org/download/)
- [maven](https://maven.apache.org/download.cgi)
- [karaf](https://karaf.apache.org/download.html)
- [yarn](https://yarnpkg.com/lang/en/docs/install/#windows-stable)

*Creation of the user and the database with extension*:
```bash
$ su postgres
$ psql
CREATE USER "openex";
CREATE DATABASE "openex" OWNER "openex";
ALTER USER "openex" WITH ENCRYPTED PASSWORD "user password";
\c openex
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

*Note:* on Windows, you may need to connect to PostgreSQL with `psql -U postgres`.

*Download the application files*:
```bash
$ mkdir /path/to/your/app && cd /path/to/your/app
$ git clone https://github.com/Luatix/openex.git
```

*Install the main application and create the database schema*:
```bash
$ cd api
$ composer install
$ php bin/console doctrine:schema:create
$ php bin/console app:db-init
```

This will create a default user `admin@openex.io`, with default password `admin`.

During the database initialization, the administrator token will be displayed.

This api is Symfony based, thus a virtualhost should be created with `dev.local.openex.io` serving folder `api/web`.

*Install the worker*:
```bash
$ cd worker
$ mvn install
$ karaf
feature:repo-add mvn:io.openex/worker-features/1.0.0/xml/features
feature:uninstall worker-features
feature:install worker-features
```

*File openex.properties*:
```bash
# Openex
openex.api=http://url_of_the_application/api
openex.token=administrator_token
```

*Start the frontend*:
```bash
$ cd frontend
$ yarn install
$ yarn start
```
