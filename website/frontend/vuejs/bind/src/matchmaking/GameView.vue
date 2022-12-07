<template>
	<div>
		<div class="center column stack" id="create">
			<div id="game_pos">
				<GameItem v-if="gameDto" :key="remount" :game="gameDto" />
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
			<div v-if="win" class="msg">
				<h1>YOU WIN !</h1>
			</div>
			<div v-if="lose" class="msg">
				<h1>YOU LOSE</h1>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { inject, onMounted, onUnmounted, provide, Ref, ref } from 'vue';
import { Socket } from 'socket.io-client';
import GameItem from '@/components/GameItem.vue';
import { useToast } from 'vue-toastification';
import { InfoDto } from '@/dto/InfoDto';
import { GameDto } from '@/dto/GameDto';

let colors = inject('colors');
let socket: Socket = inject('socket')!;
let start = ref(false);
provide('playing', start);
let isOwner = ref(false);
let nbrBall = ref(1);
let remount = ref(false);
let win = ref(false);
let lose = ref(false);
const toast = useToast();
let me: Ref<any> = inject('user')!;
let gameDto: Ref<GameDto | undefined> = ref(undefined);
socket.on('init_game', (data: GameDto) => {
	gameDto.value = data;
	if (gameDto.value.start)
		start.value = true;
	console.log('reload');
	remount.value = !remount.value;
	socket.emit('get_game_info');
});
socket.emit('get_game');

onMounted(() => {
	socket.emit('get_game_info');
	socket.on('info_game', (data: InfoDto) => {
		console.log('info', data);
		if (data.left !== undefined)
			toast.warning(data.left + ' left the game');
		if (data.isWin !== undefined)
			win.value = data.isWin;
		if (data.isLose !== undefined)
			lose.value = data.isLose;
		if (data.isStart !== undefined) {
			start.value = data.isStart;
			if (data.isStart == false) {
				if (data.isWin == undefined)
					win = ref(false);
				if (data.isLose == undefined)
					lose = ref(false);
			}
		}
		if (data.owner !== undefined)
			isOwner.value = data.owner == me?.value?.login;
		if (data.nbrBall !== undefined)
			nbrBall.value = data.nbrBall;
		if (data.remount !== undefined && data.remount)
			remount.value = !remount.value;
	});
})
onUnmounted(() => {
	socket.off('end');
	socket.off('info_game');
	socket.off('get_game_info');
	console.log('unmount game');
})

function launch() {
	start.value = !start.value;
	socket.emit('start');
}
function incrBall() {
	if (nbrBall.value + 1 <= 3) {
		nbrBall.value++;
		socket.emit('updateLobby', {
			nbrBall: nbrBall.value,
		});
		socket.emit('send_game_info');
	} else {
		toast.warning('3 balls maximum');
	}
}
function decrBall() {
	if (nbrBall.value - 1 >= 1) {
		nbrBall.value--;
		socket.emit('updateLobby', {
			nbrBall: nbrBall.value,
		});
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

.msg {
	position: absolute;
	top: calc(50 - 25px);
	z-index: 10;
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
