<template>
	<div class="center column">
		<img src="@/assets/logo.png" alt='logo'/>
		<h1>PONG.IO</h1>
		<input v-model="email_register" placeholder="email_register" />
		<input v-model="username_register" placeholder="username_register" />
		<input v-model="password_register" placeholder="password_register" />
		<button @click="this.register()">Register with email / username / password</button>
		<input v-model="email_auth" placeholder="email_auth" />
		<input v-model="password_auth" placeholder="password_auth" />
		<button @click="this.auth()">Auth with email / password</button>
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

<script lang="ts">
import Config from '../env.json';
import axios from 'axios';

export default {
	name: "App",
	data() {
		return {
			rootPath: "http://localhost:8080/",
			apiPath: "http://localhost:3000/api/v1/",
			api42Path:
				"https://api.intra.42.fr/oauth/authorize?client_id=" + Config.API_42_CLIENT_ID + "&redirect_uri=" + Config.API_42_REDIRECT_URI + "&response_type=code",
			email_register: "",
			username_register: "",
			password_register: "",
			email_auth: "",
			password_auth: "",
		};
	},
	methods: {
		register() {
			axios
				.post(this.apiPath + "auth/register", {
					email: this.email_register,
					name: this.username_register,
					password: this.password_register,
				})
				.then((response) => {
					console.log(response.data);
				})
				.catch((error) => {
					console.log(error);
				});
		},
		auth() {
			axios
				.post(this.apiPath + "auth/login", {
					email: this.email_auth,
					password: this.password_auth,
				})
				.then((response) => {
					console.log(response.data);
				})
				.catch((error) => {
					console.log(error);
				});
		},
	},
	created() { // FIXME redirect without code when successfully authenticated
		// TODO replace get code by backend api check connection
		let urlParams = new URLSearchParams(window.location.search);
		let code = urlParams.get("code");
		if (code) {
			axios
				.post(this.apiPath + "auth/login42", {
					code: code,
				})
				.then((response) => {
					console.log(response.data);
				})
				.catch((error) => {
					console.log(error);
				});
		}
	},
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
}
</script>


<style></style>
