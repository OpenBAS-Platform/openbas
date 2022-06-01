FROM node:16.6.0-alpine3.14 AS front-builder

WORKDIR /opt/openex-build/openex-front
COPY openex-front/packages ./packages
COPY openex-front/.yarn ./.yarn
COPY openex-front/package.json openex-front/yarn.lock openex-front/.yarnrc.yml ./
RUN yarn install
COPY openex-front /opt/openex-build/openex-front
RUN yarn build

FROM maven:3.8.5-openjdk-18 AS api-builder

WORKDIR /opt/openex-build/openex
COPY openex-model ./openex-model
COPY openex-framework ./openex-framework
COPY openex-api ./openex-api
COPY openex-injectors ./openex-injectors
COPY pom.xml ./pom.xml
COPY --from=front-builder /opt/openex-build/openex-front/build ./openex-front/build
RUN mvn install -DskipTests -Pdev

FROM openjdk:18-slim AS app

RUN DEBIAN_FRONTEND=noninteractive apt-get update -q && DEBIAN_FRONTEND=noninteractive apt-get install -qq -y tini;
COPY --from=api-builder /opt/openex-build/openex/openex-api/target/openex-api.jar ./

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["java", "-jar", "openex-api.jar"]
