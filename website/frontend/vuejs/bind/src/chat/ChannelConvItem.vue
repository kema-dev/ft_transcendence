<template>
	<div v-if="chanExistDone && chanExist && chanDone && userDone" id="channel_view" class="stack">
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
						alt="Undo button"
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
			<!-- <div v-if="index != -1" id="msgsCont" class="messages"> -->
			<div v-if="chanBan == '' && index != -1" id="msgsCont" class="messages">
				<div class="date">{{displayDate(chansRef[index].creation, 0)}}</div>
				<div v-for="(message, i) in filterBlockMsgs()" 
					:key="i" class="center column"
				>
					<div v-if="checkDate(i)" class="date">
						{{displayDate(message.date, i)}}
					</div>
					<div v-if="checkUserName(i)" class="msgUserName">
						{{message.user}}
					</div>
					<MessageItem
						:userAvatar="findAvatar(message.user)"
						:userLogin="message.user"
						:message="message.msg"
						:date="message.date"
						:displayAvatar="checkAvatar(i)"
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
	<div v-else-if="chanExistDone && !chanExist" class="wrongPath center">
		<span class="wrongPathMsg">This channel does not exist &#129301;</span>
	</div>
</template>

<script setup lang="ts">
/* eslint @typescript-eslint/no-var-requires: "off" */
import { inject, onMounted, ref, Ref, onBeforeUnmount, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import { Socket } from "socket.io-client";
import HTTP from "../components/axios";
import MessageItem from "@/chat/MessageItem.vue";
import ChannelInfoItem from "./ChannelInfoItem.vue";
import { NewChanMsgDto } from "@/chat/dto/NewChanMsgDto";
import { ChannelDto } from "./dto/ChannelDto";
import { ProfileUserDto } from "@/dto/ProfileUserDto"
import router from "@/router";
import { MessageDto } from "./dto/MessageDto";


// ================= INIT =================

// INIT COMPONENT VARIABLES
const route = useRoute();
let chanName = route.params.conv_name as string;
let apiPath: string = inject("apiPath")!;
let colors = inject("colors");
let mySocket: Socket = inject("socket")!;
let myName: string = inject("me")!;
let me: Ref<ProfileUserDto> = inject("user")!;
let userDone: Ref<boolean> = inject("userDone")!;
const findChanIndex : Ref<boolean> = inject("findChanIndex")!;
let myMsg = ref("");
let info = ref(false);
let chanExist = ref(false);
let chanExistDone = ref(false);
let index = ref(-1);
let filtredMsgs: MessageDto[] = [];
let reloadChanIndex: Ref<boolean> = inject("reloadChanIndex")!;

// VERIFY IF CHAN EXIST
HTTP.get(apiPath + "chat/chanExist/" + chanName)
	.then((res) => {
		chanExist.value = res.data;
		chanExistDone.value = true;
		nextTick(() => {
			scrollAndFocus();
		})
	})
	.catch((e) => console.log(e));

// GET CHANS REFS
let chansRef : Ref<ChannelDto[]> = inject("chans")!;
let chanRead: (index: number, readed: boolean) => void =
	inject("chanReaded")!;
const chanDone: Ref<boolean> = inject("chanDone")!;
const chanBan: Ref<string> = inject("chanBan")!;

// GET CHAN INDEX
index.value = chansRef.value.findIndex((chan) => chan.name == chanName);
if (index.value != -1)
	init();

// GET CHAN INDEX IF REFRESH PAGE
watch(chanDone, () => {
	index.value = chansRef.value.findIndex((chan) => chan.name == chanName);
	if (index.value != -1)
		nextTick(() => { init(); })
}, {flush: 'post'})
watch(userDone, () => {
	index.value = chansRef.value.findIndex((chan) => chan.name == chanName);
	if (index.value != -1)
		nextTick(() => { init(); })
}, {flush: 'post'})


// ================= WATCHERS =================

watch(chanBan, () => {
	console.log(`start chanBan`)
	if (chanBan.value == chansRef.value[index.value].name) {
		console.log(`chanBan watcher, kicked from chan`)
		chanBan.value = '';
		router.push({name: 'channels'});
	}
	else if (chanBan.value != '') {
		console.log(`reloadChanIndex ChannelConItem`)
		setTimeout(() => {
			console.log(`find new Index reload chan`)
			index.value = chansRef.value.findIndex((chan) => chan.name == chanName);
			chanBan.value = '';
		}, 500)
	}
}, {flush: 'post'})

// watch(reloadChanIndex, () => {
// 	if (reloadChanIndex.value) {
// 		console.log(`reloadChanIndex ChannelConItem`)
// 		setTimeout(() => {
// 			index.value = chansRef.value.findIndex((chan) => chan.name == chanName);
// 			reloadChanIndex.value = false;
// 		}, 300)
// 	}
// }, {flush: 'post'})

// watch(findChanIndex, () => {
// 	// console.log(`findChanIndex ChannelConvItem OUT`);
// 	if (findChanIndex.value == true) {
// 		console.log(`findChanIndex ChannelConvItem IN`);
// 		index.value = chansRef.value.findIndex((chan) => chan.name == chanName);
// 		chanRead(index.value, true);
// 		findChanIndex.value = false;
// 	}
// }, {flush: 'post'})


// ================= METHODS =================

function init() {
	if (chanDone.value && userDone.value) {
		// filtredMsgs = filterBlockMsgs();
		chanRead(index.value, true);
		scrollAndFocus();
		watch(chansRef.value[index.value].messages, () => {
			chanRead(index.value, true);
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
}

function filterBlockMsgs() {
	filtredMsgs = chansRef.value[index.value].messages.filter(msg => {
		return !me.value.blockeds.map(b => b.login).includes(msg.user)
	});
	return filtredMsgs;
}

function scrollAndFocus() {
	let msgCont = document.getElementById("msgsCont");
	if (msgCont)
		msgCont.scrollTop = msgCont.scrollHeight;
	document.getElementById("sendbox")?.focus();
}

function findAvatar(login: string) {
	let allUsers = chansRef.value[index.value].admins
		.concat(chansRef.value[index.value].users)
		.concat(chansRef.value[index.value].mutes)
		.concat(chansRef.value[index.value].bans);
	if (chansRef.value[index.value].owner)
		allUsers.push(chansRef.value[index.value].owner);
	let isInChan = allUsers
		.find(user => user.login == login);
	if (isInChan)
		return isInChan.avatar;
	else
		return require('@/assets/dead.svg')
}

function checkDate(i: number) {
	if (i == 0) return false;
	else if (
		Math.ceil(
			(filtredMsgs[i].date.getTime() -
				filtredMsgs[i - 1].date.getTime()) /
				(1000 * 60)
		) > 15
	)
		return true;
	else
		return false;
}

function checkUserName(i: number) {
	if (myName == filtredMsgs[i].user)
		return false;
	if (i == 0) 
		return true;
	if (
		filtredMsgs[i].user 
		== filtredMsgs[i - 1].user
		&& !checkDate(i)
	)
		return false;
	else
		return true;
}

function checkAvatar(i: number) {
	if (myName == filtredMsgs[i].user)
		return false;
	if (i == 0 || i == filtredMsgs.length - 1) 
		return true;
	if (
		filtredMsgs[i].user
		== filtredMsgs[i + 1].user
		&& !checkDate(i + 1)
	)
		return false;
	else
		return true;
}

function displayDate(date: Date, i: number) {
	let minutes: string | number;
	if (date.getMinutes() < 10) minutes = "0" + date.getMinutes().toString();
	else minutes = date.getMinutes();
	let hours: string | number;
	if (date.getHours() < 10) hours = "0" + date.getHours().toString();
	else hours = date.getHours();
	const day = date.getUTCDate();
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

function sendMsg() {
	let input = document.getElementById("sendbox");
	input?.classList.remove("invalidInput");
	if (chansRef.value[index.value].mutes.find(m => m.login == myName))
		return setTimeout(() => {
			input!.classList.add("invalidInput");
		}, 50);
	if (myMsg.value != '') {
		mySocket.emit("newChanMsg", new NewChanMsgDto(myName, chanName, myMsg.value));
		myMsg.value = "";
	}
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
}
.messages {
	overflow-y: auto;
	height: calc(100vh - 340px);
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
}
.date {
	margin: 15px 0;
	font-size: 0.8rem;
	white-space: pre;
}
.msgUserName {
	width: auto;
	font-family: "Orbitron", sans-serif;
	font-size: 0.7rem;
	margin-right: auto;
	margin-left: 47px;
	justify-self: flex-start;
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
.invalidInput {
	animation: shake 0.4s linear;
}
@keyframes shake {
	0%,
	100% {
		transform: translateX(0);
	}
	10%,
	30%,
	50%,
	70%,
	90% {
		transform: translateX(-5px);
	}
	20%,
	40%,
	60%,
	80% {
		transform: translateX(5px);
	}
	0% {
		background-color: rgb(255, 178, 178);
	}
	100.0% {
		background-color: white;
	}
}
.wrongPath {
	height: calc(100vh - 180px);
	font-family: "Orbitron", sans-serif;
	font-size: 1.2rem;
	position: relative;
}
.wrongPathMsg {
	position: absolute;
	top: 30%;
}
</style>
