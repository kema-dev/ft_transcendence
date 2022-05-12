<template>
	<div id="app">
		<h1>Hello Vue!</h1>
		<p>
			<a :href="this.api42Path">AUTHENTICATE WITH 42</a>
		</p>
		<p>
			<button @click="this.reset()">RESET</button>
		</p>
    <p>
			<button @click="this.getAll()">GET ALL USERS</button>
		</p>
	</div>
</template>

<script>
import axios from "axios";

export default {
	name: "App",
	data() {
		return {
			rootPath: "http://localhost:8080",
			apiPath: "http://localhost:3000/api/",
			api42Path:
				"https://api.intra.42.fr/oauth/authorize?client_id=4b42a21a05efa463774526895b6026f4d6119d07eac916ee0670f6985f63904e&redirect_uri=http%3A%2F%2Flocalhost%3A8080&response_type=code",
		};
	},
	created() {
		// TODO replace get code by backend api check connection
		let urlParams = new URLSearchParams(window.location.search);
		let code = urlParams.get("code");
		if (code) {
			axios
				.post(this.apiPath + "auth/login", {
					code: code,
				})
				.then((response) => {
					console.log(response.data); // TODO Find a way not to receive the token in the response
				})
				.catch((error) => {
					console.log(error);
				});
		}
	},
	methods: {
		reset() {
			window.location.href = this.rootPath;
			axios
				.post(this.apiPath + "auth/reset/", {})
				.then((response) => {
					console.log(response.data);
				})
				.catch((error) => {
					console.log(error);
				});
		},
    getAll() {
      axios
        .get(this.apiPath + "auth/getUsers/")
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }
	},
};
</script>

<style>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
}
</style>
