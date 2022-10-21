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
			<h1 class="login">{{ user_login }}</h1>
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
import { onMounted, inject, Ref, ref, watch } from 'vue';
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
let show = ref(false);

let user_ratio = ref(0.5);
let user_ratio_rounded = ref(50);
let user_history = ref([]);
let user_stats = ref({});
let other_user_avatar = ref('');
let user_status = ref('');

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
	
	// API.post('/user/get_user_status', {
	// 	headers: {
	// 		login: usr_login,
	// 		token: usr_token,
	// 	},
	// 	login: user_login,
	// }).then((res) => {
	// 	user_status.value = res.data;
	// 	show.value = true;
	// }).catch((err) => {
	// 	console.log(err);
	// 	show.value = false;
	// });
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
.match_history_title {
	margin-top: 20px;
	margin-bottom: 10px;
	font-size: 150%;
}
</style>




<!-- ============================================ -->



<!-- <template>
	<div class="column center" v-if="show">
		<h1>{{ user_status }}</h1>
		<div class="stack avatar-stack">
			<div id="avatar">
				<img :src="other_user_avatar" id="img" />
			</div>
		</div>
		<h1 id="name">{{ user_login }}</h1>
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
	</div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { onMounted, inject, Ref, ref, watch } from 'vue';
import { Socket } from "socket.io-client";
import MatchItem from '../components/MatchItem.vue';
import { ProfileUserDto } from '../dto/ProfileUserDto';
import API from '../components/axios';
import { useCookies } from 'vue3-cookies';

const route = useRoute();
const { cookies } = useCookies();
let define = inject('colors');
let user_login = route.params.name;
let userDone = inject('userDone')!;
let socket : Socket = inject('socket')!;
let showBlocks = ref(false);

let user_ratio = ref(0.5);
let user_ratio_rounded = ref(50);
let user_history = ref([]);
let user_stats = ref({});
let show = ref(false);
let other_user_avatar = ref('');
let user_status = ref('');

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
		show.value = true;
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
		show.value = true;
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
		show.value = true;
	}).catch((err) => {
		console.log(err);
		show.value = false;
	});
	API.post('/user/get_user_status', {
		headers: {
			login: usr_login,
			token: usr_token,
		},
		login: user_login,
	}).then((res) => {
		user_status.value = res.data;
		show.value = true;
	}).catch((err) => {
		console.log(err);
		show.value = false;
	});
})

</script>

<style scoped>
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
	object-fit: cover;
	vertical-align: middle;
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
</style>  -->
