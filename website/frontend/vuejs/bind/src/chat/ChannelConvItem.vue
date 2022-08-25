<template>
		<div id="channel_view" class="stack">
			<div class="userTopBar center raw space-between">
				<div class="avatar_cont center">
					<img :src="conv.user.avatar" class="avatar" alt="avatar">
				</div>
				<span class="login">{{route.params.conv_name}}</span>
				<div class="option_buttons center raw stack">
					<!-- <button @click="inviteGame" class="button_cont infoButton center">
						<span class="infoButtonText">Invite in room</span>
						<img src="~@/assets/play_button.png" alt="Invite game button" class="logo_img">
					</button> -->
					<button @click="info = !info" class="button_cont infoButton center">
						<span class="infoButtonText">Info</span>
						<img v-if="!info" src="~@/assets/info_logo.svg" alt="Info button" class="logo_img">
						<img v-else src="~@/assets/undo_logo.svg" alt="Info button" class="logo_img">
					</button>
					<button onclick="history.back();" class="button_cont infoButton center">
						<span class="infoButtonText">Close</span>
						<img src="~@/assets/close_logo.svg" alt="Invite game button" class="logo_img">
					</button>
				</div>
			</div>
			<div v-if="!info" class="conversation_content stack">
				<div id="messages_cont" class="messages ">
						<MessageItem v-for="(message, i) in conv.messages" :key="i" :message="message"/>
				</div>
				<div class="sendbox_cont">
					<input type="text" placeholder="Aa..." id="sendbox" v-model="myMsg" class="sendbox"/>
				</div>
			</div>
			<div v-else class="infoCont left column">
				<div class="infoElemCont left column" id="passwordInfo">
					<div class="infoElemHead left_center raw">
						<div class="infoElemImgCont center">
							<img src="~@/assets/key_logo.svg" alt="Password" class="infoImg">
						</div>
						<span class="infoText">Password :</span>
						<img v-if="password == ''" src="~@/assets/redcross.svg" alt="No Password" class="infoImg">
						<span v-else >{{password}}</span>
						<div class="settingsOptions left_center raw stack">
							<button @click="showSettings = !showSettings" class="settingsBtn center">
								<img src="~@/assets/settings_logo.svg" alt="Password" class="infoImg">
							</button>
							<div v-if="showSettings" class="extendSettingsCont right_center raw">
								<button class="extendBtn center">
									<img src="~@/assets/add2_logo.svg" alt="Add password" class="infoImg">
								</button>
								<button class="extendBtn center">
									<img src="~@/assets/edit_logo.svg" alt="Edit password" class="infoImg">
								</button>
								<button class="extendBtn center">
									<img src="~@/assets/delete_logo.svg" alt="Delete password" class="infoImg">
								</button>
							</div>
						</div>
					</div>
					<div class="infoElemBody left">
						<input type="text" class="passwordInput">
					</div>
				</div>
				<!-- <div class="infoElemCont center raw" id="AdministratorsInfo">
					<div class="infoImgCont">
						<img src="~@/assets/crown_logo.svg" alt="Password" class="infoAvatar">
					</div>
					<span class="infoText">Administrators</span>
					<img v-if="password == ''" src="~@/assets/redcross.svg" alt="" class="svgNoFilter">
					<button class="infoSettings infoImgCont">
						<img src="~@/assets/settings_logo.svg" alt="Password" class="infoAvatar">
					</button>
				</div>
				<div class="infoElemCont center raw" id="UsersInfo">
					<div class="infoImgCont">
						<img src="~@/assets/group2_logo.svg" alt="Password" class="infoAvatar">
					</div>
					<span class="infoText">Users</span>
					<img v-if="password == ''" src="~@/assets/redcross.svg" alt="" class="svgNoFilter">
					<button class="infoSettings infoImgCont">
						<img src="~@/assets/settings_logo.svg" alt="Password" class="infoAvatar">
					</button>
				</div> -->

			</div>
		</div>
</template>

<script setup lang="ts">
/* eslint @typescript-eslint/no-var-requires: "off" */
import { inject, onMounted, ref, onBeforeUnmount, watch } from "vue";
import { useRoute } from 'vue-router';
import MessageItem from "@/chat/MessageItem.vue";
import Private from '@/chat/Private';
import User from "@/chat/User";
import Message from "@/chat/Message";
import BlockAdvert from "@/components/BlockItem.vue";


const route = useRoute();
let define = inject("colors");
let me: User = inject("me")!;
let myMsg = ref("");
let info = ref(false);
let password = ref('');
let showSettings = ref(false);

let user1 = new User("Totolosa", require("@/assets/avatars/(1).jpg"));
let user2 = new User("Ocean", require("@/assets/avatars/(2).jpg"));
let user3 = new User("Patrick la trick", require("@/assets/avatars/(3).jpg"));

let msg1 = new Message(user1, "Salut frere ce fait graaaaave longtemps ca fais plaisr! Tu deviens quoi l'ami?", new Date('July 17, 2022 03:24:00'));
let msg2 = new Message(user2, "Salut poto", new Date('July 22, 2022 03:25:12'));
let msg3 = new Message(user1, "Game?", new Date('July 18, 2022 12:45:45'));
let msg4 = new Message(user3, "Non je dois finir de faire le front, et wallah c'est chaud", new Date('July 18, 2022 12:47:55'));
let msg5 = new Message(user1, "dsaibciauwncopneejvnjn fcoamsdomvcafosnvonsvonoans", new Date());
let msg6 = new Message(user2, "Mais tu sais pas parler en fait", new Date());

let conv = ref(new Private(user2, [msg1, msg2, msg3, msg5, msg6]));
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
#channel_view {
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
	margin-right: 10px;
}
.button_cont {
	margin: 5px;
	position: static;
}
.logo_img {
	width: 30px;
	height: 30px;
	filter: invert(29%) sepia(16%) saturate(6497%) hue-rotate(176deg) brightness(86%) contrast(83%);
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

.infoCont {
	margin-top: 20px;
}

.infoElemCont {
	width: auto;
	margin-left: 20px;
}
.infoText {
	font-family: "Orbitron", sans-serif;
	width: auto;
	white-space:nowrap;
	margin: 0 10px;
}
.passwordInput {
	padding: 0 5px;
	border-radius: 5px;
	height: 1.5rem;
	outline: none;
}
.settingsOptions {
	margin-left: 20px;
}
.infoElemImgCont, .settingsBtn, .extendBtn {
	height: 26px;
	width: 26px;
}
.infoImg {
	height: 20px;
	width: 20px;
	filter: invert(29%) sepia(16%) saturate(6497%) hue-rotate(176deg) brightness(86%) contrast(83%);
}
.settingsBtn, .extendSettingsCont {
	border: solid 1px v-bind("define.color2");
	border-radius: 13px;
	position: absolute;
	background-color: #fff;
}
.settingsBtn {
	z-index: 1;
}
.extendSettingsCont {
	height: 26px;
	width: v-bind("4 * 26 + 'px'");
	z-index: 0;
	transition: all 0.5 ease-in-out;
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