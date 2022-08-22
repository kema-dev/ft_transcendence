# kema-dev

## ongoing

* TODO check why mfa code is not valid in backend
* TODO review controllers' args
* TODO fix E_NO_NAME error in verify_totp
* TODO handle E_GOOGLE_API, E_NO_NAME and E_TOTP_MISMATCH in totp related calls in frontend
* TODO send login request after getting proper mfa code (by previously calling a 'getMfaStatus' function)
* TODO make connection persistant for classical / 42 login methods using a jwt and guards / strategies (guard1 = password / 42logprocess ok, guard2 = jwt ok, create jwt on successful login)
* TODO add possibility to change 2FA settings, verifying identity of the user before changing, and checking that user had the correct code before saving
* TODO protect authenticated endpoints with guards

## later

* TODO update API's wiki
* TODO find a way to generate valid https certificates for nestjs and vuejs (maybe using lets encrypt's certbot)
* TODO change readme's images using a gif of a live game and some screenshots of the website
* TODO Setup GitHub Actions for build testing

## on final server deployment

* http to https redirection (via certificate)
* set up elastic search for logs
