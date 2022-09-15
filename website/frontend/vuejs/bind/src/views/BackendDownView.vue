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
import axios from 'axios';
import { useToast } from 'vue-toastification';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { FQDN } from '../../.env.json';

const router = useRouter();

let apiPath = FQDN + ':3000/api/v1/';

let BACKEND_DOWN_MESSAGE =
	'🖱️ Backend is down, please authorize our self-signed certificate manually by clicking this text';

let BACKEND_UP_MESSAGE = '😊 Backend is up, you can now login';

let backend_status = ref(false);

const toast = useToast();

onMounted(() => {
	axios
		.get(apiPath + 'auth/status')
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

<style>
.box {
	text-align: center;
	margin-bottom: 30px;
}

.toggle_container {
	margin: 0px auto;
	background: #efefef;
	width: 120px;
	padding: 10px 0;
	border-radius: 30px;
	transition: all 0.25s;
}

.toggle_container.active {
	background: #e9ffef;
}

.outer .inner {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100vh;
	width: 100vw;
}
.showup-enter-active,
.showup-leave-active {
	transition: all 0.5s ease-in-out;
}

.showup-leave-active {
	transition-delay: 0.5s;
}

.showup-enter-from,
.showup-leave-to {
	transform: translateY(10vh);
	opacity: 0;
}

.showup-enter-active .inner,
.showup-leave-active .inner {
	transition: all 0.5s ease-in-out;
}

.showup-enter-active .inner {
	transition-delay: 0.5s;
}

.input_box {
	text-align: center;
	font-family: 'Orbitron', sans-serif;
	font-size: 1rem;
	/* display: flex;
	flex-direction: column;
  position: absolute; */
}

.ft_button {
	text-align: center;
	font-family: 'Orbitron', sans-serif;
	font-size: 1rem;
}

.log_button {
	text-align: center;
	font-family: 'Orbitron', sans-serif;
	font-size: 1rem;
	background-color: #fff;
}

body span.switcher {
	position: relative;
	width: 200px;
	height: 50px;
	border-radius: 25px;
	margin: 20px 0;
}
body span.switcher input {
	appearance: none;
	position: relative;
	width: 200px;
	height: 50px;
	border-radius: 25px;
	background-color: #16638d;
	outline: none;
	font-family: sans-serif;
}
body span.switcher input:before,
body span.switcher input:after {
	z-index: 2;
	position: absolute;
	top: 50%;
	transform: translateY(-50%);
	color: #fff;
}
body span.switcher input:before {
	content: 'Register';
	left: 1.65rem;
}
body span.switcher input:after {
	content: 'Login';
	right: 2.15rem;
}
body span.switcher label {
	z-index: 1;
	position: absolute;
	top: 10px;
	bottom: 10px;
	border-radius: 20px;
}
body span.switcher.switcher-1 input {
	transition: 0.25s -0.1s;
}
body span.switcher.switcher-1 input:checked {
	background-color: #fff;
}
body span.switcher.switcher-1 input:checked:before {
	color: #fff;
	transition: color 0.3s 0.2s;
}
body span.switcher.switcher-1 input:checked:after {
	color: #ccc;
	transition: color 0.3s;
}
body span.switcher.switcher-1 input:checked + label {
	left: 10px;
	right: 100px;
	background: #16638d;
	transition: left 0.2s, right 0.2s 0.1s;
}
body span.switcher.switcher-1 input:not(:checked) {
	background: #fff;
	transition: background 0.3s -0.1s;
}
body span.switcher.switcher-1 input:not(:checked):before {
	color: #ccc;
	transition: color 0.3s;
}
body span.switcher.switcher-1 input:not(:checked):after {
	color: #fff;
	transition: color 0.3s 0.2s;
}
body span.switcher.switcher-1 input:not(:checked) + label {
	left: 100px;
	right: 10px;
	background: #16638d;
	transition: left 0.2s 0.1s, right 0.2s, background 0.35s -0.1s;
}
body span.switcher.switcher-2 {
	overflow: hidden;
}
body span.switcher.switcher-2 input {
	transition: background-color 0s 0.3s;
}
body span.switcher.switcher-2 input:before {
	color: #16638d;
}
body span.switcher.switcher-2 input:after {
	color: #fff;
}
body span.switcher.switcher-2 input:checked {
	background-color: #fff;
}
body span.switcher.switcher-2 input:checked + label {
	background: #fff;
	animation: turn-on 0.3s ease-out;
}
@keyframes turn-on {
	0% {
		left: 100%;
	}
	100% {
		left: 0%;
	}
}
body span.switcher.switcher-2 input:not(:checked) {
	background: #16638d;
}
body span.switcher.switcher-2 input:not(:checked) + label {
	background: #16638d;
	animation: turn-off 0.3s ease-out;
}
@keyframes turn-off {
	0% {
		right: 100%;
	}
	100% {
		right: 0%;
	}
}
body span.switcher.switcher-2 label {
	top: 0px;
	width: 200px;
	height: 50px;
	border-radius: 25px;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
	transition: opacity 0.5s;
	position: absolute;
}

.slide-fade-enter,
.slide-fade-leave-to {
	position: absolute;
	opacity: 0;
}

.slide-enter-active {
	transition: all 0.3s ease;
	position: absolute;
}

.slide-leave-active {
	transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
	position: absolute;
}

.slide-enter,
.slide-leave-to {
	transform: translateX(10px);
	opacity: 0;
	position: absolute;
}

.slide-up-enter-active,
.slide-up-leave-active {
	transition: all 0.4s ease-out;
	position: absolute;
}

.slide-up-enter-from {
	opacity: 0;
	transform: translateX(-10vw);
	position: absolute;
}

.slide-up-leave-to {
	opacity: 0;
	transform: translateX(10vw);
	position: absolute;
}

.form-container {
	display: flex;
	flex-direction: column;
	position: relative;
	height: 1em;
}

.form_register {
	display: flex;
	flex-direction: column;
}

.form_login {
	display: flex;
	flex-direction: column;
}

.transi {
	display: inline-flex;
	position: relative;
	height: 5rem;
}

.connect_img {
	display: flex;
	flex-direction: column;
	position: relative;
	height: 5.5rem;
}

.ft_login {
	display: flex;
	flex-direction: column;
	position: relative;
	justify-content: center;
	align-items: center;
	margin-top: 1.5rem;
}

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
