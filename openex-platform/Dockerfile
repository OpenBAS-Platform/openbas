FROM chialab/php:7.4-apache

ENV APACHE_DOCUMENT_ROOT /opt/openex/public

RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Copy work files
COPY openex-api /opt/openex
RUN cd /opt/openex && php composer.phar install --no-progress --no-interaction

# Expose and entrypoint
COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh 

EXPOSE 80/tcp
ENTRYPOINT ["/entrypoint.sh"]
