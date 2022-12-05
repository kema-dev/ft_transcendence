<template>
	<div class="security-view">
		<button @click="close" v-show="totp_code" class="mfaBtn">
			Close settings
		</button>
		<input
			class="new_username"
			type="text"
			v-model="new_username"
			placeholder="New username"
			v-show="totp_code"
		/>
		<button @click="change_username" v-show="totp_code" class="mfaBtn">
			Change username
		</button>
		<p class="hint" v-show="totp_code">
			Scan this QR code (or enter the code manually) then verify your TOTP code
			to enable 2FA
		</p>
		<div class="mfa_content" v-show="totp_code">
			<img class="qr_img" id="qr_img" v-bind:src="totp_url" alt="" />
			<p id="qr_text">Code: {{ totp_code }}</p>
		</div>
		<!-- <div class="mfa_input"> -->
		<button @click="get_totp_url" v-show="!totp_code" class="mfaBtn">
			Change settings
		</button>
		<input
			class="totp_text_verif"
			type="text"
			v-model="code"
			placeholder="TOTP Code"
			v-show="totp_code"
		/>
		<button @click="verify" v-show="totp_code" class="mfaBtn">
			VERIFY TOTP
		</button>
		<button @click="disable" v-show="totp_code" class="mfaBtn">
			DISABLE TOTP
		</button>
		<!-- </div> -->
	</div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import API from '../components/axios';
import { FQDN } from '../../.env.json';
import { VueCookies } from 'vue-cookies';
import { useToast } from 'vue-toastification';
import { useCookies } from 'vue3-cookies';
import { useRouter } from 'vue-router';
import { Socket } from 'socket.io-client';

const { cookies } = useCookies();
const toast = useToast();
const $cookies = inject<VueCookies>('$cookies');
const colors = inject('colors');

let totp_url = ref('');
let totp_code = ref('');
let email = ref('');
let code = ref('');
let new_username = ref('');
let router = useRouter();

let socket: Socket = inject('socket')!;

function change_username() {
	// API.post('user/change_username', {
	// 	// username: email.value,
	// 	new_username: new_username.value,
	// })
	// 	.then((response) => {
	// 		$cookies.set('login', '');
	// 		$cookies.set('session', '');
	// 		socket.emit('logout');
	// 		toast.success('Username changed ! Please log in again');
	// 		router.go(0);
	// 	})
	// 	.catch((error) => {
	// 		// console.log(error);
	// 		if (error.response.data.message == 'E_USERNAME_NOT_AVAILABLE') {
	// 			toast.warning(
	// 				'This username is not available, please slect another one',
	// 			);
	// 		} else if (error.response.data.message == 'E_LOGIN_NOT_MEET_REQUIREMENTS') {
	// 			toast.warning('This username does not meet the requirements, please slect another one');
	// 		} else {
	// 			toast.error('An error occured');
	// 		}
	// 	});
	socket.emit('change_username', new_username.value, (ret: any) => {
		// console.log(ret);
		if (ret == 'OK') {
			$cookies.set('login', '');
			$cookies.set('session', '');
			socket.emit('logout');
			toast.success('Username changed ! Please log in again');
			router.go(0);
		}
		else if (ret == 'E_USERNAME_NOT_AVAILABLE') {
			toast.warning(
				'This username is not available, please slect another one',
			);
		}
		else if (ret == 'E_LOGIN_NOT_MEET_REQUIREMENTS') {
			toast.warning('This username does not meet the requirements, please slect another one');
		}
		else {
			toast.error('An error occured');
		}
	} )
}

function get_totp_url() {
	API.post('auth/set_tmp_totp', {
		// email: email.value,
	})
		.then((response) => {
			totp_url.value = response.data.img_src;
			// console.log(response.data.img_src);
			totp_code.value = response.data.url.match(/secret%3D(.*)%26/)[1];
		})
		.catch((error) => {
			console.error(error);
		});
}

function close() {
	totp_url.value = '';
	totp_code.value = '';
	new_username.value = '';
	totp_code.value = '';
}

function debug() {
	API.post('auth/debug', {
		email: email.value,
	})
		.then((response) => {
			// console.log(response);
		})
		.catch((error) => {
			console.error(error);
		});
}

function verify() {
	// console.log(email.value, code.value);
	API.post('auth/verify_tmp_totp', {
		// name: email.value,
		code: code.value,
	})
		.then((response) => {
			// console.log(response);
			toast.success(
				'TOTP Verified ! You can now login with your email and TOTP code',
			);
		})
		.catch((error) => {
			console.error(error);
			toast.error('TOTP Verification failed. Please try again');
		});
}

async function disable() {
	await API.post('auth/check_totp_status', {
		// name: email.value,
	})
		.then((response) => {
			// console.log(response.data);
			if (response.data == false) {
				toast.success('You already have TOTP disabled');
				return;
			} else {
				API.post('auth/verify_totp', {
					// name: email.value,
					code: code.value,
				})
					.then((response) => {
						disable_totp_api();
					})
					.catch((error) => {
						console.error(error.response.data);
						toast.error(
							'TOTP Verification failed. Please enter your actual TOTP code',
						);
					});
			}
		})
		.catch((error) => {
			console.error(error.response);
		});
}

function disable_totp_api() {
	API.post('auth/disable_totp', {
		// name: email.value,
	})
		.then((response) => {
			toast.success('TOTP removal successful');
			// console.log(response);
		})
		.catch((error) => {
			console.error(error);
			toast.error('TOTP removal failed. Please try again');
		});
}

async function get_infos() {
	await API.get('user/getEmail/' + $cookies.get('login'), {
		params: {
			login: $cookies.get('login'),
		},
	})
		.then((response) => {
			email.value = response.data;
		})
		.catch((error) => {
			console.error(error);
		});
}

onMounted(() => {
	get_infos();
});
</script>

<style scoped>
.security-view {
	margin: 10px;
	height: fit-content;
	display: flex;
	justify-content: top;
	align-items: center;
	flex-direction: column;
	/* margin-bottom: 30px; */
}

.hint {
	font-size: 1.2rem;
	margin: 10px;
	padding: 0;
}

.qr_img {
	height: 300px;
	width: 300px;
	margin-top: 15px;
	display: flex;
	justify-content: top;
	align-items: center;
	flex-direction: column;
	object-fit: contain;
	max-width: 80%;
}

#qr_text {
	text-align: center;
	font-size: 1em;
	word-wrap: break-word;
	max-width: 80%;
}

.totp_text_verif {
	text-align: center;
	width: 100%;
	max-width: 80%;
	height: 40px;
	font-size: 1.2rem;
	margin: 10px;
	padding: 0;
	outline: none;
}

.mfa_content {
	position: relative;
	display: flex;
	justify-content: top;
	align-items: center;
	flex-direction: column;
	height: fit-content;
	margin-bottom: 20px;
}

/* .mfa_input {
	position: relative;
	z-index: 1;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	width: fit-content;
	border-radius: 10px;
	border: 3px solid #2c3e50;
	box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
} */
.mfaBtn {
	margin-top: 10px;
	margin-bottom: 10px;
	height: 1.5rem;
	width: auto;
	border-radius: calc(1.5rem / 2);
	font-weight: 500;
	background-color: v-bind('colors.color2');
	color: white;
	padding: 0 10px;
	box-shadow: 0px 0px 4px #aaa;
}
.separator {
	margin-top: 15px;
	flex-shrink: 0;
	width: 200px;
	height: 1px;
	background-color: v-bind('colors.color2');
}
</style>
