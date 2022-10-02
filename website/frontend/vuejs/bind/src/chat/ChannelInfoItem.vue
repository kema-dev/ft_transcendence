<template>
	<div v-if="display" class="infoCont left column">
		<div class="ElemCont left_center column">
			<div class="ElemHeadCont left_center raw">
				<div class="titleImgCont center">
					<img src="~@/assets/key_logo.svg" alt="Password" class="infoImg" />
				</div>
				<span class="titleText">
					Password :
				</span>
				<span v-if="!pswBool" class="titleValueText">
					{{chansRef[i].psw ? "Yes" : "No"}}
				</span>
				<span v-else class="titleValueText center">
					<input
						@click="changePswCB"
						type="checkbox" 
						name="pswCheckBox" 
						id="pswCheckBox"
						:checked="chansRef[i].psw ? true : false"
					>
				</span>
				<button v-if="pswBool"
					@click="modifPswReq"
					class="settingsBtnCont center"
				>
					<img
						src="~@/assets/done.svg"
						alt="Valid password"
						class="infoImg"
					/>
				</button>
				<button v-if="iAmAdmin"
					@click="showPsw"
					class="settingsBtnCont center"
				>
					<img v-if="!pswBool"
						src="~@/assets/edit_logo.svg"
						alt="Edit password"
						class="infoImg"
					/>
					<img v-else
						src="~@/assets/undo_logo.svg"
						alt="Undo button"
						class="infoImg"
					/>
				</button>
			</div>
			<form v-if="pswBool"
				@submit.prevent="modifPswReq" 
				class="settingsCont left"
			>
				<input v-model="pswValue"
					type="text"
					name="pswInput" 
					id="pswInput" 
					class="inputForm"
					:disabled="!pswCheck"
				/>
			</form>
		</div>
		<div class="ElemCont left_center column">
			<div class="ElemHeadCont left_center raw">
				<div class="titleImgCont center">
					<img src="~@/assets/crown.svg" alt="Password" class="infoImg" />
				</div>
				<span class="titleText">
					Admins :
				</span>
				<span v-if="!chansRef[i].admins.length" class="titleValueText">
					No admins
				</span>
			</div>
			<div v-for="(data, i) in chansRef[props.i].admins" :key="i" class="left_center">
				<BasicProfil :avatar="data.avatar" 
					:login="data.login" class="basicUser"/>
				<setUserChan v-if="iAmAdmin && data.login != myName" 
					:login="data.login" :chan="chanName" :promot="true"/>
			</div>
		</div>
		<div class="ElemCont left_center column">
			<div class="ElemHeadCont left_center raw">
				<div class="titleImgCont center">
					<img src="~@/assets/group2_logo.svg" alt="Password" class="infoImg" />
				</div>
				<span class="titleText">
					Users :
				</span>
				<span v-if="!chansRef[i].users.length" class="titleValueText">
					No users
				</span>
				<!-- <button v-if="pswBool"
					@click="modifPswReq"
					class="settingsBtnCont center"
				>
					<img
						src="~@/assets/done.svg"
						alt="Valid password"
						class="infoImg"
					/>
				</button>
				<button v-if="iAmAdmin"
					@click="showPsw"
					class="settingsBtnCont center"
				>
					<img v-if="!pswBool"
						src="~@/assets/edit_logo.svg"
						alt="Edit password"
						class="infoImg"
					/>
					<img v-else
						src="~@/assets/undo_logo.svg"
						alt="Undo button"
						class="infoImg"
					/>
				</button> -->
			</div>
			<div v-for="(data, i) in chansRef[props.i].users" :key="i" class="left_center">
				<BasicProfil :avatar="data.avatar" :login="data.login" class="basicUser"/>
				<setUserChan v-if="iAmAdmin && data.login != myName" 
					:login="data.login" :chan="chanName" :promot="false"/>
			</div>
		</div>
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
import BasicProfil from "@/components/BasicProfilItem.vue";
import setUserChan from "@/chat/setUserChanItem.vue";
import { ChannelDto } from "./dto/ChannelDto";
import { ProfileUserDto } from "@/dto/ProfileUserDto"
import { ModifChanDto } from "@/chat/dto/ModifChanDto"
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
let chansRef : Ref<ChannelDto[]> = inject("chans")!;
let iAmAdmin = ref(isAdmin());
let display = ref(true);

// PASSWORD
let pswValue = ref("");
let pswBool = ref(false);
let pswCheck = ref(false);



// ================= METHODS 

function isAdmin() {
	return chansRef.value[props.i].admins
		.map(adm => adm.login)
		.includes(myName);
}

function quitChannel() {
	mySocket.emit("userQuitChan", {login: myName, chan: chanName});
	display.value = false;
	chansRef.value.splice(props.i, 1);
	router.push({name: 'channels'});
}

function changePswCB() {
	pswValue.value = "";
	pswCheck.value = !pswCheck.value;
	// chansRef.value[props.i].psw ? 
	// 	pswCheck.value = true : pswCheck.value = false;
	nextTick(() => {
		document.getElementById("pswInput")?.focus();
	})
}

function showPsw() {
	pswBool.value = !pswBool.value;
	pswValue.value = "";
	if (pswBool.value) {
		pswCheck.value = chansRef.value[props.i].psw ? true : false;
		nextTick(() => {
			document.getElementById("pswInput")?.focus();
		})
	}
}

function modifPswReq() {
	let input = document.getElementById("pswInput");
	input?.classList.remove("invalidInput");
	if (pswCheck.value && pswValue.value == "")
		return setTimeout(() => {
			input!.classList.add("invalidInput");
		}, 50);
	if (chansRef.value[props.i].psw) {
		if (!pswCheck.value)
			mySocket.emit("modifChan",
				new ModifChanDto(chanName, "psw", ""));
		else if (pswValue.value != "")
			mySocket.emit("modifChan", 
				new ModifChanDto(chanName, "psw", pswValue.value));
	} else if (pswCheck.value)
		mySocket.emit("modifChan", 
			new ModifChanDto(chanName, "psw", pswValue.value));
	pswBool.value = false;
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


// ====================== SOCKET LISTENNERS ======================

// mySocket.on("")

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

/* GENERAL */
.infoCont {
	padding: 10px 20px;
}
.ElemCont {
	width: 220px;
	margin-bottom: 10px;
}
.ElemHeadCont {

}
.titleText {
	font-family: 'Orbitron', sans-serif;
	width: auto;
	white-space: nowrap;
	font-weight: 500;
	margin-left: 5px;
}
.titleValueText {
	font-family: 'Orbitron', sans-serif;
	margin-left: 10px;
	/* width: auto;
	white-space: nowrap; */
}
.titleImgCont,
.setUserCont,
.settingsBtnCont {
	height: 26px;
	width: 26px;
	border-radius: 13px;
}
.settingsBtnCont {
	margin-left: auto;
}
.setUserCont:hover,
.settingsBtnCont:hover {
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

/* SPECIFIC */
.inputForm {
	font-family: 'Orbitron', sans-serif;
	font-size: 0.8rem;
	width: 220px;
	height: 1.4rem;
	border-radius: calc(1.4rem / 2);
	outline: none;
	padding: 0 8px;
	/* flex-basis: 100%; */
}
.basicUser {
	margin: 5px 10px;
}
.leaveButton {
	height: 1.5rem;
	border-radius: calc(1.5rem / 2);
	font-weight: 500;
	background-color: v-bind("colors.color2");
	color: white;
	padding: 0 10px;
	margin: auto;
	margin-top: 20px;
	box-shadow: 0px 0px 4px #aaa;
}
</style>
