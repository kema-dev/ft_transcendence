# First build stage
FROM bitnami/node:18

LABEL "Maintainer"="kema-dev"

RUN mkdir -p /scripts

COPY entrypoint.sh /scripts/entrypoint.sh

ENTRYPOINT [ "/scripts/entrypoint.sh" ]
