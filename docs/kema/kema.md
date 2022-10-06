# kema-dev

## ongoing

* clean up warnings in containers creations

* add link to security page
* security page's UI
* add AuthGuards to all endpoints (except login, etc...)
* check identity of users istead of just checking if they are logged in (send session + login and check login against decoded session)
* change readme's images using a gif of a live game and some screenshots of the website

## optional

* make a refresh token function in backend and frontend (for frontend, ask for a refresh if $date + x > expiration\\_date$)
* make the API **NOT** accessible from the outside (correct backend_status accordingly)
* make backend is up endpoint redirect to frontend
* update API's wiki
* find a way to generate valid https certificates for nestjs and vuejs (maybe using lets encrypt's certbot)

## on final server deployment

* http to https redirection (via certificate)
* update JWT secret (no MD5sum, use env file's provided variable)
