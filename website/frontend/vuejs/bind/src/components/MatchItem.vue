<template>
	<div class="center column">
		<div class="center column groupe stack">
			<div class="match center row space-between" v-on:click="open()">
				<img class="tennis_racket_img" src="@/assets/svg/ball_fire.svg" />
				<div class="info center row space-around">
					<div class="row center">
						<img class="podium icon" src="@/assets/svg/leaderboard.svg" />
						<h1 class="number">{{ get_rank(me?.value?.login) }}</h1>
					</div>
					<div class="row center">
						<img class="icon" src="@/assets/svg/user.svg" />
						<h1 class="number">{{ props.match.player_count }}</h1>
					</div>
					<div class="row center">
						<img class="icon" src="@/assets/svg/tennis.svg" />
						<h1 class="number">{{ props.match.ball_count }}</h1>
					</div>
				</div>
			</div>
			<div class="more"></div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { inject, Ref, ref, defineProps } from 'vue';
import { MatchDto } from '../dto/MatchDto';
import ProfileUserDto from '../dto/ProfileUserDto';
let define = inject('colors');
let me: Ref<ProfileUserDto> = inject('user')!;

const props = defineProps(['match'])
// console.log('props:', props.match);

// let match = {
// 	nbrPlayer: 3,
// 	nbrBall: 2,
// 	players: [
// 		{
// 			login: 'toto',
// 			score: -2,
// 		},
// 		{
// 			login: 'test',
// 			score: -1,
// 		},
// 		{
// 			login: 'zeus',
// 			score: 0,
// 		},
// 	],
// };

let size = ref(0);
// function open() {
// 	if (size.value) size.value = 0;
// 	else size.value = match.nbrPlayer;
// }

function get_rank(login: string) {
	let rank = 0;
	for (let i = 0; i < props.match.players.length; i++) {
		if (props.match.players[i].login == login) {
			rank = props.match.ranks[i];
			break;
		}
	}
	return rank;
}
</script>

<style scoped>
.groupe {
	margin: 10px 0;
	width: clamp(18rem, 80%, 550px);
}
.match {
	height: 60px;
	width: 100%;
	border-radius: 100px;
	border: 3px v-bind('define.color2') solid;
	border-left: 0;
	background-color: v-bind('define.color0');
	z-index: 10;
	margin-bottom: v-bind("size * 50 + 'px'");
	cursor: pointer;
	transition: all ease-in-out 0.2s;
}
.tennis_racket_img {
	/* make image smaller */
	border-radius: 100%;
	height: 60px;
	width: 60px;
	border: 4px v-bind('define.color2') solid;
}
.info {
	width: calc(100% - 60px);
	height: 60px;
}
.more {
	position: absolute;
	z-index: 1;
	top: 0;
	height: v-bind("size * 50 + 60 + 'px'");
	border: 3px v-bind('define.color2') solid;
	border-radius: 30px;
	background-color: v-bind('define.color2');
	transition: all ease-in-out 0.2s;
}
.number {
	font-size: clamp(1px, 150%, 10rem);
}
.icon {
	/* height: clamp(10px, 10%, 40px); */
	max-height: 40px;
	margin-right: 5px;
	/* back: aquamarine; */
}
.podium {
	height: 50px !important;
}
</style>
