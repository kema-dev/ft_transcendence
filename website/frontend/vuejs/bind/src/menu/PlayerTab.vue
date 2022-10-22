<template>
	<div class="column center" v-if="show">
		<!-- <h1>{{ user_status }}</h1> -->
		<div class="stack avatar-stack">
			<div id="bar"></div>
			<div id="avatar">
				<img :src="other_user_avatar" id="img" />
			</div>
			<img onclick="history.back()" src="~@/assets/close_logo.svg" id="close">
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
		<div class="playerBtnCont center raw">
			<button @click="inviteGame()" class="playerBtn center raw">
				<img src="@/assets/ball_logo.svg" class="imgBtn">
				Play
			</button>
			<button @click="toChat()" class="playerBtn center raw">
				<img src="@/assets/chat.svg" class="imgBtn">
				Chat
			</button>
		</div>
		<hr class="separator2">
		<div class="titleCont center">
			<img src="@/assets/history.svg" class="logo">
			<h2 class="title">Match history</h2>
		</div>
		<MatchItem
			v-for="match in user_history"
			v-bind:match="match"
			:key="match.creation_date"
		/>
    <div v-if="!user_history.length">
      <h3 class="noResults">Still no match, go play! </h3>
      <img class="img" src="@/assets/svg/ball_fire.svg" />
    </div>
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
import router from "@/router";

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

function inviteGame() {
	
}

function toChat() {
	router.push({name: 'PrivConv', params: {conv_name: user_login}})
}

onMounted(async () => {
	const box = document.getElementById("usersTabText");
	if (box != null) box.classList.add("active");
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
	const box = document.getElementById("usersTabText");
	if (box != null) box.classList.remove("active");
})

</script>

<style scoped>
#close {
position: absolute;
right: 10px;
top: 10px;
width: 30px;
height: 30px;
filter: invert(29%) sepia(16%) saturate(6497%) hue-rotate(176deg)
	brightness(86%) contrast(83%);
cursor: pointer;
}
.avatar-stack {
	width: 100%;
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
	width: 60%;
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
.playerBtnCont {
	margin-top: 20px;
	margin-bottom: 10px;
	justify-content: space-evenly;
}
.playerBtn {
	height: 2rem;
	width: auto;
	border-radius: calc(2rem / 2);
	font-weight: 600;
	background-color: v-bind("define.color2");
	color: white;
	padding: 0 10px;
	box-shadow: 0px 0px 4px #aaa;
}
.imgBtn {
	width: 25px;
  height: 25px;
  margin-right: 10px;
	filter: brightness(0) invert(1);
  /* filter: invert(29%) sepia(16%) saturate(6497%) hue-rotate(176deg)
	brightness(86%) contrast(83%); */
}
.separator2 {
	flex-shrink: 0;
	width: 90%;
	height: 1px;
	background-color: grey;
	margin-top: 20px;
}
.titleCont {
  margin-top: 20px;
  margin-bottom: 10px;
}
.title {
	font-size: 1.4rem;
}
.noResults {
  font-size: 0.9rem;
  margin-top: 20px;
}
.img {
  width: 50px;
  height: 50px;
}
.logo {
  width: 25px;
  height: 25px;
  margin-right: 10px;
  filter: invert(29%) sepia(16%) saturate(6497%) hue-rotate(176deg)
		brightness(86%) contrast(83%);
}
</style>
