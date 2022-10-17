# kema-dev

## ongoing

* On other player view, add a get back to my profile button

## optional

* change readme's images using a gif of a live game and some screenshots of the website
* add kind of Auth Guards to app.gateway.ts
* clean up warnings in containers creations
* make a refresh token function in backend and frontend (for frontend, ask for a refresh if $date + x > expiration\\_date$)
* make backend is up endpoint redirect to frontend

## on final server deployment

* find a way to generate valid https certificates for nestjs and vuejs (maybe using lets encrypt's certbot)
* http to https redirection (via certificate)
* update JWT secret (no MD5sum, use env file's provided variable)
