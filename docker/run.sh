#!/bin/sh

token=`date +%s | sha256sum | base64 | head -c 40`

 sed -i -e "s/TOKEN_TO_REPLACE/${token}/g" ./sql/init.sql
 sed -i -e "s/TOKEN_TO_REPLACE/${token}/g" ./properties/openex.properties

 docker-compose up