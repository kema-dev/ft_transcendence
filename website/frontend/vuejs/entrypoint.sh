#!/bin/bash

# store env vars in .env file
echo "{\"API_42_UID\":\"${API_42_UID}\",\"API_42_REDIRECT_URI\":\"${API_42_REDIRECT_URI}\",\"FQDN\":\"${FQDN}\"}" > .env.json

# generate certificates
mkdir -p /secrets
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /secrets/key.pem -out /secrets/cert.pem -subj "/C=FR/ST=France/L=Paris/O=42/OU=42/CN=ft_transcendence"
chown 1000:1000 /secrets/key.pem
chown 1000:1000 /secrets/cert.pem

# run phase
yarn install --ignore-engines
yarn run "${VUE_PHASE}"
