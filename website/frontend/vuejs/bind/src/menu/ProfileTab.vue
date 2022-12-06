<template>
	<input id="none" type="file" />
	<div class="column center" v-if="show">
		<!-- <h2 id="player_search_title">Search for another player's profile</h2>
		<SearchProfileItem v-model:search="search"/>
		<OtherPlayerProfile
			v-bind:search="search"
		/> -->
		<div class="stack avatar-stack">
			<div id="bar"></div>
			<div v-on:click="change_avatar()" id="avatar">
				<img :src="user_avatar" id="img" />
			</div>
		</div>
		<div class="playerInfoCont center column">
			<h1 class="login">{{ me?.login }}</h1>
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
		<hr class="separator">
		<MultiFactorAuthItem />
		<hr class="separator">
		<div v-if="userDone">
			<button @click="showBlocks = !showBlocks" id="showBlocksBtn">
				{{ (showBlocks ? 'Hide' : 'Show') + ' blocked users' }}
			</button>
			<div v-if="showBlocks">
				<div v-for="block in me.blockeds" class="center column">
					<div class="center raw">
						<BasicProfil :avatar="block.avatar" :login="block.login" />
						<button @click="unblockUser(block.login)" class="restoreBtn center">
							<img src='~@/assets/restore.svg' alt="Restore User" class="restoreImg" />
						</button>
					</div>
				</div>
			</div>
		</div>
		<hr class="separator2">
		<div class="titleCont center">
			<img src="@/assets/history.svg" class="logo">
			<h2 class="title">Match history</h2>
		</div>
		<MatchItem v-for="match in user_history" v-bind:match="match" :key="match.creation_date" />
		<div v-if="!user_history.length">
			<h3 class="noResults">Still no match, go play! </h3>
			<img class="img" src="@/assets/svg/ball_fire.svg" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, inject, Ref, ref, watch } from 'vue';
import { Socket } from "socket.io-client";
import MultiFactorAuthItem from '../components/MultiFactorAuthItem.vue';
import SearchProfileItem from '../components/SearchProfileItem.vue';
import ScoreItem from '../components/ScoreItem.vue';
import MatchItem from '@/components/MatchItem.vue';
import BasicProfil from '@/components/BasicProfilItem.vue';
import OtherPlayerProfile from '../components/OtherPlayerProfile.vue';
import { ProfileUserDto } from '../dto/ProfileUserDto';
import API from '../components/axios';
import { createWebHistory } from 'vue-router';
import { useCookies } from 'vue3-cookies';
import { useToast } from 'vue-toastification';


const toast = useToast();
const { cookies } = useCookies();
let define = inject('colors');
let me: Ref<ProfileUserDto> = inject('user')!;
let myName: string = inject("me")!;
let userDone = inject('userDone')!;
let socket: Socket = inject('socket')!;
let showBlocks = ref(false);
var ProgressBar = require('progressbar.js');
let statDone = false;
let historyDone = false;
let avatarDone = false;
let show = ref(false);

let user_ratio = ref(0.5);
let user_ratio_rounded = ref(50);
let user_history = ref([]);
let user_stats = ref({});
let user_avatar = ref('');

function isDone() {
	if (statDone && historyDone && avatarDone)
		show.value = true;
}

function change_avatar() {
	let input = document.querySelector('#none')!;
	input.click();
}

function unblockUser(blocked: string) {
	socket.emit("unblockUser",
		{ blocker: me.value.login, blocked: blocked });
}

watch(show, () => {
	var bar = new ProgressBar.Circle('#bar', {
		color: define.color2,
		strokeWidth: 8,
		trailWidth: 0,
		easing: 'easeInOut',
		duration: 1400,
	});
	bar.animate(1 - user_ratio.value);
}, { flush: 'post' })
function isFileImage(file: any) {
	return file && file['type'].split('/')[0] === 'image';
}
onMounted(async () => {
	let input = document.querySelector('#none');
	input?.addEventListener('change', () => {
		console.log('change');
		const reader = new FileReader();
		reader.addEventListener('load', () => {
			let image = reader.result;
			document.querySelector('#img').src = `${image}`;
			socket.emit('changeAvatar', {
				login: me.value.login,
				avatar: `${image}`,
			});
		});
		var re = new RegExp("[^\\s]+(.*?)\\.(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$");
		// console.log(isFileImage(input.files[0]))
		if (re.test(input.files[0].name) && isFileImage(input.files[0]))
			reader.readAsDataURL(input.files[0]);
		else
			toast.error("Invalid file type");
	});
	API.post('/user/get_user_avatar', {
		login: myName,
	}).then((res) => {
		user_avatar.value = res.data;
		avatarDone = true;
		isDone();
	}).catch((err) => {
		console.log(err);
	});
	API.post('/match/get_user_stats', {
		login: myName,
	}).then((res) => {
		user_stats.value = res.data;
		user_ratio.value = res.data.average_rank;
		user_ratio_rounded.value = Math.round(res.data.average_rank * 100);
		statDone = true;
		isDone();
	}).catch((err) => {
		console.log(err);
	});
	API.post('/match/get_user_history', {
		login: myName,
	}).then((res) => {
		user_history.value = res.data;
		historyDone = true;
		isDone();
	}).catch((err) => {
		console.log(err);
	});
});
</script>

<style scoped>
#player_search_title {
	font-size: 1.5em;
	font-weight: bold;
	margin: 0;
	color: #2c3e50;
}

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
	cursor: pointer;
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

.login {
	font-size: 1.5rem;
	margin-bottom: 10px;
	width: 100%;
	overflow-wrap: break-word;
}

.separator {
	flex-shrink: 0;
	width: 60%;
	height: 3px;
	background-color: v-bind("define.color2");
	margin-bottom: 10px;
}

.separator2 {
	flex-shrink: 0;
	width: 90%;
	height: 1px;
	background-color: grey;
	margin-top: 20px;
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

#none {
	display: none;
}

#security {
	margin-top: 15px;
	margin-bottom: 15px;
	font-size: 1.5rem;
	font-weight: bold;
	color: #2c3e50;
	text-decoration: underline;
}

#showBlocksBtn {
	margin-bottom: 10px;
	height: 1.5rem;
	width: auto;
	border-radius: calc(1.5rem / 2);
	font-weight: 500;
	background-color: v-bind("define.color2");
	color: white;
	padding: 0 10px;
	box-shadow: 0px 0px 4px #aaa;
}

.restoreBtn {
	height: 30px;
	width: 30px;
	margin-left: 10px;
	border-radius: 13px;
}

.restoreBtn:hover {
	box-shadow: 0px 0px 4px #aaa;
	background-color: white;
}

.restoreImg {
	height: 26px;
	width: 26px;
	filter: invert(29%) sepia(16%) saturate(6497%) hue-rotate(176deg) brightness(86%) contrast(83%);
}

.titleCont {
	margin-top: 20px;
	margin-bottom: 10px;
	/* margin-right: auto;
	margin-left: 40px; */
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
	filter: invert(29%) sepia(16%) saturate(6497%) hue-rotate(176deg) brightness(86%) contrast(83%);
}
</style>
