<template>
	<div class="stack">
		<div id="game_pos">
			<GameItem :nbrPlayer="nbrPlayer" :nbrBall="nbrBall" :start="start" :key="reload" />
		</div>
		<div class="center column" id="settings">
			<h3 class="title">Players</h3>
			<div class="center row">
				<button class="button" v-on:click="decr">LESS</button>
				<button class="button" v-on:click="incr">MORE</button>
			</div>
			<h3 class="title">Balls</h3>
			<div class="center row">
				<button class="button" v-on:click="decrBall">LESS</button>
				<button class="button" v-on:click="incrBall">MORE</button>
			</div>
			<button class="start" v-on:click="launch" v-if="!start">start</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from "vue";
import GameItem from "@/components/GameItem.vue";
let define = inject("colors");
let start = ref(false)
let reload = ref(0);
let nbrPlayer = ref(4);
let nbrBall = ref(1);
function launch() {
	start.value = !start.value
	reload.value++
}
function incr() {
	if (nbrPlayer.value + 1 <= 8) nbrPlayer.value++;
	reload.value++;
}
function decr() {
	if (nbrPlayer.value - 1 >= 2) nbrPlayer.value--;
	reload.value++;
}
function incrBall() {
	// if (nbrBall.value + 1 <= 3)
	nbrBall.value++;
	reload.value++;
}
function decrBall() {
	if (nbrBall.value - 1 >= 1) nbrBall.value--;
	reload.value++;
}
onMounted(() => {
	let game = document.getElementById("container");
	let settings = document.getElementById("settings");
	if (game && settings) settings.style.height = game.offsetHeight + "px";
});
</script>

<style scoped>
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
	margin: 20px;
}
.title {
	margin-bottom: -20px;
}
.start {
	margin-top: 10px;
	margin-bottom: 75px;
}
</style>
