<template>
	<div class="friend_case center row">
		<div class="center row">
			<img :src="lobby?.img" class="avatar" alt="avatar" />
			<div class="left column">
				<div class="row space-between">
					<h2 class="title">{{ lobby?.lobby_name }}</h2>
					<div class="row right" style="width: auto">
						<div class="row center tag player-tag">
							<img class="icon" src="@/assets/svg/user.svg" />
							<h2 class="number">{{ lobby?.nbr_players }}</h2>
						</div>
						<div class="row center tag">
							<img class="icon" src="@/assets/svg/tennis.svg" />
							<h2 class="number">{{ lobby?.nbr_balls }}</h2>
						</div>
					</div>
				</div>
				<div class="row left">
					<button class="button" @click="join()">join</button>
					<button class="button" @click="look()">look</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Socket } from 'engine.io-client';
import { inject, defineProps, Ref } from 'vue';
let socket: Socket = inject('socket')!;
let me: Ref<any> = inject('user')!;
let isCreate = inject('isCreate')!;
let isJoin = inject('isJoin')!;
let define = inject('colors');
const props = defineProps(['lobby']);
let valide = true;
console.log(props.lobby);
if (props.lobby?.nbr_players >= 7) valide = false;
function join() {
	socket.emit('join_lobby', {
		login: me?.value?.login,
		lobby: props?.lobby?.lobby_name,
	});
	isCreate.value = true;
	isJoin.value = false;
}
function look() {
	socket.emit('look_lobby', {
		login: me?.value?.login,
		lobby_name: props?.lobby?.lobby_name,
	});
	isCreate.value = true;
	isJoin.value = false;
}
</script>

<style scoped>
.friend_case {
	width: 95%;
	height: 80px;
	background: #fff;
	border: solid 1px #ccc;
	border-radius: 100px;
	margin: 5px 0;
	padding-right: 5px;
	padding-left: 10px;
	font-size: 1.2rem;
	outline: none;
	box-shadow: 0px 0px 5px #aaa;
}
.avatar {
	width: 60px;
	height: 60px;
	border-radius: 50%;
	margin-right: 10px;
	box-shadow: 0px 1px 5px #333;
}
.title {
	text-align: left;
}
.button {
	background: v-bind('valide ? define.color2 : red');
	color: v-bind('define.color0');
	border-radius: 50px;
	font-weight: 600;
	margin-right: 5px;
	padding: 1px 12px;
}
.tag {
	margin-top: 5px;
	/*margin-right: 5px;*/
	height: 24px;
	width: 48px;
	border-radius: 100px;
	/*background: v-bind('define.color2');*/
}
.player-tag {
	/*background: v-bind('valide ? define.color2 : red');*/
}
.icon {
	width: 18px;
	margin-right: 5px;
	/*filter: invert(100%) sepia(2%) saturate(7500%) hue-rotate(191deg)
		brightness(102%) contrast(108%);*/
}
.number {
	/*color: v-bind('define.color0');*/
}
/* .avatar_case {
	border: 1px solid #333;
	border-radius: 10px;
	border-corner-shape: 1px curve #333;
	height: 30px;
	width: 30px;
} */
</style>
