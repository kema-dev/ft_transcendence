<template>
	<div class="column center" v-if="show">
		<!-- <h2 class="title">Game invitations</h2> -->
    <div class="titleCont left_center">
      <img src="@/assets/notif.svg" class="logo">
      <h2 class="title">Game invitations</h2>
    </div>
    <div >
      <h3 class="noResults">No invitations</h3>
      <!-- <img class="img" src="@/assets/svg/ball_fire.svg" /> -->
    </div>
    <hr class="separator">
		<!-- <h2 class="title">Match history</h2> -->
    <div class="titleCont left_center">
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
import { onMounted, inject, Ref, ref, watch } from 'vue';
import { Socket } from "socket.io-client";
import MatchItem from '@/components/MatchItem.vue';
import BasicProfil from '@/components/BasicProfilItem.vue';
import OtherPlayerProfile from '../components/OtherPlayerProfile.vue';
import { ProfileUserDto } from '../dto/ProfileUserDto';
import API from '../components/axios';
import { createWebHistory } from 'vue-router';
import { useCookies } from 'vue3-cookies';

const { cookies } = useCookies();
let colors = inject('colors');
let me: Ref<ProfileUserDto> = inject('user')!;
let myName: string = inject("me")!;
let userDone = inject('userDone')!;
let socket : Socket = inject('socket')!;
let historyDone = false;
let user_history = ref([])
let show = ref(false);

function isDone() {
	if (historyDone)
		show.value = true;
}

onMounted(async () => {
	API.post('/match/get_user_history', {
		headers: {
			login: cookies.get('login'),
			token: cookies.get('session'),
		},
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

.separator {
	flex-shrink: 0;
	width: 90%;
	height: 1px;
	background-color: grey;
	margin-top: 30px;
}
.titleCont {
  margin-top: 20px;
  margin-bottom: 10px;
	max-width: 100%;
	padding-left: 40px;
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
