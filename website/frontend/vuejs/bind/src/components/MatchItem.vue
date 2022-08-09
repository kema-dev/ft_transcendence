<template>
	<div class="center column">
		<div class="center column groupe stack">
			<div class="match center row space-between">
				<img class="avatar" src="@/assets/avatars/(2).jpg" />

				<div class="info center row space-around">
					<div class="row center">
						<img class="podium icon" src="@/assets/svg/leaderboard.svg" />
						<h1>{{ witch_rank(login, match) }}</h1>
					</div>
					<div class="row center">
						<img class="icon" src="@/assets/svg/user.svg" />
						<h1>{{ match.nbrPlayer }}</h1>
					</div>
					<div class="row center">
						<img class="icon" src="@/assets/svg/tennis.svg" />
						<h1>{{ match.nbrBall }}</h1>
					</div>
				</div>
			</div>
			<div v-if="true" class="more"></div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { inject } from "vue";
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
	margin-bottom: v-bind("match.nbrPlayer * 50 + 'px'");
}
.avatar {
	width: ;
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
	height: v-bind("match.nbrPlayer * 50 + 60 + 'px'");
	border: 3px v-bind("define.color2") solid;
	border-radius: 30px;
	background-color: v-bind("define.color3");
}
.icon {
	height: 40px;
	margin-right: 5px;
	/* back: aquamarine; */
}
.podium {
	height: 50px !important;
}
</style>
