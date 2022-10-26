<template>
	<div class="column center" v-if="show">
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
				<div v-if="statusDone" class="status"></div>
			</div>
			<hr class="separator">
			<div class="playerStatCont center raw">
				<h3 class="statTitle">Rank :</h3>
				<h3 class="statValue">Top {{ user_ratio_rounded }}%</h3>
			</div>
			<div class="playerStatCont center raw">
				<h3 class="statTitle">Level :</h3>
				<h3 class="statValue">{{ user_stats.level }}</h3>
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
		<div v-if="userDone" class="playerBtnCont center raw">
			<button v-if="userStatus != 'ingame'" @click="inviteGame()" 
				class="playerBtn center raw"
			>
				<img src="@/assets/ball_logo.svg" class="imgBtn">
				Play
			</button>
			<button v-else @click="specGame()" class="playerBtn center raw">
				<img src="@/assets/eye.svg" class="imgBtn">
				Watch
			</button>
			<button @click="toChat()" class="playerBtn center raw">
				<img src="@/assets/chat.svg" class="imgBtn">
				Chat
			</button>
			<button v-if="!isFriend()" @click="addFriend()" class="playerBtn center raw">
				<img src="@/assets/add_friend.svg" class="imgBtn">
				Add
			</button>
			<button v-else @click="removeFriend()" class="playerBtn center raw">
				<img src="@/assets/remove_friend.svg" class="imgBtn">
				Remove
			</button>
			<button v-if="!isBlocked()" @click="blockUser()" class="playerBtn center raw">
				<img src="@/assets/block_logo.svg" class="imgBtn">
				Block
			</button>
			<button v-else @click="unblockUser()" class="playerBtn center raw">
				<img src="@/assets/restore.svg" class="imgBtn">
				Unblock
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
      <h3 class="noResults">No match</h3>
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
import { useToast } from 'vue-toastification';

const toast = useToast();
const route = useRoute();
const { cookies } = useCookies();
let define = inject('colors')!;
let user_login = route.params.name as string;
let me: Ref<ProfileUserDto> = inject('user')!;
let myName: string = inject('me')!;
let userDone = inject('userDone')!;
let socket : Socket = inject('socket')!;
let ProgressBar = require('progressbar.js');
let statDone = false;
let historyDone = false;
let avatarDone = false;
let userStatus = ref('');
let statusColor = ref('');
let statusDone = ref(false);
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
	if (statDone && historyDone && avatarDone)
		show.value = true;
}

function inviteGame() {
	socket.off('invite_to_game');
	socket.on('invite_to_game', (data) => {
		if (data.error == 'no game') {
			toast.success('You were not in a game, created a new one for you !');
			inviteGame();
		} else if (data.error == 'no user') {
			toast.error('This user does not exist');
		} else if (data.error == 'no online') {
			toast.warning('This user is not online');
		} else {
			console.log(data);
		}
	});
	socket.emit("invite_to_game", { login: user_login });
}

function toChat() {
	router.push({name: 'PrivConv', params: {conv_name: user_login}})
}

function isFriend() {
	return me.value.friends.map(f => f.login)
		.includes(user_login);
}

function addFriend() {
	socket.emit('addFriend', { sender: myName, receiver: user_login });
}

function removeFriend() {
	socket.emit("removeFriend", { sender: myName, receiver: user_login });
}

function isBlocked() {
	return me.value.blockeds.map(f => f.login)
		.includes(user_login);
}

function blockUser() {
	socket.emit("blockUser", {blocker: myName, blocked: user_login});
}

function unblockUser() {
	socket.emit("unblockUser", {blocker: myName, blocked: user_login});
}

function specGame() {
	
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
	socket.on("userStatus", (data: {user: string, status: string}) => {
		if (data.user == user_login) {
			if (data.status == 'online')
				statusColor.value = '#00CC00';
			else if (data.status == 'offline')
				statusColor.value = '#FF3333';
			else
				statusColor.value = 'orange';
			userStatus.value = data.status;
			statusDone.value = true;
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
	max-width: 85%;
	overflow-wrap: break-word;
}
.status {
	width: 25px;
	height: 25px;
	border-radius: 50%;
	margin-left: 10px;
	background: v-bind(statusColor);
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
	font-size: 1.2rem;
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
