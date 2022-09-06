#!/bin/zsh
docker exec -it `docker ps | grep $1 | awk '{print $1}'` /bin/bash
