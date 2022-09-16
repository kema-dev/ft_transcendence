# kema-dev

## ongoing

* fix duplicate entries in `lobby_name` table (maybe flush more often)
* do not let non-owner players to change settings / start the game
* sync players in lobbies (existing players, new players in lobby, player leaving lobby)
* make `start` false when the game is over
* make a play again button
* do not flush user lobbies on page refresh (no `onMounted`)
* make user join conditionally (if the lobby is not full)

## later

* clean up warnings in containers creations
* make players shown on hover
* check identity of users istead of just checking if they are logged in (send session + login and check login against decoded session)
* make a refresh token function in backend and frontend (for frontend, ask for a refresh if $date + x > expiration\\_date$)
* fix "depends_on" directive in docker-compose.yml (use healthcheck)
* make the API **NOT** accessible from the outside (correct backend_status accordingly)
* make backend is up endpoint redirect to frontend
* update API's wiki
* find a way to generate valid https certificates for nestjs and vuejs (maybe using lets encrypt's certbot)
* change readme's images using a gif of a live game and some screenshots of the website
* Setup GitHub Actions for build testing

## on final server deployment

* http to https redirection (via certificate)
* set up elastic search for logs
