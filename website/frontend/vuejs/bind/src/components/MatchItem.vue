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
			<div class="more" v-if="size">
				<div class="match_detail"></div>
				<div
					class="match_detail"
					v-for="i in props.match.players.length"
					:key="i"
				>
					<div class="space-between fit_match">
						<img class="avatar" src="@/assets/svg/ball_fire.svg" />
						<div class="info center row space-around">
							<div class="row center">
								<h1 class="player_login">{{ props.match.players[i - 1] }}</h1>
							</div>
							<div class="row center">
								<img class="podium icon" src="@/assets/svg/leaderboard.svg" />
								<h1 class="number">{{ props.match.ranks[i - 1] }}</h1>
							</div>
							<div class="row center">
								<img class="icon" src="@/assets/svg/heart.svg" />
								<h1 class="number">{{ props.match.scores[i - 1] }}</h1>
							</div>
						</div>
					</div>
				</div>
			</div>
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

let size = ref(0);

function open() {
	if (size.value) size.value = 0;
	else size.value = (props.match.player_count + 1);
}

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
	height: v-bind("size * 50 + 65 + 'px'");
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
.match_detail {
	height: 50px;
	width: 100%;
	border-radius: 100px;
	border: 3px v-bind('define.color2') solid;
	background-color: v-bind('define.color0');
	margin-bottom: 10px;
}
.avatar {
	border-radius: 100%;
	height: 50px;
	width: 50px;
	border: 4px v-bind('define.color2') solid;
}
.fit_match {
	height: 42px;
}
.player_login {
	font-size: clamp(1px, 150%, 10rem);
}
</style>
