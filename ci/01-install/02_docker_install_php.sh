#!/bin/bash

# We need to install dependencies only for Docker
[[ ! -e /.dockerenv ]] && exit 0

set -xe

# Install Xdebug
pecl install Xdebug

# Install dependencies
apt-get install -yqq libpng-dev libjpeg-dev

# Configure php extensions
docker-php-ext-configure gd --with-jpeg-dir=/usr/include

# Install php extensions
docker-php-ext-install zip mbstring gd
