<template>
	<div class="basicProfil center row">
		<div class="avatar_cont center">
			<img :src="avatar" class="avatar" alt="avatar" />
		</div>
		<div class="login">{{ login }}</div>
	</div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-unused-vars */
import { inject, defineProps, onMounted, ref } from "vue";

let define = inject('colors');
const props = defineProps({
	avatar: {
		type: String,
		required: true,
	},
	login: {
		type: String,
		required: true,
	},
});
</script>

<style scoped>
* {
	--height: 30px;
}
.basicProfil {
	width: auto;
	height: var(--height);
	margin: 3px 0;
}
.avatar_cont {
	width: var(--height);
	height: var(--height);
}
.avatar {
	height: var(--height);
	width: var(--height);
	border-radius: 50%;
}
.login {
	padding-left: 10px;
	font-family: 'Orbitron', sans-serif;
	font-size: 0.9rem;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
</style>
