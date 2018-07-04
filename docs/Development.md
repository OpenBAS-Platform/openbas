## Development installation

*Prerequisites*:

- PHP (>= 5.6)
- MySQL (>= 5.5)

*Installation of dependencies (Ubuntu 16.04)*:
```bash
$ sudo apt-get install apache2 libapache2-mod-php7.0 postgresql openjdk-8-jre
$ sudo apt-get install php7.0-xml php7.0-mbstring php7.0-ldap php7.0-json php7.0-curl php7.0-pgsql
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
$ git clone https://github.com/Luatix/openex.git
```

*Install the main application and create the database schema*:
```bash
$ cd api
$ composer install
$ php bin/console doctrine:schema:create
$ php bin/console app:db-init
```

*Install the worker*:
```bash
$ cd worker
$ mvn install
$ karaf
feature:repo-add mvn:io.openex/worker-features/1.0.0/xml/features
feature:uninstall worker-features
feature:install worker-features
```

*Start the frontend*:
```bash
$ cd frontend
$ yarn install
$ yarn start
```
