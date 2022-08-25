# kema-dev

## ongoing

* TODO make an authorize backend certificate warning for each page
* TODO learn more about jwt construction
* TODO make a guard, checking the stored cookie against the jwt, and add this guard to the routes. Maybe find a way to send the cookie by default in every request.
* TODO make frontend function to delete cookie for logout (call deletecookie on backend)
* TODO improve 2FA page
* TODO make a refresh token function in backend and frontend (for frontend, ask for a refresh if $date + x > expiration\\_date$)

## later

* TODO update API's wiki
* TODO find a way to generate valid https certificates for nestjs and vuejs (maybe using lets encrypt's certbot)
* TODO change readme's images using a gif of a live game and some screenshots of the website
* TODO Setup GitHub Actions for build testing

## on final server deployment

* http to https redirection (via certificate)
* set up elastic search for logs
