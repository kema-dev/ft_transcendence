<template>
	<div class="center column" id="app">
		<a
			v-if="!backend_status"
			class="back_msg"
			:href="apiPath + 'auth/status'"
			>{{ BACKEND_DOWN_MESSAGE }}</a
		>
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
								<button class="login-btn" @click="register()">Register</button>
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
								<input v-if="totp_enabled"
									class="input_box"
									v-model="totp_val"
									placeholder="mfa code"
									type="text"
								/>
								<button @click="auth()">Login</button>
							</div>
						</Transition>
					</div>
					<div class="ft_login">
						<a :href="api42Path"
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

<script setup lang="ts">
import axios from "axios";
import Config from "../env.json";
import { useToast } from "vue-toastification";
import { inject, onMounted, provide, ref } from "vue";
import { useRouter } from "vue-router";
import { VueCookies } from "vue-cookies";

const router = useRouter();

let apiPath = "https://localhost:3000/api/v1/";
let api42Path =
	"https://api.intra.42.fr/oauth/authorize?client_id=" +
	Config.API_42_UID +
	"&redirect_uri=" +
	Config.API_42_REDIRECT_URI +
	"&response_type=code";
let email_register = ref("");
let login_register = ref("");
let password_register = ref("");
let password_confirmation = ref("");
let email_auth = ref("");
let password_auth = ref("");
let show = ref(false);
let switch_value = ref(true);
let backend_status = ref(true);
let totp_enabled = ref(false);
let totp_val = ref("");

let E_PASS_DIFFERS = "📝 Passwords do not match, please try again";
let E_PASS_NOT_MEET_REQUIREMENTS =
	"📝 Password must contain at least one lowercase letter, one uppercase letter, one digit, one special character (!@#$%^&*) and must be between 10 and 32 characters long, please try again";
let E_MAIL_NOT_MEET_REQUIREMENTS = "📝 Email is not valid, please try again";
let E_LOGIN_NOT_MEET_REQUIREMENTS =
	"📝 Login is not valid, must be between 1 and 25 characters long, using alphanumeric characters, '_' and '-' only, please try again";
let E_UNEXPECTED_ERROR = "😥 Unknown error, we are sorry for that";
let E_EMAIL_OR_LOGIN_ALREADY_EXISTS =
	"📝 User with that email and/or login already exists, please try again";
let E_PASS_FAIL = "📝 Wrong credentials provided, please try again";
let BACKEND_DOWN_MESSAGE =
	"🖱️ Backend is down, please authorize our self-signed certificate manually by clicking this text";
let E_NO_CODE_PROVIDED =
	"❌ 42 API authentication: No code provided, please try again";
let E_CODE_IN_USE =
	"❌ 42 API authentication: Code already in use, please try again";
let E_USER_IS_FT =
	"📝 You registered with a 42 account, please login with your 42 account";
let E_USER_NOT_FOUND = "📝 This email / login does not exist, please try again";
let E_USER_HAS_TOTP = "📝 You have enabled 2FA, please login with your 2FA code";
let E_TOTP_FAIL = "📝 2FA code is not valid, please try again";
let E_EMPTY_FIELD = "📝 At least one field is empty, please fill all of them";

provide("defaultState", switch_value);

const toast = useToast();
const $cookies = inject<VueCookies>('$cookies'); 

function register() {
	if (
		email_register.value === "" ||
		login_register.value === "" ||
		password_register.value === "" ||
		password_confirmation.value === ""
	) {
		toast.warning(E_EMPTY_FIELD);
		return;
	}
	axios
		.post(apiPath + "auth/register", {
			email: email_register.value,
			login: login_register.value,
			password: password_register.value,
			password_confirmation: password_confirmation.value,
		})
		.then((response) => {
			console.log(response);
			$cookies.set(response.data.key, response.data.value);
			$cookies.set('login', response.data.login);
			toast.success(
				"Registration success, welcome " + response.data.login + " !"
			);
			router.push("/home");
		})
		.catch((error) => {
			if (error.response.data.message === "E_EMAIL_OR_LOGIN_ALREADY_EXISTS") {
				toast.warning(E_EMAIL_OR_LOGIN_ALREADY_EXISTS);
			} else if (error.response.data.message === "E_PASS_DIFFERS") {
				toast.warning(E_PASS_DIFFERS);
			} else if (
				error.response.data.message === "E_PASS_NOT_MEET_REQUIREMENTS"
			) {
				toast.warning(E_PASS_NOT_MEET_REQUIREMENTS);
			} else if (
				error.response.data.message === "E_MAIL_NOT_MEET_REQUIREMENTS"
			) {
				toast.warning(E_MAIL_NOT_MEET_REQUIREMENTS);
			} else if (
				error.response.data.message === "E_LOGIN_NOT_MEET_REQUIREMENTS"
			) {
				toast.warning(E_LOGIN_NOT_MEET_REQUIREMENTS);
			} else {
				toast.error(E_UNEXPECTED_ERROR);
				console.error(error);
			}
		});
}
function auth() {
	if (email_auth.value === "" || password_auth.value === "") {
		toast.warning("📝 At least one field is empty, please fill all of them");
		return;
	}
	axios
		.post(apiPath + "auth/login", {
			email: email_auth.value,
			password: password_auth.value,
			mfa: totp_val.value,
		})
		.then((response) => {
			console.log(response);
			$cookies.set(response.data.key, response.data.value);
			$cookies.set('login', response.data.login);
			toast.success(
				"Authentication success, welcome " + response.data.login + " !"
			);
			router.push("/home");
		})
		.catch((error) => {
			console.log(error);
			if (error.response.data.message === "E_USER_HAS_TOTP") {
				toast.warning(E_USER_HAS_TOTP);
				totp_enabled.value = true;
			} else if (error.response.data.message === "E_TOTP_FAIL") {
				toast.warning(E_TOTP_FAIL);
			} else if (error.response.data.message === "E_PASS_FAIL") {
				toast.warning(E_PASS_FAIL);
			} else if (error.response.data.message === "E_USER_IS_FT") {
				toast.warning(E_USER_IS_FT);
			} else if (error.response.data.message === "E_USER_NOT_FOUND") {
				toast.warning(E_USER_NOT_FOUND);
			} else {
				toast.error(E_UNEXPECTED_ERROR);
				console.error(error);
			}
		});
}
onMounted(() => {
	axios
		.get(apiPath + "auth/status")
		.then(() => {
			backend_status.value = true;
			setTimeout(() => {
				show.value = true;
			}, 0.5);
			let urlParams = new URLSearchParams(window.location.search);
			let code = urlParams.get("code");
			if (code) {
				axios
					.post(apiPath + "auth/login42", {
						code: code,
					})
					.then((response) => {
						console.log(response);
						$cookies.set(response.data.key, response.data.value);
			$cookies.set('login', response.data.login);
						toast.success(
							"Authentication success, welcome " + response.data.login + " !"
						);
						router.push("/home");
					})
					.catch((error) => {
						if (error.response.data.message === "E_NO_CODE_PROVIDED") {
							toast.warning(E_NO_CODE_PROVIDED);
						} else if (error.response.data.message === "E_CODE_IN_USE") {
							toast.warning(E_CODE_IN_USE);
						} else if (error.response.data.message === "E_UNEXPECTED_ERROR") {
							toast.error(E_UNEXPECTED_ERROR);
							console.error(error);
						} else {
							toast.error(E_UNEXPECTED_ERROR);
							console.error(error);
						}
					});
			}
		})
		.catch(() => {
			setTimeout(() => {
				backend_status.value = false;
				toast.error(BACKEND_DOWN_MESSAGE);
			}, 0.5);
		});
});
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
