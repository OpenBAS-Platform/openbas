#!/bin/bash

# We need to install dependencies only for Docker
[[ ! -e /.dockerenv ]] && exit 0

set -xe

# Install missing dependencies
apt-get update -yqq
apt-get install -yqq git unzip curl gpg
