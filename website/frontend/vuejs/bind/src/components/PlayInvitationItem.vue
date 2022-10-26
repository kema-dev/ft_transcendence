<template>
	<div class="center column">
		<div class="center column groupe stack">
			<div class="match center row space-between" v-on:click="open()">
				<img class="tennis_racket_img" src="@/assets/svg/ball_fire.svg" />
				<div class="info center row space-around">
					<div class="row center">
						<img class="icon" src="@/assets/svg/user.svg" />
						<h1 class="number">{{ props.match.player_count }}</h1>
					</div>
					<div class="row center">
						<img class="icon" src="@/assets/svg/tennis.svg" />
						<h1 class="number">{{ props.match.ball_count }}</h1>
					</div>
					<div class="row center front" @click="accept_invit">
						<img class="icon" src="@/assets/play_button.png" />
					</div>
					<div class="row center front" @click="deny_invit">
						<img class="icon" src="@/assets/undo_logo.svg" />
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
						<div class="space-between fit_match">
							<img
								:src="avatar[i - 1]"
								class="avatar"
								@click="go_to_user_profile(i)"
							/>
							<div class="info_details center row space-around">
								<div class="row center">
									<h1 class="player_login" @click="go_to_user_profile(i)">
										{{ get_player_name(props.match.players[i - 1]) }}
									</h1>
								</div>
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
import { useRouter } from 'vue-router';
import { Socket } from 'socket.io-client';
const { cookies } = useCookies();

let define = inject('colors');
let me: Ref<ProfileUserDto> = inject('user')!;

const props = defineProps(['match']);

let size = ref(0);

const router = useRouter();

function go_to_user_profile(i: number) {
	router.push('/home/player/' + props.match.players[i - 1]);
	// router.go(0);
}

function open() {
	if (size.value) size.value = 0;
	else size.value = props.match.player_count + 1;
}

let avatar = ref([]);

async function get_avatars() {
	for (let i = 0; i < props.match.players.length; i++) {
		await API.post('/user/get_user_avatar', {
			headers: {
				login: cookies.get('login'),
				token: cookies.get('session'),
			},
			login: props.match.players[i],
		})
			.then((res) => {
				avatar.value.push(res.data);
			})
			.catch((err) => {
				// console.log(err);
			});
	}
}

let mySocket: Socket = inject('socket')!;

function deny_invit() {
	mySocket.emit('deny_invit', {
		game: props.match.name,
	});
}

let isCreate: Ref<boolean> = inject('isCreate')!;
let isJoin: Ref<boolean> = inject('isJoin')!;

function accept_invit() {
	mySocket.emit('join_lobby', {
		login: me?.value?.login,
		lobby: props.match.name,
	});
	isCreate.value = true;
	isJoin.value = false;
	deny_invit();
}

function get_player_name(player: string) {
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
.front {
	z-index: 100;
}

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
	margin-bottom: v-bind("size ? (size - 1) * 55 + 'px' : 0");
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
	margin-left: -8px;
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
}
.fit_match {
	height: 42px;
}
.player_login {
	font-size: clamp(1px, 120%, 8rem);
}
.small_icon {
	height: 30px !important;
}
</style>
