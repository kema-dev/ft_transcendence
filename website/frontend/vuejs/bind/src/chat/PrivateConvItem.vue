<template>
	<div v-if="userExistDone && userExist && privDone" id="conversation_view" class="stack">
		<div class="userTopBar center raw space-between">
			<div @click="toProfile" class="avatar_cont center">
				<img :src="userExist.avatar"
					class="avatar" alt="avatar"
				/>
			</div>
			<div class="center row">
				<button @click="toProfile" class="login">{{ userName }}</button>
				<div v-if="statusDone" class="status"></div>
			</div>
			<div class="option_buttons center raw stack">
				<button v-if="userStatus != 'ingame'" @click="inviteGame" class="button_cont center">
					<span class="infoButtonText">Invite in game</span>
					<img
						src="~@/assets/ball_logo.svg"
						alt="Invite game button"
						class="button_img"
					/>
				</button>
				<button v-else @click="specGame()" class="button_cont center">
					<span class="infoButtonText">Watch game</span>
					<img
						src="~@/assets/eye.svg"
						alt="Watch game button"
						class="button_img"
					/>
				</button>
				<button @click="blockWarn = true" class="button_cont center">
					<span class="infoButtonText">Block</span>
					<img
						src="~@/assets/block_logo.svg"
						alt="Invite game button"
						class="button_img"
					/>
				</button>
				<button onclick="history.back()" class="button_cont center">
					<span class="infoButtonText">Close</span>
					<img
						src="~@/assets/close_logo.svg"
						alt="Invite game button"
						class="button_img"
					/>
				</button>
			</div>
		</div>
		<div class="conversation_content">
			<div v-if="index != -1" id="msgsCont" class="messages">
				<div v-for="(message, i) in privsRef[index]?.messages" 
					:key="i" class="center column"
				>
					<div v-if="checkDate(i)" class="date">
						{{ displayDate(message.date, i) }}
					</div>
					<MessageItem
						:userAvatar="privsRef[index].user.avatar"
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
		<WarningMsg
			v-if="blockWarn"
			msg="Are you sure to block this User? 
				You will not receive message from him/her anymore"
			:img="require('@/assets/warning_logo.png')"
		>
			<template #buttons>
				<div class="blockAdvertButtons center raw">
					<button @click="blockUser">Yes</button>
					<button @click="blockWarn = false">No</button>
				</div>
			</template>
		</WarningMsg>
	</div>
	<div v-else-if="userExistDone && userBlocked" class="wrongPath center">
		<span class="wrongPathMsg">This user is blocked &#129301;</span>
	</div>
	<div v-else-if="userExistDone && !userExist" class="wrongPath center">
		<span class="wrongPathMsg">Bad userName &#129301;</span>
	</div>
</template>

<script setup lang="ts">
/* eslint @typescript-eslint/no-var-requires: "off" */
import {
	inject,
	onMounted,
	watch,
	ref,
	Ref,
	onBeforeUnmount,
	nextTick,
} from "vue";
import { useRoute } from "vue-router";
import { Socket } from "socket.io-client";
import HTTP from "../components/axios";
import MessageItem from "@/chat/MessageItem.vue";
import WarningMsg from "@/components/WarningMsg.vue";
import { NewPrivMsgDto } from "@/chat/dto/NewPrivMsgDto";
import { PrivConvDto } from "@/chat/dto/PrivConvDto";
import { BasicUserDto } from "./dto/BasicUserDto";
import router from "@/router";
import { useToast } from 'vue-toastification';
// ===================== INIT =====================

// INIT COMPONENT VARIABLES
const toast = useToast();
let colors = inject("colors");
let mySocket: Socket = inject("socket")!;
let me: string = inject("me")!;
let apiPath: string = inject("apiPath")!;
const userName = useRoute().params.conv_name as string;
let isCreate : Ref<boolean> = inject('isCreate')!;
let isJoin : Ref<boolean> = inject('isJoin')!;
let myMsg = ref("");
let userStatus = ref('');
let statusColor = ref('');
let statusDone = ref(false);
let blockWarn = ref(false);
let userBlocked = ref(false);
let userExistDone = ref(false);
let userExist : Ref<BasicUserDto| undefined> = ref(undefined);
let index = ref(-1);

// VERIFY IF CHAN EXIST
userExistOrBlocked();

// GET PRIVS REFS
let privsRef: Ref<PrivConvDto[]> = inject("privs")!;
const privDone: Ref<boolean> = inject("privDone")!;
const findPrivIndex: Ref<boolean> = inject("findPrivIndex")!;

// GET PRIV INDEX
index.value = privsRef.value
	.findIndex((priv) => priv.user.login == userName);
if (index.value != -1) init();

// GET PRIV INDEX IF REFRESH PAGE
watch(privDone, () => {
	index.value = privsRef.value
		.findIndex((priv) => priv.user.login == userName);
	if (index.value != -1) nextTick(() => init())
}, {flush: 'post'})

function init() {
	privMsgRead();
	scrollAndFocus();
	watch(privsRef.value[index.value].messages, () => {
		privMsgRead();
		let msgsCont = document.getElementById("msgsCont");
		if (msgsCont) {
			// let oldScrollTop = msgsCont!.scrollTop;
			// let oldScrollHeight = msgsCont!.scrollHeight;
			// let oldClientHeight = msgsCont!.clientHeight;
			// let lastMsg = msgsCont.lastElementChild!.clientHeight;
			// console.log(`oldscrolltop = `)
			// if (oldScrollTop + oldClientHeight + lastMsg == oldScrollHeight){
			// 		msgsCont!.scrollTop = msgsCont!.scrollHeight;
			// }
			msgsCont!.scrollTop = msgsCont!.scrollHeight;
		}
	}, {flush: 'post'})
}

watch(findPrivIndex, () => {
	console.log(`findPrivIndex privConvItem OUT`)
	if (findPrivIndex.value == true) {
		console.log(`findPrivIndex privConvItem IN`)
		index.value = privsRef.value
			.findIndex((priv) => priv.user.login == userName);
		findPrivIndex.value = false;
	}
})


// ===================== METHODS =====================

function userExistOrBlocked() {
	HTTP.get(`${apiPath}chat/userExistOrBlocked/${userName}`)
		.then((res) => {
			userExist.value = res.data;
			userExistDone.value = true;
			nextTick(() => scrollAndFocus() )
		})
		.catch((e) => {
			userExistDone.value = true;
			if (e.response.data.message === 'DO_NOT_EXIST')
				console.error(`This user do not exist`)
			if (e.response.data.message === 'IS_YOU')
			console.error(`Bad userName, it's yours`)
			else if (e.response.data.message === 'USER_BLOCKED') {
				userBlocked.value = true;
				// console.error(`This user is blocked`)
			}
		});
}

function toProfile() {
	router.push({name: 'player', params: { name: userName }});
}

function sendMsg() {
	if (myMsg.value != "") {
		mySocket.emit("newPrivMsg", new NewPrivMsgDto(userName, myMsg.value));
		myMsg.value = "";
	}
}

function privMsgRead() {
	if (privsRef.value[index.value].messages.at(-1)!.user != me
		&& privsRef.value[index.value].readed == false
	) {
		privsRef.value[index.value].readed = true;
		mySocket.emit('privReaded', {sender: userName});
	}
}

function specGame() {
	mySocket.emit('look_lobby2', {
		spec: me,
		player: userName,
	});
	isCreate.value = true;
	isJoin.value = false;
}

function blockUser() {
	router.push({name: 'private'});
	mySocket.emit("blockUser", {blocker: me, blocked: userName});
}

function inviteGame() {
	console.log('inviteGame: Starting')
	mySocket.off('invite_to_game');
	mySocket.on('invite_to_game', (data) => {
		console.log('inviteGame: received data')
		if (data.error == 'no game') {
			toast.success('You were not in a game, created a new one for you !');
			inviteGame();
		} else if (data.error == 'no user') {
			toast.error('This user does not exist');
		} else if (data.error == 'no online') {
			toast.warning('This user is not online');
		} else {
			console.log(data);
		}
	});
	mySocket.emit("invite_to_game", { login: userName });
}

function scrollAndFocus() {
	let msgCont = document.getElementById("msgsCont");
	if (msgCont)
		msgCont.scrollTop = msgCont.scrollHeight;
		document.getElementById("sendbox")?.focus();
}

function checkDate(i: number) {
	if (i == 0) return true;
	else if (
		Math.ceil(
			(privsRef.value[index.value].messages[i].date.getTime() -
				privsRef.value[index.value].messages[i - 1].date.getTime()) /
				(1000 * 60)
		) > 15
	)
		return true;
	else
		return false;
}

function checkAvatar(i: number) {
	if (me == privsRef.value[index.value].messages[i].user)
		return false;
	if (i == privsRef.value[index.value].messages.length - 1) 
		return true;
	if (
		privsRef.value[index.value].messages[i].user == 
		privsRef.value[index.value].messages[i + 1].user
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


// ===================== LIFECYCLES HOOKS =====================

onMounted(() => {
	let msgsCont = document.getElementById("msgsCont");
	if (msgsCont)
		msgsCont!.scrollTop = msgsCont!.scrollHeight;
		const box = document.getElementById("privateTabText");
	document.getElementById("sendbox")?.focus();
	if (box != null) box.classList.add("chatTabActive");
	mySocket.on("userStatus", (data: {user: string, status: string}) => {
		if (data.user == userName) {
			if (data.status == 'online')
				statusColor.value = '#00CC00';
			else if (data.status == 'offline')
				statusColor.value = '#FF3333';
			else
				statusColor.value = 'orange';
			userStatus.value = data.status;
			statusDone.value = true;
		}
	});
	mySocket.emit("userStatus", userName);
});

onBeforeUnmount(() => {
	mySocket.off("userStatus");
	const box = document.getElementById("privateTabText");
	if (box != null) box.classList.remove("chatTabActive");
});


// ====================== UTILS ======================

function printPriv(priv: PrivConvDto | undefined) {
	if (!priv) return console.log(`priv undefined`);
	priv.messages.forEach((msg) => console.log(`${msg.msg}`));
}

function printPrivs(privs: PrivConvDto[] | undefined) {
	if (!privs) return console.log(`privs undefined`);
	privs.forEach((priv: PrivConvDto) => {
		console.log(`user = ${priv.user.login}`);
		printPriv(priv);
	});
}
</script>

<style scoped>
* {
	--height: 70px;
}
#conversation_view {
	height: calc(100vh - 180px);
	/* width: 100%; */
}
.userTopBar {
	width: 100%;
	/* max-width: min-content; */
	height: var(--height);
	background-color: white;
	box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1), 0px -4px 4px rgba(0, 0, 0, 0.1);
}
.avatar_cont {
	cursor: pointer;
	width: var(--height);
	height: var(--height);
	margin-left: 5px;
}
.avatar {
	height: calc(var(--height) - 15px);
	width: calc(var(--height) - 15px);
	border-radius: 50%;
	object-fit: cover;
}
.login {
	max-width: 80%;
	font-family: "Orbitron", sans-serif;
	font-size: 1.2rem;
	font-weight: bold;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
.status {
	width: 20px;
	height: 20px;
	border-radius: 50%;
	margin-left: 10px;
	background: v-bind(statusColor);
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
	width: 120px;
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

.date {
	margin: 15px;
	font-size: 0.8rem;
	white-space: pre;
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
