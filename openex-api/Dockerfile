FROM maven:3.6.3-openjdk-17

# Copy the worker
COPY . /opt/openex-api

# Build
RUN cd /opt/openex-api && mvn install -DskipTests

# Copy configuration
RUN cd /opt/openex-api && cp src/main/resources/application.properties target/

# Expose and entrypoint
COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh 

EXPOSE 8080/tcp
ENTRYPOINT ["/entrypoint.sh"]
