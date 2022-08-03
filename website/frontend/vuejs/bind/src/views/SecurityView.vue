<template>
	<div class="security-view">
		<h1>Security</h1>
		<qrcode-vue v-if="totp_url" :value="totp_url" :size="300" level="H" class="qr"/>
		<p>URL: {{ totp_url }}</p>
		<button @click="get_totp_url">GET TOTP URL</button>
		<input type="text" v-model="test_code" placeholder="TOTP Code"/>
		<button @click="verify">VERIFY TOTP</button>
	</div>
</template>

<script>
import axios from "axios";
import QrcodeVue from "qrcode.vue";

export default {
	name: "SecurityView",
	data() {
		return {
			apiPath: "https://localhost:3000/api/v1/",
			totp_url: "",
			test_mail: "q@q.q",
			test_code: "123456",
		};
	},
	components: {
		QrcodeVue,
	},
	methods: {
		get_totp_url() {
			axios
				.post(this.apiPath + "auth/set_totp", {
					email: this.test_mail,
				})
				.then((response) => {
					this.totp_url = response.data.url;
					console.log(response);
				})
				.catch((error) => {
					console.error(error);
				});
		},
		verify() {
			axios
				.post(this.apiPath + "auth/verify_totp", {
					email: this.test_mail,
					code: this.test_code,
				})
				.then((response) => {
					console.log(response);
				}).catch((error) => {
					console.error(error);
				});
		}
	},
};
</script>

<style>
.security-view {
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	position: relative;
}
</style>