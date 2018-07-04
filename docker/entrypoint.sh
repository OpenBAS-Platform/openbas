#!/bin/sh

# Env vars
export APACHE_RUN_USER=www-data
export APACHE_RUN_GROUP=www-data
export APACHE_LOCK_DIR=/var/lock/apache2
export APACHE_PID_FILE=/var/run/apache2/apache2.pid
export APACHE_RUN_DIR=/var/run/apache2
export APACHE_LOG_DIR=/var/log/apache2

# Start log
/etc/init.d/rsyslog start

# Start PostgreSQL
service postgresql start

# Start Worker
/var/openex/openex-worker/bin/start &

# Start Apache2
exec apache2 -DNO_DETACH -k start
