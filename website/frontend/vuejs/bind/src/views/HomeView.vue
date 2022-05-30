<template>
	<div id="home" class="wrap">
		<NavbarItem />
		<!-- <router-link to="/">Log out</router-link> -->
		<div id="game" class="center"><div id="field"></div></div>
		<div id="menu">
			<div id="nav_menu" class="center row">
				<h2 class="nav_menu_text">CHAT</h2>
				<h2 class="nav_menu_text">FRIENDS</h2>
				<h2 class="nav_menu_text">SETTINGS</h2>
			</div>
		</div>
	</div>
</template>

<script setup>
import NavbarItem from "@/components/NavbarItem.vue";
import define from "@/utils/define";
import { onMounted } from "vue";

onMounted(() => {
	// let field = document.querySelector('#field');
	// field.style.height = field.offsetWidth + 'px';
})
</script>

<style>
#home {
	width: 100%;
	/* height: 100vh; */
	align-items: center;
}
#game {
	width: 70vw;
	height: 100%;
	padding-top: 60px;
}
#field {
	width: clamp(0px, 50vw, 80vh);
	height: clamp(0px, 50vw, 80vh);
	border: solid 3px v-bind("define.color2");
	background: v-bind("define.color3");
	box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
}
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
.nav_menu_text {
	font-size: clamp(0.5rem, 1.5vw, 1.3rem);
}
@media screen and (max-width: 1000px) {
	#menu {
		width: 100%;
		padding: 0;
		height: 50vh;
	}
	#game {
		margin: 100px 0;
		width: 100%;
	}
	#field {
		width: 75vw;
		height: 75vw;
	}
	.nav_menu_text {
		font-size: clamp(1rem, 2vw, 1.3rem);
	}
}
</style>
