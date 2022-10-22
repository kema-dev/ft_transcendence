# kema-dev

## ongoing

- onglet chat, dans un channel auqnd tu click sur Info->More(sur user)->Invite game
- onglet user, sur les profils des users via le bouton (je vais re design les profils friends et pas friends)
- add notification for game invitations

## optional

* change readme's images using a gif of a live game and some screenshots of the website
* add kind of Auth Guards to app.gateway.ts
* clean up warnings in containers creations
* make a refresh token function in backend and frontend (for frontend, ask for a refresh if $date + x > expiration\\_date$)
* make backend is up endpoint redirect to frontend

## on final server deployment

* find a way to generate valid https certificates for nestjs and vuejs (maybe using lets encrypt's certbot)
* http to https redirection (via certificate)
