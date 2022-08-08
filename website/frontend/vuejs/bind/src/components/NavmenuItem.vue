<template>
	<div id="menu">
		<div id="nav_menu" class="center row">
			<router-link to="/home/chat" class="nav_menu_link">
				<h2 class="nav_menu_text">CHAT</h2>
			</router-link>
			<h1 class="pipe">|</h1>
			<router-link to="/home/friends" class="nav_menu_link">
				<h2 class="nav_menu_text">FRIENDS</h2>
			</router-link>
			<h1 class="pipe">|</h1>
			<router-link to="/home/profile" class="nav_menu_link">
				<h2 class="nav_menu_text">PROFILE</h2>
			</router-link>
		</div>
		<!-- <transition name="slide-fade" mode="out-in"> -->
		<div class="content">
			<router-view name="menu" />
		</div>
		<!-- </transition> -->
	</div>
</template>

<script setup lang="ts">
import { inject } from "vue";

let define = inject("colors");
</script>

<style scoped>
#menu {
	height: calc(100vh - 60px);
	width: 30vw;
	background: v-bind("define.color3");
	box-shadow: -4px 0px 4px rgba(0, 0, 0, 0.25);
	margin-top: 60px;
}
.content {
	overflow-y: scroll;
	overflow: auto;
	height: calc(100vh - 120px);
}
#nav_menu {
	width: 100%;
	height: 60px;
	justify-content: space-around;
	align-items: center;
	background-color: v-bind("define.color0");
	box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
}
.pipe {
	font-size: 1.5rem;
	font-weight: 100;
}
.nav_menu_link {
	width: 30%;
}
.nav_menu_text {
	font-size: clamp(0.5rem, 1.5vw, 1.3rem);
	font-weight: 100;
}
.router-link-active > .nav_menu_text {
	font-weight: 900;
}
@media screen and (max-width: 1000px) {
	#menu {
		width: 100%;
		padding: 0;
		height: auto;
		margin-top: 0;
	}
	.nav_menu_text {
		font-size: clamp(1rem, 2vw, 1.3rem);
	}
}
</style>
