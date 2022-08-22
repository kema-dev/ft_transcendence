<template>
	<nav>
		<div class="center space-between">
		<div class="nav-icon">
			<img src="@/assets/logo_white.png" alt="pong.io logo" class="logo" />
			<h1 class="text_logo">PONG.IO</h1>
		</div>
		<div>
			<!-- <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
<lottie-player src="/Users/odroz-ba/GitHub/cursus/ft_transcendence/website/frontend/vuejs/bind/src/assets/json/home.json" background="#ffffff"  speed="1"  style="width: 300px; height: 300px;" hover loop controls autoplay></lottie-player> -->
		</div>
		</div>
		<!-- <span class="material-symbols-outlined"> menu </span> -->
	</nav>
</template>

<script setup lang="ts">
import { inject } from 'vue'

let define = inject('colors');
</script>

<style>
nav {
	position: fixed;
	z-index: 100;
	top: 0;
	height: 60px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20px 20px;
	width: 100%;
	background-color: v-bind("define.color2");
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
	color: v-bind("define.color0");
}
.shadow_nav {
	box-shadow: 0px 10px 50px rgba(0, 0, 0, 0.25);
	transition: all 0.3s;
}
.material-symbols-outlined {
	font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 48;
	font-size: 50px;
}
</style>
