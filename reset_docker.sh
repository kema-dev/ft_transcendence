#!/bin/zsh
docker stop $(docker ps -qa)
docker rm $(docker ps -qa)
docker rmi -f $(docker images -qa)
docker volume rm $(docker volume ls -q)
docker network rm $(docker network ls -q)
rm -f website/backend/nestjs/bind/package-lock.json
rm -f website/frontend/vuejs/bind/package-lock.json
rm -f website/frontend/vuejs/bind/yarn.lock
rm -rf website/backend/nestjs/bind/node_modules
rm -rf website/frontend/vuejs/bind/node_modules
