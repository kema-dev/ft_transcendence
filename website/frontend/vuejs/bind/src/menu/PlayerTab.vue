<template>
    <div>
		<h1>{{route.params.name}}</h1>
			<!-- <div class="column center">
		<div v-on:click="change_avatar" id="avatar">
			<img src="@/assets/avatars/(1).jpg" id="img" />
		</div>
		<input id="none" type="file" />
		<h2 class="info">{{ user.rank }}</h2>
		<h1 id="name">{{ me.login }}</h1>
		<h2 class="info">level {{ me.level }}</h2>
		<h3 id="ratio">{{ user.ratiov }} | {{ user.ratiod }}</h3>
		<h2>Match history</h2>
		<div v-for="match in user.history" :key="match.adversary">
			<MatchItem index=""/>
		</div>
	</div> -->
    </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { useRoute } from 'vue-router'
import axios from "axios";
import { FQDN } from "../../.env.json";

let define = inject('colors');
const route = useRoute()
let user;
axios
.get(FQDN + ":3000/api/v1/auth/getInfo", {login: "hey"})
.then((response) => {
	user = response.data;
})
.catch((error) => {
	console.log(error);
});
</script>

<style scoped>

</style>
