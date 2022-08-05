<template>
	<div class="userTopBar center raw space-between">
		<div class="avatar_cont center">
			<img :src="conv.users[0].avatar" class="avatar" alt="avatar">
			<!-- <img v-else :src="conv!.messages[conv!.messages.length -1].user.avatar" class="avatar" alt="avatar"> -->
		</div>
		<h2 class="login">{{route.params.conv_name}}</h2>
		<div class="option_buttons center raw">
			<button @click="restet_input" class="button_cont tooltip center">
				<span class="tooltiptext">Invite in room</span>
				<img src="~@/assets/play_button.png" alt="Invite game button" class="logo_img">
			</button>
			<!-- <button @click="restet_input" class="button_cont tooltip center">
				<span class="tooltiptext">Profile</span>
				<img src="~@/assets/profile_button.png" alt="Invite game button" class="logo_img">
			</button> -->
			<button @click="restet_input" class="button_cont tooltip center">
				<span class="tooltiptext">Block</span>
				<img src="~@/assets/ban_button.png" alt="Invite game button" class="logo_img">
			</button>
			<button @click="restet_input" class="button_cont tooltip center">
				<span class="tooltiptext">Close</span>
				<img src="~@/assets/close_button.png" alt="Invite game button" class="logo_img">
			</button>
		</div>
	</div>
	<div v-for="(message, i) in conv.messages" :key="i" class="messages">
		<MessageItem :message="message"/>
	</div>
</template>

<script setup lang="ts">
/* eslint @typescript-eslint/no-var-requires: "off" */
import { inject, defineProps, onMounted, ref, onBeforeUnmount } from "vue";
import { useRoute } from 'vue-router';
import Conversation from '@/chat/Conversation';
import User from "@/chat/User";
import Message from "@/chat/Message";
import MessageItem from "@/chat/MessageItem";

const route = useRoute();
let define = inject("colors");
// const props = defineProps({
//   conv: Conversation
// })

let user1 = new User("Totolosa", require("@/assets/avatars/(1).jpg"));
let user2 = new User("Ocean", require("@/assets/avatars/(2).jpg"));
let user3 = new User("Patrick la trick", require("@/assets/avatars/(3).jpg"));

let msg1 = new Message(user1, "Salut frere rwf;jnavionra'mrv'aomf gifsivbdfvndfnvjsdglbjgb;fgklb;s;bg", new Date('July 17, 2022 03:24:00'));
let msg2 = new Message(user2, "Salut poto", new Date('July 22, 2022 03:25:12'));
let msg3 = new Message(user1, "Game?", new Date('July 18, 2022 12:45:45'));
let msg4 = new Message(user3, "Non je dois finir de faire le front, et wallah c'est chaud", new Date('July 18, 2022 12:47:55'));
let msg5 = new Message(user1, "dsaibciauwncopneejvnjn fcoamsdomvcafosnvonsvonoans", new Date());
let msg6 = new Message(user2, "Mais tu sais pas parler en fait", new Date());

let conv = new Conversation(false, [user2], [msg1, msg2]);
// let conv2 = new Conversation(false, [user1, user2, user3], [msg1, msg2]);

console.log(route.query.page);
console.log(window.location.href);

onMounted(() => {
	const box = document.getElementById('privateTabText');
	if (box != null) {
		box.style.setProperty('border-bottom', '2px solid #16638D');
		box.style.setProperty('color', '#16638D');
		box.style.setProperty('font-weight', '500');
	}
});

onBeforeUnmount(() => {
	const box = document.getElementById('privateTabText');
	if (box != null) {
		box.style.removeProperty('border-bottom');
		box.style.removeProperty('color');
		box.style.removeProperty('font-weight');
	}
})

</script>

<style scoped>
* {
  --height: 70px;
}
.userTopBar {
	width: 100%;
	height: var(--height);
	background-color: white;
	margin-top: 1rem;
	margin-bottom: 20px;
	box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1), 0px -4px 4px rgba(0, 0, 0, 0.1);
}
.avatar_cont {
  width: var(--height);
  height: var(--height);
  /* position: absolute; */
}
.avatar {
	height: calc(var(--height) - 10px);
  width: calc(var(--height) - 10px);
  /* margin-left: 5px; */
  /* position: absolute; */
  /* top: 4px; */
  /* top: 50%; */
  /* transform: translate(0, -50%); */
  border-radius: 50%;
}
.login {
  /* width: 100%; */
  /* margin-left: 10px; */
  /* text-align: start; */
  font-family: "Orbitron", sans-serif;
	font-size: 1.2rem;
  font-weight: bold;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.option_buttons {
	width: auto;
}
.button_cont {
	margin: 0 2px;
}
.logo_img {
	width: 25px;
	height: 25px;
}
.tooltip {
  position: relative;
  display: inline-block;
}

/* Tooltip text */
.tooltip .tooltiptext {
  /* visibility: hidden; */
	opacity:0;
  /* transition:opacity 1000ms; */
	transition-:  1000ms;
	/* transition: 500ms; */
  width: 120px;
  background-color: rgba(0,0,0,0.6);
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;
 
  /* Position the tooltip text - see examples below! */
  position: absolute;
  z-index: 1;
	width: 120px;
  bottom: 100%;
  left: 50%;
  margin-left: -60px;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:hover .tooltiptext {
  /* visibility: visible; */
	opacity: 1;
}
</style>