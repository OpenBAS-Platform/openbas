#!/bin/sh

# Go to the right directory
cd /opt/openex

# Initialize schema
bin/console doctrine:schema:update

# Initialize data
bin/console app:db-init

# Launch Apache2
apache2-foreground
