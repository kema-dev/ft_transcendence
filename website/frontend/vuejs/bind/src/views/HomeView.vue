<template>
	<div id="home" class="wrap">
		<NavbarItem />
		<!-- <router-link to="/">Log out</router-link> -->
		<div id="game" class="center"><div id="field"></div></div>
		<NavmenuItem />
	</div>
</template>

<script setup lang="ts">
import NavbarItem from "@/components/NavbarItem.vue";
import NavmenuItem from "@/components/NavmenuItem.vue";
import { onMounted } from "vue";
import { inject } from 'vue'

let define = inject('colors');

onMounted(() => {
	// let field = document.querySelector('#field');
	// field.style.height = field.offsetWidth + 'px';
});
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
@media screen and (max-width: 1000px) {
	#game {
		margin: 100px 0;
		width: 100%;
	}
	#field {
		width: 75vw;
		height: 75vw;
	}
}
</style>
