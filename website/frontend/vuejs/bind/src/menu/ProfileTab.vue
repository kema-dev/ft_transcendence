<template>
	<div class="column center" id="test">
		<div class="stack avatar-stack">
			<div id="bar"></div>
			<div v-on:click="change_avatar()" id="avatar">
				<img :src="me?.avatar" id="img" />
			</div>
		</div>
		<input id="none" type="file" />
		<!-- <h2 class="info">{{ user.rank }}</h2> -->
		<h1 id="name">{{ me?.login }}</h1>
		<!-- <h2 class="info" style="margin-bottom: 40px">level {{ me?.level }}</h2> -->
		<h2>Match history</h2>
		<MatchItem
			v-for="match in user_history"
			v-bind:match="match"
			:key="match.creation_date"
		/>
		<!-- <ScoreItem :player="user.name" :adversary="match.adversary" :points1="match.points1" :points2="match.points2"/> -->
		<!-- <MatchItem :match="match" /> -->
		<!-- </div> -->
	</div>
</template>

<script setup lang="ts">
import { onMounted, inject, Ref, ref } from 'vue';
import ScoreItem from '../components/ScoreItem.vue';
import MatchItem from '@/components/MatchItem.vue';
import { ProfileUserDto } from '../dto/ProfileUserDto';
import API from '../components/axios';
import { createWebHistory } from 'vue-router';
let define = inject('colors');
let me: Ref<ProfileUserDto> = inject('user')!;
let socket = inject('socket')!;

var ProgressBar = require('progressbar.js');

// console.log('me:', me?.value);

let user_ratio = ref(0.5);
let user_history = ref([]);

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
	await API.post('/match/get_user_ratio', {
		login: me?.value?.login,
	}).then((res) => {
		user_ratio.value = res.data;
	});
	bar.animate(user_ratio.value);
	await API.post('/match/get_user_history', {
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
	margin-top: -5px;
	/* margin-bottom: -5px; */
	font-size: 200%;
}
.info {
	font-size: 100%;
}
</style>
