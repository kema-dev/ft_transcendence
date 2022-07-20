<template>
	<div class="center column" id="app">
		<Transition name="showup">
			<div v-if="show" class="outer">
				<div class="inner">
					<div>
						<input id="switch" value="true" v-model="switch_value" type="checkbox"/>
					</div>
					<div v-if="switch_value">
						<p>Register</p>
					</div>
					<div v-else>
						<p>Login</p>
					</div>
					<img src="@/assets/logo.png" alt="logo" />

					<div v-if="switch_value">
						<div>
							<input
								class="input_box"
								v-model="email_register"
								placeholder="email"
							/>
						</div>
						<div>
							<input
								class="input_box"
								v-model="login_register"
								placeholder="login"
							/>
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

					<div v-else>
						<div>
							<input
								class="input_box"
								v-model="email_auth"
								placeholder="email or login"
							/>
						</div>
						<div>
							<input
								class="input_box"
								v-model="password_auth"
								placeholder="password"
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
			email_auth: "",
			password_auth: "",
			show: false,
			switch_value: true,
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
		// change_form(value) {
		// 	this.switch_value = value;
		// 	console.log("sw val: " + this.switch_value);
		// },
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
					this.toast.success("Authentication success, welcome " + response.data.email + " !");
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
					// console.log(response.data);
					this.$router.push("/debug_kema");
					this.toast.success("Authentication success, welcome " + response.data.email + " !");
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
	background-color: rgba(135, 196, 253, 0.925);
}

.custom__button {
    vertical-align: middle;
    user-select: none;
    cursor: pointer;
}
.custom__button input[type="checkbox"] {
    opacity: 0;
    position: absolute;
    width: 1px;
    height: 1px;
}
.custom__button .custom__switch {
    display:inline-block;
    height:12px;
    border-radius:6px;
    width:40px;
    background: #BFCBD9;
    box-shadow: inset 0 0 1px #BFCBD9;
    position:relative;
    margin-left: 10px;
    transition: all .25s;
}

.custom__button .custom__switch::after, 
.custom__button .custom__switch::before {
    content: "";
    position: absolute;
    display: block;
    height: 18px;
    width: 18px;
    border-radius: 50%;
    left: 0;
    top: -3px;
    transform: translateX(0);
    transition: all .25s cubic-bezier(.5, -.6, .5, 1.6);
}

.custom__button .custom__switch::after {
    background: #4D4D4D;
    box-shadow: 0 0 1px #666;
}
.custom__button .custom__switch::before {
    background: #4D4D4D;
    box-shadow: 0 0 0 3px rgba(0,0,0,0.1);
    opacity:0;
}

.active .custom__switch {
    background: #3da7e0;
    box-shadow: inset 0 0 1px #3da7e0;
}

.active .custom__switch::after,
.active .custom__switch::before{
    transform:translateX(40px - 18px);
}

.active .custom__switch::after {
    left: 23px;
    background: #16638D;
    box-shadow: 0 0 1px #16638D;
}
</style>
