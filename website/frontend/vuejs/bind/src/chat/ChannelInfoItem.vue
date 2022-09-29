<template>
	<div v-if="display" class="infoCont left column">
		<div class="infoElemCont left column" id="passwordInfo">
			<div class="infoElemHead left_center raw">
				<div class="infoElemImgCont center">
					<img src="~@/assets/key_logo.svg" alt="Password" class="infoImg" />
				</div>
				<span class="infoText">
					Password : {{chansRef[i].psw ? "Yes" : "No"}}
				</span>
				<!-- <img
					v-if="!chansRef[props.i].psw"
					src="~@/assets/redcross.svg"
					alt="No Password"
					class="infoImg"
				/> -->
				<button
					@click="modifPsw = !modifPsw"
					class="settingsBtn center"
				>
					<!-- <img
						src="~@/assets/settings_logo.svg"
						alt="Password"
						class="infoImg"
					/> -->
					<img
						src="~@/assets/edit_logo.svg"
						alt="Edit password"
						class="infoImg"
					/>
				</button>

				<!-- <div class="settingsOptions left_center raw stack">
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
			</div> -->
			
			<!-- <div class="infoElemBody left">
				<input type="text" class="passwordInput" />
			</div> -->
			</div>
			<form v-if="modifPsw" class="settingsCont left">
				<input type="text" name="newPsw" id="newPsw" class="inputForm" />
			</form>
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
		<button @click="quitChannel" class="leaveButton">
			Quit Channel
		</button>
	</div>
</template>

<script setup lang="ts">
/* eslint @typescript-eslint/no-var-requires: "off" */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { defineProps, inject, onMounted, ref, Ref, onBeforeUnmount, watch, onBeforeUpdate, onUpdated, nextTick } from "vue";
import { useRoute } from "vue-router";
import { Socket } from "socket.io-client";
import MessageItem from "@/chat/MessageItem.vue";
import BlockAdvert from "@/components/BlockItem.vue";
import { MessageDto } from "@/chat/dto/MessageDto";
import { NewChanMsgDto } from "@/chat/dto/NewChanMsgDto";
import { ChannelDto } from "./dto/ChannelDto";
import { ProfileUserDto } from "@/dto/ProfileUserDto"
import router from "@/router";

const props = defineProps({
	i: {
		type: Number,
		required: true,
	} 
});

let colors = inject("colors");
let mySocket: Socket = inject("socket")!;
const route = useRoute();
let chanName = route.params.conv_name as string;
let myName: string = inject("me")!;
let me: Ref<ProfileUserDto> = inject("user")!;
let modifPsw = ref(false);
let display = ref(true);
let chansRef : Ref<ChannelDto[]> = inject("chans")!;



// ================= METHODS 

function quitChannel() {
	mySocket.emit("userQuitChan", {login: myName, chan: chanName});
	display.value = false;
	chansRef.value.splice(props.i, 1);
	router.push({name: 'channels'});
}


function findAvatar(login: string) {
	printChan(chansRef.value[props.i]);
	console.log(`index.value = ${props.i}`)
	let isAdmin = chansRef.value[props.i].admins.find(admin => admin.login == login);
	console.log(`isAdmin = ${isAdmin}`)

	if (isAdmin)
		return isAdmin.avatar;
	let isUser = chansRef.value[props.i].users.find(user => user.login == login);
	console.log(`isUser = ${isUser}`)
	if (isUser)
		return isUser.avatar;
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
	padding: 10px 20px;
}

.infoElemCont {
	width: auto;
	margin-bottom: 10px;
}
.infoText {
	font-family: 'Orbitron', sans-serif;
	width: auto;
	white-space: nowrap;
}
.settingsBtn {
	margin-left: 20px;
	height: 26px;
	width: 26px;
	border-radius: 13px;
}
.settingsBtn:hover {
	/* border: solid 1px v-bind("colors.color2"); */
	background-color: #fff;
	box-shadow: 0px 0px 4px #aaa;
}
.infoImg {
	height: 20px;
	width: 20px;
	filter: invert(29%) sepia(16%) saturate(6497%) hue-rotate(176deg)
		brightness(86%) contrast(83%);
}
.inputForm {
	width: auto;
}
.leaveButton {
	height: 1.5rem;
	font-weight: 500;
	border-radius: calc(1.5rem / 2);
	background-color: v-bind("colors.color2");
	color: white;
	padding: 0 10px;
	box-shadow: 0px 0px 4px #aaa;
}
</style>
