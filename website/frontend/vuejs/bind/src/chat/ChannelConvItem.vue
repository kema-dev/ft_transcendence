<template>
	<div v-if="chanDone" id="channel_view" class="stack">
		<div class="userTopBar center raw space-between">
			<div class="avatar_cont center">
				<img src="~@/assets/group_logo.svg"  class="avatar" alt="avatar" />
			</div>
			<span class="login">{{ route.params.conv_name }}</span>

			<div class="option_buttons center raw stack">
				<button @click="info = !info" class="button_cont center">
					<span class="infoButtonText">Infos</span>
					<img v-if="!info"
						src="~@/assets/info_logo.svg"
						alt="Infos button"
						class="button_img"
					/>
					<img v-else
						src="~@/assets/undo_logo.svg"
						alt="Info button"
						class="button_img"
					/>
				</button>
				<button onclick="history.back();" class="button_cont center">
					<span class="infoButtonText">Close</span>
					<img
						src="~@/assets/close_logo.svg"
						alt="Invite game button"
						class="button_img"
					/>
				</button>
			</div>
		</div>
		<div v-if="!info" class="conversation_content stack">
			<div v-if="index != -1" id="msgsCont" class="messages">
				<div class="date">{{displayDate(chansRef[index].creation, 0)}}</div>
				<div v-for="(message, i) in chansRef[index].messages" :key="i" class="center column">
					<div v-if="checkDate(i)" class="date">
						{{displayDate(message.date, i)}}
					</div>
					<MessageItem
						:userAvatar="findAvatar(message.user)"
						:userLogin="message.user"
						:message="message.msg"
						:date="message.date"
					/>
				</div>
			</div>
			<div class="sendbox_cont">
				<input
					v-model="myMsg"
					@keydown.enter="sendMsg()"
					type="text"
					placeholder="Aa..."
					id="sendbox"
					class="sendbox"
				/>
			</div>
		</div>
		<ChannelInfoItem v-if="info && index != -1" :i="index"/>
	</div>
</template>

<script setup lang="ts">
/* eslint @typescript-eslint/no-var-requires: "off" */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { inject, onMounted, ref, Ref, onBeforeUnmount, watch, onBeforeUpdate, onUpdated, nextTick } from "vue";
import { useRoute } from "vue-router";
import { Socket } from "socket.io-client";
import MessageItem from "@/chat/MessageItem.vue";
import BlockAdvert from "@/components/BlockItem.vue";
import ChannelInfoItem from "./ChannelInfoItem.vue";
import { MessageDto } from "@/chat/dto/MessageDto";
import { NewChanMsgDto } from "@/chat/dto/NewChanMsgDto";
import { ChannelDto } from "./dto/ChannelDto";
import { ProfileUserDto } from "@/dto/ProfileUserDto"

// ================= INIT =================

// INIT COMPONENT VARIABLES
const route = useRoute();
let chanName = route.params.conv_name as string;
let colors = inject("colors");
let mySocket: Socket = inject("socket")!;
let myName: string = inject("me")!;
let me: Ref<ProfileUserDto> = inject("user")!;
let myMsg = ref("");
let info = ref(false);
let index = ref(-1);

// GET CHANS REFS
let chansRef : Ref<ChannelDto[]> = inject("chans")!;
const chanDone: Ref<boolean> = inject("chanDone")!;

// GET CHAN INDEX
index.value = chansRef.value.findIndex((chan) => chan.name == chanName);
if (index.value != -1) {
	chanMsgRead();
	watch(chansRef.value[index.value].messages, () => {
		chanMsgRead();
		let msgsCont = document.getElementById("msgsCont");
		if (msgsCont) {
			let oldScrollTop = msgsCont!.scrollTop;
			let oldScrollHeight = msgsCont!.scrollHeight;
			let oldClientHeight = msgsCont!.clientHeight;
			let lastMsg = msgsCont.lastElementChild!.clientHeight;
			if (oldScrollTop + oldClientHeight + lastMsg == oldScrollHeight)
				msgsCont!.scrollTop = msgsCont!.scrollHeight;
		}
	}, {flush: 'post'})
}

// GET CHAN INDEX IF REFRESH PAGE
watch(chanDone, () => {
	index.value = chansRef.value.findIndex((chan) => chan.name == chanName);
	if (index.value != -1) {
		nextTick(() => {
			let msgCont = document.getElementById("msgsCont");
			msgCont!.scrollTop = msgCont!.scrollHeight;
			chanMsgRead();
			watch(chansRef.value[index.value].messages, () => {
				chanMsgRead();
				let msgsCont = document.getElementById("msgsCont");
				if (msgsCont) {
					let oldScrollTop = msgsCont!.scrollTop;
					let oldScrollHeight = msgsCont!.scrollHeight;
					let oldClientHeight = msgsCont!.clientHeight;
					let lastMsg = msgsCont.lastElementChild!.clientHeight;
					if (oldScrollTop + oldClientHeight + lastMsg == oldScrollHeight)
					msgsCont!.scrollTop = msgsCont!.scrollHeight;
				}
			})
		})
	}
}, {flush: 'post'})


// ================= METHODS =================

function sendMsg() {
	if (myMsg.value != '') {
		mySocket.emit("newChanMsg", new NewChanMsgDto(me.value.login, chanName, myMsg.value));
		myMsg.value = "";
	}
}

function chanMsgRead() {
	if (chansRef!.value[index.value].messages?.at(-1)?.user != myName) {
		// ================= MARGER MESSAGE LU
		// mySocket.emit("chanReaded", { userSend: userName, userReceive: me });
		// markReaded(index.value, true);
	}
}

function findAvatar(login: string) {
	// printChan(chansRef.value[index.value]);
	// console.log(`index.value = ${index.value}`)
	let isAdmin = chansRef.value[index.value].admins.find(admin => admin.login == login);
	// console.log(`isAdmin = ${isAdmin}`)
	if (isAdmin)
		return isAdmin.avatar;
	let isUser = chansRef.value[index.value].users.find(user => user.login == login);
	// console.log(`isUser = ${isUser}`)
	if (isUser)
		return isUser.avatar;
	else
		return require('@/assets/dead.svg')
}

function checkDate(i: number) {
	if (i == 0) return false;
	else if (
		Math.ceil(
			(chansRef.value[index.value].messages[i].date.getTime() -
				chansRef.value[index.value].messages[i - 1].date.getTime()) /
				(1000 * 60)
		) > 15
	)
		return true;
	else
		return false;
}

function displayDate(date: Date, i: number) {
	let minutes: string | number;
	if (date.getMinutes() < 10) minutes = "0" + date.getMinutes().toString();
	else minutes = date.getMinutes();
	let hours: string | number;
	if (date.getHours() < 10) hours = "0" + date.getHours().toString();
	else hours = date.getHours();
	const day = date.getDay();
	const month = date.toLocaleString("default", { month: "long" });
	const year = date.getFullYear();
	if (i == 0)
		return `Created the ${day} ${month} ${year} at ${hours}:${minutes}`;
	const now = new Date();
	const timeDif = date.getTime() - new Date().getTime();
	const minutesDif = Math.ceil(timeDif / (1000 * 60));
	const hoursDif = Math.ceil(minutesDif / 60);
	const daysDif = Math.ceil(hoursDif / 24);
	if (date.toDateString() == now.toDateString()) return `${hours}:${minutes}`;
	if (daysDif < 7)
		return `${date.toLocaleDateString("en-GB", {
			weekday: "long",
		})} ${hours}:${minutes}`;
	else return `${day} ${month} ${year} at ${hours}:${minutes}`;
}


// ====================== LIFECYCLES HOOKS ======================

onMounted(() => {
	let msgsCont = document.getElementById("msgsCont");
	if (msgsCont)
		msgsCont!.scrollTop = msgsCont!.scrollHeight;
	document.getElementById("sendbox")?.focus();
	const box = document.getElementById("channelsTabText");
	if (box != null) box.classList.add("chatTabActive");
});

onBeforeUnmount(() => {
	const box = document.getElementById("channelsTabText");
	if (box != null) box.classList.remove("chatTabActive");
});


// ====================== UTILS ======================

function printChan(chan: ChannelDto) {
	console.log(`PRINTCHAN`)
	console.log(`psw = ${chan.psw}`);
	console.log(`creation = ${chan.creation}`);
	console.log(`readed = ${chan.readed}`);
	console.log(`admins = ${chan.admins.map(admin => admin.login + ', ')}`);
	console.log(`users = ${chan.users.map(user => user.login + ', ')}`);
	chan.messages.forEach((msg) => console.log(`${msg.msg}`));
}

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
	color: v-bind("colors.color2");
}


.option_buttons {
	width: auto;
	margin-right: 8px;
}
.button_img {
	width: 30px;
	height: 30px;
	filter: invert(29%) sepia(16%) saturate(6497%) hue-rotate(176deg)
		brightness(86%) contrast(83%);
}
.button_cont {
	border-radius: 50%;
	padding: 5px;
}
.button_cont:hover {
	background-color: white;
	box-shadow: 0px 0px 4px #aaa;
}

.infoButtonText {
	visibility: hidden;
	font-size: 0.8rem;
	width: 70px;
	background-color: rgba(0, 0, 0, 0.6);
	color: #fff;
	text-align: center;
	padding: 5px 0;
	border-radius: 6px;
	position: absolute;
	z-index: 1;
	bottom: 110%;
	right: 50%;
	transform: translate(50%);
}
.button_cont:hover .infoButtonText {
	visibility: visible;
	opacity: 0;
	animation: displayButtonInfo 0.3s;
	animation-delay: 0.3s;
	animation-fill-mode: forwards;
}
@keyframes displayButtonInfo {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
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
	font-family: 'Orbitron', sans-serif;
	width: auto;
	white-space: nowrap;
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
.infoElemImgCont,
.settingsBtn,
.extendBtn {
	height: 26px;
	width: 26px;
}
.infoImg {
	height: 20px;
	width: 20px;
	filter: invert(29%) sepia(16%) saturate(6497%) hue-rotate(176deg)
		brightness(86%) contrast(83%);
}
.settingsBtn,
.extendSettingsCont {
	border: solid 1px v-bind("colors.color2");
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
