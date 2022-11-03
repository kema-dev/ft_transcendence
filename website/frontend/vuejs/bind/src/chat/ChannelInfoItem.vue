<template>
	<div v-if="display" class="infoCont center column">
		<div class="topButsCont center raw">
			<button @click="showNewUser" class="invitButton">
				Invit User
			</button>
			<button @click="quitChannel" class="leaveButton">
				Quit Channel
			</button>
		</div>
		<div class="ElemCont left_center column">
			<div class="ElemHeadCont left_center raw">
				<div class="titleImgCont center">
					<img src="~@/assets/key_logo.svg" alt="Password" class="infoImg" />
				</div>
				<span class="titleText">
					Password :
				</span>
				<span v-if="!pswShow" class="titleValueText">
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
				<button v-if="pswShow"
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
					<img v-if="!pswShow"
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
			<form v-if="pswShow"
				@submit.prevent="modifPswReq" 
				class="settingsCont left"
			>
				<input v-model="pswValue"
					type="text"
					name="pswInput" 
					id="pswInput" 
					class="inputForm"
					:disabled="!pswCheckBox"
				/>
			</form>
		</div>
		<hr class="separator">
		<div class="ElemCont left_center column">
			<div class="ElemHeadCont left_center raw">
				<div class="titleImgCont center">
					<img src="~@/assets/private.svg" alt="Private" class="infoImg" />
				</div>
				<span class="titleText">
					Private :
				</span>
				<span v-if="!privShow" class="titleValueText">
					{{chansRef[i].priv ? "Yes" : "No"}}
				</span>
				<span v-else class="titleValueText center">
					<input
						@click="privCheck = !privCheck"
						type="checkbox" 
						name="privCheckBox" 
						id="privCheckBox"
						:checked="chansRef[i].priv ? true : false"
					>
				</span>
				<button v-if="privShow"
					@click="modifPrivReq"
					class="settingsBtnCont center"
				>
					<img
						src="~@/assets/done.svg"
						alt="Valid private"
						class="infoImg"
					/>
				</button>
				<button v-if="iAmAdmin"
					@click="showPriv"
					class="settingsBtnCont center"
				>
					<img v-if="!privShow"
						src="~@/assets/edit_logo.svg"
						alt="Edit private"
						class="infoImg"
					/>
					<img v-else
						src="~@/assets/undo_logo.svg"
						alt="Undo button"
						class="infoImg"
					/>
				</button>
			</div>
		</div>
		<hr class="separator">
		<div class="ElemCont left_center column">
			<div class="ElemHeadCont left_center raw">
				<div class="titleImgCont center">
					<img src="~@/assets/crown.svg" alt="Password" class="infoImg" />
				</div>
				<span class="titleText">
					Owner :
				</span>
				<span v-if="!chansRef[i].owner" class="titleValueText">
					No owner
				</span>
			</div>
			<div v-if="chansRef[i].owner" class="basicUserCont left_center">
				<BasicProfil :avatar="chansRef[i].owner.avatar" 
					@click="toProfile(chansRef[i].owner.login)" 
					:login="chansRef[i].owner.login" class="basicUser"/>
				<setUserChan v-if="chansRef[i].owner.login != myName" 
					:login="chansRef[i].owner.login" :chan="chanName" group="admins" 
					:isAdmin="false"/>
			</div>
		</div>
		<hr class="separator">
		<div class="ElemCont left_center column">
			<div class="ElemHeadCont left_center raw">
				<div class="titleImgCont center">
					<img src="~@/assets/star2.svg" alt="Password" class="infoImg" />
				</div>
				<span class="titleText">
					Admins :
				</span>
				<span v-if="!chansRef[i].admins.length" class="titleValueText">
					No admins
				</span>
			</div>
			<div v-for="(data, i) in chansRef[props.i].admins" :key="i" 
				class="basicUserCont left_center"
			>
				<BasicProfil :avatar="data.avatar" @click="toProfile(data.login)" 
					:login="data.login" class="basicUser"/>
				<setUserChan v-if="data.login != myName" 
					:login="data.login" :chan="chanName" group="admins" 
					:isAdmin="isAdmin()"/>
			</div>
		</div>
		<hr class="separator">
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
			</div>
			<div v-for="(data, i) in chansRef[props.i].users" :key="i" 
				class="basicUserCont left_center"
			>
				<BasicProfil @click="toProfile(data.login)" 
					:avatar="data.avatar" :login="data.login" class="basicUser"/>
				<setUserChan v-if="data.login != myName" 
					:login="data.login" :chan="chanName" group="users"
					:isAdmin="isAdmin()"/>
			</div>
		</div>
		<hr class="separator">
		<div class="ElemCont left_center column">
			<div class="ElemHeadCont left_center raw">
				<div class="titleImgCont center">
					<img src="~@/assets/mute.svg" alt="Muted people" class="infoImg" />
				</div>
				<span class="titleText">
					Muted :
				</span>
				<span v-if="!chansRef[i].mutes.length" class="titleValueText">
					No mutes
				</span>
			</div>
			<div v-for="(data, i) in chansRef[props.i].mutes" :key="i" 
				class="basicUserCont left_center"
			>
				<BasicProfil @click="toProfile(data.login)" 
					:avatar="data.avatar" :login="data.login" class="basicUser"/>
				<setUserChan v-if="data.login != myName" 
					:login="data.login" :chan="chanName" group="mutes"
					:isAdmin="isAdmin()"/>
			</div>
		</div>
		<hr class="separator">
		<div class="ElemCont left_center column">
			<div class="ElemHeadCont left_center raw">
				<div class="titleImgCont center">
					<img src="~@/assets/block_logo.svg" alt="Ban people" class="infoImg" />
				</div>
				<span class="titleText">
					Baned :
				</span>
				<span v-if="!chansRef[i].bans.length" class="titleValueText">
					No bans
				</span>
			</div>
			<div v-for="(data, i) in chansRef[props.i].bans" :key="i" 
				class="basicUserCont left_center"
			>
				<BasicProfil @click="toProfile(data.login)" 
					:avatar="data.avatar" :login="data.login" class="basicUser"/>
				<setUserChan v-if="data.login != myName" 
					:login="data.login" :chan="chanName" group="bans"
					:isAdmin="isAdmin()"/>
			</div>
		</div>
		<WarningMsg v-if="invitUser"
			msg="Enter the user's login you want to invit:"
			:img="require('@/assets/add_user.png')"
		>
			<template #content>
				<input v-model="newUser" @keypress.enter="addUserReq" type="text" id="newUserInput"/>
			</template>
			<template #buttons>
				<div class="blockAdvertButtons center raw">
					<button @click="addUserReq">OK</button>
					<button @click="showNewUser">Back</button>
				</div>
			</template>
		</WarningMsg>
	</div>
</template>

<script setup lang="ts">
/* eslint @typescript-eslint/no-var-requires: "off" */
import { defineProps, inject, onMounted, ref, Ref, onBeforeUnmount, watch, onBeforeUpdate, onUpdated, nextTick } from "vue";
import { useRoute } from "vue-router";
import { Socket } from "socket.io-client";
import HTTP from "../components/axios";
import BasicProfil from "@/components/BasicProfilItem.vue";
import setUserChan from "@/chat/setUserChanItem.vue";
import WarningMsg from "@/components/WarningMsg.vue";
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

// GLOBAL
let colors = inject("colors");
let mySocket: Socket = inject("socket")!;
const route = useRoute();
let apiPath: string = inject("apiPath")!;
let chanName = route.params.conv_name as string;
let myName: string = inject("me")!;
let me: Ref<ProfileUserDto> = inject("user")!;
let chansRef : Ref<ChannelDto[]> = inject("chans")!;
let iAmAdmin = ref(isAdmin());
let display = ref(true);

// INVIT USER
let invitUser = ref(false);
let newUser = ref('');

// PASSWORD
let pswValue = ref("");
let pswShow = ref(false);
let pswCheckBox = ref(false);

// PRIVATE
let privShow = ref(false);
let privCheck = ref(false);


// ================= WATCHERS =================

watch(chansRef.value[props.i].admins, () => {
	iAmAdmin.value = isAdmin();
})


// ================= GENERAL =================

function isAdmin() {
	let admins =  chansRef.value[props.i].admins
		.map(adm => adm.login);
	if (chansRef.value[props.i].owner)
		admins.push(chansRef.value[props.i].owner.login);
	return admins.includes(myName);
}

function quitChannel() {
	mySocket.emit("userQuitChan", {login: myName, chan: chanName});
	display.value = false;
	chansRef.value.splice(props.i, 1);
	router.push({name: 'channels'});
}


// ================= INVIT USER =================

function showNewUser() {
	invitUser.value = !invitUser.value;
	newUser.value = '';
	if (invitUser.value) {
		nextTick(() => {
			document.getElementById("newUserInput")?.focus();
		})
	}
}

function addUserReq() {
	let newUserInput = document.getElementById("newUserInput");
	newUserInput?.classList.remove("invalidInput");
	if (!newUser.value)
		return setTimeout(() => {
			newUserInput?.classList.add("invalidInput");
		})
	HTTP.get(`${apiPath}chat/invitChanUser/${chanName}/${newUser.value}`)
	.then(res => {
		// mySocket.emit("modifChan", 
		// 	new ModifChanDto(chanName, 'invitUser', newUser.value));
		mySocket.emit("newChannelUser", {chan: chanName, login: newUser.value})
		newUser.value = "";
		invitUser.value = false;
	})
	.catch(e => {
		if (e.response.data.message == 'DO_NOT_EXIST'
			|| e.response.data.message == 'ALREADY_USER'
			|| e.response.data.message == 'IS_BANNED') {
				newUserInput?.classList.add("invalidInput");
		}
	});
}


// ================= PASSWORD =================

function changePswCB() {
	pswValue.value = "";
	pswCheckBox.value = !pswCheckBox.value;
	// chansRef.value[props.i].psw ? 
	// 	pswCheck.value = true : pswCheck.value = false;
	nextTick(() => {
		document.getElementById("pswInput")?.focus();
	})
}

function showPsw() {
	pswShow.value = !pswShow.value;
	pswValue.value = "";
	if (pswShow.value) {
		pswCheckBox.value = chansRef.value[props.i].psw ? true : false;
		nextTick(() => {
			document.getElementById("pswInput")?.focus();
		})
	}
}

function modifPswReq() {
	let input = document.getElementById("pswInput");
	input?.classList.remove("invalidInput");
	if (pswCheckBox.value && pswValue.value == "")
		return setTimeout(() => {
			input!.classList.add("invalidInput");
		}, 50);
	if (chansRef.value[props.i].psw) {
		if (!pswCheckBox.value)
			mySocket.emit("modifChan",
				new ModifChanDto(myName, chanName, "psw", ""));
		else if (pswValue.value != "")
			mySocket.emit("modifChan", 
				new ModifChanDto(myName, chanName, "psw", pswValue.value));
	} else if (pswCheckBox.value)
		mySocket.emit("modifChan", 
			new ModifChanDto(myName, chanName, "psw", pswValue.value));
	pswShow.value = false;
}


// ================= PRIVATE =================



function showPriv() {
	privShow.value = !privShow.value;
	privCheck.value = chansRef.value[props.i].priv;
}

function modifPrivReq() {
	if ((chansRef.value[props.i].priv && !privCheck.value)
		|| (!chansRef.value[props.i].priv && privCheck.value)) 
		mySocket.emit("modifChan",
			new ModifChanDto(myName, chanName, "priv", privCheck.value));
	privShow.value = false;
}


// ================= PROFILE =================

function toProfile(player: string) {
	router.push({name: 'player', params: { name: player }});
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

/* GENERAL */
.infoCont {
	height: calc(100vh - 250px);
	overflow-y: auto;
	justify-content: flex-start;
}
.topButsCont {
	margin: 20px 0;
	margin-top: 30px;
	margin-bottom: 15px;
	height: auto;
}

.ElemCont {
	width: 80%;
	margin: 10px;
}
.separator{
	flex-shrink: 0;
	width: 70%;
	height: 1px;
	background-color: v-bind("colors.color2");
	margin: 10px 0;
}
.titleText {
	font-family: 'Orbitron', sans-serif;
	width: auto;
	white-space: nowrap;
	font-weight: 500;
	margin-left: 10px;
}
.titleValueText {
	font-family: 'Orbitron', sans-serif;
	margin-left: 10px;
}
.titleImgCont,
.setUserCont,
.settingsBtnCont {
	height: 26px;
	width: 26px;
	border-radius: 13px;
}
.settingsBtnCont {
	margin-left: 20px
}
.setUserCont:hover,
.settingsBtnCont:hover {
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

.inputForm {
	font-family: 'Orbitron', sans-serif;
	font-size: 0.8rem;
	width: 220px;
	height: 1.4rem;
	border-radius: calc(1.4rem / 2);
	outline: none;
	padding: 0 8px;
}
.basicUserCont{
	width: 95%;
}
.basicUser {
	margin: 5px 10px;
	cursor: pointer;
}
.invitButton {
	height: 1.5rem;
	width: 135px;
	border-radius: calc(1.5rem / 2);
	font-weight: 500;
	background-color: v-bind("colors.color2");
	color: white;
	padding: 0 10px;
	margin: auto;
	box-shadow: 0px 0px 4px #aaa;
}
#newUserInput {
	font-family: 'Orbitron', sans-serif;
	font-size: 0.8rem;
	width: 150px;
	background-color: v-bind("colors.color3");
	height: 1.4rem;
	border-radius: calc(1.4rem / 2);
	outline: none;
	margin-bottom: 10px;
	padding: 0 8px;
}
.leaveButton {
	height: 1.5rem;
	width: 135px;
	border-radius: calc(1.5rem / 2);
	font-weight: 500;
	background-color: rgb(246, 129, 129);
	color: white;
	padding: 0 10px;
	margin: auto;
	box-shadow: 0px 0px 4px #aaa;
}
</style>
