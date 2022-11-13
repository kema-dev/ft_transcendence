<template>

	<div class="stack center" id="page">
		<button v-if="isJoin || isGame" @click="back()" class="backBtn center">
			<img src="@/assets/undo_logo.svg" alt="" class="imgLogo">
		</button>
		<!-- <div v-if="isJoin || isCreate" class="back left" @click="back()">
			<span class="material-symbols-outlined"> arrow_back_ios </span>
		</div> -->
		<div v-if="!isGame && !isJoin" class="center column choice">
			<h1>Create or join</h1>
			<h2>Create or join a game</h2>
			<div class="center column"><div class="center row">
				<button class="start" @click="create()">create</button>
				<button class="start" @click="join()">join</button>
			</div>
				<button class="start" @click="autoQueue()">automatic</button>
			</div>
		</div>
		<JoinView v-else-if="isJoin" />
		<GameView v-else-if="isGame"/>
	</div>
</template>

<script setup lang="ts">
import { inject, onMounted, onUnmounted, provide, Ref, ref } from 'vue';
import { Socket } from 'socket.io-client';
import { VueCookies } from 'vue-cookies';
import { useToast } from 'vue-toastification';
import GameView from './GameView.vue';
import JoinView from './JoinView.vue';
const toast = useToast();

let colors = inject('colors');
let socket: Socket = inject('socket')!;
let me: Ref<any> = inject('user')!;
const $cookies = inject<VueCookies>('$cookies');

let isGame: Ref<boolean> = inject('isCreate')!;
let isJoin: Ref<boolean> = inject('isJoin')!;
socket.off('accept_success')
socket.on('accept_success', (data) => {
	isGame.value = true;
	isJoin.value = false;
});
let lob_id = 0;
socket.off('join_failure')
socket.on('join_failure', (data) => {
	console.log('join failed for lobby', lob_id);
	lob_id += 1;
	autoQueue();
});
function autoQueue() {
	// if (lobbys.value.length > lob_id) {
	// 	socket.emit('join_lobby', {
	// 		login: me?.value?.login,
	// 		lobby: lobbys.value[lob_id].lobby_name,
	// 	});
	// } else {
	// 	create();
	// 	lob_id = 0;
	// }
}
function back() {
	if (isGame.value)
		socket.emit('leftGame', {login: me?.value?.login});
	isGame.value = false;
	isJoin.value = false;
	lob_id = 0;
}
function create() {
	console.log('create');
	isGame.value = true;
	socket.emit('newLobby');
}
function join() {
	isJoin.value = true;
	socket.emit('userUpdate', { login: me?.value?.login });
}

onMounted(() => {
	let game = document.getElementById('container');
	let settings = document.getElementById('settings');
	if (game && settings) settings.style.height = game.offsetHeight + 'px';

	// window.addEventListener("resize", () => {
	// 	reload++;
	// })
});
onUnmounted(() => {
	socket.off('info_game');
	socket.off('lobbys');
	socket.off('end');
});

socket.off('create_from_invitation');
socket.on('create_from_invitation', (data: any) => {
	create();
});

</script>

<style scoped>
#page {
	height: 100%;
	max-width: calc(100vh - 65px);
	padding: 5px 5px 0 5px;
	min-height: 300px;
	/* padding: 0 calc(); */
}
.msg {
	position: absolute;
	top: calc(50 - 25px);
	z-index: 10;
}
.choice {
	margin: 150px 0;
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
	background-color: v-bind('colors.color2');
	border-radius: 10px;
	color: v-bind('colors.color0');
	font-size: 18px;
	width: 7rem;
	height: 1.8rem;
	margin: 1rem 0.5rem 0 0.5rem;
}
.backBtn {
	position: absolute;
	top: 0;
	left: 0;
	width: 30px;
	height: 30px;
	margin-top: 10px;
	/* margin-right: auto; */
	margin-left: 10px;
	border-radius: calc(30px / 2);
	background-color: v-bind("colors.color2");
	z-index: 2;
}
.imgLogo {
	width: 26px;
	height: 26px;
	filter: brightness(0) invert(1);
}
</style>
