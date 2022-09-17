<template>
	<div class="column center" id="test">
		<div class="stack avatar-stack">
			<div id="bar"></div>
			<div id="avatar">
				<img :src="user?.avatar" id="img" />
			</div>
		</div>
		<h2 class="info">{{ user?.rank }}</h2>
		<h1 id="name">{{ user?.login }}</h1>
		<h2 class="info" style="margin-bottom: 40px">level {{ user?.level }}</h2>
		<h2>Match history</h2>
		<div v-for="match in user?.history" :key="match.adversary">
			<MatchItem index="" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import MatchItem from "@/components/MatchItem.vue";

let socket = inject("socket")!;
let define = inject("colors");
const route = useRoute();
let user = ref();
let bar: any;
socket.on("getUserByLogin", (data: any) => {
	user.value = data;
	bar.animate(1 - Number(user?.value?.ratio));
});
socket.emit("getUserByLogin", { login: route.params.name });
var ProgressBar = require("progressbar.js");
onMounted(() => {
	bar = new ProgressBar.Circle("#bar", {
		color: define.color2,
		strokeWidth: 4,
		trailWidth: 0,
		easing: "easeInOut",
		duration: 1400,
	});
});
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
#name {
	margin-top: -5px;
	/* margin-bottom: -5px; */
	font-size: 200%;
}
.info {
	font-size: 100%;
}
</style>
