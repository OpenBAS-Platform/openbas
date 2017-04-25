# DEV CONFIG
etc/org.ops4j.pax.url.mvn.cfg => org.ops4j.pax.url.mvn.defaultLocalRepoAsRemote=true

# INTERESTING COMMANDS
mvn install
karaf debug
feature:repo-add mvn:io.openex/worker-features/1.0.0/xml/features
feature:uninstall worker-features
feature:install worker-features
bundle:watch *
log:display

# DEPLOYMENT
mvn install
unzip distribution\target\worker-distribution-1.0.0.zip
modify etc\openex.properties
start karaf executable

# REST SERVICES
GET http://localhost:8181/cxf/contracts
POST {json} http://localhost:8181/cxf/worker/{worker_ident}