#!/bin/sh
docker stop $(docker ps -qa)
docker rm $(docker ps -qa)
docker network rm $(docker network ls -q)
rm -f website/backend/nestjs/bind/package-lock.json
rm -f website/frontend/vuejs/bind/package-lock.json
rm -f website/frontend/vuejs/bind/yarn.lock
rm -rf website/frontend/vuejs/bind/.env
rm -rf website/backend/nestjs/bind/.env
