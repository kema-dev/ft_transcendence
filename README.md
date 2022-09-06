<div id="top"></div>

<!-- PROJECT LOGO -->
<br />
<div align="center" style="height:200px; margin-bottom:10%">
  <img src="assets/docker_moby.png" alt="Docker logo" style="height:30vh">
</div>

<!-- ABOUT THE PROJECT -->
## About The Project

<!-- TODO Put images / gifs from the project here -->

ft_transcendence is a 42 project, aiming to create a pong-like game using NestJS as backend framework, any TypeScript framework for frontend, and get this altogether using docker compose.

You can find complete subject <a href="docs/subject">here</a>.

### Built With

* <a href="https://www.docker.com/" target="_blank" title="Docker's website">Docker</a>
* <a href="https://nestjs.com/" target="_blank" title="NestJS's website">NestJS</a>
* <a href="https://vuejs.org/" target="_blank" title="Vue.js's website">Vue.js</a>
* <a href="https://www.postgresql.org/" target="_blank" title="postgreSQL's website">PostgreSQL</a>

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

* [Docker and Docker compose](https://docs.docker.com/compose/install/)

### Installation

1. Clone the repo

```sh
git clone https://github.com/kema-dev/ft_transcendence.git
```

2. Go to repository's folder

```sh
cd ft_transcendence
```

3. Create a `.env` file by executing a script

```sh
./generate_env_file.sh
```

4. Change default values (passwords, emails...) and add your 42 API credentials (API_42_UID, API_42_SECRET, and API_42_REDIRECT_URI) in `.env` file

<!-- USAGE EXAMPLES -->
## Usage

1. Build the project and make it available !

```sh
docker compose up --build
```

Below is a list of links to website's pages (assuming you're using default values in `.env` file):

* [website](https://localhost:443) - website served by vue.js
* [api](https://localhost:3000) - REST api served by nestjs
* [pgadmin](http://localhost:8081) - PostgreSQL administration tool

<!-- ROADMAP -->
## Roadmap

* To be decided

See the [open issues](https://github.com/kema-dev/ft_transcendence/issues) for a full list of proposed features (and known issues).

<!-- CONTACT -->
## Contact

We are 3 creators :

kema-dev - [GitHub](https://github.com/kema-dev)

oc8 - [GitHub](https://github.com/oc8)

Totolosa - [GitHub](https://github.com/Totolosa)

## Acknowledgments

* [Img Shields](https://shields.io)
* [README.MD-Template](https://github.com/othneildrew/Best-README-Template)
