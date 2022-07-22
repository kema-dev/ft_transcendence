<template>
	<div class="stack" id="page">
		<div id="game_pos">
			<GameItem
				:nbrPlayer="nbrPlayer"
				:nbrBall="nbrBall"
				:start="start"
				:key="reload"
			/>
		</div>
		<div class="center column" id="settings">
			<h1 v-if="!start">{{ nbrPlayer }}</h1>
			<h2 class="title">Players</h2>
			<div class="center row">
				<button class="button" v-on:click="decr">LESS</button>
				<button class="button" v-on:click="incr">MORE</button>
			</div>
			<h2 class="title">Balls</h2>
			<div class="center row">
				<button class="button" v-on:click="decrBall">LESS</button>
				<button class="button" v-on:click="incrBall">MORE</button>
			</div>
			<button class="start" v-on:click="launch" v-if="!start">start</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { inject, onMounted, provide, ref } from "vue";
import GameItem from "@/components/GameItem.vue";
let define = inject("colors");
let start = ref(false);
provide("playing", start);
let reload = ref(0);
let nbrPlayer = ref(4);
let nbrBall = ref(1);
function launch() {
	start.value = !start.value;
	reload.value++;
}
function incr() {
	if (nbrPlayer.value + 1 <= 8) {
		nbrPlayer.value++;
		reload.value++;
	}
}
function decr() {
	if (nbrPlayer.value - 1 >= 2) {
		nbrPlayer.value--;
		reload.value++;
	}
}
function incrBall() {
	// if (nbrBall.value + 1 <= 3)
	{
		nbrBall.value++;
		reload.value++;
	}
}
function decrBall() {
	if (nbrBall.value - 1 >= 1) {
		nbrBall.value--;
		reload.value++;
	}
}
onMounted(() => {
	let game = document.getElementById("container");
	let settings = document.getElementById("settings");
	if (game && settings) settings.style.height = game.offsetHeight + "px";
	// window.addEventListener("resize", () => {
	// 	reload.value++;
	// })
});
</script>

<style scoped>
#page {
	height: 100%;
	max-width: calc(100vh - 65px);
	/* padding: 0 calc(); */
}
#settings {
	position: relative;
	z-index: 10;
	/* height: 500px; */
}
#game_pos {
	position: absolute;
	z-index: 1;
	top: 0;
	left: 0;
}
.button {
	margin: 20px 10px;
	font-size: 1rem;
}
.title {
	margin-bottom: -18px;
	font-size: 1.25rem;
}
.start {
	/* margin-top: 10px; */
	/* margin-bottom: 95px; */
	background-color: v-bind("define.color2");
	border-radius: 10px;
	color: v-bind("define.color0");
	width: 4.5rem;
	height: 1.5rem;
}
</style>
