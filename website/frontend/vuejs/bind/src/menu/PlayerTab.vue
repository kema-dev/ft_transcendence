<template>
	<div class="column center" v-if="show">
		<!-- <h1>{{ user_status }}</h1> -->
		<div class="stack avatar-stack">
			<div id="bar"></div>
			<div id="avatar">
				<img :src="other_user_avatar" id="img" />
			</div>
		</div>
		<div class="playerInfoCont center column">
			<div class="loginStatus center raw">
				<h1 class="login">{{ user_login }}</h1>
				<div class="status"></div>
			</div>
			<hr class="separator">
			<div class="playerStatCont center raw">
				<h3 class="statTitle">Rank :</h3>
				<h3 class="statValue">Top {{ user_ratio_rounded }}%</h3>
			</div>
			<div class="playerStatCont center raw">
				<h3 class="statTitle">Win :</h3>
				<h3 class="statValue">{{ user_stats.wins }}</h3>
			</div>
			<div class="playerStatCont center raw">
				<h3 class="statTitle">Loose :</h3>
				<h3 class="statValue">{{ user_stats.loses }}</h3>
			</div>
		</div>

		<h2 class="match_history_title">Match history</h2>
		<MatchItem
			v-for="match in user_history"
			v-bind:match="match"
			:key="match.creation_date"
		/>
	</div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { onMounted, inject, Ref, ref, watch, onUnmounted } from 'vue';
import { Socket } from "socket.io-client";
import MatchItem from '../components/MatchItem.vue';
import { ProfileUserDto } from '../dto/ProfileUserDto';
import API from '../components/axios';
import { useCookies } from 'vue3-cookies';

const route = useRoute();
const { cookies } = useCookies();
let define = inject('colors')!;
let user_login = route.params.name;
let userDone = inject('userDone')!;
let socket : Socket = inject('socket')!;
let showBlocks = ref(false);
let ProgressBar = require('progressbar.js');
let statDone = false;
let historyDone = false;
let avatarDone = false;
let statusDone = false;
let show = ref(false);

let user_ratio = ref(0.5);
let user_ratio_rounded = ref(50);
let user_history = ref([]);
let user_stats = ref({});
let other_user_avatar = ref('');
let user_status = ref(false);

watch(show, () => {
	var bar = new ProgressBar.Circle('#bar', {
		color: define.color2,
		strokeWidth: 8,
		trailWidth: 0,
		easing: 'easeInOut',
		duration: 1400,
	});
	bar.animate(1 - user_ratio.value);
}, {flush: 'post'})

function isDone() {
	if (statDone && historyDone && avatarDone && statusDone)
		show.value = true;
}

onMounted(async () => {
	const usr_login = cookies.get('login');
	const usr_token = cookies.get('session');
	API.post('/match/get_user_stats/', {
		headers: {
			login: usr_login,
			token: usr_token,
		},
		login: user_login,
	}).then((res) => {
		user_stats.value = res.data;
		user_ratio.value = res.data.average_rank;
		user_ratio_rounded.value = Math.round(res.data.average_rank * 100);
		statDone = true;
		isDone();
	}).catch((err) => {
		console.log(err);
		show.value = false;
	});
	API.post('/match/get_user_history', {
		headers: {
			login: usr_login,
			token: usr_token,
		},
		login: user_login,
	}).then((res) => {
		user_history.value = res.data;
		historyDone = true;
		isDone();
	}).catch((err) => {
		console.log(err);
		show.value = false;
	});
	API.post('/user/get_user_avatar', {
		headers: {
			login: usr_login,
			token: usr_token,
		},
		login: user_login,
	}).then((res) => {
		other_user_avatar.value = res.data;
		avatarDone = true;
		isDone();
	}).catch((err) => {
		console.log(err);
		show.value = false;
	});
	socket.on("userStatus", (data: {user: string, status: boolean}) => {
		if (data.user == user_login) {
			user_status.value = data.status;
			statusDone = true;
			isDone();
		}
	});
	socket.emit("userStatus", user_login);
})

onUnmounted(() => {
	socket.off("userStatus");
})

</script>

<style scoped>
.avatar-stack {
	width: 40%;
	height: 200px;
}
#avatar {
	position: absolute;
	width: 150px;
	height: 150px;
	border-radius: 50%;
	box-shadow: 0px 2px 5px #333;
	top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
#img {
	object-fit: cover;
	width: 100%;
	height: 100%;
	border-radius: 50%;
}
#bar {
	position: absolute;
	width: 165px;
	height: 165px;
	top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.loginStatus {
	margin-bottom: 10px;
}
.login{
	font-size: 1.5rem;
	/* width: auto; */
	max-width: 85%;
	overflow-wrap: break-word;
}
.status {
	width: 25px;
	height: 25px;
	border-radius: 50%;
	background: v-bind((user_status ? "#00CC00" : "#FF3333"));
}
.separator {
	flex-shrink: 0;
	width: 200px;
	height: 3px;
	background-color: v-bind("define.color2");
	margin-bottom: 10px;
}
.playerStatCont {
	margin: 5px 0;
	width: 60%;
}
.statTitle,
.statValue {
	width: 40%;
	font-size: 0.9rem;
}
.match_history_title {
	margin-top: 20px;
	margin-bottom: 10px;
	font-size: 150%;
}
</style>
