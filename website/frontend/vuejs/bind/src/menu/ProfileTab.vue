<template>
	<div class="column center">
		<div v-on:click="change_avatar" id="avatar">
			<img src="@/assets/avatars/(1).jpg" id="img" />
		</div>
		<input id="none" type="file" />
		<h2 class="info">{{ user.rank }}</h2>
		<h1 id="name">{{ user.name }}</h1>
		<h2 class="info">level {{ user.level }}</h2>
		<h3 id="ratio">{{ user.ratiov }} | {{ user.ratiod }}</h3>
		<h2>Match history</h2>
		<div v-for="match in user.history" :key="match.adversary">
			<!-- <ScoreItem :player="user.name" :adversary="match.adversary" :points1="match.points1" :points2="match.points2"/> -->
			<MatchItem index=""/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, inject } from "vue";
import ScoreItem from "../components/ScoreItem.vue";
import MatchItem from '@/components/MatchItem.vue';
let define = inject('colors')
let user = {
	name: "zeus",
	level: "1000",
	avatar: require("@/assets/avatars/(2).jpg"),
	friends: ["Jane", "John", "Jacksdfgtertwdsfadfsafdertert"],
	status: "offline",
	rank: "1st",
	ratiov: "10",
	ratiod: "5",
	history: [
		{
			adversary: "John",
			points1: 10,
			points2: 5,
		},
		{
			adversary: "Jacksdfgtertwdsfadfsafdertert",
			points1: 7,
			points2: 5,
		},
		{
			adversary: "John",
			points1: 3,
			points2: 5,
		},
	],
};
onMounted(() => {
	let input = document.querySelector("#none");
	input?.addEventListener("change", () => {
		const reader = new FileReader();
		reader.addEventListener("load", () => {
			const uploaded_image = reader.result;
			document.querySelector("#img").src = `${uploaded_image}`;
		});
		reader.readAsDataURL(input.files[0]);
	});
});
function change_avatar() {
	let input = document.querySelector("#none");
	input.click();
}
</script>

<style scoped>
#avatar {
	width: 40%;
	border-radius: 50%;
	box-shadow: 0px 2px 5px #333;
	cursor: pointer;
	vertical-align: middle;
	margin: 30px;
	/* background-image: url("@/assets/avatars/(1).jpg"); */
	/* background-size: 100%; */
	/* height: 40%; */
	/* padding-top: 40%; */
}
#img {
	vertical-align: middle;
	width: 100%;
	border-radius: 50%;
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
#ratio {
	margin-bottom: 60px;
}
</style>
