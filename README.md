# OpenEx - Open Crisis Management Exercise Platform [![Build Status](https://api.travis-ci.org/Luatix/OpenEx.svg?branch=master)](https://travis-ci.org/Luatix/OpenEx)

Website: http://openex.io

OpenEx is a global open source platform allowing organizations to plan, schedule and execute crisis management exercises. This application is freely inspired by the NATO Joint Exercise Management Module (JEMM) . OpenEx has been designed as a modern product including a RESTFul API and is built for a better user experience, for both planners and players.

## Features

OpenEx includes the following features:

- Multi-exercises and multi-organizations;
- Training objectives and key processes;
- Story lines development;
- Incidents and injects management;
- Scenarios scripting and automatic execution;
- Documents and files sharing;
- Statistics, reports and results;
- Lesson learned process and roadmap follow-up.

## Status

Currently OpenEx is under heavy development, no release has been published yet. The first release will be available on January 2017. You wilk find the product roadmap here: https://projets.luatix.org/OpenEx.

## Softwares

OpenEx works with an external scheduler ([Dkron](http://dkron.io)) for injects automation. Indeed, OpenEx developers are focusing on the exercises features, the user experience and all the very specific needs of crisis management processes.
 
As OpenEx has been built with the [Symfony framework](https://symfony.com) on top of an SQL database, you will need a PHP/MySQL stack.

Prerequisites:
 
- Install Dkron, follow instructions here http://dkron.io/docs/getting-started
- Install a webserver and PHP (>= 5.6)
- Install MySQL (>= 5.5)

## Quick start

Create the database for OpenEx and start the deployment:

```bash
$ git clone https://github.com/Luatix/OpenEx.git
$ cd OpenEx
$ composer install
```

Once the platform has been deployed, initialize the database:

```bash
php bin/console doctrine:schema:create
php bin/console app:db-init
```

Enjoy the platform!

## Documentation

Full, comprehensive documentation is viewable on the [OpenEx website](http://www.openex.io). 
