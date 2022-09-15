<template>
	<div v-if="privDone" id="conversation_view" class="stack">
		<div class="userTopBar center raw space-between">
			<div class="avatar_cont center">
				<img :src="receiver!.avatar" class="avatar" alt="avatar" />
			</div>
			<button @click="toProfile" class="login">{{ receiver!.login }}</button>
			<div class="option_buttons center raw stack">
				<button @click="inviteGame" class="button_cont infoButton center">
					<span class="infoButtonText">Invite in room</span>
					<img
						src="~@/assets/ball_logo.svg"
						alt="Invite game button"
						class="logo_img"
					/>
				</button>
				<button @click="blockWarn = true" class="button_cont infoButton center">
					<span class="infoButtonText">Block</span>
					<img
						src="~@/assets/block_logo.svg"
						alt="Invite game button"
						class="logo_img"
					/>
				</button>
				<!-- <button onclick="history.back();" class="button_cont infoButton center"> -->
				<router-link
					:to="{ name: 'private' }"
					class="button_cont infoButton center"
				>
					<span class="infoButtonText">Close</span>
					<img
						src="~@/assets/close_logo.svg"
						alt="Invite game button"
						class="logo_img"
					/>
				</router-link>
			</div>
		</div>
		<div class="conversation_content">
			<div
				v-if="selectPriv()"
				id="messages_cont"
				ref="msgsCont"
				class="messages"
			>
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
				<!-- <MessageItem v-for="(message, i) in msgs" :key="i"
						:userAvatar="receiver!.avatar"
						:userLogin="message.user"
						:message="message.msg"
						:date="message.date"
					/> -->
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
import axios from "axios";
import {
	inject,
	onMounted,
	onUnmounted,
	ref,
	Ref,
	onBeforeUnmount,
	watch,
	onBeforeMount,
	nextTick,
} from "vue";
import { useRoute } from "vue-router";
import { Socket } from "socket.io-client";
import HTTP from "../components/axios";
import MessageItem from "@/chat/MessageItem.vue";
import User from "@/chat/objects/User";
import Message from "@/chat/objects/Message";
import WarningMsg from "@/components/WarningMsg.vue";
import { NewPrivMsgDto } from "@/chat/dto/NewPrivMsgDto";
import BasicUserDto from "./dto/BasicUserDto";
import MessageDto from "./dto/MessageDto";
import { PrivateConvDto } from "./dto/PrivateConvDto";
import { PrivConv } from "@/chat/objects/PrivConv";
import BasicUser from "./objects/BasicUser";
import { ConstantTypes } from "@vue/compiler-core";

let define = inject("colors");
let apiPath: string = inject("apiPath")!;
let mySocket: Socket = inject("socket")!;
let me: string = inject("me")!;
let privs: Ref<PrivConv[]> = inject("privs")!;
const userName = useRoute().params.conv_name as string;
let receiver: BasicUser = new BasicUser(userName);
const privDone: Ref<boolean> = inject("privDone")!;
// console.log(`privDone = ${privDone.value}, privsRef : `);
// privs.value.forEach(priv => {
// 	console.log(`user = ${priv.user.login}`);
// 	priv.messages.forEach((msg) => console.log(`${msg.msg}`));
// });

// watch(privDone, () => {
// 	console.log(`privDone = ${privDone.value}`);
// })

let myMsg = ref("");
let blockWarn = ref(false);
let requestDone = ref(false);
let msgsCont = ref(null);

function selectPriv() {
	// console.log(`selectPriv()`);
	return privs.value!.find((priv) => priv.user.login == userName);
}

// mySocket.on('newPrivMsg', (data: {msg: Message, id: number}) => {
// 	console.log(`New message received : ${data.msg.msg}`)
// })

// mySocket.on("newPrivMsg", (data: NewPrivMsgDto) => {
// 	// console.log(`msgs.value = ${msgs.value}`);
// 	let tmp = msgs.value!;
// 	tmp.push(new MessageDto(data.userSend, data.message, new Date(data.date)))
// 	msgs.value = tmp;
// 	nextTick(() => {
// 		((msgsCont.value!) as HTMLElement).scrollTop =
// 			((msgsCont.value!) as HTMLElement).scrollHeight;
// 		console.log(`scrolled socket on`);
// 	}).catch(e => console.log(e));
// 	console.log(`userSend = ${data.userSend}, me = ${me}`)
// 	if (data.userSend != me)
// 		mySocket.emit("privReaded", {userSend: userName, userReceive: me});
// });

// (async () => {
// 	// receiver = (await HTTP.get(apiPath + "user/getBasicUser/:login" + userName)).data;
// 	let privConvDto : PrivateConvDto = (await HTTP.get(apiPath
// 		+ "chat/getPriv/" + me + "/" + userName))
// 		.data;
// 	// console.log(`privConvDto = ${privConvDto}`);
// 	receiver.value = new BasicUserDto(privConvDto.user);
// 	// console.log(`receiver = ${receiver.value.login}`);
// 	let msgsTmp : MessageDto[] = [];
// 	privConvDto.msgs.forEach(msg => {
// 		msgsTmp.push(new MessageDto(msg.user, msg.msg, new Date(msg.date)))
// 	});
// 	msgs.value = msgsTmp;
// 	// msgs.value.forEach(msg => {
// 	// 	console.log(msg);
// 	// });
// 	// nbMsgs = msgs.value.length;
// 	requestDone.value = true;
// })();

// HTTP.get(apiPath + "chat/getPriv/" + me + "/" + userName)
// 	.then(res => {
// 		// console.log(`privConvDto = ${res.data}`);
// 		receiver.value = new BasicUserDto(res.data.user);
// 		let msgsTmp : MessageDto[] = [];
// 		res.data.msgs.forEach((msg : MessageDto) => {
// 			msgsTmp.push(new MessageDto(msg.user, msg.msg, new Date(msg.date)))
// 		});
// 		msgs.value = msgsTmp;
// 		requestDone.value = true;
// 	})
// 	.catch(e => console.log(e));

// axios.get(apiPath + "chat/message")
// 	.then(res => {console.log("backMsg = ", res.data)})
// 	.catch(e => {console.log(e)});
// let backMsg = await axios.get(apiPath + "chat/message");
// console.log("backMsg = ", (await backMsg).data);

// let user1 = new User("Totolosa", require("@/assets/avatars/(1).jpg"));
// let user2 = new User("Ocean", require("@/assets/avatars/(2).jpg"));
// let user3 = new User("Patrick la trick", require("@/assets/avatars/(3).jpg"));

// let msg1 = new Message(user1, "Salut frere ce fait graaaaave longtemps ca fais plaisr! Tu deviens quoi l'ami?", new Date('July 17, 2022 03:24:00'));
// let msg2 = new Message(user2, "Salut poto", new Date('July 22, 2022 03:25:12'));
// let msg3 = new Message(user1, "Game?", new Date('July 18, 2022 12:45:45'));
// let msg4 = new Message(user3, "Non je dois finir de faire le front, et wallah c'est chaud", new Date('July 18, 2022 12:47:55'));
// let msg5 = new Message(user1, "dsaibciauwncopneejvnjn fcoamsdomvcafosnvonsvonoans", new Date());
// let msg6 = new Message(user2, "Mais tu sais pas parler en fait", new Date());

// let conv = ref(new Private(user2, [msg1, msg2, msg3, msg5, msg6]));

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
	console.log(`test`);
	let hours: string | number;
	if (date.getHours() < 10) hours = "0" + date.getHours().toString();
	else hours = date.getHours();
	const day = date.getDay();
	const month = date.toLocaleString("default", { month: "long" });
	// const monthNames = ["January", "February", "March", "April", "May", "June",
	// 	"July", "August", "September", "October", "November", "December"];
	const year = date.getFullYear();
	console.log(`displayDate() avant returns`);
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

function banUser() {
	// DEMMANDER DE BAN LE USER AU BACK <==================================
}

function sendMsg() {
	// e.preventDefault();
	// ENVOI MSG AU BACK <=================================================

	// // POST REQUEST
	// axios.post(apiPath + "chat/message", myMsg)
	// 		.then(res => {
	// 			console.log("Send msg to back OK");
	// 			let newMsg = new Message(me, myMsg.value, new Date());
	// 			conv.value.messages.push(newMsg);
	// myMsg.value = "";
	// 		}).catch(e => {console.log(e)});

	// // SOCKET
	// mySocket.emit('message', myMsg.value);
	mySocket.emit("newPrivMsg", new NewPrivMsgDto(me, userName, myMsg.value));
	// mySocket.emit('getMsgs');
	myMsg.value = "";
}

watch(
	selectPriv()!.messages!,
	(msg) => {
		(msgsCont.value! as HTMLElement).scrollTop = (
			msgsCont.value! as HTMLElement
		).scrollHeight;
		// nextTick(() => {
		// 	let msgsCont = document.getElementById("messages_cont");
		// 	msgsCont!.scrollTop = msgsCont!.scrollHeight;
		// });
		console.log("scrolled watch");
	},
	{ flush: "post" }
);

onMounted(() => {
	(msgsCont.value! as HTMLElement).scrollTop = (
		msgsCont.value! as HTMLElement
	).scrollHeight;
	console.log("scrolled onMounted");
});

onBeforeUnmount(() => {
	const box = document.getElementById("privateTabText");
	if (box != null) {
		box.style.removeProperty("border-bottom");
		box.style.removeProperty("color");
		box.style.removeProperty("font-weight");
	}
});

onUnmounted(() => {
	// console.log("debut mounted");
	// mySocket.off("newPrivMsg");
	const box = document.getElementById("privateTabText");
	if (box != null) {
		box.style.setProperty("border-bottom", "2px solid #16638D");
		box.style.setProperty("color", "#16638D");
		box.style.setProperty("font-weight", "500");
	}
	// console.log("fin mounted");
});
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
	filter: invert(29%) sepia(16%) saturate(6497%) hue-rotate(176deg)
		brightness(86%) contrast(83%);
}

.infoButtonText {
	opacity: 0;
	font-size: 0.8rem;
	width: 120px;
	background-color: rgba(0, 0, 0, 0.6);
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

/* .conversation_content {
	height: calc(100% - 70px);
	width: 100%;
	padding-top: 20px;
} */
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
