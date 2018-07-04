#!/bin/sh

until sudo -u postgres psql -d openex -c "select 1" > /dev/null 2>&1 ; do
  echo "Waiting for PostgreSQL server..."
  sleep 5
done

cd /var/openex/openex-app
php bin/console doctrine:schema:create
php bin/console app:db-init|grep "Creating token for user admin: "|cut -c32- > /var/openex/token
