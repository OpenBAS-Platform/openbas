# OpenEx - Open Crisis Management Exercise Platform 

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

To easily deploy the OpenEx platform, [Composer](https://getcomposer.org) is strongly recommanded.

1. Clone the repository

`git clone https://github.com/Luatix/OpenEx.git`

3. Create the database
4. Rename the file *parameters.yml.dist* in *parameters.yml* (in *app/config*)
5. Change the parameters of the MySQL database in the file

6. Install the framework and the dependencies

`composer install`

7. Create the database schema

`php bin/console doctrine:schema:update --dump-sql`
 
8. Initialize the database

`php bin/console app:db-init` 

Enjoy!


## Documentation

Full, comprehensive documentation is viewable on the [OpenEx website](http://www.openex.io). 
