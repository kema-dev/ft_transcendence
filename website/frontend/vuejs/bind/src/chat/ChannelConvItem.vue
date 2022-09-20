<template>
	<div id="channel_view" class="stack">
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
			<div id="messages_cont" ref="msgsCont" class="messages">
				
				<div v-if="chanDone && selectChan()">
					<div v-for="(message, i) in selectChan()!.messages" :key="i" class="center column">
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
		<div v-else class="infoCont left column">
			<div class="infoElemCont left column" id="passwordInfo">
				<div class="infoElemHead left_center raw">
					<div class="infoElemImgCont center">
						<img src="~@/assets/key_logo.svg" alt="Password" class="infoImg" />
					</div>
					<span class="infoText">Password :</span>
					<img
						v-if="password == ''"
						src="~@/assets/redcross.svg"
						alt="No Password"
						class="infoImg"
					/>
					<span v-else>{{ password }}</span>
					<div class="settingsOptions left_center raw stack">
						<button
							@click="showSettings = !showSettings"
							class="settingsBtn center"
						>
							<img
								src="~@/assets/settings_logo.svg"
								alt="Password"
								class="infoImg"
							/>
						</button>
						<div
							v-if="showSettings"
							class="extendSettingsCont right_center raw"
						>
							<button class="extendBtn center">
								<img
									src="~@/assets/add2_logo.svg"
									alt="Add password"
									class="infoImg"
								/>
							</button>
							<button class="extendBtn center">
								<img
									src="~@/assets/edit_logo.svg"
									alt="Edit password"
									class="infoImg"
								/>
							</button>
							<button class="extendBtn center">
								<img
									src="~@/assets/delete_logo.svg"
									alt="Delete password"
									class="infoImg"
								/>
							</button>
						</div>
					</div>
				</div>
				<div class="infoElemBody left">
					<input type="text" class="passwordInput" />
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
/* eslint-disable @typescript-eslint/no-unused-vars */
import { inject, onMounted, ref, Ref, onBeforeUnmount, watch, onBeforeUpdate, onUpdated } from "vue";
import { useRoute } from "vue-router";
import { Socket } from "socket.io-client";
import MessageItem from "@/chat/MessageItem.vue";
import BlockAdvert from "@/components/BlockItem.vue";
import { MessageDto } from "@/chat/dto/MessageDto";
import { NewChanMsgDto } from "@/chat/dto/NewChanMsgDto";
import { ChannelDto } from "./dto/ChannelDto";
import { ProfileUserDto } from "@/dto/ProfileUserDto"

const route = useRoute();
let chanName = route.params.conv_name as string;
let colors = inject("colors");
let mySocket: Socket = inject("socket")!;
let me: Ref<ProfileUserDto> = inject("user")!;
let myMsg = ref("");
let info = ref(false);
let password = ref("");
let showSettings = ref(false);
let msgsCont = ref(null);

let chansRef : Ref<ChannelDto[]> = inject("chans")!;
const chanDone: Ref<boolean> = inject("chanDone")!;
let index = ref(-1);
if (chansRef?.value.length) {
	index.value = chansRef!.value.findIndex((chan) => chan.name == chanName);
	if (
		index.value != -1 &&
		chansRef.value[index.value].messages.at(-1)?.user != me.value.login
	) {
		// mySocket.emit("chanReaded", { userSend: userName, userReceive: me });
		// markReaded(index.value, true);
	}
}


// ================= METHODS =

function selectChan() {
	let chan = chansRef?.value.find((chan) => chan.name == chanName);
	if (chan)
		index.value = chansRef!.value.findIndex((chan) => chan.name == chanName);
	return chan;
}

function sendMsg() {
	mySocket.emit("newChanMsg", new NewChanMsgDto(me.value.login, chanName, myMsg.value));
	myMsg.value = "";
}

function findAvatar(login: string) {
	let isAdmin = chansRef.value[index.value].admins.find(admin => admin.login == login);
	if (isAdmin)
		return isAdmin.avatar;
	let isUser = chansRef.value[index.value].users.find(user => user.login == login);
	if (isUser)
		return isUser.avatar;
}

function checkDate(i: number) {
	// console.log(`checkDate(), i = ${i}`)
	if (i == 0) return true;
	else if (
		Math.ceil(
			(selectChan()!.messages[i].date.getTime() -
				selectChan()!.messages[i - 1].date.getTime()) /
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
	if (chansRef?.value.length)
		index.value = chansRef!.value.findIndex((chan) => chan.name == chanName);
	if (
		index.value != -1 &&
		oldNbMsg != chansRef!.value[index.value].messages.length
	) {
		newMsg = true;
		oldNbMsg = chansRef!.value[index.value].messages.length;
	} else newMsg = false;
	let oldScrollTop = (msgsCont.value! as HTMLElement).scrollTop;
	let oldScrollHeight = (msgsCont.value! as HTMLElement).scrollHeight;
	let oldClientHeight = (msgsCont.value! as HTMLElement).clientHeight;
	if (oldScrollTop + oldClientHeight == oldScrollHeight) scroll = true;
	else scroll = false;
});

onUpdated(() => {
	if (scroll == true) {
		(msgsCont.value! as HTMLElement).scrollTop = (
			msgsCont.value! as HTMLElement
		).scrollHeight;
	}
	if (newMsg && chansRef!.value[index.value].messages.at(-1)?.user != me.value.login) {
		// mySocket.emit("chanReaded", { userSend: userName, userReceive: me });
		// markReaded(index.value, true);
	}
});

onMounted(() => {
	(msgsCont.value! as HTMLElement).scrollTop = (
			msgsCont.value! as HTMLElement
		).scrollHeight;
	document.getElementById("sendbox")?.focus();
	const box = document.getElementById("channelsTabText");
	if (box != null) box.classList.add("chatTabActive");
});

onBeforeUnmount(() => {
	const box = document.getElementById("channelsTabText");
	if (box != null) box.classList.remove("chatTabActive");
});

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
