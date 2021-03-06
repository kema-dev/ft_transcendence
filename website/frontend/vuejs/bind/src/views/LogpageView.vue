<template>
	<div class="center column" id="app">
		<a v-if="!backend_status" class="back_msg" :href="this.apiPath + 'auth/status'">Please click here to authorize backend's certificate</a>
		<Transition name="showup">
			<div v-if="show" class="outer">
				<div class="inner">
					<img src="@/assets/logo.png" alt="logo" />
					<div class="top_margin">
						<h1>pong.io</h1>
					</div>
					<span class="switcher switcher-1">
						<input
							type="checkbox"
							id="switcher-1"
							value="true"
							v-model="switch_value"
						/>
						<label for="switcher-1"></label>
					</span>
					<div class="transi">
						<Transition name="slide-up">
							<div v-if="switch_value" class="form_register">
								<input
									class="input_box"
									v-model="email_register"
									placeholder="email"
									type="email"
								/>
								<input
									class="input_box"
									v-model="login_register"
									placeholder="login"
									type="text"
								/>
								<input
									class="input_box"
									v-model="password_register"
									placeholder="password"
									type="password"
								/>
								<input
									class="input_box"
									v-model="password_confirmation"
									placeholder="password confirmation"
									type="password"
								/>
								<button class="login-btn" @click="this.register()">
									Register
								</button>
							</div>
							<div v-else class="form_login">
								<input
									class="input_box"
									v-model="email_auth"
									placeholder="email or login"
									type="text"
								/>
								<input
									class="input_box"
									v-model="password_auth"
									placeholder="password"
									type="password"
								/>
								<button @click="this.auth()">Login</button>
							</div>
						</Transition>
					</div>
					<div class="ft_login">
						<a :href="this.api42Path"
							><img
								src="@/assets/connect_with_42.svg"
								alt="connect with 42"
								class="connect_img"
						/></a>
					</div>
				</div>
			</div>
		</Transition>
	</div>
</template>

<script>
import axios from "axios";
import Config from "../env.json";
import { useToast } from "vue-toastification";

export default {
	name: "App",
	title: "Pong.io",
	data() {
		return {
			rootPath: "https://localhost/",
			apiPath: "https://localhost:3000/api/v1/",
			api42Path:
				"https://api.intra.42.fr/oauth/authorize?client_id=" +
				Config.API_42_UID +
				"&redirect_uri=" +
				Config.API_42_REDIRECT_URI +
				"&response_type=code",
			email_register: "",
			login_register: "",
			password_register: "",
			password_confirmation: "",
			email_auth: "",
			password_auth: "",
			show: false,
			switch_value: true,
			docState: "saved",
			backend_status: true,
		};
	},
	provide() {
		return {
			defaultState: this.switch_value,
		};
	},
	setup() {
		const toast = useToast();
		return { toast };
	},
	methods: {
		change_form() {
			this.switch_value = !this.switch_value;
		},
		register() {
			axios
				.post(this.apiPath + "auth/register", {
					email: this.email_register,
					login: this.login_register,
					password: this.password_register,
					password_confirmation: this.password_confirmation,
				})
				.then(() => {
					this.toast.success(
						"Registration success, welcome " + this.login_register + " !"
					);
					this.$router.push("/home");
				})
				.catch((error) => {
					if (
						error.response.data.message ===
						"User with that email and/or login already exists, please try again"
					) {
						this.toast.warning(
							"User with that email and/or login already exists, please try again"
						);
					} else if (error.response.data.message === "Passwords do not match") {
						this.toast.warning("Passwords do not match");
					} else if (
						error.response.data.message.search("Password must contain") !== -1
					) {
						this.toast.warning(
							"Password must contain at least one lowercase letter, one uppercase letter, one digit, one special character (!@#$%^&*) and must be between 10 and 32 characters long"
						);
					} else if (error.response.data.message === "Email is not valid") {
						this.toast.warning("Email is not valid");
					} else if (error.response.data.message === "Login is not valid") {
						this.toast.warning(
							'Login is not valid, must be between 1 and 25 characters long, using alphanumeric characters, "_" and "-" only'
						);
					} else {
						this.toast.error("Unknown error, we are sorry for that 😥");
						console.error(error);
					}
				});
		},
		auth() {
			axios
				.post(this.apiPath + "auth/login", {
					email: this.email_auth,
					password: this.password_auth,
				})
				.then((response) => {
					this.toast.success(
						"Authentication success, welcome " + response.data.login + " !"
					);
					this.$router.push("/home");
				})
				.catch((error) => {
					if (error.response.data.message === "Wrong credentials provided") {
						this.toast.warning("Wrong credentials provided, please try again");
					} else {
						this.toast.error("Unknown error, we are sorry for that 😥");
						console.error(error);
					}
				});
		},
	},
	created() {
		axios
			.get(this.apiPath + "auth/status")
			.then(() => {
				this.backend_status = true;
				setTimeout(() => {
					this.show = true;
				}, 0.5);
				let urlParams = new URLSearchParams(window.location.search);
				let code = urlParams.get("code");
				if (code) {
					axios
						.post(this.apiPath + "auth/login42", {
							code: code,
						})
						.then((response) => {
							// console.log(response.data);
							this.toast.success(
								"Authentication success, welcome " + response.data.login + " !"
							);
							this.$router.replace("/home");
						})
						.catch((error) => {
							this.toast.error("Authentication failure, please try again");
							console.error(error);
						});
				}
			})
			.catch(() => {
				setTimeout(() => {
					this.backend_status = false;
					this.toast.error(
						"Backend is down, please authorize our self-signed certificate manually by clicking the button at the center of your screen"
					);
				}, 0.5);
			});
	},
};
</script>


<style>
.box {
	text-align: center;
	margin-bottom: 30px;
}

.toggle_container {
	margin: 0px auto;
	background: #efefef;
	width: 120px;
	padding: 10px 0;
	border-radius: 30px;
	transition: all 0.25s;
}

.toggle_container.active {
	background: #e9ffef;
}

.outer .inner {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100vh;
	width: 100vw;
}
.showup-enter-active,
.showup-leave-active {
	transition: all 0.5s ease-in-out;
}

.showup-leave-active {
	transition-delay: 0.5s;
}

.showup-enter-from,
.showup-leave-to {
	transform: translateY(10vh);
	opacity: 0;
}

.showup-enter-active .inner,
.showup-leave-active .inner {
	transition: all 0.5s ease-in-out;
}

.showup-enter-active .inner {
	transition-delay: 0.5s;
}

.input_box {
	text-align: center;
	font-family: "Orbitron", sans-serif;
	font-size: 1rem;
	/* display: flex;
	flex-direction: column;
  position: absolute; */
}

.ft_button {
	text-align: center;
	font-family: "Orbitron", sans-serif;
	font-size: 1rem;
}

.log_button {
	text-align: center;
	font-family: "Orbitron", sans-serif;
	font-size: 1rem;
	background-color: #fff;
}

body span.switcher {
	position: relative;
	width: 200px;
	height: 50px;
	border-radius: 25px;
	margin: 20px 0;
}
body span.switcher input {
	appearance: none;
	position: relative;
	width: 200px;
	height: 50px;
	border-radius: 25px;
	background-color: #16638d;
	outline: none;
	font-family: sans-serif;
}
body span.switcher input:before,
body span.switcher input:after {
	z-index: 2;
	position: absolute;
	top: 50%;
	transform: translateY(-50%);
	color: #fff;
}
body span.switcher input:before {
	content: "Register";
	left: 1.65rem;
}
body span.switcher input:after {
	content: "Login";
	right: 2.15rem;
}
body span.switcher label {
	z-index: 1;
	position: absolute;
	top: 10px;
	bottom: 10px;
	border-radius: 20px;
}
body span.switcher.switcher-1 input {
	transition: 0.25s -0.1s;
}
body span.switcher.switcher-1 input:checked {
	background-color: #fff;
}
body span.switcher.switcher-1 input:checked:before {
	color: #fff;
	transition: color 0.3s 0.2s;
}
body span.switcher.switcher-1 input:checked:after {
	color: #ccc;
	transition: color 0.3s;
}
body span.switcher.switcher-1 input:checked + label {
	left: 10px;
	right: 100px;
	background: #16638d;
	transition: left 0.2s, right 0.2s 0.1s;
}
body span.switcher.switcher-1 input:not(:checked) {
	background: #fff;
	transition: background 0.3s -0.1s;
}
body span.switcher.switcher-1 input:not(:checked):before {
	color: #ccc;
	transition: color 0.3s;
}
body span.switcher.switcher-1 input:not(:checked):after {
	color: #fff;
	transition: color 0.3s 0.2s;
}
body span.switcher.switcher-1 input:not(:checked) + label {
	left: 100px;
	right: 10px;
	background: #16638d;
	transition: left 0.2s 0.1s, right 0.2s, background 0.35s -0.1s;
}
body span.switcher.switcher-2 {
	overflow: hidden;
}
body span.switcher.switcher-2 input {
	transition: background-color 0s 0.3s;
}
body span.switcher.switcher-2 input:before {
	color: #16638d;
}
body span.switcher.switcher-2 input:after {
	color: #fff;
}
body span.switcher.switcher-2 input:checked {
	background-color: #fff;
}
body span.switcher.switcher-2 input:checked + label {
	background: #fff;
	animation: turn-on 0.3s ease-out;
}
@keyframes turn-on {
	0% {
		left: 100%;
	}
	100% {
		left: 0%;
	}
}
body span.switcher.switcher-2 input:not(:checked) {
	background: #16638d;
}
body span.switcher.switcher-2 input:not(:checked) + label {
	background: #16638d;
	animation: turn-off 0.3s ease-out;
}
@keyframes turn-off {
	0% {
		right: 100%;
	}
	100% {
		right: 0%;
	}
}
body span.switcher.switcher-2 label {
	top: 0px;
	width: 200px;
	height: 50px;
	border-radius: 25px;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
	transition: opacity 0.5s;
	position: absolute;
}

.slide-fade-enter,
.slide-fade-leave-to {
	position: absolute;
	opacity: 0;
}

.slide-enter-active {
	transition: all 0.3s ease;
	position: absolute;
}

.slide-leave-active {
	transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
	position: absolute;
}

.slide-enter,
.slide-leave-to {
	transform: translateX(10px);
	opacity: 0;
	position: absolute;
}

.slide-up-enter-active,
.slide-up-leave-active {
	transition: all 0.4s ease-out;
	position: absolute;
}

.slide-up-enter-from {
	opacity: 0;
	transform: translateX(-10vw);
	position: absolute;
}

.slide-up-leave-to {
	opacity: 0;
	transform: translateX(10vw);
	position: absolute;
}

.form-container {
	display: flex;
	flex-direction: column;
	position: relative;
	height: 1em;
}

.form_register {
	display: flex;
	flex-direction: column;
}

.form_login {
	display: flex;
	flex-direction: column;
}

.transi {
	display: inline-flex;
	position: relative;
	height: 5rem;
}

.connect_img {
	display: flex;
	flex-direction: column;
	position: relative;
	height: 5.5rem;
}

.ft_login {
	display: flex;
	flex-direction: column;
	position: relative;
	justify-content: center;
	align-items: center;
	margin-top: 1.5rem;
}

.back_msg {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	position: absolute;
	top: 0;
	left: 0;
}
</style>
