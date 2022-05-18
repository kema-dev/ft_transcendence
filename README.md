<div id="top"></div>
<p align=center>
  <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/kema-dev/ft_transcendence">
  <img alt="GitHub issues" src="https://img.shields.io/github/issues/kema-dev/ft_transcendence">
  <img alt="GitHub top language" src="https://img.shields.io/github/languages/top/kema-dev/ft_transcendence">
</p>

<!-- PROJECT LOGO -->
<br />
<div align="center" style="height:200px; margin-bottom:10%">
  <a>
    <img src="assets/docker_moby.png" alt="Docker logo">
  </a>
</div>

<!-- TABLE OF CONTENTS -->
<summary>Table of Contents</summary>
<ol>
<li>
	<a href="#about-the-project">About The Project</a>
	<ul>
	<li><a href="#built-with">Built With</a></li>
	</ul>
</li>
<li>
	<a href="#getting-started">Getting Started</a>
	<ul>
	<li><a href="#prerequisites">Prerequisites</a></li>
	<li><a href="#installation">Installation</a></li>
	</ul>
</li>
<li><a href="#usage">Usage</a></li>
<li><a href="#roadmap">Roadmap</a></li>
<li><a href="#contact">Contact</a></li>
<li><a href="#acknowledgments">Acknowledgments</a></li>
</ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

<div align="center" style="height:200px; margin-bottom:10%">
  <a>
    <img src="assets/docker_moby.png" alt="Docker logo">
  </a>
</div>
<!-- TODO Put images from the project here -->

ft_transcendence is a 42 project, aiming to create a pong like game using NestJS as backend framework, any TypeScript framework for frontend, and get this altogether using docker compose. You can find complete subject <a href="docs/subject">here</a>.

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

3. Create a `.env` file containing the project variables (do not forget to change default values)

   ```.env
   BACKEND_PORT=3000
   FRONTEND_PORT=8080
   VUE_PHASE=serve
   NEST_PHASE=start:dev
   POSTGRESQL_PASSWORD=postgres_pass
   POSTGRESQL_DATABASE=postgres_db
   POSTGRESQL_PORT=5432
   POSTGRESQL_USERNAME=postgres
   POSTGRESQL_HOST=localhost
   POSTGRESQL_POSTGRES_PASSWORD=postgres_pass
   API_42_CLIENT_ID=YOUR_API_42_CLIENT_ID
   API_42_CLIENT_SECRET=YOUR_API_42_CLIENT_SECRET
   API_42_REDIRECT_URI=YOUR_API_42_REDIRECT_URI
   ```

<!-- USAGE EXAMPLES -->
## Usage

1. Build the project and make it available !

   ```sh
   docker compose up --build
   ```

<!-- ROADMAP -->
## Roadmap

* To be decided

See the [open issues](https://github.com/kema-dev/ft_transcendence/issues) for a full list of proposed features (and known issues).

<!-- CONTACT -->
## Contact

We are 4 creators :

kema-dev - [GitHub](https://github.com/kema-dev)

dorianginisty - [GitHub](https://github.com/dorianginisty)

<!-- TODO Add Ocean and Thomas as creators -->

## Acknowledgments

* [Img Shields](https://shields.io)
* [README.MD-Template](https://github.com/othneildrew/Best-README-Template)
