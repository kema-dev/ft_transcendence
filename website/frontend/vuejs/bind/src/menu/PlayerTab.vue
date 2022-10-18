<template>
	<div class="column center" v-if="show">
		<div class="stack avatar-stack">
			<div id="avatar">
				<img :src="other_user_avatar" id="img" />
			</div>
		</div>
		<input id="none" type="file" />
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

onMounted(async () => {
	const usr_login = cookies.get('login');
	const usr_token = cookies.get('session');
	await API.post('/match/get_user_stats/', {
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
	await API.post('/match/get_user_history', {
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
	await API.post('/user/get_user_avatar', {
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
</style>
