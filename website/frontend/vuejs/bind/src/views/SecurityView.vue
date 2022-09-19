<template>
	<div class="security-view">
		<h1>Security</h1>
		<div class="mfa_input">
			<button @click="get_totp_url">Enable / Change MFA</button>
			<input type="text" v-model="code" placeholder="TOTP Code" />
			<button @click="verify">VERIFY TOTP</button>
		</div>
		<!-- <div class="debug">
			<button @click="debug">DEBUG</button>
		</div> -->
		<div id="qrcode" class="mfa_content">
			<qrcode-vue
				id="qr_img"
				:value="totp_url"
				:size="300"
				level="H"
				class="qr"
			/>
			<p id="qr_text" class="qr">Code: {{ totp_code }}</p>
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

const toast = useToast();
const $cookies = inject<VueCookies>('$cookies');

let totp_url = ref('');
let totp_code = ref('');
let email = ref('');
let code = ref('');

function get_totp_url() {
	API.post('auth/set_tmp_totp', {
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
	document.getElementById('qrcode').style.height = '20vh';
	document.getElementById('qr_img').style.filter = 'opacity(1)';
	document.getElementById('qr_text').style.filter = 'opacity(1)';
	get_infos();
});
</script>

<style>
.security-view {
	height: 100vh;
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	position: relative;
}

.mfa_content {
	position: relative;
	height: 0;
	/* transition: 2s ease; */
	display: block;
}

.qr {
	position: inherit;
	filter: opacity(0);
	transition: cubic-bezier(0.075, 0.82, 0.165, 1);
	/* transition-delay: 2s; */
}

.mfa_input {
	position: relative;
	z-index: 1;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
}

.debug {
	z-index: 1;
}
</style>
