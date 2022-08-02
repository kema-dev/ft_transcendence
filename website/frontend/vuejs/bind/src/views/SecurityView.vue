<template>
	<div class="security-view">
		<h1>Security</h1>
		<p>2FA will be implemented on this page.</p>
		<qrcode-vue v-if="code" :value="code" :size="300" level="H" class="qr"/>
		<button @click="get_totp_url">CLICK</button>
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
			code: "",
		};
	},
	components: {
		QrcodeVue,
	},
	methods: {
		get_totp_url() {
			axios
				.post(this.apiPath + "auth/totp", {
					email: "jjourdan@student.42lyon.fr",
				})
				.then((response) => {
					this.code = response.data.key_uri;
					console.log(response);
				})
				.catch((error) => {
					console.error(error);
				});
		},
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