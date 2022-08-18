<template>
		<div id="conversation_view" class="stack">
			<div class="userTopBar center raw space-between">
				<div class="avatar_cont center">
					<img :src="conv.user.avatar" class="avatar" alt="avatar">
				</div>
				<button @click="toProfile" class="login">{{route.params.conv_name}}</button>
				<div class="option_buttons center raw stack">
					<button @click="inviteGame" class="button_cont infoButton center">
						<span class="infoButtonText">Invite in room</span>
						<img src="~@/assets/play_button.png" alt="Invite game button" class="logo_img">
					</button>
					<button @click="blockUser" class="button_cont infoButton center">
						<span class="infoButtonText">Block</span>
						<img src="~@/assets/ban_button.png" alt="Invite game button" class="logo_img">
					</button>
					<button onclick="history.back();" class="button_cont infoButton center">
						<span class="infoButtonText">Close</span>
						<img src="~@/assets/close_button.png" alt="Invite game button" class="logo_img">
					</button>
				</div>
			</div>
			<div class="conversation_content stack">
				<div id="messages_cont" class="messages ">
						<MessageItem v-for="(message, i) in conv.messages" :key="i" :message="message"/>
				</div>
				<div class="sendbox_cont">
					<input
						type="text"
						placeholder="Aa..."
						id="sendbox"
						v-model="myMsg"
						class="sendbox"
					/>
				</div>
				<BlockAdvert/>
			</div>
		</div>
</template>

<script setup lang="ts">
/* eslint @typescript-eslint/no-var-requires: "off" */
import { inject, onMounted, ref, onBeforeUnmount, watch } from "vue";
import { useRoute } from 'vue-router';
import MessageItem from "@/chat/MessageItem.vue";
import PrivateConv from '@/chat/PrivateConv';
import User from "@/chat/User";
import Message from "@/chat/Message";
import BlockAdvert from "@/components/BlockItem.vue";


const route = useRoute();
let define = inject("colors");
let me: User = inject("me")!;
let myMsg = ref("");

let user1 = new User("Totolosa", require("@/assets/avatars/(1).jpg"));
let user2 = new User("Ocean", require("@/assets/avatars/(2).jpg"));
let user3 = new User("Patrick la trick", require("@/assets/avatars/(3).jpg"));

let msg1 = new Message(user1, "Salut frere ce fait graaaaave longtemps ca fais plaisr! Tu deviens quoi l'ami?", new Date('July 17, 2022 03:24:00'));
let msg2 = new Message(user2, "Salut poto", new Date('July 22, 2022 03:25:12'));
let msg3 = new Message(user1, "Game?", new Date('July 18, 2022 12:45:45'));
let msg4 = new Message(user3, "Non je dois finir de faire le front, et wallah c'est chaud", new Date('July 18, 2022 12:47:55'));
let msg5 = new Message(user1, "dsaibciauwncopneejvnjn fcoamsdomvcafosnvonsvonoans", new Date());
let msg6 = new Message(user2, "Mais tu sais pas parler en fait", new Date());

let conv = ref(new PrivateConv(user2, [msg1, msg2, msg3, msg5, msg6]));
// let conv2 = new Conversation(false, [user1, user2, user3], [msg1, msg2]);

function blockUser () {
	let advert = document.getElementById("blockAdvert_view");
	if (advert != null) {
		advert.style.setProperty('visibility', 'visible');
	}
}

watch(conv.value.messages, (newMsg) => {
	let msgs = document.getElementById("messages_cont");
	msgs!.scrollTop = msgs!.scrollHeight;
}, {flush:'post'});


onMounted(() => {
	const box = document.getElementById('privateTabText');
	if (box != null) {
		box.style.setProperty('border-bottom', '2px solid #16638D');
		box.style.setProperty('color', '#16638D');
		box.style.setProperty('font-weight', '500');
	}
	let input = document.getElementById("sendbox");
	input!.addEventListener("keydown", function(e) {
		if (e.key === "Enter") {
			e.preventDefault();
			let newMsg = new Message(me, myMsg.value, new Date());
			conv.value.messages.push(newMsg);
			myMsg.value = "";
		}
	});
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
#conversation_view {
	height: calc(100vh - 180px);
}
.userTopBar {
	width: 100%;
	height: var(--height);
	background-color: white;
	/* margin-top: 5px; */

	box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1), 0px -4px 4px rgba(0, 0, 0, 0.1);
}
.avatar_cont {
  width: var(--height);
  height: var(--height);
}
.avatar {
	height: calc(var(--height) - 15px);
  width: calc(var(--height) - 15px);
  border-radius: 50%;
}
.login {
  font-family: "Orbitron", sans-serif;
	font-size: 1.2rem;
  font-weight: bold;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.login:hover {
	color: v-bind("define.color2");
}
.option_buttons {
	width: auto;
	position: relative;
}
.button_cont {
	margin: 5px;
	position: static;
}
.logo_img {
	width: 30px;
	height: 30px;
}

.infoButtonText {
	opacity:0;
	font-size: 0.8rem;
  width: 120px;
  background-color: rgba(0,0,0,0.6);
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;
  position: absolute;
  z-index: 1;
  bottom: 100%;
	right: 50%;
	transform: translate(50%);
}

.conversation_content {
	height: calc(100% - 70px);
	width: 100%;
	padding-top: 20px;
}
.messages {
	overflow-y: auto;
	height: calc(100vh - 340px);
	display: flex;
  flex-direction: column;
	justify-content: flex-start;
}

.sendbox_cont {
	position: absolute;
	bottom: 1rem;
}

.sendbox {
	width: 40%;
	height: 2.2rem;
	padding: 10px 15px;
	font-size: 0.9rem;
	border-radius: calc(2.2rem / 2);
	outline: none;
	transition: width 0.3s ease-in-out;
}
.sendbox:focus {
	transition: width 0.3s ease-in-out;
	width: 80%;
}

/* TRANSITION ROUTER VIEW */

/* .mySlide-leave-active,
.mySlide-enter-active {
  transition: 1s;
}
.mySlide-leave-to,
.mySlide-enter-from {
	transform: translateY(100%);
} */


/* .mySlide-enter-from {
	transform: translateY(100%);
}
.mySlide-leave-to {
	transform: translateY(-100%);
} */

</style>