<template>
	<div class="center column">
		<div class="center column groupe stack">
			<div class="match center row space-between" v-on:click="open()">
				<img class="tennis_racket_img" src="@/assets/svg/ball_fire.svg" />
				<div class="info center row space-around">
					<div class="row center">
						<img class="podium icon" src="@/assets/svg/leaderboard.svg" />
						<h1 class="number">{{ rank }}</h1>
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
				<div class="match_detail_first"></div>
				<div class="list">
					<div
						class="match_detail"
						v-for="i in props.match.players.length"
						:key="i"
					>
						<div @click="go_to_user_profile(i)" class="space-between fit_match">
							<img :src="avatar[i - 1]" class="avatar" />
							<div class="info_details center row space-around">
								<div class="row center">
									<h1 class="player_login">
										{{ props.match.ranking[i - 1] }}
									</h1>
								</div>
								<div class="row center">
									<img class="podium icon" src="@/assets/svg/leaderboard.svg" />
									<h1 class="number_details">{{ i }}</h1>
								</div>
								<!-- <div class="row center">
									<img class="icon small_icon" src="@/assets/svg/heart.svg" />
									<h1 class="number_details">
										{{ props.match.ranking[i - 1] }}
									</h1>
								</div> -->
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { inject, Ref, ref, defineProps, onMounted } from 'vue';
import { MatchDto } from '../dto/MatchDto';
import ProfileUserDto from '../dto/ProfileUserDto';
import API from './axios';
import { useCookies } from 'vue3-cookies';
import { useRouter, useRoute } from 'vue-router';

const route = useRoute();
const router = useRouter();
const { cookies } = useCookies();
let define = inject('colors');
let me: Ref<ProfileUserDto> = inject('user')!;
let size = ref(0);
const props = defineProps(['match']);

props.match.ranking = props.match.ranking.reverse();

let rank: Ref<number> = ref(0);

async function get_names() {
	for (let i = 0; i < props.match.ranking.length; i++) {
		await API.post('/user/get_user_login', {
			email: props.match.ranking[i],
		})
			.then((res) => {
				props.match.ranking[i] = res.data;
			})
			.catch((err) => {
				// console.log(err);
			});
	}
	if (me.value == undefined) {
		rank.value = 0;
	} else {
		rank.value = props.match.ranking.indexOf(me?.value?.login) + 1;
	}
}

get_names();

function go_to_user_profile(i: number) {
	// let refresh = false;
	// if (route.path.startsWith('/home/player/'))
	// 	refresh = true;
	router.push({name: 'player', params: {name: props.match.ranking[i - 1]}});
	// if (refresh == true) {
	// 	console.log(`refresh`);
	// 	setTimeout(() => {
	// 		router.go(0);
	// 	}, 100);
	// }
}

function open() {
	if (size.value) size.value = 0;
	else size.value = props.match.player_count + 1;
}

let avatar = ref([]);

async function get_avatars() {
	for (let i = 0; i < props.match.ranking.length; i++) {
		await API.post('/user/get_user_avatar', {
			login: props.match.ranking[i],
		})
			.then((res) => {
				avatar.value.push(res.data);
			})
			.catch((err) => {
				// console.log(err);
			});
	}
}

async function get_player_name(player: string) {
	// get player name via email
	await API.post('/user/get_user_login', {
		email: player,
	})
		.then((res) => {
			player = res.data;
		})
		.catch((err) => {
			// console.log(err);
			return '';
		});
	// send max 5 char
	if (player.length > 6) {
		return player.substring(0, 6) + '.';
	}
	return player;
}

onMounted(async () => {
	await get_avatars();
});
</script>

<style scoped>
.groupe {
	margin: 10px 0;
	width: clamp(18rem, 80%, 550px);
}
.list {
	transition: v-bind("size ? 'all 0.5s ease-in-out' : 0");
	opacity: v-bind('size ? 1 : 0');
}
.match {
	height: 60px;
	width: 100%;
	border-radius: 100px;
	border: 3px v-bind('define.color2') solid;
	border-left: 0;
	background-color: v-bind('define.color0');
	z-index: 10;
	margin-bottom: v-bind("size ? (size) * 50 + 5 + 65 + 'px' : 0");
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
.info_details {
	width: calc(100% - 50px);
	height: 50px;
}
.more {
	position: absolute;
	z-index: 1;
	top: 0;
	height: v-bind("size ? fit-content : 60 + 'px'");
	border: 3px v-bind('define.color2') solid;
	border-radius: 30px;
	background-color: v-bind('define.color2');
	transition: all ease-in-out 0.2s;
}
.number {
	font-size: clamp(1px, 120%, 8rem);
}
.number_details {
	font-size: clamp(1px, 120%, 8rem);
	/* margin-left: -8px; */
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
	margin-bottom: 5px;
}
.match_detail_first {
	height: 50px;
	width: 100%;
	border-radius: 100px;
	border: 3px v-bind('define.color2') solid;
	background-color: v-bind('define.color0');
	margin-bottom: 12px;
}
.avatar {
	border-radius: 100%;
	height: 50px;
	width: 50px;
	border: 4px v-bind('define.color2') solid;
	object-fit: cover;
}
.fit_match {
	height: 42px;
	cursor: pointer;
}
.player_login {
	font-size: clamp(1px, 120%, 8rem);
}
.small_icon {
	height: 30px !important;
}
</style>
