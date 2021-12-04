FROM maven:3.8.4-openjdk-17

# Copy the worker
COPY . /opt/openex-player

# Build
RUN cd /opt/openex-player && mvn install

# Copy configuration
RUN cd /opt/openex-player && cp src/main/resources/application.properties target/

# Expose and entrypoint
COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh 

EXPOSE 8080/tcp
ENTRYPOINT ["/entrypoint.sh"]
