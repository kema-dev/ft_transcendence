# kema-dev

## ongoing

* TODO add messages to be displayed in vue .data
* TODO tidy my code, dont use message comparison
* TODO add another page for 2FA
* TODO don't create a Jwt on auth, but on security / 2fa page
* TODO add possibility to change 2FA settings, verifying identity of the user before changing, and checking that user had the correct code before saving
* TODO set cookie on ALL authentication methods, with 2FA verification, and verify that cookie is not set w/e result the log gets

## later

* TODO find a way to generate valid https certificates for nestjs and vuejs (maybe using lets encrypt's certbot)
* TODO change readme's images using a gif of a live game and some screenshots of the website
* TODO Setup GitHub Actions for build testing

## known issues

* registering with a login / email further used with 42 connection makes 42 account override the previous account

## on final server deployment

* http to https redirection
* save logs every 10 minutes
