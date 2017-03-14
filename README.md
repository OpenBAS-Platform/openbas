# OpenEx - Open Exercises Platform [![Build Status](https://api.travis-ci.org/LuatixHQ/openex-worker.svg?branch=master)](https://travis-ci.org/LuatixHQ/openex-worker)

Website: http://openex.io

OpenEx is a global open source platform allowing organizations to plan, schedule and conduct exercises. OpenEx is an [ISO 22398](http://www.iso.org/iso/iso_catalogue/catalogue_tc/catalogue_detail.htm?csnumber=50294) compliant product and has been designed as a modern web application including a RESTFul API and a UX oriented frontend.

## Releases download

The releases are available on the [OpenEx website](http://www.openex.io) in the [releases section](http://openex.io/download). The website also provides a full [documentation](http://www.openex.io/documentation) about installation, usage and administration of the platform.   

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

To contribute to the worker development, please follow the next steps to deploy it.

*Installation*:

```bash
$ git clone https://github.com/LuatixHQ/openex-worker
$ cd openex-worker
$ mvn install
```

*Configuration*:

Create a directory *openex* in your main Karaf path.

```bash
$ cd /your/karaf/path
$ mkdir openex
```

Copy the 2 configuration files in the just created directory: 
```bash
$ cd /your/worker/path
$ cp distribution/src/main/filtered-resources/openex/*.properties /your/karaf/path/openex
```

Modify these files with your own parameters.

*Starting*:

```bash
$ cd /your/karaf/path
$ cd bin
$ ./karaf
```

*Launch services*:

```bash
$ feature:repo-add mvn:io.openex/worker-features/1.0.0-SNAPSHOT/xml/features
$ feature:install worker-features
```