<template>
	<div class="stack">
		<div id="game_pos">
		<GameItem :nbrPlayer="nbrPlayer" :key="nbrPlayer"/></div>
		<div class="center row" id="settings">
		<button class="button" v-on:click="decr">LESS</button>
		<button class="button" v-on:click="incr">MORE</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { inject, ref } from "vue";
import GameItem from "@/components/GameItem.vue";
let define = inject("colors");

let nbrPlayer = ref(4);
function incr() {
	if (nbrPlayer.value + 1 <= 8)
		nbrPlayer.value++
}
function decr() {
	if (nbrPlayer.value - 1 >= 2)
		nbrPlayer.value--
}
</script>

<style scoped>
#settings {
	position: relative;
	z-index: 10;
	height: 500px;
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
</style>
