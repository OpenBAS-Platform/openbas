# OpenEx - Open crisis management exercises platform 
=============

The Crisis Excercises Platform (CEP) is a global open source platform allowing organizations to plan, schedule and execute crisis management exercises.

Features
--------------

The CEP includes the following features:

- Multi-exercises and multi-organizations;
- Training objectives and key processes;
- Story lines development;
- Incidents and injects management;
- Scenarios scripting and automatic execution;
- Documents and files sharing;
- Statistics, reports and results;
- Lesson learned process and roadmap follow-up.

Also, the CEP provides a RESTFul API to allow interaction with other applications.

Installation
--------------

#### Softwares

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
