#!/bin/zsh
echo "BACKEND_PORT=3000
FRONTEND_PORT_HTTP=80
FRONTEND_PORT_HTTPS=443
FRONTEND_EXPOSED_HTTP=80
FRONTEND_EXPOSED_HTTPS=443
VUE_PHASE=serve
NEST_PHASE=start:dev
POSTGRESQL_PASSWORD=postgres_pass
POSTGRESQL_DATABASE=postgres_db
POSTGRESQL_PORT=5432
POSTGRESQL_USERNAME=postgres
POSTGRESQL_HOST=localhost
POSTGRESQL_POSTGRES_PASSWORD=postgres_pass
PGADMIN_PORT_HTTP=80
PGADMIN_HOST_PORT=8080
PGADMIN_EMAIL=pgadmin@example.com
PGADMIN_PASSWORD=pgadmin_pass
JWT_MAX_AGE=86400
FQDN=https://localhost
API_42_UID=
API_42_SECRET=
API_42_REDIRECT_URI=
" > .env
