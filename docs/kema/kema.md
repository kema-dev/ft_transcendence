# kema-dev

## ongoing

* TODO make lobbies updated not recreated
* TODO warn when a lobby is full / max-min balls / max-min players
* TODO find about `lobby_name` to group players (how to make a player join a lobby / socket.io rooms)
* TODO lobby sync across players (store in DB) (party owner rules everything)
* TODO sync players in lobbies (existing players, new players in lobby, player leaving lobby)
* TODO loby selection page (option to create a new one)
* TODO autofill option (join first available lobby)

## later

* TODO check identity of users istead of just checking if they are logged in (send session + login and check login against decoded session)
* TODO make a refresh token function in backend and frontend (for frontend, ask for a refresh if $date + x > expiration\\_date$)
* TODO fix "depends_on" directive in docker-compose.yml (use healthcheck)
* TODO make the API **NOT** accessible from the outside (correct backend_status accordingly)
* TODO make backend is up endpoint redirect to frontend
* TODO update API's wiki
* TODO find a way to generate valid https certificates for nestjs and vuejs (maybe using lets encrypt's certbot)
* TODO change readme's images using a gif of a live game and some screenshots of the website
* TODO Setup GitHub Actions for build testing

## on final server deployment

* http to https redirection (via certificate)
* set up elastic search for logs
