# Use the official Docker Hub Ubuntu 18.04 base image
FROM ubuntu:18.04

# Update the base image
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get -y upgrade && apt-get -y dist-upgrade

# Setup install environment and OpenCTI dependencies
RUN DEBIAN_FRONTEND=noninteractive apt-get -y install apache2 libapache2-mod-php7.2 sudo rsyslog wget openjdk-8-jre

# Enable the Apache rewrite module
RUN a2enmod rewrite
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Install PHP dependencies
RUN DEBIAN_FRONTEND=noninteractive apt-get -y install php7.2-cli php7.2-xml php7.2-pgsql php7.2-ldap php7.2-json php7.2-curl composer

# Create the database
COPY sql/init.sql /
RUN service postgresql start && sudo -u postgres psql -f init.sql

# Create the properties folder
RUN mkdir /properties

# Download archive
RUN mkdir /var/openex
RUN wget -O /var/openex/openex.tar.gz http://releases.openex.io/openex-release-201807.tar.gz
RUN cd /var/openex && tar xvfz /var/openex/openex.tar.gz

# Configure the app
COPY sql/parameters.yml /var/openex/openex-app/app/config/
COPY sql/config_database.sh /
RUN chmod +x /config_database.sh
RUN sed -i -e "s/SECRET_TO_REPLACE/`date +%s | sha256sum | base64 | head -c 40`/g" /var/openex/openex-app/app/config/parameters.yml
RUN service postgresql start && /config_database.sh

# Chown and create symlink
RUN chown -R 33:33 /var/openex/openex-app
RUN rm -Rf /var/www/html && ln -s /var/openex/openex-app/web /var/www/html

# Copy properties
COPY properties/* /var/openex/openex-worker/openex/
RUN sed -i -e "s#TOKEN_TO_REPLACE#`cat /var/openex/token`#g" /var/openex/openex-worker/openex/openex.properties

# Expose and entrypoint
COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh 
EXPOSE 80/tcp
ENTRYPOINT ["/entrypoint.sh"]
