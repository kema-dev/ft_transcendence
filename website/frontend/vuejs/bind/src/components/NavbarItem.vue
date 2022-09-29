<template>
	<nav>
		<div class="center space-between" style="height: 100%">
			<div class="nav-icon">
				<img src="@/assets/logo_white.png" alt="pong.io logo" class="logo" />
				<h1 class="text_logo">PONG.IO</h1>
			</div>
			<div style="height: 100%" class="center row right">
				<!-- <lottie-player
					:src="require('@/assets/json/settings.json')"
					speed="2"
					hover
					class="icon"
				/> -->
				<lottie-player
					:src="require('@/assets/json/logout.json')"
					speed="2"
					hover
					class="icon"
					@click="logout"
				/>
				<!-- <lottie-player
					:src="require('@/assets/json/home.json')"
					speed="2"
					hover
					class="icon"
				/> -->
			</div>
		</div>
	</nav>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { VueCookies } from 'vue-cookies';
import API from '../components/axios';

let define = inject('colors');

const $cookies = inject<VueCookies>('$cookies');

function logout() {
	API.post('auth/logout', {
		login: $cookies.get('login'),
	}).then(() => {
		$cookies.remove('session');
		$cookies.remove('login');
		window.location.href = '/';
	}).catch((err) => {
		console.log(err);
	});
}
</script>

<style scoped>
nav {
	position: fixed;
	z-index: 100;
	top: 0;
	height: 60px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 5px 10px 5px 20px;
	width: 100%;
	background-color: v-bind('define.color2');
	transition: all 0.3s;
	box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
}
.nav-icon {
	/* border: solid 1px black; */
	display: flex;
	align-items: center;
	height: 100%;
}
.logo {
	height: 40px;
	margin: 0 10px 0 0;
}
.text_logo {
	font-size: 35px;
	font-weight: 900;
	color: v-bind('define.color0');
}
.shadow_nav {
	box-shadow: 0px 10px 50px rgba(0, 0, 0, 0.25);
	transition: all 0.3s;
}
.material-symbols-outlined {
	font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48;
	font-size: 50px;
}
.icon {
	height: 100%;
	width: 50px;
	cursor: pointer;
}
</style>
