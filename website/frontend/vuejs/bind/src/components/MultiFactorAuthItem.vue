<template>
	<div class="security-view">
		<p class="hint" v-show="totp_code">
			Scan this QR code (or enter the code manually) then verify your TOTP code
			to enable 2FA
		</p>
		<div class="mfa_content" v-show="totp_code">
			<qrcode-vue
				:value="totp_url"
				:size="300"
				level="H"
				class="qr_img"
				id="qr_img"
			/>
			<p id="qr_text">Code: {{ totp_code }}</p>
		</div>
		<div class="mfa_input">
			<button @click="get_totp_url" v-show="!totp_code">
				Enable / Change MFA
			</button>
			<input
				class="totp_text_verif"
				type="text"
				v-model="code"
				placeholder="TOTP Code"
				v-show="totp_code"
			/>
			<button @click="verify" v-show="totp_code">VERIFY TOTP</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import QrcodeVue from 'qrcode.vue';
import { inject, onMounted, ref } from 'vue';
import API from '../components/axios';
import { FQDN } from '../../.env.json';
import { VueCookies } from 'vue-cookies';
import { useToast } from 'vue-toastification';
import { useCookies } from 'vue3-cookies';
const { cookies } = useCookies();
const toast = useToast();
const $cookies = inject<VueCookies>('$cookies');

let totp_url = ref('');
let totp_code = ref('');
let email = ref('');
let code = ref('');

function get_totp_url() {
	API.post('auth/set_tmp_totp', {
		headers: {
			login: cookies.get('login'),
			token: cookies.get('session'),
		},
		email: email.value,
	})
		.then((response) => {
			totp_url.value = response.data.url;
			totp_code.value = response.data.url.match(/secret%3D(.*)%26/)[1];
		})
		.catch((error) => {
			console.error(error);
		});
}

function debug() {
	API.post('auth/debug', {
		headers: {
			login: cookies.get('login'),
			token: cookies.get('session'),
		},
		email: email.value,
	})
		.then((response) => {
			console.log(response);
		})
		.catch((error) => {
			console.error(error);
		});
}

function verify() {
	console.log(email.value, code.value);
	API.post('auth/verify_tmp_totp', {
		headers: {
			login: cookies.get('login'),
			token: cookies.get('session'),
		},
		name: email.value,
		code: code.value,
	})
		.then((response) => {
			console.log(response);
			toast.success(
				'TOTP Verified ! You can now login with your email and TOTP code',
			);
		})
		.catch((error) => {
			console.error(error);
			toast.error('TOTP Verification failed. Please try again');
		});
}

async function get_infos() {
	await API.get('user/getEmail/' + $cookies.get('login'), {
		headers: {
			login: cookies.get('login'),
			token: cookies.get('session'),
		},
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
	margin: 30px;
	height: fit-content;
	display: flex;
	justify-content: top;
	align-items: center;
	flex-direction: column;
	margin-bottom: 30px;
}

.hint {
	font-size: 1.2rem;
	margin: 10px;
	padding: 0;
}

.qr_img {
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

.mfa_input {
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
}
</style>
