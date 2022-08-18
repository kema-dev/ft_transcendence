<template>
	<!-- <router-link :to="{name: 'PrivConv', params: {conv_name: user!.name }}" class="basicProfil_cont center row"> -->
	<div class="basicProfil center row">
		<div class="avatar_cont center">
			<img :src="user!.avatar" class="avatar" alt="avatar">
		</div>
		<div class="login">{{user?.name}}</div>
	</div>
	<!-- </router-link> -->
</template>

<script setup lang="ts">
import { inject, defineProps, onMounted, ref } from "vue";
import Conversation from '@/chat/PrivateConv';
import User from "@/chat/User";

let define = inject("colors");
const props = defineProps({
  user: User
})

</script>

<style scoped>
* {
  --height: 30px;
}
.basicProfil {
	width: auto;
	height: var(--height);
	/* padding: 5px 0 5px 20px; */
	margin: 3px 0;

}
.avatar_cont {
  width: var(--height);
  height: var(--height);
}
.avatar {
	height: var(--height);
  width: var(--height);
  border-radius: 50%;
}
.login {
	padding-left: 10px;
  font-family: "Orbitron", sans-serif;
	font-size: 0.9rem;
  /* font-weight: bold; */
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>