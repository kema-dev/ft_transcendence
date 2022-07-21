<template>
	<div class="center column" id="app">
		<Transition name="showup">
			<div v-if="show" class="outer">
				<div class="inner">
					<img src="@/assets/logo.png" alt="logo" />
					<h1>pong.io</h1>
					<span class="switcher switcher-1">
						<input
							type="checkbox"
							id="switcher-1"
							value="true"
							v-model="switch_value"
						/>
						<label for="switcher-1"></label>
					</span>

					<div v-if="switch_value">
						<div>
							<input
								class="input_box"
								v-model="email_register"
								placeholder="email"
								type="email"
							/>
						</div>
						<div>
							<input
								class="input_box"
								v-model="login_register"
								placeholder="login"
								type="text"
							/>
						</div>
						<div>
							<input
								class="input_box"
								v-model="password_register"
								placeholder="password"
								type="password"
							/>
						</div>
						<div>
							<input
								class="input_box"
								v-model="password_confirmation"
								placeholder="password confirmation"
								type="password"
							/>
						</div>
						<div>
							<button class="log_button" @click="this.register()">
								Register
							</button>
						</div>
						<div>
							<a class="ft_button" :href="this.api42Path">Register with 42</a>
						</div>
					</div>

					<div v-else>
						<div>
							<input
								class="input_box"
								v-model="email_auth"
								placeholder="email or login"
								type="text"
							/>
						</div>
						<div>
							<input
								class="input_box"
								v-model="password_auth"
								placeholder="password"
								type="password"
							/>
						</div>
						<div>
							<button @click="this.auth()">Login</button>
						</div>
						<div>
							<p>
								<a class="ft_button" :href="this.api42Path">Login with 42</a>
							</p>
						</div>
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
import ToggleButton from "../components/ToggleButton.vue";

export default {
	name: "App",
	data() {
		return {
			rootPath: "http://localhost/",
			apiPath: "http://localhost:3000/api/v1/",
			api42Path:
				"https://api.intra.42.fr/oauth/authorize?client_id=" +
				Config.API_42_CLIENT_ID +
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
		};
	},
	provide() {
		return {
			defaultState: this.switch_value,
		};
	},
	components: {
		// ToggleButton,
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
				.then((response) => {
					this.toast.success("Register success");
					// console.log(response.data);
				})
				.catch((error) => {
					if (
						error.response.data.message ===
						"User with that email already exists"
					) {
						this.toast.warning("User with that email already exists");
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
					} else {
						this.toast.error("Unknown error");
						console.log(error);
					}
					// console.log(error.response.data.message);
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
						"Authentication success, welcome " + response.data.email + " !"
					);
					// console.log(response.data);
				})
				.catch((error) => {
					this.toast.error("Authentication failure, please try again");
					console.log(error);
				});
		},
	},
	created() {
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
					this.$router.push("/");
					this.toast.success(
						"Authentication success, welcome " + response.data.email + " !"
					);
				})
				.catch((error) => {
					this.toast.error("Authentication failure, please try again");
					console.log(error);
				});
		}
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
	background-color: #16638D;
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
	left: 20px;
}
body span.switcher input:after {
	content: "Login";
	right: 20px;
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
	transition: color 0.5s 0.2s;
}
body span.switcher.switcher-1 input:checked:after {
	color: #ccc;
	transition: color 0.5s;
}
body span.switcher.switcher-1 input:checked + label {
	left: 10px;
	right: 100px;
	background: #16638D;
	transition: left 0.5s, right 0.4s 0.2s;
}
body span.switcher.switcher-1 input:not(:checked) {
	background: #fff;
	transition: background 0.5s -0.1s;
}
body span.switcher.switcher-1 input:not(:checked):before {
	color: #ccc;
	transition: color 0.5s;
}
body span.switcher.switcher-1 input:not(:checked):after {
	color: #fff;
	transition: color 0.5s 0.2s;
}
body span.switcher.switcher-1 input:not(:checked) + label {
	left: 100px;
	right: 10px;
	background: #16638D;
	transition: left 0.4s 0.2s, right 0.5s, background 0.35s -0.1s;
}
body span.switcher.switcher-2 {
	overflow: hidden;
}
body span.switcher.switcher-2 input {
	transition: background-color 0s 0.5s;
}
body span.switcher.switcher-2 input:before {
	color: #16638D;
}
body span.switcher.switcher-2 input:after {
	color: #fff;
}
body span.switcher.switcher-2 input:checked {
	background-color: #fff;
}
body span.switcher.switcher-2 input:checked + label {
	background: #fff;
	animation: turn-on 0.5s ease-out;
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
	background: #16638D;
}
body span.switcher.switcher-2 input:not(:checked) + label {
	background: #16638D;
	animation: turn-off 0.5s ease-out;
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
</style>
