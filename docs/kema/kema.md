# kema-dev

## ongoing

gerer E_GOOGLE_API
gerer E_NO_NAME
gerer E_TOTP_MISMATCH
revoir auth42

* TODO update API's wiki
* TODO tidy trailing warnings in logs
* TODO fix anchors
* TODO review controllers' args

* TODO send login request after getting proper mfa code (by previously calling a 'getMfaStatus' function)
* TODO make connection persistant for classical / 42 login methods using a jwt and guards / strategies
* TODO add possibility to change 2FA settings, verifying identity of the user before changing, and checking that user had the correct code before saving
* TODO set cookie on ALL authentication methods, with 2FA verification, and verify that cookie is not set w/e result the log gets

## later

* TODO find a way to generate valid https certificates for nestjs and vuejs (maybe using lets encrypt's certbot)
* TODO change readme's images using a gif of a live game and some screenshots of the website
* TODO Setup GitHub Actions for build testing

## on final server deployment

* http to https redirection (via certificate)
* set up elastic search for logs
