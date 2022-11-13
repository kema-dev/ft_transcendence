<template>
  <div>
		<div class="center column stack" id="create">
			<div id="game_pos">
				<GameItem :key="remount" />
			</div>
			<div v-if="!start && isOwner" id="settings">
				<h1>{{ nbrBall }}</h1>
				<h2 class="title">Balls</h2>
				<div class="center row">
					<button class="button" @click="decrBall">LESS</button>
					<button class="button" @click="incrBall">MORE</button>
				</div>
				<button class="start" @click="launch">start</button>
			</div>
			<div v-else-if="!start && !isOwner" id="settings">
				<h1>{{ nbrBall }}</h1>
				<h2 class="title">Balls</h2>
				<h2 style="margin-top: 3%;">Waiting for owner to start</h2>
			</div>
		</div>
		<div v-if="win" class="msg">
			<h1>YOU WIN !</h1>
		</div>
		<div v-if="lose" class="msg">
			<h1>YOU LOSE</h1>
		</div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, onUnmounted, provide, Ref, ref } from 'vue';
import { Socket } from 'socket.io-client';
import GameItem from '@/components/GameItem.vue';
import { useToast } from 'vue-toastification';
import { InfoDto } from '@/dto/InfoDto';

let colors = inject('colors');
let socket: Socket = inject('socket')!;
let start = ref(false);
provide('playing', start);
let isOwner = ref(false);
let nbrBall = ref(1);
socket.on('get_game_info', (data) => {
	isOwner.value = data.owner;
	nbrBall.value = data.nbrBall;
});
let remount = ref(false);
let win = ref(false);
let lose = ref(false);
const toast = useToast();
let me: Ref<any> = inject('user')!;

onMounted(() => {
	socket.emit('get_game_info');
	socket.on('info_game', (data: InfoDto) => {
		if (data.left != "")
			toast.warning(data.left + ' left the game');
		remount.value = !data.remount;
		win.value = data.isWin;
		lose.value = data.isLose;
		start.value = data.isStart;
		console.log("is owner: ", me?.value?.lobby_name == me?.value?.login + "'s lobby")
		if (me?.value?.lobby_name == me?.value?.login + "'s lobby")
			isOwner.value = true;
	});
})
onUnmounted(() => {
	socket.off('end');
	socket.off('info_game');
	socket.off('get_game_info');
})

function launch() {
	start.value = !start.value;
	socket.emit('start');
}
function incrBall() {
	if (nbrBall.value + 1 <= 3) {
		nbrBall.value++;
		socket.emit('updateLobby', {
			lobby_name: me?.value?.lobby_name,
			nbrBall: nbrBall.value,
		});
		remount.value = !remount.value;
		socket.emit('send_game_info');
	} else {
		toast.warning('3 balls maximum');
	}
}
function decrBall() {
	if (nbrBall.value - 1 >= 1) {
		nbrBall.value--;
		socket.emit('updateLobby', {
			lobby_name: me?.value?.lobby_name,
			nbrBall: nbrBall.value,
		});
		remount.value = !remount.value;
		socket.emit('send_game_info');
	} else {
		toast.warning('1 balls minimum');
	}
}
</script>

<style scoped>
#game_pos {
	position: relative;
	top: 0;
	left: 0;
}
#settings {
	position: absolute;
	top: calc(50% - 100px);
	z-index: 10;
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
</style>
