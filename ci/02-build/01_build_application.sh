#!/bin/bash

# We need to install dependencies only for Docker
[[ ! -e /.dockerenv ]] && exit 0

set -xe

# Get current working dir
CWD=$(pwd)

# Install dependencies
cd ${CWD}/api && composer install --no-progress --no-interaction # install project's dependencies (composer)
cd ${CWD}/frontend && yarn install --silent --non-interactive    # install project's dependencies (yarn)

# Build application
cd ${CWD}/frontend && yarn build
