<template>
	<div id="menu">
		<div id="nav_menu" class="center row">
			<router-link to="/home/chat" class="nav_menu_link">
				<h2 class="nav_menu_text">CHAT</h2>
			</router-link>
			<h1>|</h1>
			<router-link to="/home/friends" class="nav_menu_link">
				<h2 class="nav_menu_text">FRIENDS</h2>
			</router-link>
			<h1>|</h1>
			<router-link to="/home/settings" class="nav_menu_link">
				<h2 class="nav_menu_text">SETTINGS</h2>
			</router-link>
		</div>
		<!-- <transition name="slide-fade" mode="out-in"> -->
		<router-view name="menu" />
		<!-- </transition> -->
	</div>
</template>

<script setup lang="ts">
import { inject } from 'vue'

let define = inject('colors');
</script>

<style scoped>
#menu {
	height: 100vh;
	width: 30vw;
	background: v-bind("define.color3");
	box-shadow: -4px 0px 4px rgba(0, 0, 0, 0.25);
	padding-top: 60px;
}
#nav_menu {
	width: 100%;
	height: 60px;
	justify-content: space-around;
	align-items: center;
	background-color: v-bind("define.color0");
	box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
}
.nav_menu_link {
	width: 30%;
}
.nav_menu_text {
	font-size: clamp(0.5rem, 1.5vw, 1.3rem);
}
@media screen and (max-width: 1000px) {
	#menu {
		width: 100%;
		padding: 0;
		height: 50vh;
	}
	.nav_menu_text {
		font-size: clamp(1rem, 2vw, 1.3rem);
	}
}
</style>
