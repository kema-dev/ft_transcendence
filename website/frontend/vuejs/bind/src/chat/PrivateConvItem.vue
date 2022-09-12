<template>
	<div id="conversation_view" class="stack">
		<div class="userTopBar center raw space-between">
			<div class="avatar_cont center">
				<img :src="receiver!.avatar" class="avatar" alt="avatar">
			</div>
			<button @click="toProfile" class="login">{{receiver!.login}}</button>
			<div class="option_buttons center raw stack">
				<button @click="inviteGame" class="button_cont infoButton center">
					<span class="infoButtonText">Invite in room</span>
					<img src="~@/assets/ball_logo.svg" alt="Invite game button" class="logo_img">
				</button>
				<button @click="blockWarn = true" class="button_cont infoButton center">
					<span class="infoButtonText">Block</span>
					<img src="~@/assets/block_logo.svg" alt="Invite game button" class="logo_img">
				</button>
				<!-- <button onclick="history.back();" class="button_cont infoButton center"> -->
				<router-link :to="{name: 'private'}" class="button_cont infoButton center">
					<span class="infoButtonText">Close</span>
					<img src="~@/assets/close_logo.svg" alt="Invite game button" class="logo_img">
				</router-link>
			</div>
		</div>
		<div class="conversation_content ">
			<div id="messages_cont" ref="msgsCont" class="messages ">
				<div v-if="privDone && selectPriv()">
					<div v-for="(message, i) in selectPriv()!.messages" :key="i" class="center column">
						<div v-if="checkDate(i)" class="date">
							{{displayDate(message.date, i)}}
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
				<input v-model="myMsg" @keydown.enter="sendMsg()" type="text" placeholder="Aa..." id="sendbox" class="sendbox"/>
			</div>
		</div>
		<WarningMsg v-if="blockWarn" msg="Are you sure to block this User? You will not receive message from him/her anymore"
			:img="require('@/assets/warning_logo.png')">
			<template #buttons>
				<div class="blockAdvertButtons center raw">
					<button @click="banUser()" >Yes</button>
					<button @click="blockWarn = false">No</button>
				</div>
			</template>
		</WarningMsg>
	</div>
</template>

<script setup lang="ts">
/* eslint @typescript-eslint/no-var-requires: "off" */
import axios from "axios";
import { inject, onMounted, onUnmounted, ref, Ref, onBeforeUnmount, watch, onBeforeMount, nextTick, onUpdated, onBeforeUpdate } from "vue";
import { useRoute } from 'vue-router';
import { Socket } from "socket.io-client";
import HTTP from "../components/axios";
import MessageItem from "@/chat/MessageItem.vue";
import User from "@/chat/objects/User";
import Message from "@/chat/objects/Message";
import WarningMsg from "@/components/WarningMsg.vue";
import { NewPrivMsgDto } from "@/chat/dto/NewPrivMsgDto";
import BasicUserDto from "./dto/BasicUserDto";
import MessageDto from "./dto/MessageDto"
import {PrivateConvDto} from "./dto/PrivateConvDto"
import { PrivConv } from "@/chat/objects/PrivConv";
import BasicUser from "./objects/BasicUser";
import { ConstantTypes } from "@vue/compiler-core";


console.log('debut');

let define = inject("colors");
let apiPath: string = inject("apiPath")!;
let mySocket: Socket = inject("socket")!;
let me: string = inject("me")!;
const userName = useRoute().params.conv_name as string ;
let receiver : BasicUser = new BasicUser(userName);
let privs : Ref<PrivConv[]> | undefined = inject("privs");
// printPrivs(privs.value);
// let privRef : Ref<PrivConv> | undefined;
// if (privs) {
// }

// let priv = privs.value.find(priv => priv.user.login == userName);
// let privRef = ref(priv);
// let privRef = ref(privs.value.find(priv => priv.user.login == userName));
// let privRef = privs.value.find(priv => priv.user.login == userName);

// printPriv(privRef.value);
const privDone: Ref<boolean> = inject("privDone")!;
	
	// console.log("Priv debut PrivConvItem :")
	// printPriv(priv);

let myMsg = ref("");
let blockWarn = ref(false);
let msgsCont = ref(null);
// let msgsLoaded = ref(null);

// watch(privDone, () => {
// 	console.log(`privDone = ${privDone.value}`);
// 	// ((msgsCont.value!) as HTMLElement).scrollTop = 
// 	// ((msgsCont.value!) as HTMLElement).scrollHeight;
// 	// privRef.value = privs.value.find(priv => priv.user.login == userName)!;
// 	// privRef = privs.value.find(priv => priv.user.login == userName)!;
// })

// watch(msgsLoaded, () => {
// 	console.log(`Mesages in privConvItem loaded`);
// 	((msgsCont.value!) as HTMLElement).scrollTop = 
// 		((msgsCont.value!) as HTMLElement).scrollHeight;
// 	// if (privRef.value!.messages[privRef.value!.messages.length - 1].user != me) {
// 	// 	mySocket.emit('privReaded', {userSend: userName, userReceive: me});
// 	// 	privRef.value!.readed = true;
// 	// }
// })

// watch(privs, () => {
// 	console.log(`watch privs change`);
// 	printPrivs(privs.value);
// 	console.log(`apres watch privs`)
// 	// privRef.value = privs.value.find(priv => priv.user.login == userName)!;
// })


// watch(privRef, () => {
// 	console.log(`watch privRef change`);
// 	((msgsCont.value!) as HTMLElement).scrollTop = 
// 	((msgsCont.value!) as HTMLElement).scrollHeight;
// 	// nextTick(() => {
// 		// 	let msgsCont = document.getElementById("messages_cont");
// 		// 	msgsCont!.scrollTop = msgsCont!.scrollHeight;
// 		// });
// 	console.log("scrolled watch");
// }, {flush:'post'});

// watch((privs.value.find(priv => priv.user.login == userName)), () => {
// 	((msgsCont.value!) as HTMLElement).scrollTop = 
// 	((msgsCont.value!) as HTMLElement).scrollHeight;
// })


let scroll = true;

onBeforeUpdate(() => {
	let oldScrollTop = ((msgsCont.value!) as HTMLElement).scrollTop;
	let oldScrollHeight = ((msgsCont.value!) as HTMLElement).scrollHeight;
	let oldClientHeight = ((msgsCont.value!) as HTMLElement).clientHeight;
	// let oldOffsetHeight = ((msgsCont.value!) as HTMLElement).offsetHeight;

	console.log(`onBeforeUpdate oldScrollTop =  ${oldScrollTop}`)
	console.log(`onBeforeUpdate oldScrollHeight =  ${oldScrollHeight}`)
	console.log(`onBeforeUpdate oldClientHeight =  ${oldClientHeight}`)
	// console.log(`onBeforeUpdate oldOffsetHeight =  ${oldOffsetHeight}`)

	if (oldScrollTop + oldClientHeight == oldScrollHeight)
		scroll = true;
	else
		scroll = false;
})

onUpdated( () => {
	console.log(`PrivConvItem Updated`);
	// console.log(`onUpdate scrollTop =  ${((msgsCont.value!) as HTMLElement).scrollTop}`);
	console.log(`onUpdate scrollHeight =  ${((msgsCont.value!) as HTMLElement).scrollHeight}`);
	if (scroll == true) {
		((msgsCont.value!) as HTMLElement).scrollTop = 
			((msgsCont.value!) as HTMLElement).scrollHeight;
	}
	// ((msgsCont.value!) as HTMLElement).scrollTop = 
	// 	((msgsCont.value!) as HTMLElement).scrollHeight;
	if (selectPriv()!.messages[selectPriv()!.messages.length - 1].user != me) {
		mySocket.emit('privReaded', {userSend: userName, userReceive: me});
		selectPriv()!.readed = true;
	}
})

function selectPriv() {
	// console.log(`selectPriv()`);
	let priv = privs.value?.find(priv => priv.user.login == userName);
	// console.log(`selectPriv = ${priv}`);
	return priv;
}

function checkDate(i: number) {
	// console.log(`checkDate(), i = ${i}`)
	if (i == 0)
		return true;
	else if (Math.ceil((selectPriv()!.messages[i].date.getTime() 
		- selectPriv()!.messages[i-1].date.getTime()) / (1000 * 60)) > 15) {
			// console.log(`checkDate = true`);
			return true;
		}
	else {
		// console.log(`checkDate = false`);
		return false;
	}
}

function displayDate(date: Date, i: number) {
	// console.log(`displayDate()`)
	let minutes : string | number;
	if (date.getMinutes() < 10)
		minutes = "0" + date.getMinutes().toString();
	else
		minutes = date.getMinutes();
	// console.log(`test`);
	let hours : string | number;
	if (date.getHours() < 10)
		hours = "0" + date.getHours().toString();
	else
		hours = date.getHours();
	const day = date.getDay();
	const month = date.toLocaleString('default', { month: 'long' })
	const year = date.getFullYear();
	// console.log(`displayDate() avant returns`)
	if (i == 0)
		return `Created the ${day} ${month} ${year} at ${hours}:${minutes}`;
	const now = new Date();
	const timeDif = date.getTime() - new Date().getTime();
	const minutesDif = Math.ceil(timeDif / (1000 * 60));
	const hoursDif = Math.ceil(minutesDif / 60);
	const daysDif = Math.ceil(hoursDif / 24);
	if (date.toDateString() == now.toDateString()) 
		return `${hours}:${minutes}`
	if (daysDif < 7)
		return `${date.toLocaleDateString('en-GB', { weekday: 'long' })} ${hours}:${minutes}`;  
	else
		return `${day} ${month} ${year} at ${hours}:${minutes}`;
}

function banUser() {
	// DEMMANDER DE BAN LE USER AU BACK <==================================
}

function sendMsg() {
	// console.log(`message send`);
	mySocket.emit('newPrivMsg', new NewPrivMsgDto(me, userName, myMsg.value));
	myMsg.value = "";

}

onMounted(() => {
	// console.log(`debut onMounted PrivConvIten`);
	// console.log(`msgsCont.value = ${msgsCont.value}`);
	// console.log(`msgsCont.scrollHeight = ${((msgsCont.value!) as HTMLElement).scrollHeight}, `);
	((msgsCont.value!) as HTMLElement).scrollTop = 
	((msgsCont.value!) as HTMLElement).scrollHeight;
	// console.log("scrolled onMounted");
})

onBeforeUnmount(() => {
	const box = document.getElementById('privateTabText');
	if (box != null) {
		box.style.removeProperty('border-bottom');
		box.style.removeProperty('color');
		box.style.removeProperty('font-weight');
	}
})

onUnmounted(() => {
	// console.log("debut mounted");
	// mySocket.off("newPrivMsg");
	const box = document.getElementById('privateTabText');
	if (box != null) {
		box.style.setProperty('border-bottom', '2px solid #16638D');
		box.style.setProperty('color', '#16638D');
		box.style.setProperty('font-weight', '500');
	}
	// console.log("fin mounted");
});

function printPriv(priv: PrivConv | undefined) {
	if (!priv)
		return console.log(`priv undefined`);
	priv.messages.forEach((msg) => console.log(`${msg.msg}`));
}

function printPrivs(privs: PrivConv[] | undefined) {
	if (!privs)
		return console.log(`privs undefined`);
	privs.forEach((priv : PrivConv) => {
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