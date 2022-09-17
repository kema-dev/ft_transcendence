# kema-dev

## ongoing

* fix backend crash when user in `login` cookie is not in database
* fix lobbies list listing
* find about `lobby_name` to group players (how to make a player join a lobby / socket.io rooms)
* do not let non-owner players to change settings / start the game
* sync players in lobbies (existing players, new players in lobby, player leaving lobby)
* make `start` false when the game is over
* make a join button in lobbies list
* make a play again button
* do not flush user lobbies on update

## later

* make players shown on hover and a join button
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
