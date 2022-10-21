<template>
	<div class="column center">
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
			<input id="none" type="file" />
		</div>
		<div class="playerInfoCont center column">
			<h1 class="login">{{ me?.login }}</h1>
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
		<MultiFactorAuthItem />
		<div v-if="userDone">
			<button @click="showBlocks = !showBlocks" id="showBlocksBtn">
				{{(showBlocks? 'Hide' : 'Show') + ' blocked users'}}
			</button>
			<div v-if="showBlocks">
				<div v-for="block in me.blockeds" class="center column">
					<div class="center raw">
						<BasicProfil :avatar="block.avatar" :login="block.login"/>
						<button @click="unblockUser(block.login)" 
							class="restoreBtn center"
						>
							<img
								src='~@/assets/restore.svg'
								alt="Restore User"
								class="restoreImg"
							/>
						</button>
					</div>
				</div>
			</div>
		</div>
		<!-- <hr class="separator"> -->
		<h2 class="match_history_title">Match history</h2>
		<MatchItem
			v-for="match in user_history"
			v-bind:match="match"
			:key="match.creation_date"
		/>
	</div>
</template>

<script setup lang="ts">
import { onMounted, inject, Ref, ref, provide } from 'vue';
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

const { cookies } = useCookies();
let define = inject('colors');
let me: Ref<ProfileUserDto> = inject('user')!;
let userDone = inject('userDone')!;
let socket : Socket = inject('socket')!;
let showBlocks = ref(false);
var ProgressBar = require('progressbar.js');

let user_ratio = ref(0.5);
let user_ratio_rounded = ref(50);
let user_history = ref([]);
let user_stats = ref({});
let search = ref('');
let user_avatar = ref('');

function unblockUser(blocked: string) {
	socket.emit("unblockUser", 
		{blocker: me.value.login, blocked: blocked});
}

onMounted(async () => {
	let input = document.querySelector('#none');
	input?.addEventListener('change', () => {
		const reader = new FileReader();
		reader.addEventListener('load', () => {
			let image = reader.result;
			document.querySelector('#img').src = `${image}`;
			socket.emit('changeAvatar', {
				login: me.value.login,
				avatar: `${image}`,
			});
		});
		reader.readAsDataURL(input.files[0]);
	});
	var bar = new ProgressBar.Circle('#bar', {
		color: define.color2,
		strokeWidth: 8,
		trailWidth: 0,
		easing: 'easeInOut',
		duration: 1400,
	});
	await API.post('/user/get_user_avatar', {
		headers: {
			login: cookies.get('login'),
			token: cookies.get('session'),
		},
		login: me?.value?.login,
	}).then((res) => {
		user_avatar.value = res.data;
	}).catch((err) => {
		console.log(err);
	});
	await API.post('/match/get_user_stats', {
		headers: {
			login: cookies.get('login'),
			token: cookies.get('session'),
		},
		login: me?.value?.login,
	}).then((res) => {
		user_stats.value = res.data;
		user_ratio.value = res.data.average_rank;
		user_ratio_rounded.value = Math.round(res.data.average_rank * 100);
	});
	console.log('user_ratio:', user_ratio.value);
	bar.animate(1 - user_ratio.value);
	await API.post('/match/get_user_history', {
		headers: {
			login: cookies.get('login'),
			token: cookies.get('session'),
		},
		login: me?.value?.login,
	}).then((res) => {
		user_history.value = res.data;
	});
});
function change_avatar() {
	let input = document.querySelector('#none');
	input.click();
}
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

.login{
	font-size: 1.5rem;
	margin-bottom: 10px;
	width: 100%;
	overflow-wrap: break-word;
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

#none {
	display: none;
}
.match_history_title {
	margin-top: 20px;
	margin-bottom: 10px;
	font-size: 150%;
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
	filter: invert(29%) sepia(16%) saturate(6497%) hue-rotate(176deg)
		brightness(86%) contrast(83%);
}
</style>



<!-- ==================================================================== -->


<!-- 
<template>
	<div class="column center">
		<h2 id="player_search_title">Search for another player's profile</h2>
		<SearchProfileItem v-model:search="search"/>
		<OtherPlayerProfile
			v-bind:search="search"
		/>
		<div class="stack avatar-stack">
			<div id="bar"></div>
			<div v-on:click="change_avatar()" id="avatar">
				<img :src="user_avatar" id="img" />
			</div>
		</div>
		<input id="none" type="file" />
		<h1 id="name">{{ me?.login }}</h1>
		<MultiFactorAuthItem />
		<h2 class="avg_rank">Average rank: Top {{ user_ratio_rounded }}%</h2>
		<h2 class="w_l">
			Total: {{ user_stats.total }} - Wins: {{ user_stats.wins }} - Loses:
			{{ user_stats.loses }}
		</h2>
		<h2 class="match_history_title">Match history</h2>
		<MatchItem
			v-for="match in user_history"
			v-bind:match="match"
			:key="match.creation_date"
		/>
		<div v-if="userDone">
			<button @click="showBlocks = !showBlocks" id="showBlocksBtn">
				{{(showBlocks? 'Hide' : 'Show') + ' blocked users'}}
			</button>
			<div v-if="showBlocks">
				<div v-for="block in me.blockeds" class="center column">
					<div class="center raw">
						<BasicProfil :avatar="block.avatar" :login="block.login"/>
						<button @click="unblockUser(block.login)" 
							class="restoreBtn center"
						>
							<img
								src='~@/assets/restore.svg'
								alt="Restore User"
								class="restoreImg"
							/>
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, inject, Ref, ref, provide } from 'vue';
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

const { cookies } = useCookies();
let define = inject('colors');
let me: Ref<ProfileUserDto> = inject('user')!;
let userDone = inject('userDone')!;
let socket : Socket = inject('socket')!;
let showBlocks = ref(false);


var ProgressBar = require('progressbar.js');

// console.log('me:', me?.value);

let user_ratio = ref(0.5);
let user_ratio_rounded = ref(50);
let user_history = ref([]);
let user_stats = ref({});
let search = ref('');
let user_avatar = ref('');

// let user = {
// 	name: 'zeus',
// 	level: '1000',
// 	avatar: require('@/assets/avatars/(2).jpg'),
// 	friends: ['Jane', 'John', 'Jacksdfgtertwdsfadfsafdertert'],
// 	status: 'offline',
// 	rank: '1st',
// };

// let user_history = [
// 	{
// 		points1: 10,
// 		points2: 5,
// 		date: 1
// 	},
// 	{
// 		points1: 7,
// 		points2: 5,
// 		date: 2
// 	},
// 	{
// 		points1: 3,
// 		points2: 5,
// 		date: 3
// 	},
// ];

function unblockUser(blocked: string) {
	socket.emit("unblockUser", 
		{blocker: me.value.login, blocked: blocked});
}

onMounted(async () => {
	let input = document.querySelector('#none');
	input?.addEventListener('change', () => {
		const reader = new FileReader();
		reader.addEventListener('load', () => {
			let image = reader.result;
			document.querySelector('#img').src = `${image}`;
			socket.emit('changeAvatar', {
				login: me.value.login,
				avatar: `${image}`,
			});
		});
		reader.readAsDataURL(input.files[0]);
	});
	var bar = new ProgressBar.Circle('#bar', {
		color: define.color2,
		strokeWidth: 4,
		trailWidth: 0,
		easing: 'easeInOut',
		duration: 1400,
	});
	await API.post('/user/get_user_avatar', {
		headers: {
			login: cookies.get('login'),
			token: cookies.get('session'),
		},
		login: me?.value?.login,
	}).then((res) => {
		user_avatar.value = res.data;
	}).catch((err) => {
		console.log(err);
	});
	await API.post('/match/get_user_stats', {
		headers: {
			login: cookies.get('login'),
			token: cookies.get('session'),
		},
		login: me?.value?.login,
	}).then((res) => {
		user_stats.value = res.data;
		user_ratio.value = res.data.average_rank;
		user_ratio_rounded.value = Math.round(res.data.average_rank * 100);
	});
	console.log('user_ratio:', user_ratio.value);
	bar.animate(1 - user_ratio.value);
	await API.post('/match/get_user_history', {
		headers: {
			login: cookies.get('login'),
			token: cookies.get('session'),
		},
		login: me?.value?.login,
	}).then((res) => {
		user_history.value = res.data;
	});
});
function change_avatar() {
	let input = document.querySelector('#none');
	input.click();
}
</script>

<style scoped>
#player_search_title {
	font-size: 1.5em;
	font-weight: bold;
	margin: 0;
	color: #2c3e50;
}

.avatar-stack {
	margin-top: 50px;
	width: 200px;
	margin-bottom: 250px;
}
#avatar {
	position: absolute;
	width: 200px;
	height: 200px;
	border-radius: 50%;
	box-shadow: 0px 2px 5px #333;
	cursor: pointer;
	vertical-align: middle;
	margin: 7.5px;
	/* background-image: url("@/assets/avatars/(1).jpg"); */
	/* background-size: 100%; */
	/* height: 40%; */
	/* padding-top: 40%; */
}
#img {
	/* object-fit: cover; */
	/* vertical-align: middle; */
	width: 100%;
	height: 100%;
	border-radius: 50%;
}
#bar {
	position: absolute;
	width: 215px;
	height: 215px;
}
#none {
	display: none;
}
#name {
	margin-top: -20px;
	/* margin-bottom: -5px; */
	font-size: 200%;
}
.info {
	font-size: 100%;
}
.avg_rank {
	margin-top: 10px;
}
.w_l {
	margin-bottom: 10px;
}
.match_history_title {
	margin-bottom: 10px;
	font-size: 200%;
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
	margin-top: 30px;
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
	filter: invert(29%) sepia(16%) saturate(6497%) hue-rotate(176deg)
		brightness(86%) contrast(83%);
}
</style>
 -->
