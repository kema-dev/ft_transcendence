<template>
	<nav>
		<div class="center space-between" style="height: 100%">
			<div class="nav-icon">
				<img src="@/assets/logo_white.png" alt="pong.io logo" class="logo" />
				<h1 class="text_logo">PONG.IO</h1>
			</div>
			<div style="height: 100%" class="center row right">
				<img v-if="userDone" @click="toProfile"
					:src="me.avatar" alt="My avatar" class="avatar">
				<img src="@/assets/svg/logout.svg" alt="logout" class="icon" @click="logout" />
				<!-- <lottie-player
					:src="require('@/assets/json/settings.json')"
					speed="2"
					hover
					class="icon"
					@click="logout"
				/> -->
			</div>
		</div>
	</nav>
</template>

<script setup lang="ts">
import router from '@/router';
import { inject } from 'vue';
import { VueCookies } from 'vue-cookies';
import API from '../components/axios';
import { Socket } from "socket.io-client";

let define = inject('colors');
let userDone = inject('userDone');
let me = inject('user');
let myName : string = inject('me')!;
let socket : Socket = inject('socket')!;

const $cookies = inject<VueCookies>('$cookies');
import { useCookies } from 'vue3-cookies';
const { cookies } = useCookies();

function toProfile() {
	router.push({name: 'profile'});
}

function logout() {
	API.post('auth/logout', {
		headers: {
			login: cookies.get('login'),
			token: cookies.get('session'),
		},
		login: $cookies.get('login'),
	}).then(() => {
		$cookies.remove('session');
		$cookies.remove('login');
		window.location.href = '/';
	}).catch((err) => {
		console.log(err);
	});
	socket.emit("userLogout", myName);
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
	filter: invert(100%) sepia(100%) saturate(0%) hue-rotate(193deg) brightness(107%) contrast(100%);
}
.avatar {
	width: 50px;
	height: 50px;
	border-radius: 25px;
	margin-right: 10px;
	cursor: pointer;
	object-fit: cover;
}
</style>
