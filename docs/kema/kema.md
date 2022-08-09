# kema-dev

## ongoing

* TODO get ocean's page
* TODO send error codes like "E_NO_MAIL" instead of long messages
* TODO add messages to be displayed in vue variables
* TODO change "getbylogin/email" calls to "getuser" that check for both abd returns the same
* TODO tidy my code, dont use message comparison
* TODO use a component for 2FA, maybe an overlay (thus make a proper "ask_mfa_enabled" function)
* TODO don't create a Jwt on auth, but on security / 2fa component
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
