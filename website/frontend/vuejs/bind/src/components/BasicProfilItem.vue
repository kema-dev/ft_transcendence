<template>
	<router-link :to="{name: 'conversation', params: {conv_name: user!.name }}" class="basicProfil_cont center row">
		<div class="avatar_cont center">
			<img :src="user!.avatar" class="avatar" alt="avatar">
		</div>
		<div class="login">{{user?.name}}</div>
		<!-- <div class="info center column">
			<div class="top-bar row center stack">
				<div class="login">{{conv!.name}}</div>
				<div class="date">{{display_date()}}</div>
			</div>
			<div class="message_cont center">
				<div class="message">{{conv?.messages[conv.messages.length - 1].msg}}</div>
			</div>
		</div> -->
	</router-link>
</template>

<script setup lang="ts">
import { inject, defineProps, onMounted, ref } from "vue";
import Conversation from '@/chat/Conversation';
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
.basicProfil_cont {
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