FROM openjdk:17

# Expose and entrypoint
COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh

EXPOSE 80/tcp
ENTRYPOINT ["/entrypoint.sh"]