<template>
	<div id="channel_view" class="center column stack">
		<div class="option_private center raw">
			<SearchItem v-if="!newChannel" v-model:search="search"/>
			<div v-if="newChannel" class="newChannelTitle center">
				<span class="newChannelTitleText">Create new Channel</span>
			</div>
			<div class="option_buttons space-around raw stack">
				<button
					v-if="!newChannel"
					@click="findChannelFn()"
					class="button_cont center"
				>
					<span v-if="!findChannel" class="infoButtonText">Join channel</span>
					<img
						v-if="!findChannel"
						src="~@/assets/logo_search.svg"
						alt="Find Channel Button"
						class="button_img"
					/>
					<span v-if="findChannel" class="infoButtonText">Back</span>
					<img
						v-if="findChannel"
						src="~@/assets/undo_logo.svg"
						alt="Undo Button"
						class="button_img"
					/>
				</button>
				<button
					v-if="!findChannel"
					@click="newChannelFn()"
					class="button_cont center"
				>
					<span v-if="!newChannel" class="infoButtonText">Create channel</span>
					<img
						v-if="!newChannel"
						src="~@/assets/add_logo.svg"
						alt="New message"
						class="button_img"
					/>
					<span v-if="newChannel" class="infoButtonText">Back</span>
					<img
						v-if="newChannel"
						src="~@/assets/undo_logo.svg"
						alt="New message"
						class="button_img"
					/>
				</button>
			</div>
		</div>
		<div v-if="chanDone && !findChannel && !newChannel && userDone"
			class="myChannels center column"
		>
			<div v-for="(data, i) in chansFiltred" :key="i" 
				:set="ind = findIndexMsg(data.messages)" class="center"
			>
				<ConversationTab
					v-if="data.messages.length > 0 && ind >= 0"
					:name-conv="data.name"
					:message="data.messages.at(ind)!.msg"
					:date="data.messages.at(ind)!.date"
					:last-msg-user="data.messages.at(ind)!.user"
					:read="data.readed"
					:chan="true"
					class="center"
				/>
				<ConversationTab
					v-else
					:name-conv="data.name"
					:date="data.creation"
					:read="data.readed"
					:chan="true"
					class="center"
				/>
			</div>
			<h2 v-if="chansRef.length == 0" class="no_results">No channels</h2>
			<h2 v-else-if="chansFiltred!.length == 0" class="no_results">
				No results
			</h2>
		</div>
		<h2 v-else-if="findChannel && !search.length" class="no_results">
			Type in the search bar
		</h2>
		<div
			v-if="findChannel && search.length > 0 && serverChans.length > 0"
			class="findChannelResults left column"
		>
			<ChannelTab v-for="(data, i) in serverChans" :key="i" :infos="data" />
		</div>
		<h2 v-else-if="findChannel && search.length > 0 && serverChans.length == 0" class="no_results">
			No results
		</h2>
		<form
			v-if="newChannel"
			@submit.prevent="submitChannel"
			id="channelForm"
			class="channelForm center column"
		>
			<div class="elemFormCont left_center column">
				<div class=" elemFormTopCont left_center raw">
					<img src="@/assets/name_logo.svg" alt="Name Channel" class="newChanImg">
					<label for="newChanName" class="labelForm">Name :</label>
				</div>
				<input v-model="nameInput" type="text" 
					name="newChanName" id="newChanName" class="inputForm" 
				/>
			</div>
			<div class="elemFormCont left_center raw">
				<img src="@/assets/private.svg" alt="Private Channel" class="newChanImg">
				<label for="privateCheckbox" class="labelForm">Private :</label>
				<input
						v-model="privCB"
						type="checkbox"
						name="privateCheckbox"
						id="privateCheckbox"
					/>
			</div>
			<div class="elemFormCont left_center column">
				<div class="elemFormTopCont left_center raw">
					<img src="@/assets/lock_logo.svg" alt="Password Channel" class="newChanImg">
					<label for="pswCheckbox" class="labelForm">Password :</label>
					<input
						v-model="pswCheck"
						type="checkbox"
						name="pswCheckbox"
						id="pswCheckbox"
						value="psw required"
					/>
				</div>
				<input v-model="pswInput" type="text"
					name="pswInput" id="pswInput" class="inputForm" :disabled="!pswCheck"
				/>
			</div>
			<input type="submit" value="Create" id="submitButton" />
		</form>
	</div>
</template>

<script setup lang="ts">
/* eslint @typescript-eslint/no-var-requires: "off" */
import {
	inject,
	onMounted,
	onBeforeUnmount,
	ref,
	Ref,
	nextTick,
	watch,
	onUpdated,
} from "vue";
import HTTP from "../components/axios";
import ChannelTab from "@/chat/ChannelSearchTab.vue";
import SearchItem from "@/components/SearchItem.vue";
import ConversationTab from "@/chat/ConversationTab.vue";
import { ChannelDto } from "@/chat/dto/ChannelDto";
import { ChannelTabDto } from "@/chat/dto/ChannelTabDto ";
import { NewChanDto } from "@/chat/dto/NewChanDto"
import { MessageDto } from "./dto/MessageDto";
import { ProfileUserDto } from "@/dto/ProfileUserDto"


// ================= INIT =================

// INIT COMPONENT VARIABLES
let ind : number;
const colors = inject("colors");
const myName: string = inject("me")!;
const me: Ref<ProfileUserDto> = inject("user")!;
const apiPath: string = inject("apiPath")!;
const search = ref("");
const findChannel = ref(false);
const newChannel = ref(false);
const pswCheck = ref(false);
const privCB = ref(false);
const nameInput = ref("");
const pswInput = ref("");
const chanServReqDone = ref(false);
const serverChans : Ref<ChannelTabDto[]> = ref([]);
const userDone : Ref<boolean> = inject("userDone")!;


// GET CHANS REFS
const chansRef : Ref<ChannelDto[]> = inject("chans")!;
const chansFiltred : Ref<ChannelDto[]> = ref(chansRef.value);
const chanDone: Ref<boolean> = inject("chanDone")!;
const nbChanNR: { n: Ref<string[]>; reset: () => void } = inject("nbChanNR")!;

// INIT IF REFRESH PAGE
watch(chanDone, () => {
	chansFiltred.value = chansRef.value;
});


// ================= WATCHERS =================

watch(search, () => {
	chanServReqDone.value = false;
	chansFiltred.value = chansRef.value?.filter(function (chan) {
		return chan.name.toUpperCase().startsWith(search.value.toUpperCase());
	});
	if (findChannel.value && search.value != "") getServerChans();
});


// ================= METHODS =================

function getServerChans() {
	HTTP.get(apiPath + "chat/getServerChansFiltred/" + me + "/" + search.value)
		.then((res) => {
			let chansTmp: ChannelTabDto[] = [];
			res.data.forEach((chan: ChannelTabDto) => {
				chansTmp.push(
					new ChannelTabDto(chan.name, chan.nbUsers, chan.psw, chan.ban)
				);
			});
			serverChans.value = chansTmp;
			chanServReqDone.value = true;
		})
		.catch((e) => console.log(e));
}

function findChannelFn() {
	findChannel.value = !findChannel.value;
	search.value = "";
	nextTick(() => {
		document.getElementById("search")?.focus();
	});
}

function newChannelFn() {
	newChannel.value = !newChannel.value;
	pswInput.value = "";
	nameInput.value = "";
	nextTick(() => {
		document.getElementById("newChanName")?.focus();
	})
}

function findIndexMsg(msgs: MessageDto[]) {
	let i : number;
	let blockeds = me.value.blockeds.map(b => b.login);
	for (i = msgs.length - 1; i >= 0; i--) {
		if (!blockeds.includes(msgs[i].user))
			break;
	}
	return i;
}

function submitChannel() {
	let nameElem = document.getElementById('newChanName');
	let pswElem = document.getElementById('pswInput');
	nameElem!.classList.remove("invalidInput");
	pswElem?.classList.remove("invalidInput");
	if (nameInput.value == '')
		return setTimeout(() => {
			nameElem!.classList.add("invalidInput");
		})
	if (pswCheck.value && pswInput.value == '')
		return setTimeout(() => {
			pswElem!.classList.add("invalidInput");
		})
	HTTP.post(apiPath + "chat/createChan", 
		new NewChanDto(nameInput.value, myName, privCB.value, pswInput.value))
		.then(res => {
			let newChan = res.data as ChannelDto;
			newChan.creation = new Date(newChan.creation);
			newChannel.value = false;
			chansRef.value.unshift(newChan);
		})
		.catch(e => {
			if (e.response.data.message === 'CHAN_ALREADY_EXIST') {
				nameElem!.classList.add("invalidInput");
			}
		});
}


// ====================== LIFECYCLES HOOKS ======================

onUpdated(() => {
	if (nbChanNR.n.value.length) nbChanNR.reset();
});

onMounted(() => {
	if (chansRef.value.length) nbChanNR.reset();
	const box = document.getElementById("channelsTabText");
	if (box != null) box.classList.add("chatTabActive");
});

onBeforeUnmount(() => {
	const box = document.getElementById("channelsTabText");
	if (box != null) box.classList.remove("chatTabActive");
});

</script>

<style scoped>
#channel_view {
	height: calc(100vh - 180px);
	justify-content: flex-start;
}
.no_results {
	margin-top: 1rem;
}

.option_buttons {
	width: 25%;
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
	width: auto;
	background-color: rgba(0, 0, 0, 0.6);
	color: #fff;
	text-align: center;
	padding: 5px 0;
	border-radius: 6px;
	position: absolute;
	z-index: 1;
	bottom: 110%;
	right: 0;
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
.findChannelResults {
	margin-top: 10px;
	width: 90%;
}
.typeUsers {
	margin-top: 15px;
	margin-bottom: 5px;
}
.newChannelTitle {
	height: 75px;
	width: 70%;
	align-items: center;
}
.newChannelTitleText {
	font-size: 1.15rem;
	font-weight: 500;
	color: v-bind("colors.color2");
	border-bottom: 2px solid v-bind("colors.color2");
	font-family: "Orbitron", sans-serif;
	padding-bottom: 10px;
}
.channelForm {
	width: 80%;
	margin-top: 20px;
}
.elemFormCont {
	margin-bottom: 15px;
}
.elemFormTopCont {
	margin-bottom: 5px;
}
.newChanImg {
	width: 20px;
	height: 20px;
	margin-right: 10px;
	filter: invert(29%) sepia(16%) saturate(6497%) hue-rotate(176deg)
		brightness(86%) contrast(83%);
}
.labelForm {
	font-family: "Orbitron", sans-serif;
	font-weight: 400;
}
.inputForm {
	padding: 0 8px;
	border-radius: calc(1.5rem / 2);
	height: 1.5rem;
	outline: none;
}
#privateCheckbox,
#pswCheckbox {
	margin-left: 10px;
}
#submitButton {
	background-color: v-bind("colors.color2");
	color: #fff;
	border-radius: 5px;
	margin-top: 10px;
	padding: 5px;
	font-family: 'Orbitron', sans-serif;
}
#submitButton:hover {
	box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
	cursor: pointer;
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
</style>
