<template>
	<div class="stack" id="page">
		<div id="lobbies_menu">
			<LobbyListItem />
		</div>
		<div id="game_pos">
			<GameItem
				:nbrPlayer="nbrPlayer"
				:nbrBall="nbrBall"
				:players="players"
				:lobby_name="lobby_name"
				:start="start"
				:key="remount"
			/>
		</div>
		<div class="center column" id="settings" v-show="!start" >
			<h1>{{ nbrPlayer }}</h1>
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
			<button class="start" v-on:click="launch">start</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { inject, onMounted, provide, ref } from "vue";
import GameItem from "@/components/GameItem.vue";
import LobbyListItem from "@/components/LobbyListItem.vue";
import { Socket } from "socket.io-client";
import { VueCookies } from "vue-cookies";
import { useToast } from "vue-toastification";
const toast = useToast();

let define = inject("colors");
let start = ref(false);
provide("playing", start);
let socket: Socket = inject("socket")!;
const $cookies = inject<VueCookies>('$cookies'); 
let remount = ref(false);

let nbrPlayer = ref(6);
let nbrBall = ref(3);
let players = ref([$cookies.get("login")]);
let lobby_name = ref($cookies.get("login"));

function update_game() {
	remount.value = !remount.value;
	console.log("updated settings");
}
function launch() {
	start.value = !start.value;
	socket.emit('start', {
		lobby_name: lobby_name.value,
	});
}
function incr() {
	if (nbrPlayer.value + 1 <= 7) {
		nbrPlayer.value++;
		update_game();
	} else {
		toast.warning('7 players maximum');
	}
}
function decr() {
	if (nbrPlayer.value - 1 >= 2) {
		nbrPlayer.value--;
		update_game();
	} else {
		toast.warning('2 players minimum');
	}
}
function incrBall() {
	if (nbrBall.value + 1 <= 3) {
		nbrBall.value++;
		update_game();
	} else {
		toast.warning('3 balls maximum');
	}
}
function decrBall() {
	if (nbrBall.value - 1 >= 1) {
		nbrBall.value--;
		update_game();
	} else {
		toast.warning('1 balls minimum');
	}
}
onMounted(() => {
	let game = document.getElementById("container");
	let settings = document.getElementById("settings");
	if (game && settings) settings.style.height = game.offsetHeight + "px";
	// window.addEventListener("resize", () => {
	// 	reload++;
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
	position: absolute;
	top: 0;
	z-index: 10;
}
#game_pos {
	position: relative;
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
