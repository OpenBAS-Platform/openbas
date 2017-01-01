# OpenEx - Open Exercises Platform [![Build Status](https://api.travis-ci.org/LuatixHQ/openex-frontend.svg?branch=master)](https://travis-ci.org/LuatixHQ/openex-frontend)

Website: http://openex.io

OpenEx is a global open source platform allowing organizations to plan, schedule and conduct exercises. OpenEx is an [ISO 22398](http://www.iso.org/iso/iso_catalogue/catalogue_tc/catalogue_detail.htm?csnumber=50294) compliant product and has been designed as a modern web application including a RESTFul API and a UX oriented frontend.

## Releases download

The releases are available on the [OpenEx website](http://www.openex.io) in the [releases section](http://openex.io/releases). The website also provides a full [documentation](http://www.openex.io/documentation) about installation, usage and administration of the platform.   

## Status & Bugs

Currently OpenEx is under heavy development, if you wish to report bugs or ask for new features, you can find the product bug tracker here: https://projects.luatix.org/projects/openex or directly use the Github issues module.

## Softwares

#### API [[openex-api](https://github.com/LuatixHQ/openex-api)]

The API is the link between the frontend, the database and the worker, built with the [Symfony framework](https://symfony.com).

#### Frontend [[openex-frontend](https://github.com/LuatixHQ/openex-frontend)]

The frontend is the user interface of the product, built with the [ReactJS framework](https://facebook.github.io/react).

#### Worker [[openex-worker](https://github.com/LuatixHQ/openex-worker)]

The worker is the executor that send incidents and injects, built with the [Karaf framework](http://karaf.apache.org).
 
## Development

To contribute to the frontend development, please follow the next steps to deploy it.

*Installation*:

```bash
$ git clone https://github.com/LuatixHQ/openex-frontend
$ cd openex-frontend
$ yarn install
```

*Configuration*:

In the file package.json, replace the "proxy" by the URL of your API deployment.

*Starting*:

```bash
$ yarn start
```