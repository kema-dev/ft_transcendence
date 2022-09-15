<template>
	<div id="conversation_view" class="stack">
		<div class="userTopBar center raw space-between">
			<div class="avatar_cont center">
				<img :src="receiver.avatar" class="avatar" alt="avatar" />
			</div>
			<button @click="toProfile" class="login">{{ receiver!.login }}</button>
			<div class="option_buttons center raw stack">
				<button @click="inviteGame" class="button_cont center">
					<span class="infoButtonText">Invite in room</span>
					<img
						src="~@/assets/ball_logo.svg"
						alt="Invite game button"
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
		<div class="conversation_content">
			<div id="messages_cont" ref="msgsCont" class="messages">
				<div v-if="privDone && selectPriv()">
					<div
						v-for="(message, i) in selectPriv()!.messages"
						:key="i"
						class="center column"
					>
						<div v-if="checkDate(i)" class="date">
							{{ displayDate(message.date, i) }}
						</div>
						<MessageItem
							:userAvatar="receiver.avatar"
							:userLogin="message.user"
							:message="message.msg"
							:date="message.date"
						/>
					</div>
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
			msg="Are you sure to block this User? You will not receive message from him/her anymore"
			:img="require('@/assets/warning_logo.png')"
		>
			<template #buttons>
				<div class="blockAdvertButtons center raw">
					<button @click="banUser()">Yes</button>
					<button @click="blockWarn = false">No</button>
				</div>
			</template>
		</WarningMsg>
	</div>
</template>

<script setup lang="ts">
/* eslint @typescript-eslint/no-var-requires: "off" */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	inject,
	onMounted,
	onUnmounted,
	ref,
	Ref,
	onBeforeUnmount,
	onUpdated,
	onBeforeUpdate,
} from "vue";
import { useRoute } from "vue-router";
import { Socket } from "socket.io-client";
import MessageItem from "@/chat/MessageItem.vue";
import WarningMsg from "@/components/WarningMsg.vue";
import { NewPrivMsgDto } from "@/chat/dto/NewPrivMsgDto";
import { PrivConvDto } from "@/chat/dto/PrivConvDto";
import { BasicUserDto } from "./dto/BasicUserDto";

let colors = inject("colors");
let mySocket: Socket = inject("socket")!;
let me: string = inject("me")!;
const userName = useRoute().params.conv_name as string;
let receiver: BasicUserDto = new BasicUserDto(userName);
let privs: Ref<PrivConvDto[]> | undefined = inject("privs");
let markReaded: (index: number, readed: boolean) => void =
	inject("markReaded")!;
let index = ref(-1);
if (privs?.value.length) {
	index.value = privs!.value.findIndex((priv) => priv.user.login == userName);
	if (
		index.value != -1 &&
		privs.value[index.value].messages.at(-1)?.user != me
	) {
		mySocket.emit("privReaded", { userSend: userName, userReceive: me });
		markReaded(index.value, true);
	}
}
const privDone: Ref<boolean> = inject("privDone")!;
// let p : {privs: Ref<PrivConv[]>, (index : number, readed: boolean) : void } | undefined = inject("privsPackage");
// printPrivs(privs.value);
// let privRef : Ref<PrivConv> | undefined;
// if (privs) {
// }

// let priv = privs.value.find(priv => priv.user.login == userName);
// let privRef = ref(priv);
// let privRef = ref(privs.value.find(priv => priv.user.login == userName));
// let privRef = privs.value.find(priv => priv.user.login == userName);

// printPriv(privRef.value);

// console.log("Priv debut PrivConvItem :")
// printPriv(priv);

let myMsg = ref("");
let blockWarn = ref(false);
let msgsCont = ref(null);

// ====================== METHODS ======================

function sendMsg() {
	mySocket.emit("newPrivMsg", new NewPrivMsgDto(me, userName, myMsg.value));
	myMsg.value = "";
}

function banUser() {
	// DEMMANDER DE BAN LE USER AU BACK
}

function selectPriv() {
	// console.log(`selectPriv()`);
	let priv = privs?.value.find((priv) => priv.user.login == userName);
	// console.log(`selectPriv = ${priv}`);
	return priv;
}

function checkDate(i: number) {
	// console.log(`checkDate(), i = ${i}`)
	if (i == 0) return true;
	else if (
		Math.ceil(
			(selectPriv()!.messages[i].date.getTime() -
				selectPriv()!.messages[i - 1].date.getTime()) /
				(1000 * 60)
		) > 15
	) {
		// console.log(`checkDate = true`);
		return true;
	} else {
		// console.log(`checkDate = false`);
		return false;
	}
}

function displayDate(date: Date, i: number) {
	// console.log(`displayDate()`)
	let minutes: string | number;
	if (date.getMinutes() < 10) minutes = "0" + date.getMinutes().toString();
	else minutes = date.getMinutes();
	// console.log(`test`);
	let hours: string | number;
	if (date.getHours() < 10) hours = "0" + date.getHours().toString();
	else hours = date.getHours();
	const day = date.getDay();
	const month = date.toLocaleString("default", { month: "long" });
	const year = date.getFullYear();
	// console.log(`displayDate() avant returns`)
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

let scroll = true;
let oldNbMsg = -1;
let newMsg = false;

onBeforeUpdate(() => {
	if (privs?.value.length)
		index.value = privs!.value.findIndex((priv) => priv.user.login == userName);
	if (
		index.value != -1 &&
		oldNbMsg != privs!.value[index.value].messages.length
	) {
		newMsg = true;
		oldNbMsg = privs!.value[index.value].messages.length;
	} else newMsg = false;
	let oldScrollTop = (msgsCont.value! as HTMLElement).scrollTop;
	let oldScrollHeight = (msgsCont.value! as HTMLElement).scrollHeight;
	let oldClientHeight = (msgsCont.value! as HTMLElement).clientHeight;
	if (oldScrollTop + oldClientHeight == oldScrollHeight) scroll = true;
	else scroll = false;
});

onUpdated(() => {
	// console.log(`PrivConvItem Updated`);

	// if (privs?.value.length) {
	// 	index.value = privs!.value.findIndex(priv => priv.user.login == userName);
	// }

	// index = privs!.value.findIndex(priv => {
	// 	console.log(`priv.user.login = ${priv.user.login}, userName = ${userName}`);
	// 	if (priv.user.login == userName)
	// 		return true;
	// });
	// console.log(`index priv of privConvItem = ${index.value}`);
	// console.log(`onUpdate scrollTop =  ${((msgsCont.value!) as HTMLElement).scrollTop}`);
	// console.log(`onUpdate scrollHeight =  ${((msgsCont.value!) as HTMLElement).scrollHeight}`);
	if (scroll == true) {
		(msgsCont.value! as HTMLElement).scrollTop = (
			msgsCont.value! as HTMLElement
		).scrollHeight;
	}

	// if (index.value != -1 && privs!.value[index.value].messages.at(-1)?.user != me) {
	if (newMsg && privs!.value[index.value].messages.at(-1)?.user != me) {
		mySocket.emit("privReaded", { userSend: userName, userReceive: me });
		markReaded(index.value, true);
	}
});

onMounted(() => {
	(msgsCont.value! as HTMLElement).scrollTop = (
		msgsCont.value! as HTMLElement
	).scrollHeight;
	document.getElementById("sendbox")?.focus();
	const box = document.getElementById("privateTabText");
	if (box != null) box.classList.add("chatTabActive");
});

onBeforeUnmount(() => {
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
