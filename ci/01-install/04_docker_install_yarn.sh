#!/bin/bash

# We need to install dependencies only for Docker
[[ ! -e /.dockerenv ]] && exit 0

set -xe

# Install Node.js and npm
wget --quiet https://nodejs.org/dist/v8.12.0/node-v8.12.0-linux-x64.tar.xz -O $HOME/node-v8.12.0-linux-x64.tar.xz
mkdir $HOME/node-v8.12.0
tar xf $HOME/node-v8.12.0-linux-x64.tar.xz --directory $HOME/node-v8.12.0
PATH="$HOME/node-v8.12.0/node-v8.12.0-linux-x64/bin:$PATH"

# Install yarn
curl --silent -o- -L https://yarnpkg.com/install.sh | bash
PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"

export PATH="$HOME/node-v8.12.0/node-v8.12.0-linux-x64/bin:$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"
