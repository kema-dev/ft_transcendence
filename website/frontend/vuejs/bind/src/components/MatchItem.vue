<template>
	<div class="center column">
		<div class="center column groupe stack">
			<div class="match center row space-between" v-on:click="open()">
				<img class="avatar" src="@/assets/avatars/(2).jpg" />
				<div class="info center row space-around">
					<div class="row center">
						<img class="podium icon" src="@/assets/svg/leaderboard.svg" />
						<h1 class="number">{{ witch_rank(login, match) }}</h1>
					</div>
					<div class="row center">
						<img class="icon" src="@/assets/svg/user.svg" />
						<h1 class="number">{{ match.nbrPlayer }}</h1>
					</div>
					<div class="row center">
						<img class="icon" src="@/assets/svg/tennis.svg" />
						<h1 class="number">{{ match.nbrBall }}</h1>
					</div>
				</div>
			</div>
			<div class="more" :style="{height: size * 50 + 60 + 'px'}"></div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { inject, ref } from "vue";
let define = inject("colors");

let login = "zeus";

let match = {
	nbrPlayer: 3,
	nbrBall: 2,
	players: [
		{
			login: "toto",
			score: -2,
		},
		{
			login: "test",
			score: -1,
		},
		{
			login: "zeus",
			score: 0,
		},
	],
};

let size = ref(0);
function open() {
	if (size.value)
		size.value = 0
	else
		size.value = match.nbrPlayer;
}

function witch_rank(login: string, match: any) {
	for (let i = 0; i < match.nbrPlayer; ++i) {
		if (match.players[i].login == login) {
			return i + 1;
		}
	}
	return -1;
}
</script>

<style scoped>
.groupe {
	margin: 10px 0;
	width: clamp(150px, 80%, 1000px);
}
.match {
	height: 60px;
	border-radius: 100px;
	border: 3px v-bind("define.color2") solid;
	border-left: 0;
	background-color: v-bind("define.color0");
	z-index: 10;
	margin-bottom: v-bind("size * 50 + 'px'");
	cursor: pointer;
	transition: all linear 0.2s;
}
.avatar {
	/* width: ; */
	border-radius: 100%;
	height: 60px;
	width: 60px;
	border: 4px v-bind("define.color2") solid;
}
.info {
	width: calc(100% - 60px);
	height: 60px;
}
.more {
	position: absolute;
	z-index: 1;
	top: 0;
	/* height: v-bind("match.nbrPlayer * 50 + 60 + 'px'"); */
	height: 60px;
	border: 3px v-bind("define.color2") solid;
	border-radius: 30px;
	background-color: v-bind("define.color3");
	transition: all linear 0.2s;
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
/* .more {
  animation: slide 0.4s ease-in-out;
}
@keyframes slide {
	0% {transform: max-height 0px;}
	100% {transform: max-height 400px;}
} */
</style>
