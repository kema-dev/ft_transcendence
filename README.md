<div id="top"></div>

<p align=center>
  <img alt="Project's status" src="https://img.shields.io/badge/Status-Ongoing-brightgreen">
  <img alt="Project's primary language" src="https://img.shields.io/badge/Language-Typescript-blue">
  <img alt="Project's focus" src="https://img.shields.io/badge/Focus-Containerized%20website-blue">
</p>

<!-- PROJECT LOGO -->
<br />
<div align="center" style="height:200px; margin-bottom:10%">
  <img src="assets/docker_moby.png" alt="Docker logo" style="height:30vh">
</div>

<!-- ABOUT THE PROJECT -->
## About The Project

<!-- TODO Put images / gifs from the project here -->

**ft_transcendence** is a 42 project, aiming to create a pong-like game using NestJS as backend framework, any TypeScript framework for frontend, and get this altogether using docker compose.

You can find complete subject <a href="docs/subject">here</a>.

### Built With

* <a href="https://www.docker.com/" target="_blank" title="Docker's website">Docker</a>
* <a href="https://nestjs.com/" target="_blank" title="NestJS's website">NestJS</a>
* <a href="https://vuejs.org/" target="_blank" title="Vue.js's website">Vue.js</a>
* <a href="https://www.postgresql.org/" target="_blank" title="postgreSQL's website">PostgreSQL</a> / <a href="https://typeorm.io/" target="_blank" title="TypeORM's website">TypeORM</a>

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

3. Create `.env` file from `.env.example` template
```sh
cp .env.example .env
```

4. Change default values (passwords, emails...) and replace `PLACEHOLDERS` under `# Your environment ?` in `.env` file

<!-- USAGE EXAMPLES -->
## Usage

* Dev environment

```sh
docker compose up --build
```

* Prod environment (do not forget to change `VUE_PHASE` to `build` and `NEST_PHASE` to `start:prod` in `.env` file)

```sh
docker-compose --profile prod up --build
```

Below is a list of links to website's pages (assuming you're using default values in `.env` file):

* [website](https://localhost:443) - website served by vue.js
* [api](https://localhost:3000) - REST api served by nestjs
* [pgadmin](http://localhost:8081) - PostgreSQL administration tool

<!-- CONTACT -->
## Contact

We are 3 creators :

kema-dev - [GitHub](https://github.com/kema-dev)

oc8 - [GitHub](https://github.com/oc8)

Totolosa - [GitHub](https://github.com/Totolosa)

## Acknowledgments

* [Img Shields](https://shields.io)
* [README.MD-Template](https://github.com/othneildrew/Best-README-Template)
