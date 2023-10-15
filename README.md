<h1 align="center">
  <a href="https://openex.io"><img src="https://filigran.io/wp-content/uploads/2023/10/openex_github.png" alt="OpenEx"></a>
</h1>
<p align="center">
  <a href="https://openex.io" alt="Website"><img src="https://img.shields.io/badge/website-openex.io-blue.svg" /></a>
  <a href="https://docs.openex.io" alt="Documentation"><img src="https://img.shields.io/badge/documentation-latest-orange.svg" /></a>
  <a href="https://community.filigran.io" alt="Slack"><img src="https://img.shields.io/badge/slack-3K%2B%20members-4A154B" /></a>
  <a href="https://drone.filigran.io/OpenEx-Platform/openex"><img src="https://drone.filigran.io/api/badges/OpenEx-Platform/openex/status.svg" /></a>
  <a href="https://codecov.io/gh/OpenEx-Platform/openex"><img src="https://codecov.io/gh/OpenEx-Platform/openex/graph/badge.svg" /></a>
  <a href="https://deepscan.io/dashboard#view=project&tid=11710&pid=14631&bid=276803"><img src="https://deepscan.io/api/teams/11710/projects/14631/branches/276803/badge/grade.svg" alt="DeepScan grade"></a>
  <a href="https://hub.docker.com/u/openexhq" alt="Docker pulls"><img src="https://img.shields.io/docker/pulls/openexhq/platform" /></a>
</p>

## Introduction

OpenEx is an open source platform allowing organizations to plan, schedule and conduct crisis exercises as well as adversary simulation campaign. OpenEx is an [ISO 22398](http://www.iso.org/iso/iso_catalogue/catalogue_tc/catalogue_detail.htm?csnumber=50294) compliant product and has been designed as a modern web application including a RESTFul API and an UX oriented frontend.

![Screenshot](https://filigran.io/wp-content/uploads/2023/10/openex-dashboard.png "Screenshot")

## Objective

The goal is to create a powerful, reliable and open source tool to effectively plan and play all types of training, exercises and simulation from the technical level to the strategic one. The need for rationalization and capitalization from one year to the next, as well as the publication of ISO 22398: 2013 standard necessarily lead to the need to acquire specific software. 

OpenEx aims to respond to these issues, which not only concern state services but also many private organizations. With different modules (scenarios, audiences, simulations, verification of means of communication, encryption, etc.), the platform offers advantages such as collaborative work, real-time monitoring, statistics or the management of feedback.

Finally, OpenEx supports different types of inject, allowing the tool to be integrated with emails, SMS platforms, social medias, alarm systems, etc. All currently supported integration can be found in the [OpenEx ecosystem](https://filigran.notion.site/OpenEx-Ecosystem-30d8eb73d7d04611843e758ddef8941b).

## Editions of the platform

OpenEx platform has 2 different editions: Community (CE) and Enterprise (EE). The purpose of the Enterprise Edition is to provide [additional and powerful features](https://filigran.io/offering/subscribe) which require specific investments in research and development. You can enable the Enterprise Edition directly in the settings of the platform.

* OpenEx Community Edition, licensed under the [Apache 2, Version 2.0 license](LICENSE).
* OpenEx Enterprise Edition, licensed under the [Non-Commercial license](LICENSE).

To understand what OpenEx Enterprise Edition brings in terms of features, just check the [Enterprise Editions page](https://filigran.io/offering/subscribe) on the Filigran website. You can also try this edition by enabling it in the settings of the platform.

## Documentation and demonstration

If you want to know more on OpenEx, you can read the [documentation on the tool](https://docs.openex.io). If you wish to discover how the OpenEx platform is working, a [demonstration instance](https://demo.openex.io) is available and open to everyone. This instance is reset every night and is based on reference data maintained by the OpenEx developers.

## Releases download

The releases are available on the [Github releases page](https://github.com/OpenEx-Platform/openex/releases). You can also access the [rolling release package](https://releases.openex.io) generated from the mater branch of the repository.

## Installation

All you need to install the OpenEx platform can be found in the [official documentation](https://filigran.notion.site/OpenEx-Public-Knowledge-Base-bbc835446e9140999d6f2e10d96c2ee0). For installation, you can:

* [Use Docker](https://docs.openex.io/latest/deployment/installation/#using-docker)
* [Install manually](https://docs.openex.io/latest/deployment/installation/#install-manually)

## Contributing

### Code of Conduct

OpenEx has adopted a [Code of Conduct](CODE_OF_CONDUCT.md) that we expect project participants to adhere to. Please read the [full text](CODE_OF_CONDUCT.md) so that you can understand what actions will and will not be tolerated.

### Contributing Guide

Read our [contributing guide](CONTRIBUTING.md) to learn about our development process, how to propose bugfixes and improvements, and how to build and test your changes to OpenEx.

### Beginner friendly issues

To help you get you familiar with our contribution process, we have a list of [beginner friendly issues](https://github.com/OpenEx-Platform/openex/labels/beginner%20friendly%20issue) which are fairly easy to implement. This is a great place to get started.

### Development

If you want to actively help OpenEx, we created a [dedicated documentation](https://filigran.notion.site/Environment-setup-7b7754139072490aa9cb01f798ba8d5b) about the deployment of a development environement and how to start the source code modification.

## Community

### Status & bugs

Currently OpenEx is under heavy development, if you wish to report bugs or ask for new features, you can directly use the [Github issues module](https://github.com/OpenEx-Platform/openex/issues).

### Discussion

If you need support or you wish to engage a discussion about the OpenEx platform, feel free to join us on our [Slack channel](https://community.filigran.io). You can also send us an email to contact@filigran.io.

## About

### Authors

OpenEx is a product designed and developed by the company [Filigran](https://filigran.io).

<a href="https://filigran.io" alt="Filigran"><img src="https://filigran.io/wp-content/uploads/2023/08/filigran_text_medium.png" width="200" /></a>

### GDPR and the OpenEx OpenStreetMap server

In order to provide OpenEx users with cartography features, the platform uses a dedicated OpenStreetMap server (https://map.openex.io). To monitor usage and adapt services performances, Filigran collects access log to this server (including IP addresses).

By using this server, you authorize Filigran to collect this information. Otherwise, you are free to deploy your own OpenStreetMap server and modify the platform configuration accordingly.

If you have started using the Filigran server and change your mind, you have the right to access, limit, rectify, erase and receive your data. To exercise your rights, please send your request to contact@filigran.io.

