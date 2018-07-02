# OpenEx - Open Exercises Platform [![Build Status](https://api.travis-ci.org/LuatixHQ/openex-api.svg?branch=master)](https://travis-ci.org/LuatixHQ/openex)

Website: https://www.openex.io

OpenEx is an open source platform allowing organizations to plan, schedule and conduct crisis exercises. OpenEx is an [ISO 22398](http://www.iso.org/iso/iso_catalogue/catalogue_tc/catalogue_detail.htm?csnumber=50294) compliant product and has been designed as a modern web application including a RESTFul API and an UX oriented frontend.

## Releases download

The releases are available on the [Github releases page](https://github.com/LuatixHQ/openex/releases).

## Status & Bugs

Currently OpenEx is under heavy development, if you wish to report bugs or ask for new features, you can find the product bug tracker here: https://projects.luatix.org/projects/openex or directly use the Github issues module.

## Installation

### Docker

*Coming soon*

### Manual installation

*Installation of dependencies*:
```bash
sudo apt-get install apache2 libapache2-mod-php7.0 postgresql openjdk-8-jre
sudo apt-get install php7.0-xml php7.0-mbstring php7.0-ldap php7.0-json php7.0-curl php7.0-pgsql
```

*Creation of the user and the database with extension*:
```bash
su postgres
psql
CREATE USER "openex"
CREATE DATABASE "openex" OWNER "openex";
ALTER USER "openex" WITH ENCRYPTED PASSWORD "user password";
\c openex
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

*Download the application files*:
```bash
mkdir /path/to/your/app && cd /path/to/your/app
wget https://github.com/LuatixHQ/openex/releases/download/v1.0.0/openex-release-1.0.0.tar.gz
tar xvfz v1.0.3.tar.gz
```

The OpenEx main application is based on Symfony, you have to configure your virtualhost against the *openex-app/web* directory.

*Install the main application and create the database schema*:
```bash
cd openex-app
composer install
php bin/console doctrine:schema:create
php bin/console app:db-init
```

During the database initialization, the administrator token will be displayed.

*Configure the worker*:
```bash
cd openex-worker/openex
```

*File openex.properties*:
```bash
# Openex
openex.api=http://url_of_the_application/api
openex.token=administrator_token
```

You have to configure the file *openex_email.properties* with your own parameters. The file *openex_ovh_sms.properties* is for using the [OVH API](https://www.ovh.com) to send SMS.

*Launch the worker*:
```bash
cd openex-worker/bin
./start
```

## Development installation

*Download the application files*:
```bash
mkdir /path/to/your/app && cd /path/to/your/app
git clone https://github.com/Luatix/openex.git
```

Configure the application as descriped in the production installation, where the *api* folder is the Symfony application and the *worker* the Apache Karaf application.

*Start the frontend*:
```bash
cd frontend
yarn install
yarn start
```
