# OpenEx - Open Crisis Management Exercise Platform 

Website: http://openex.io

OpenEx is a global open source platform allowing organizations to plan, schedule and execute crisis management exercises. This product is freely inspired by the NATO Joint Exercise Management Module (JEMM) . OpenEx uses the last technologies and focuses on user experience, for both planners and players.

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

Also, OpenEx provides a RESTFul API to allow interaction with other applications.

## Status

Currently OpenEx is under heavy development, no release has been published yet. The first release will be available on Junuary 2017, anyway you can find the product roadmap here: https://projets.luatix.org/OpenEx.

## Quick start

OpenEx uses an other open source tool for the scheduling and the automation. Indeed, OpenEx developers are focusing on the exercises features and all the very specific needs of the crisis management processes. 

1. Clone the repository
`git clone `

You will need the following softwares:

- Webserver (ie. Apache) with mod_rewrite
- MySQL database (>= 5.5)
- PHP (>= 5.6)
- Composer

#### Deployment

Perform the following steps:
```
    git clone https://bitbucket.org/balize/cep-api.git
    composer install
    php bin/console doctrine:schema:update --dump-sql --force
    php bin/console app:db-init
```

Enjoy!
