<template>
	<div class="infoCont left column">
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
let myName: string = inject("me")!;
let me: Ref<ProfileUserDto> = inject("user")!;
let myMsg = ref("");
let info = ref(false);
let password = ref("");
let showSettings = ref(false);
let msgsCont = ref(null);

let chansRef : Ref<ChannelDto[]> = inject("chans")!;
const chanDone: Ref<boolean> = inject("chanDone")!;


// FIND INDEX CHANNELREF 
let index = ref(-1);
if (chansRef?.value.length) {
	index.value = chansRef!.value.findIndex((chan) => chan.name == chanName);
}

watch(chanDone, () => {
	index.value = chansRef!.value.findIndex((chan) => chan.name == chanName);
})

// ================= METHODS 


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
	printChan(chansRef.value[index.value]);
	console.log(`index.value = ${index.value}`)
	let isAdmin = chansRef.value[index.value].admins.find(admin => admin.login == login);
	console.log(`isAdmin = ${isAdmin}`)

	if (isAdmin)
		return isAdmin.avatar;
	let isUser = chansRef.value[index.value].users.find(user => user.login == login);
	console.log(`isUser = ${isUser}`)
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

let scroll = false;
let oldNbMsg = -1;
let newMsg = false;

onBeforeUpdate(() => {
	if (chansRef?.value.length)
		index.value = chansRef!.value.findIndex((chan) => chan.name == chanName);

});

// onUpdated(() => {

// });

onMounted(() => {
	// (msgsCont.value! as HTMLElement).scrollTop = (
	// 		msgsCont.value! as HTMLElement
	// 	).scrollHeight;
	// document.getElementById("sendbox")?.focus();
	// const box = document.getElementById("channelsTabText");
	// if (box != null) box.classList.add("chatTabActive");
});

onBeforeUnmount(() => {
	// const box = document.getElementById("channelsTabText");
	// if (box != null) box.classList.remove("chatTabActive");
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
</style>
