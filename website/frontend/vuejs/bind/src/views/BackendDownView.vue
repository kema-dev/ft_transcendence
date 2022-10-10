<template>
	<div class="center column" id="app">
		<a
			v-if="!backend_status"
			class="back_msg"
			:href="apiPath + 'auth/status'"
			>{{ BACKEND_DOWN_MESSAGE }}</a
		>
	</div>
</template>

<script setup lang="ts">
import API from '../components/axios';
import { useToast } from 'vue-toastification';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { FQDN } from '../../.env.json';
import { useCookies } from 'vue3-cookies';
const { cookies } = useCookies();

const router = useRouter();

let apiPath = FQDN + ':3000/api/v1/';

let BACKEND_DOWN_MESSAGE =
	'🖱️ Backend is down, please authorize our self-signed certificate manually by clicking this text';

let BACKEND_UP_MESSAGE = '😊 Backend is up, you can now login';

let backend_status = ref(false);

const toast = useToast();

onMounted(() => {
	API.get('auth/status', {
		headers: {
			login: cookies.get('login'),
			token: cookies.get('session'),
		},
	})
		.then(() => {
			backend_status.value = true;
			toast.info(BACKEND_UP_MESSAGE);
			router.replace('/');
		})
		.catch(() => {
			setTimeout(() => {
				backend_status.value = false;
				toast.error(BACKEND_DOWN_MESSAGE);
			}, 0.5);
		});
});
</script>

<style scoped>

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
