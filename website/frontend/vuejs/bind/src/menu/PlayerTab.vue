<template>
	<div>
		<h1>{{ route.params.name }}</h1>
	</div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { FQDN } from '../../.env.json';

let define = inject('colors');
const route = useRoute();
let user;
axios
	.get(FQDN + ':3000/api/v1/auth/getInfo', { login: 'hey' })
	.then((response) => {
		user = response.data;
	})
	.catch((error) => {
		console.log(error);
	});
</script>

<style scoped></style>
