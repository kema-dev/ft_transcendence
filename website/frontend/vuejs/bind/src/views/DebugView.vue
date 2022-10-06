<template>
	<div class="debug">
		<button @click="debug">DEBUG</button>
	</div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import API from '../components/axios';
import { VueCookies } from 'vue-cookies';
import { useCookies } from 'vue3-cookies';
const { cookies } = useCookies();
const $cookies = inject<VueCookies>('$cookies');

function debug() {
	// console.log('login: ' + cookies.get('login'));
	// console.log('session: ' + cookies.get('session'));
	API.post('auth/debug', {
		headers: {
			login: cookies.get('login'),
			token: cookies.get('session'),
		},
	})
		.then((response) => {
			console.log(response);
		})
		.catch((error) => {
			console.error(error);
		});
}

onMounted(() => {
	email.value = $cookies.get('email');
});
</script>

<style>
.debug {
	z-index: 1;
}
</style>
