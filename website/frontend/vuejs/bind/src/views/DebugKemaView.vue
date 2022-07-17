<template>
	<div class="center column">
		<Transition name="showup">
			<div v-if="show" class="outer">
				<div class="inner">
					<img src="@/assets/logo.png" alt="logo" />

					<div v-if="register_form">
						<div>
							<input class="input_box" v-model="email_register" placeholder="email" />
						</div>
						<div>
							<input class="input_box" v-model="login_register" placeholder="login" />
						</div>
						<div>
							<input
								class="input_box"
								v-model="password_register"
								placeholder="password"
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

					<div v-if="login_form">
						<div>
							<input class="input_box" v-model="email_auth" placeholder="email or login" />
						</div>
						<div>
							<input class="input_box" v-model="password_auth" placeholder="password" />
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
import { ref } from "vue";
import axios from "axios";
import Config from "../env.json";
import { useToast } from "vue-toastification";

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
			email_auth: "",
			password_auth: "",
			show: false,
			register_form: true,
			login_form: false,
		};
	},
	setup() {
		const toast = useToast();
		return { toast };
	},
	methods: {
		register() {
			axios
				.post(this.apiPath + "auth/register", {
					email: this.email_register,
					login: this.login_register,
					password: this.password_register,
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
					} else {
						this.toast.error("Unknown error");
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
					console.log(response.data);
				})
				.catch((error) => {
					console.log(error);
				});
		},
	},
	created() {
		setTimeout(() => {
			this.show = true;
		}, 0);
		console.log(this.show);
		let urlParams = new URLSearchParams(window.location.search);
		let code = urlParams.get("code");
		if (code) {
			axios
				.post(this.apiPath + "auth/login42", {
					code: code,
				})
				.then((response) => {
					console.log(response.data);
					this.$router.push("/debug_kema");
				})
				.catch((error) => {
					console.log(error);
				});
		}
	},
};
</script>


<style>
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
	background-color: rgba(135, 196, 253, 0.925);
}

</style>
