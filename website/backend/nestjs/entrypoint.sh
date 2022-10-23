#!/bin/bash

# avoid secret collisions + plain text secrets
COMPUTED_SECRET=$(echo -n "${JWT_SECRET}_$(date +%s)" | sha256sum | cut -d ' ' -f 1)

# store env vars in .env file
echo -e "POSTGRES_PORT=${POSTGRES_PORT}\nPOSTGRES_USER=${POSTGRES_USER}\nPOSTGRES_PASSWORD=${POSTGRES_PASSWORD}\nPOSTGRES_DB=${POSTGRES_DB}\nJWT_MAX_AGE=${JWT_MAX_AGE}\nJWT_SECRET=${COMPUTED_SECRET}\nAPI_42_UID=${API_42_UID}\nAPI_42_SECRET=${API_42_SECRET}\nAPI_42_REDIRECT_URI=${API_42_REDIRECT_URI}\nFQDN=${FQDN}" > .env

export JWT_SECRET="${COMPUTED_SECRET}"

# generate certificates
mkdir -p /secrets
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /secrets/key.pem -out /secrets/cert.pem -subj "/C=FR/ST=France/L=Paris/O=42/OU=42/CN=ft_transcendence"
chmod 777 /secrets/key.pem
chmod 777 /secrets/cert.pem

# run phase
npm config set fund false
npm install
npm run ${NEST_PHASE}
