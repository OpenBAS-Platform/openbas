# OpenEx - Open Exercises Platform [![Build Status](https://api.travis-ci.org/LuatixHQ/openex.svg?branch=master)](https://travis-ci.org/LuatixHQ/openex)

Website: http://openex.io

OpenEx is a global open source platform allowing organizations to plan, schedule and execute crisis management exercises. OpenEx tries  OpenEx has been designed as a modern product including a RESTFul API and is built for a better user experience, for both planners and players.

## Releases download

The releases are available on the [OpenEx website](http://www.openex.io) in the [releases section](http://openex.io/releases). The website also provide a full [documentation](http://www.openex.io/documentation) about installation, usage and administration of the platform.   

## Status & Bugs

Currently OpenEx is under heavy development, if you wish to report bugs or ask for new features, you can find the product bug tracker here: https://projects.luatix.org/projects/openex or directly use the Github issues module.

## Softwares

OpenEx is composed of 3 components:

#### API [[openex-api](https://github.com/LuatixHQ/openex-api)]

The API is the link between the frontend, the database and the worker, built with the [Symfony framework](https://symfony.com).

#### Frontend [[openex-frontend](https://github.com/LuatixHQ/openex-frontend)]

The frontend is the user interface of the product, built with the [ReactJS framework](https://facebook.github.io/react).

#### Worker [[openeex-worker](https://github.com/LuatixHQ/openex-worker)]

The worker is the executor that send incidents and injects, built with the [Camel framework](http://camel.apache.org).
 
## Development
 
To contribute to the API development, please follow the next steps to deploy it.
    
*Prerequisites*:
 
- Install Dkron, follow instructions here http://dkron.io/docs/getting-started
- Install a webserver and PHP (>= 5.6)
- Install MySQL (>= 5.5)

*Installation*:

```bash
$ git clone https://github.com/Luatix/OpenEx.git
$ cd OpenEx
$ composer install
```

*Database initialization*:

```bash
php bin/console doctrine:schema:create
php bin/console app:db-init
```

The API is now up and running.
