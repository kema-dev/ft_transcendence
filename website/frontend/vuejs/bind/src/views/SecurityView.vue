<template>
	<div class="security-view">
		<h1>Security</h1>
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
		<div class="mfa_input">
			<button @click="get_totp_url">GET TOTP URL</button>
			<input type="text" v-model="test_mail" placeholder="email" />
			<input type="text" v-model="test_code" placeholder="TOTP Code" />
			<button @click="verify">VERIFY TOTP</button>
		</div>
		<div class="debug">
			<button @click="debug">DEBUG</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import axios from "axios";
import QrcodeVue from "qrcode.vue";
import { ref } from "vue";
import HTTP from "../components/axios";
import { FQDN } from "../../.env.json";

let apiPath = FQDN + ":3000/api/v1/";
let totp_url = ref("");
let totp_code = ref("");
let test_mail = ref("q@q.q");
let test_code = ref("123456");

function get_totp_url() {
	document.getElementById("qrcode").style.height = "20vh";
	document.getElementById("qr_img").style.filter = "opacity(1)";
	document.getElementById("qr_text").style.filter = "opacity(1)";
	axios
		.post(apiPath + "auth/set_totp", {
			email: test_mail.value, // TODO get email from jwt
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
	HTTP.post(apiPath + "auth/debug", {
		email: test_mail.value,
	})
		.then((response) => {
			console.log(response);
		})
		.catch((error) => {
			console.error(error);
		});
}

function verify() {
	console.log(test_mail.value, test_code.value);
	axios
		.post(apiPath + "auth/verify_totp", {
			name: test_mail.value,
			code: test_code.value,
		})
		.then((response) => {
			console.log(response);
		})
		.catch((error) => {
			console.error(error);
		});
}
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
	transition: 2s ease;
}

.qr {
	filter: opacity(0);
	transition: cubic-bezier(0.075, 0.82, 0.165, 1);
	transition-delay: 2s;
}

.mfa_input {
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
